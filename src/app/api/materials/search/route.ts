import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

/**
 * GET /api/materials/search
 * Search for materials by serial number
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const serialNumber = searchParams.get("serialNumber");

    if (!serialNumber) {
      return NextResponse.json(
        { error: "serialNumber query parameter is required" },
        { status: 400 }
      );
    }

    const material = await prisma.material.findFirst({
      where: { serialNumber },
      select: {
        id: true,
        name: true,
        code: true,
        serialNumber: true,
        partNo: true,
      },
    });

    if (!material) {
      return NextResponse.json(
        { error: "Material not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(material);
  } catch (error) {
    console.error("Error searching material:", error);
    return NextResponse.json(
      { error: "Failed to search material" },
      { status: 500 }
    );
  }
}
