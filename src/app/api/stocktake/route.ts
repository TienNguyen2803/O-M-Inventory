import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { stocktakeSchema } from "@/lib/validations/stocktake";
import { Prisma } from "@prisma/client";

// Include relations for nested data
const includeRelations = {
  status: true,
  area: true,
  createdBy: {
    select: { id: true, name: true, employeeCode: true },
  },
  assignments: {
    include: {
      location: { select: { id: true, code: true, name: true } },
      assignee: { select: { id: true, name: true, employeeCode: true } },
      status: true,
    },
  },
  results: {
    include: {
      material: { select: { id: true, code: true, name: true } },
      location: { select: { id: true, code: true, name: true } },
      unit: { select: { id: true, code: true, name: true } },
      countedBy: { select: { id: true, name: true } },
    },
  },
};

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const limit = parseInt(searchParams.get("limit") || "100");
  const offset = parseInt(searchParams.get("offset") || "0");
  const query = searchParams.get("query") || "";
  const statusId = searchParams.get("statusId");
  const areaId = searchParams.get("areaId");

  const where: Prisma.StocktakeWhereInput = {
    AND: [
      query
        ? {
            OR: [
              { takeCode: { contains: query, mode: "insensitive" } },
              { name: { contains: query, mode: "insensitive" } },
            ],
          }
        : {},
      statusId && statusId !== "all" ? { statusId } : {},
      areaId && areaId !== "all" ? { areaId } : {},
    ],
  };

  try {
    const [data, total] = await Promise.all([
      prisma.stocktake.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: "desc" },
        include: includeRelations,
      }),
      prisma.stocktake.count({ where }),
    ]);

    // Transform data to include computed fields
    const transformedData = data.map((stocktake) => ({
      ...stocktake,
      currentStep: stocktake.status.sortOrder,
      totalLocations: stocktake.assignments.length,
      completedLocations: stocktake.assignments.filter(
        (a) => a.status.code === "COMPLETED"
      ).length,
      totalVariance: stocktake.results.reduce((sum, r) => sum + r.variance, 0),
    }));

    return NextResponse.json({ data: transformedData, total });
  } catch (error) {
    console.error("Error fetching stocktakes:", error);
    return NextResponse.json(
      { error: "Failed to fetch stocktakes" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate body
    const validationResult = stocktakeSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { assignments, ...stocktakeData } = validationResult.data;

    // Get default user (first user for now - should be replaced with auth)
    const defaultUser = await prisma.user.findFirst();
    if (!defaultUser) {
      return NextResponse.json(
        { error: "No user found for createdBy" },
        { status: 400 }
      );
    }

    // Get DRAFT status
    const draftStatus = await prisma.stocktakeStatus.findUnique({
      where: { code: "DRAFT" },
    });
    if (!draftStatus) {
      return NextResponse.json(
        { error: "DRAFT status not found" },
        { status: 500 }
      );
    }

    // Get PENDING assignment status
    const pendingAssignmentStatus =
      await prisma.stocktakeAssignmentStatus.findUnique({
        where: { code: "PENDING" },
      });
    if (!pendingAssignmentStatus) {
      return NextResponse.json(
        { error: "PENDING assignment status not found" },
        { status: 500 }
      );
    }

    const assignmentsToCreate = assignments || [];

    // Use transaction for atomic takeCode generation + create
    const newStocktake = await prisma.$transaction(async (tx) => {
      // Generate takeCode if not provided
      let takeCode = stocktakeData.takeCode;
      if (!takeCode) {
        const date = new Date();
        const year = date.getFullYear();
        const prefix = `KK-${year}`;
        const count = await tx.stocktake.count({
          where: { takeCode: { startsWith: prefix } },
        });
        takeCode = `${prefix}-${String(count + 1).padStart(3, "0")}`;
      }

      return tx.stocktake.create({
        data: {
          takeCode,
          name: stocktakeData.name,
          statusId: stocktakeData.statusId || draftStatus.id,
          areaId: stocktakeData.areaId,
          createdById: stocktakeData.createdById || defaultUser.id,
          takeDate: stocktakeData.takeDate,
          notes: stocktakeData.notes || null,
          assignments: {
            create: assignmentsToCreate.map((assignment) => ({
              locationId: assignment.locationId,
              assigneeId: assignment.assigneeId,
              statusId: assignment.statusId || pendingAssignmentStatus.id,
            })),
          },
        },
        include: includeRelations,
      });
    });

    return NextResponse.json(newStocktake, { status: 201 });
  } catch (error) {
    console.error("Error creating stocktake:", error);
    return NextResponse.json(
      { error: "Failed to create stocktake" },
      { status: 500 }
    );
  }
}
