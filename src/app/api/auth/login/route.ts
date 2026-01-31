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
    const user = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase().trim(),
        status: "Active",
      },
      select: {
        id: true,
        employeeCode: true,
        name: true,
        email: true,
        phone: true,
        department: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Email không tồn tại trong hệ thống" },
        { status: 401 }
      );
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: "Lỗi server" },
      { status: 500 }
    );
  }
}
