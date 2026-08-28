import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/db";

// Slug validation regex: lowercase letters, numbers, hyphens, 3-50 chars
const SLUG_REGEX = /^[a-z][a-z0-9-]{1,48}[a-z0-9]$/;
const RESERVED_SLUGS = ["new", "settings", "members", "api", "admin", "app", "www", "mail", "help", "support"];

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    if (!slug) {
      return NextResponse.json({ error: "Slug parameter required" }, { status: 400 });
    }

    const normalizedSlug = slug.toLowerCase().trim();

    // Check format
    if (!SLUG_REGEX.test(normalizedSlug)) {
      return NextResponse.json({
        available: false,
        valid: false,
        error: "Must be 3-50 characters, start with a letter, contain only lowercase letters, numbers, and hyphens",
      });
    }

    // Check reserved
    if (RESERVED_SLUGS.includes(normalizedSlug)) {
      return NextResponse.json({
        available: false,
        valid: true,
        error: "This slug is reserved",
      });
    }

    // Check if exists in database
    const existing = await prisma.organization.findUnique({
      where: { slug: normalizedSlug },
    });

    if (existing) {
      return NextResponse.json({
        available: false,
        valid: true,
        error: "This slug is already taken",
      });
    }

    return NextResponse.json({
      available: true,
      valid: true,
      slug: normalizedSlug,
    });
  } catch (error) {
    console.error("Error checking slug:", error);
    return NextResponse.json(
      { error: "Failed to check slug availability" },
      { status: 500 }
    );
  }
}
