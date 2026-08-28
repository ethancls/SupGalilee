import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import prisma from './db';
import type { Session } from '@prisma/client';
import { env } from './env';
import { authLogger } from './logger';

const JWT_SECRET = env.JWT_SECRET;
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  platformRole: string;
};

// ============================================================================
// PASSWORD HASHING
// ============================================================================

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch {
    return null;
  }
}

export async function createSession(userId: string, userAgent?: string, ipAddress?: string): Promise<Session> {
  const token = generateToken(userId);
  const expiresAt = new Date(Date.now() + SESSION_DURATION);

  const session = await prisma.session.create({
    data: {
      userId,
      token,
      userAgent,
      ipAddress,
      expiresAt,
    },
  });

  return session;
}

export async function deleteSession(token: string): Promise<void> {
  await prisma.session.delete({
    where: { token },
  }).catch(() => {});
}

export async function deleteUserSessions(userId: string): Promise<void> {
  await prisma.session.deleteMany({
    where: { userId },
  });
}

export async function getSessionFromCookie(): Promise<Session | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  
  if (!token) {
    authLogger.debug('No session cookie found');
    return null;
  }

  const session = await prisma.session.findUnique({
    where: { token },
  });

  if (!session) {
    authLogger.warn('Session token not found in database');
    return null;
  }

  if (session.expiresAt < new Date()) {
    authLogger.debug('Session expired', { sessionId: session.id });
    await deleteSession(token);
    return null;
  }

  authLogger.debug('Valid session found', { userId: session.userId });
  return session;
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await getSessionFromCookie();
  if (!session) {
    authLogger.debug('No session for getCurrentUser');
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
      platformRole: true,
    },
  });

  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatar: user.avatar || undefined,
    platformRole: user.platformRole,
  };
}

// ============================================================================
// AUTH ACTIONS
// ============================================================================

export async function register(
  email: string,
  password: string,
  name: string
): Promise<{ user: SessionUser; token: string } | { error: string }> {
  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existingUser) {
    return { error: 'Un compte avec cet email existe déjà' };
  }

  // Validate password
  if (password.length < 8) {
    return { error: 'Le mot de passe doit contenir au moins 8 caractères' };
  }

  // Create user
  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      name,
      passwordHash,
    },
    select: {
      id: true,
      email: true,
      name: true,
      platformRole: true,
    },
  });

  // Create session
  const session = await createSession(user.id);

  return { user, token: session.token };
}

export async function login(
  email: string,
  password: string,
  userAgent?: string,
  ipAddress?: string
): Promise<{ user: SessionUser; token: string } | { error: string }> {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    return { error: 'Email ou mot de passe incorrect' };
  }

  if (!user.isActive) {
    return { error: 'Ce compte a été désactivé' };
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    return { error: 'Email ou mot de passe incorrect' };
  }

  const session = await createSession(user.id, userAgent, ipAddress);

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      platformRole: user.platformRole,
    },
    token: session.token,
  };
}

export async function logout(): Promise<void> {
  const session = await getSessionFromCookie();
  if (session) {
    await deleteSession(session.token);
  }
}

// ============================================================================
// PASSWORD RESET
// ============================================================================

export async function createPasswordResetToken(email: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) return null;

  // Delete existing tokens
  await prisma.passwordResetToken.deleteMany({
    where: { userId: user.id },
  });

  // Create new token
  const token = crypto.randomUUID();
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    },
  });

  return token;
}

export async function resetPassword(token: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!resetToken) {
    return { success: false, error: 'Token invalide' };
  }

  if (resetToken.expiresAt < new Date()) {
    await prisma.passwordResetToken.delete({ where: { id: resetToken.id } });
    return { success: false, error: 'Token expiré' };
  }

  if (resetToken.usedAt) {
    return { success: false, error: 'Token déjà utilisé' };
  }

  if (newPassword.length < 8) {
    return { success: false, error: 'Le mot de passe doit contenir au moins 8 caractères' };
  }

  const passwordHash = await hashPassword(newPassword);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    }),
    // Invalidate all sessions
    prisma.session.deleteMany({
      where: { userId: resetToken.userId },
    }),
  ]);

  return { success: true };
}
