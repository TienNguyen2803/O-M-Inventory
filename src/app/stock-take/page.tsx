import { prisma } from "@/lib/db";
import { StocktakeClient } from "./_components/stocktake-client";
import { Stocktake, MasterDataItem } from "@/lib/types";

export default async function StocktakePage() {
  // Fetch stocktakes with relations
  const [stocktakesData, stocktakeStatusesData, stocktakeAreasData] =
    await Promise.all([
      prisma.stocktake.findMany({
        take: 100,
        orderBy: { createdAt: "desc" },
        include: {
          status: true,
          area: true,
          createdBy: {
            select: { id: true, name: true, employeeCode: true },
          },
          assignments: {
            include: {
              location: { select: { id: true, code: true, name: true } },
              assignee: {
                select: { id: true, name: true, employeeCode: true },
              },
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
        },
      }),
      prisma.stocktakeStatus.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.stocktakeArea.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      }),
    ]);

  // Transform Prisma data to match our application type
  const stocktakes: Stocktake[] = stocktakesData.map((s) => ({
    id: s.id,
    takeCode: s.takeCode,
    name: s.name,
    statusId: s.statusId,
    areaId: s.areaId,
    createdById: s.createdById,
    status: s.status
      ? {
          id: s.status.id,
          code: s.status.code,
          name: s.status.name,
          color: s.status.color,
          sortOrder: s.status.sortOrder,
        }
      : undefined,
    area: s.area
      ? { id: s.area.id, code: s.area.code, name: s.area.name }
      : undefined,
    createdBy: s.createdBy || undefined,
    takeDate: s.takeDate.toISOString(),
    notes: s.notes,
    completedAt: s.completedAt?.toISOString() || null,
    currentStep: s.status.sortOrder,
    totalLocations: s.assignments.length,
    completedLocations: s.assignments.filter(
      (a) => a.status.code === "COMPLETED"
    ).length,
    totalVariance: s.results.reduce((sum, r) => sum + r.variance, 0),
    assignments: s.assignments.map((a) => ({
      id: a.id,
      stocktakeId: a.stocktakeId,
      locationId: a.locationId,
      assigneeId: a.assigneeId,
      statusId: a.statusId,
      location: a.location || undefined,
      assignee: a.assignee || undefined,
      status: a.status
        ? {
            id: a.status.id,
            code: a.status.code,
            name: a.status.name,
            color: a.status.color,
          }
        : undefined,
      completedAt: a.completedAt?.toISOString() || null,
    })),
    results: s.results.map((r) => ({
      id: r.id,
      stocktakeId: r.stocktakeId,
      materialId: r.materialId,
      locationId: r.locationId,
      unitId: r.unitId,
      countedById: r.countedById,
      material: r.material || undefined,
      location: r.location || undefined,
      unit: r.unit
        ? { id: r.unit.id, code: r.unit.code, name: r.unit.name }
        : undefined,
      countedBy: r.countedBy || undefined,
      bookQuantity: r.bookQuantity,
      actualQuantity: r.actualQuantity,
      variance: r.variance,
      serialBatch: r.serialBatch,
      notes: r.notes,
      updatedAt: r.updatedAt.toISOString(),
    })),
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  }));

  // Transform master data
  const stocktakeStatuses: MasterDataItem[] = stocktakeStatusesData.map(
    (s) => ({
      id: s.id,
      code: s.code,
      name: s.name,
      color: s.color,
    })
  );

  const stocktakeAreas: MasterDataItem[] = stocktakeAreasData.map((a) => ({
    id: a.id,
    code: a.code,
    name: a.name,
    color: a.color,
  }));

  return (
    <StocktakeClient
      initialStocktakes={stocktakes}
      stocktakeStatuses={stocktakeStatuses}
      stocktakeAreas={stocktakeAreas}
    />
  );
}
