import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

const MAX_AVATAR_URL_LENGTH = 2048;

// Server-side avatar URL validation - security focused (XSS/CSRF prevention)
function validateAvatarUrl(url: string | null | undefined): { valid: boolean; error?: string } {
  // Null or empty is allowed (removes avatar)
  if (!url || url.trim() === '') {
    return { valid: true };
  }

  const trimmedUrl = url.trim();

  // Check URL length
  if (trimmedUrl.length > MAX_AVATAR_URL_LENGTH) {
    return { valid: false, error: `URL too long (max ${MAX_AVATAR_URL_LENGTH} characters)` };
  }

  // Allow data URLs for images
  if (trimmedUrl.startsWith('data:image/')) {
    const mimeMatch = trimmedUrl.match(/^data:image\/([\w+-]+);/);
    if (mimeMatch) {
      const mimeType = mimeMatch[1].toLowerCase();
      if (!['png', 'jpeg', 'jpg', 'gif', 'webp', 'svg+xml'].includes(mimeType)) {
        return { valid: false, error: 'Invalid image format in data URL' };
      }
    }
    return { valid: true };
  }

  // Must be HTTPS for security (or relative URL starting with /)
  if (!trimmedUrl.startsWith('https://') && !trimmedUrl.startsWith('/')) {
    return { valid: false, error: 'Avatar URL must use HTTPS protocol' };
  }

  // Block XSS/injection patterns
  const dangerousPatterns = [
    'javascript:',
    '<script',
    'onerror=',
    'onload=',
    'onclick=',
    'onmouseover=',
    'data:text/html',
  ];
  
  const lowerUrl = trimmedUrl.toLowerCase();
  for (const pattern of dangerousPatterns) {
    if (lowerUrl.includes(pattern)) {
      return { valid: false, error: 'Invalid URL' };
    }
  }

  // Basic URL format validation
  try {
    new URL(trimmedUrl);
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }

  return { valid: true };
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, email, avatar } = await request.json();

    // Validate avatar URL
    const avatarValidation = validateAvatarUrl(avatar);
    if (!avatarValidation.valid) {
      return NextResponse.json(
        { error: avatarValidation.error },
        { status: 400 }
      );
    }

    // Check if email is already taken by another user
    if (email && email !== user.email) {
      const existing = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });
      if (existing && existing.id !== user.id) {
        return NextResponse.json(
          { error: 'Email is already in use' },
          { status: 409 }
        );
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: name || undefined,
        email: email?.toLowerCase() || undefined,
        avatar: avatar !== undefined ? (avatar?.trim() || null) : undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        platformRole: true,
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
