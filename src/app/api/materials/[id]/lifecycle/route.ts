import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { lifecycleQuerySchema } from "@/lib/validations/lifecycle";
import type {
  MaterialLifecycleResponse,
  MaterialInfo,
  LocationInfo,
  MaterialEventDto,
} from "@/lib/types/lifecycle";

type RouteParams = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/materials/[id]/lifecycle
 * Returns the lifecycle timeline for a specific material
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);

    // Parse and validate query params
    const queryResult = lifecycleQuerySchema.safeParse({
      limit: searchParams.get("limit") ?? undefined,
      offset: searchParams.get("offset") ?? undefined,
      fromDate: searchParams.get("fromDate") ?? undefined,
      toDate: searchParams.get("toDate") ?? undefined,
    });

    if (!queryResult.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: queryResult.error.issues },
        { status: 400 }
      );
    }

    const { limit, offset, fromDate, toDate } = queryResult.data;

    // Fetch material with related data
    const material = await prisma.material.findUnique({
      where: { id },
      include: {
        materialCategory: { select: { code: true, name: true } },
        materialUnit: { select: { code: true, name: true } },
        materialStatus: { select: { code: true, name: true, color: true } },
        installations: {
          orderBy: { installedAt: "desc" },
          take: 1,
          include: {
            installedBy: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!material) {
      return NextResponse.json({ error: "Material not found" }, { status: 404 });
    }

    // Build date filter for events
    const dateFilter: { gte?: Date; lte?: Date } = {};
    if (fromDate) dateFilter.gte = new Date(fromDate);
    if (toDate) dateFilter.lte = new Date(toDate);

    // Fetch lifecycle events with pagination
    const [events, totalCount] = await Promise.all([
      prisma.materialEvent.findMany({
        where: {
          materialId: id,
          ...(fromDate || toDate ? { eventDate: dateFilter } : {}),
        },
        orderBy: { eventDate: "desc" },
        skip: offset,
        take: limit,
      }),
      prisma.materialEvent.count({
        where: {
          materialId: id,
          ...(fromDate || toDate ? { eventDate: dateFilter } : {}),
        },
      }),
    ]);

    // Build material info
    const materialInfo: MaterialInfo = {
      id: material.id,
      code: material.code,
      name: material.name,
      serialNumber: material.serialNumber,
      partNo: material.partNo,
      category: material.materialCategory,
      unit: material.materialUnit,
      status: material.materialStatus,
    };

    // Determine current location
    let currentLocation: LocationInfo;
    const latestInstallation = material.installations[0];

    if (latestInstallation) {
      currentLocation = {
        type: "installed",
        name: latestInstallation.locationName,
        slotInfo: latestInstallation.slotInfo,
        installedAt: latestInstallation.installedAt.toISOString(),
        installedBy: latestInstallation.installedBy,
      };
    } else if (material.location) {
      currentLocation = {
        type: "warehouse",
        name: material.location,
      };
    } else {
      currentLocation = {
        type: "unknown",
        name: "Chưa xác định",
      };
    }

    // Transform events to DTOs
    const timeline: MaterialEventDto[] = events.map((event) => ({
      id: event.id,
      eventType: event.eventType,
      eventDate: event.eventDate.toISOString(),
      actorId: event.actorId,
      actorName: event.actorName,
      referenceType: event.referenceType,
      referenceId: event.referenceId,
      referenceCode: event.referenceCode,
      description: event.description,
      metadata: event.metadata as Record<string, unknown> | null,
      createdAt: event.createdAt.toISOString(),
    }));

    const response: MaterialLifecycleResponse = {
      material: materialInfo,
      currentLocation,
      timeline,
      pagination: {
        total: totalCount,
        limit,
        offset,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching material lifecycle:", error);
    return NextResponse.json(
      { error: "Failed to fetch material lifecycle" },
      { status: 500 }
    );
  }
}
