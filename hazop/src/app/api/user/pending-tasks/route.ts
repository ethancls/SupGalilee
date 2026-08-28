import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Count pending assignments for the user
    const pendingCount = await prisma.deviationAssignment.count({
      where: {
        userId: user.id,
        status: {
          in: ["PENDING", "ACCEPTED", "IN_PROGRESS"],
        },
      },
    });

    return NextResponse.json({ count: pendingCount });
  } catch (error) {
    console.error("Error fetching pending tasks count:", error);
    return NextResponse.json(
      { error: "Failed to fetch pending tasks count" },
      { status: 500 }
    );
  }
}
