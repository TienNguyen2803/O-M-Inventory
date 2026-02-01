import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

type RouteParams = {
  params: Promise<{ id: string }>
}

// Common include for fetching full bidding package data
const packageInclude = {
  method: { select: { id: true, code: true, name: true } },
  status: { select: { id: true, code: true, name: true, color: true } },
  createdBy: { select: { id: true, name: true, employeeCode: true } },
  winner: { select: { id: true, code: true, name: true } },
  purchaseRequests: {
    include: {
      purchaseRequest: {
        select: { id: true, requestCode: true, description: true, totalAmount: true }
      }
    }
  },
  participants: {
    include: {
      supplier: { select: { id: true, code: true, name: true } },
      quotations: {
        include: {
          scopeItem: { select: { id: true, name: true } }
        }
      }
    }
  },
  scopeItems: {
    include: {
      material: { select: { id: true, code: true, name: true } },
      unit: { select: { id: true, code: true, name: true } }
    }
  }
}

// Helper to map package to response
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapPackageToResponse(pkg: any) {
  return {
    id: pkg.packageCode,
    packageCode: pkg.packageCode,
    name: pkg.name,
    methodId: pkg.methodId,
    statusId: pkg.statusId,
    createdById: pkg.createdById,
    winnerId: pkg.winnerId,
    method: pkg.method,
    status: pkg.status,
    createdBy: pkg.createdBy,
    winner: pkg.winner,
    estimatedBudget: pkg.estimatedBudget,
    openDate: pkg.openDate?.toISOString(),
    closeDate: pkg.closeDate?.toISOString(),
    step: pkg.step,
    notes: pkg.notes,
    createdAt: pkg.createdAt.toISOString(),
    updatedAt: pkg.updatedAt.toISOString(),
    purchaseRequests: pkg.purchaseRequests?.map((pr: { purchaseRequest: { id: string; requestCode: string; description: string; totalAmount: number } }) => pr.purchaseRequest) || [],
    participants: pkg.participants?.map((p: {
      id: string
      invitedAt: Date
      submittedAt: Date | null
      isSubmitted: boolean
      technicalScore: number | null
      priceScore: number | null
      totalScore: number | null
      rank: number | null
      supplier: { id: string; code: string; name: string }
      quotations: Array<{
        id: string
        unitPrice: number
        quantity: number
        totalPrice: number
        scopeItem: { id: string; name: string }
      }>
    }) => ({
      id: p.id,
      supplier: p.supplier,
      invitedAt: p.invitedAt?.toISOString(),
      submittedAt: p.submittedAt?.toISOString(),
      isSubmitted: p.isSubmitted,
      technicalScore: p.technicalScore,
      priceScore: p.priceScore,
      totalScore: p.totalScore,
      rank: p.rank,
      quotations: p.quotations?.map(q => ({
        id: q.id,
        scopeItemId: q.scopeItem.id,
        scopeItemName: q.scopeItem.name,
        unitPrice: q.unitPrice,
        quantity: q.quantity,
        totalPrice: q.totalPrice
      })) || []
    })) || [],
    scopeItems: pkg.scopeItems?.map((item: {
      id: string
      materialId: string | null
      name: string
      unitId: string
      quantity: number
      estimatedAmount: number
      material: { id: string; code: string; name: string } | null
      unit: { id: string; code: string; name: string }
    }) => ({
      id: item.id,
      materialId: item.materialId,
      name: item.name,
      unitId: item.unitId,
      quantity: item.quantity,
      estimatedAmount: item.estimatedAmount,
      material: item.material,
      unit: item.unit
    })) || []
  }
}

// GET /api/bidding-packages/[id] - Get a single package
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    const biddingPackage = await prisma.biddingPackage.findFirst({
      where: { packageCode: id },
      include: packageInclude
    })

    if (!biddingPackage) {
      return NextResponse.json(
        { error: 'Bidding package not found' },
        { status: 404 }
      )
    }

    const data = mapPackageToResponse(biddingPackage)

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error fetching bidding package:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bidding package' },
      { status: 500 }
    )
  }
}

// PUT /api/bidding-packages/[id] - Update a package
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()
    const {
      name,
      methodId,
      statusId,
      winnerId,
      estimatedBudget,
      openDate,
      closeDate,
      step,
      notes,
      purchaseRequestIds,
      scopeItems
    } = body

    const existing = await prisma.biddingPackage.findFirst({
      where: { packageCode: id }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Bidding package not found' },
        { status: 404 }
      )
    }

    // Update package
    await prisma.biddingPackage.update({
      where: { id: existing.id },
      data: {
        name: name ?? existing.name,
        methodId: methodId ?? existing.methodId,
        statusId: statusId ?? existing.statusId,
        winnerId: winnerId !== undefined ? winnerId : existing.winnerId,
        estimatedBudget: estimatedBudget ?? existing.estimatedBudget,
        openDate: openDate ? new Date(openDate) : existing.openDate,
        closeDate: closeDate ? new Date(closeDate) : existing.closeDate,
        step: step ?? existing.step,
        notes: notes !== undefined ? notes : existing.notes,
      },
    })

    // Update purchase request links if provided
    if (purchaseRequestIds !== undefined) {
      await prisma.biddingPurchaseRequest.deleteMany({
        where: { biddingPackageId: existing.id }
      })
      if (purchaseRequestIds.length > 0) {
        await prisma.biddingPurchaseRequest.createMany({
          data: purchaseRequestIds.map((prId: string) => ({
            biddingPackageId: existing.id,
            purchaseRequestId: prId
          }))
        })
      }
    }

    // Update scope items if provided
    if (scopeItems !== undefined) {
      // First, delete any quotations that reference the old scope items
      // to avoid FK constraint errors
      const existingScopeItems = await prisma.biddingScopeItem.findMany({
        where: { biddingPackageId: existing.id },
        select: { id: true }
      })
      const existingScopeItemIds = existingScopeItems.map(item => item.id)
      
      if (existingScopeItemIds.length > 0) {
        await prisma.bidQuotation.deleteMany({
          where: { scopeItemId: { in: existingScopeItemIds } }
        })
      }

      // Now delete the old scope items
      await prisma.biddingScopeItem.deleteMany({
        where: { biddingPackageId: existing.id }
      })
      
      // Create new scope items
      if (scopeItems.length > 0) {
        await prisma.biddingScopeItem.createMany({
          data: scopeItems.map((item: {
            materialId?: string
            name: string
            unitId: string
            quantity: number
            estimatedAmount: number
          }) => ({
            biddingPackageId: existing.id,
            materialId: item.materialId || null,
            name: item.name,
            unitId: item.unitId,
            quantity: item.quantity,
            estimatedAmount: item.estimatedAmount
          }))
        })
      }
    }

    // Fetch updated package
    const updated = await prisma.biddingPackage.findUnique({
      where: { id: existing.id },
      include: packageInclude
    })

    const data = mapPackageToResponse(updated)

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error updating bidding package:', error)
    return NextResponse.json(
      { error: 'Failed to update bidding package' },
      { status: 500 }
    )
  }
}

// DELETE /api/bidding-packages/[id] - Delete a package
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    const existing = await prisma.biddingPackage.findFirst({
      where: { packageCode: id }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Bidding package not found' },
        { status: 404 }
      )
    }

    await prisma.biddingPackage.delete({
      where: { id: existing.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting bidding package:', error)
    return NextResponse.json(
      { error: 'Failed to delete bidding package' },
      { status: 500 }
    )
  }
}
