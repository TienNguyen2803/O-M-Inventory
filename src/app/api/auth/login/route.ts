import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { success: false, error: "Email là bắt buộc" },
        { status: 400 }
      );
    }

    // Find user by email
    const dbUser = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase().trim(),
        userStatus: {
          code: "ACT" // Assuming 'ACT' is the code for Active
        }
      },
      include: {
        department: true,
        userStatus: true,
        userRoles: {
          include: {
            role: true
          }
        }
      },
    });

    if (!dbUser) {
      return NextResponse.json(
        { success: false, error: "Email không tồn tại trong hệ thống" },
        { status: 401 }
      );
    }

    // Map to User type
    const user = {
      id: dbUser.id,
      employeeCode: dbUser.employeeCode,
      name: dbUser.name,
      email: dbUser.email,
      phone: dbUser.phone,
      departmentId: dbUser.departmentId,
      statusId: dbUser.statusId,
      department: dbUser.department,
      userStatus: dbUser.userStatus,
      userRoles: dbUser.userRoles,
      role: dbUser.userRoles[0]?.role.name || "", // Legacy/Simple role
      status: dbUser.userStatus.name || "", // Legacy/Simple status
      createdAt: dbUser.createdAt.toISOString(),
    };

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: "Lỗi server" },
      { status: 500 }
    );
  }
}
