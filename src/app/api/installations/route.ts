import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { createInstallationSchema } from "@/lib/validations/lifecycle";
import {
  createMaterialEvent,
  buildEventDescription,
} from "@/lib/services/material-event-logging-service";

/**
 * GET /api/installations - List installations with pagination
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const materialId = searchParams.get("materialId");

    const skip = (page - 1) * limit;

    const where = materialId ? { materialId } : {};

    const [installations, total] = await Promise.all([
      prisma.installation.findMany({
        where,
        skip,
        take: limit,
        orderBy: { installedAt: "desc" },
        include: {
          material: {
            select: { id: true, code: true, name: true, serialNumber: true },
          },
          installedBy: {
            select: { id: true, name: true, employeeCode: true },
          },
        },
      }),
      prisma.installation.count({ where }),
    ]);

    return NextResponse.json({
      data: installations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching installations:", error);
    return NextResponse.json(
      { error: "Failed to fetch installations" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/installations - Create a new installation record
 * Also logs an INSTALLED event for the material lifecycle
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validationResult = createInstallationSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { materialId, locationName, slotInfo, installedAt, notes } =
      validationResult.data;

    // Get installedById from request body (required for actor)
    const installedById = body.installedById;
    if (!installedById) {
      return NextResponse.json(
        { error: "installedById is required" },
        { status: 400 }
      );
    }

    // Verify material exists
    const material = await prisma.material.findUnique({
      where: { id: materialId },
      select: { id: true, code: true, name: true },
    });

    if (!material) {
      return NextResponse.json(
        { error: "Material not found" },
        { status: 404 }
      );
    }

    // Verify installer exists
    const installer = await prisma.user.findUnique({
      where: { id: installedById },
      select: { id: true, name: true },
    });

    if (!installer) {
      return NextResponse.json(
        { error: "Installer user not found" },
        { status: 404 }
      );
    }

    // Create installation record
    const installation = await prisma.installation.create({
      data: {
        materialId,
        installedById,
        locationName,
        slotInfo: slotInfo || null,
        installedAt: new Date(installedAt),
        notes: notes || null,
      },
      include: {
        material: {
          select: { id: true, code: true, name: true, serialNumber: true },
        },
        installedBy: {
          select: { id: true, name: true, employeeCode: true },
        },
      },
    });

    // Log INSTALLED event
    try {
      await createMaterialEvent({
        materialId,
        eventType: "INSTALLED",
        eventDate: new Date(installedAt),
        actorId: installedById,
        actorName: installer.name,
        referenceType: "Installation",
        referenceId: installation.id,
        referenceCode: `INST-${installation.id.slice(0, 8)}`,
        description: buildEventDescription("INSTALLED", { locationName }),
        metadata: { locationName, slotInfo },
      });
    } catch (eventError) {
      console.error("Failed to log INSTALLED event:", eventError);
    }

    return NextResponse.json(installation, { status: 201 });
  } catch (error) {
    console.error("Error creating installation:", error);
    return NextResponse.json(
      { error: "Failed to create installation" },
      { status: 500 }
    );
  }
}
