import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

type RouteParams = {
  params: Promise<{ id: string }>
}

// Common include for fetching full request data
const requestInclude = {
  requester: { select: { id: true, name: true, employeeCode: true } },
  department: { select: { id: true, code: true, name: true } },
  status: { select: { id: true, code: true, name: true, color: true } },
  source: { select: { id: true, code: true, name: true } },
  fundingSource: { select: { id: true, code: true, name: true } },
  items: {
    include: {
      material: { select: { id: true, code: true, name: true } },
      unit: { select: { id: true, code: true, name: true } },
      suggestedSupplier: { select: { id: true, name: true } },
    },
  },
}

// Helper to map request to frontend format
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRequestToResponse(req: any) {
  return {
    id: req.requestCode,
    requestCode: req.requestCode,
    requesterId: req.requesterId,
    departmentId: req.departmentId,
    statusId: req.statusId,
    sourceId: req.sourceId,
    fundingSourceId: req.fundingSourceId,
    requester: req.requester,
    department: req.department,
    status: req.status,
    source: req.source,
    fundingSource: req.fundingSource,
    requesterName: req.requester.name,
    requesterDept: req.department.name,
    description: req.description,
    totalAmount: req.totalAmount,
    step: req.step,
    createdAt: req.createdAt.toISOString(),
    updatedAt: req.updatedAt.toISOString(),
    items: req.items.map((item: {
      id: string
      materialId: string | null
      name: string
      unitId: string
      quantity: number
      estimatedPrice: number
      suggestedSupplierId: string | null
      material: { id: string; code: string; name: string } | null
      unit: { id: string; code: string; name: string }
      suggestedSupplier: { id: string; name: string } | null
    }) => ({
      id: item.id,
      materialId: item.materialId,
      name: item.name,
      unitId: item.unitId,
      material: item.material,
      unit: item.unit,
      suggestedSupplier: item.suggestedSupplier,
      suggestedSupplierId: item.suggestedSupplierId,
      quantity: item.quantity,
      estimatedPrice: item.estimatedPrice,
    }))
  }
}

// GET /api/purchase-requests/[id] - Get a single request
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    const purchaseRequest = await prisma.purchaseRequest.findFirst({
      where: { requestCode: id },
      include: requestInclude
    })

    if (!purchaseRequest) {
      return NextResponse.json(
        { error: 'Purchase request not found' },
        { status: 404 }
      )
    }

    const data = mapRequestToResponse(purchaseRequest)

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error fetching purchase request:', error)
    return NextResponse.json(
      { error: 'Failed to fetch purchase request' },
      { status: 500 }
    )
  }
}

// PUT /api/purchase-requests/[id] - Update a request
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()
    const {
      departmentId,
      statusId,
      sourceId,
      fundingSourceId,
      description,
      items,
      step
    } = body

    // Find existing request
    const existingRequest = await prisma.purchaseRequest.findFirst({
      where: { requestCode: id }
    })

    if (!existingRequest) {
      return NextResponse.json(
        { error: 'Purchase request not found' },
        { status: 404 }
      )
    }

    // Calculate new total if items provided
    let totalAmount = existingRequest.totalAmount
    if (items && Array.isArray(items)) {
      totalAmount = items.reduce((sum: number, item: { quantity: number; estimatedPrice: number }) =>
        sum + (item.quantity * item.estimatedPrice), 0)
    }

    // Update request
    await prisma.purchaseRequest.update({
      where: { id: existingRequest.id },
      data: {
        departmentId: departmentId ?? existingRequest.departmentId,
        statusId: statusId ?? existingRequest.statusId,
        sourceId: sourceId ?? existingRequest.sourceId,
        fundingSourceId: fundingSourceId ?? existingRequest.fundingSourceId,
        description: description ?? existingRequest.description,
        totalAmount,
        step: step ?? existingRequest.step,
      },
    })

    // If items are provided, replace them
    if (items && Array.isArray(items)) {
      // Delete existing items
      await prisma.purchaseRequestItem.deleteMany({
        where: { requestId: existingRequest.id }
      })

      // Create new items
      await prisma.purchaseRequestItem.createMany({
        data: items.map((item: {
          materialId?: string
          name: string
          unitId: string
          quantity: number
          estimatedPrice: number
          suggestedSupplierId?: string
        }) => ({
          requestId: existingRequest.id,
          materialId: item.materialId || null,
          name: item.name,
          unitId: item.unitId,
          quantity: item.quantity,
          estimatedPrice: item.estimatedPrice,
          suggestedSupplierId: item.suggestedSupplierId || null,
        }))
      })
    }

    // Fetch updated request with items
    const finalRequest = await prisma.purchaseRequest.findUnique({
      where: { id: existingRequest.id },
      include: requestInclude
    })

    const data = mapRequestToResponse(finalRequest)

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error updating purchase request:', error)
    return NextResponse.json(
      { error: 'Failed to update purchase request' },
      { status: 500 }
    )
  }
}

// DELETE /api/purchase-requests/[id] - Delete (hard delete)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    const existingRequest = await prisma.purchaseRequest.findFirst({
      where: { requestCode: id }
    })

    if (!existingRequest) {
      return NextResponse.json(
        { error: 'Purchase request not found' },
        { status: 404 }
      )
    }

    // Hard delete the request (cascade deletes items)
    await prisma.purchaseRequest.delete({
      where: { id: existingRequest.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting purchase request:', error)
    return NextResponse.json(
      { error: 'Failed to delete purchase request' },
      { status: 500 }
    )
  }
}
