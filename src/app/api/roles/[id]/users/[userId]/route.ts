import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// DELETE /api/roles/[id]/users/[userId] - Remove user from role
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const { id: roleId, userId } = await params;

    // Delete the user-role relationship
    await prisma.userRole.deleteMany({
      where: { roleId, userId },
    });

    // Update user count
    const userCount = await prisma.userRole.count({ where: { roleId } });
    await prisma.role.update({
      where: { id: roleId },
      data: { userCount },
    });

    return NextResponse.json({ success: true, userCount });
  } catch (error) {
    console.error("Error removing user from role:", error);
    return NextResponse.json(
      { error: "Failed to remove user from role" },
      { status: 500 }
    );
  }
}
