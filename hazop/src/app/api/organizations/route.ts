import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/db";

// Slug validation regex: lowercase letters, numbers, hyphens, 3-50 chars
const SLUG_REGEX = /^[a-z][a-z0-9-]{1,48}[a-z0-9]$/;
const RESERVED_SLUGS = ["new", "settings", "members", "api", "admin", "app", "www", "mail", "help", "support"];

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const memberships = await prisma.organizationMember.findMany({
      where: { userId: user.id },
      include: {
        organization: true,
      },
    });

    const organizations = memberships.map((m) => ({
      id: m.organization.id,
      name: m.organization.name,
      slug: m.organization.slug,
      role: m.role,
    }));

    return NextResponse.json({ organizations });
  } catch (error) {
    console.error("Error fetching organizations:", error);
    return NextResponse.json(
      { error: "Failed to fetch organizations" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, slug, description } = await request.json();

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Organization name is required" },
        { status: 400 }
      );
    }

    if (!slug || slug.trim().length === 0) {
      return NextResponse.json(
        { error: "URL slug is required" },
        { status: 400 }
      );
    }

    const normalizedSlug = slug.toLowerCase().trim();

    // Validate slug format
    if (!SLUG_REGEX.test(normalizedSlug)) {
      return NextResponse.json(
        { error: "Slug must be 3-50 characters, start with a letter, and contain only lowercase letters, numbers, and hyphens" },
        { status: 400 }
      );
    }

    // Check reserved slugs
    if (RESERVED_SLUGS.includes(normalizedSlug)) {
      return NextResponse.json(
        { error: "This slug is reserved and cannot be used" },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existing = await prisma.organization.findUnique({
      where: { slug: normalizedSlug },
    });

    if (existing) {
      return NextResponse.json(
        { error: "This URL slug is already taken" },
        { status: 400 }
      );
    }

    // Create organization and add user as owner
    const organization = await prisma.organization.create({
      data: {
        name: name.trim(),
        slug: normalizedSlug,
        description: description?.trim() || null,
        members: {
          create: {
            userId: user.id,
            role: "OWNER",
          },
        },
      },
    });

    return NextResponse.json({
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      role: "OWNER",
    });
  } catch (error) {
    console.error("Error creating organization:", error);
    return NextResponse.json(
      { error: "Failed to create organization" },
      { status: 500 }
    );
  }
}
