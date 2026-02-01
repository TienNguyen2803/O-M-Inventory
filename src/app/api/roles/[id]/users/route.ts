import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/roles/[id]/users - Get users of a role
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: roleId } = await params;

    const userRoles = await prisma.userRole.findMany({
      where: { roleId },
      include: {
        user: {
          select: {
            id: true,
            employeeCode: true,
            name: true,
            email: true,
            departmentId: true,
            statusId: true,
            department: true,
            userStatus: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const users = userRoles.map((ur) => ur.user);

    return NextResponse.json({ data: users });
  } catch (error) {
    console.error("Error fetching role users:", error);
    return NextResponse.json(
      { error: "Failed to fetch role users" },
      { status: 500 }
    );
  }
}

// POST /api/roles/[id]/users - Add users to role
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: roleId } = await params;
    const body = await request.json();
    const { userIds } = body;

    console.log("[POST /api/roles/[id]/users] roleId:", roleId);
    console.log("[POST /api/roles/[id]/users] userIds:", userIds);

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      console.log("[POST /api/roles/[id]/users] Invalid userIds");
      return NextResponse.json(
        { error: "userIds array is required" },
        { status: 400 }
      );
    }

    // Check if role exists
    const role = await prisma.role.findUnique({ where: { id: roleId } });
    console.log("[POST /api/roles/[id]/users] Found role:", role?.name);
    
    if (!role) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    // Create user-role relationships (skip duplicates)
    const createData = userIds.map((userId: string) => ({
      userId,
      roleId,
    }));

    console.log("[POST /api/roles/[id]/users] Creating:", createData);

    const result = await prisma.userRole.createMany({
      data: createData,
      skipDuplicates: true,
    });

    console.log("[POST /api/roles/[id]/users] Create result:", result);

    // Update user count
    const userCount = await prisma.userRole.count({ where: { roleId } });
    await prisma.role.update({
      where: { id: roleId },
      data: { userCount },
    });

    console.log("[POST /api/roles/[id]/users] Updated userCount:", userCount);

    return NextResponse.json({ success: true, userCount });
  } catch (error) {
    console.error("Error adding users to role:", error);
    return NextResponse.json(
      { error: "Failed to add users to role" },
      { status: 500 }
    );
  }
}
