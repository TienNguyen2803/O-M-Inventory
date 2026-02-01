import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

type RouteParams = {
  params: Promise<{ id: string }>
}

// Common include for fetching full request data
const requestInclude = {
  requester: { select: { id: true, name: true, employeeCode: true } },
  department: { select: { id: true, code: true, name: true } },
  priority: { select: { id: true, code: true, name: true, color: true } },
  status: { select: { id: true, code: true, name: true, color: true } },
  approver: { select: { id: true, name: true, employeeCode: true } },
  items: {
    include: {
      material: { select: { id: true, code: true, name: true, partNo: true, stock: true } },
      unit: { select: { id: true, code: true, name: true } },
    },
  },
}

// Helper to map request to frontend format
function mapRequestToResponse(req: Awaited<ReturnType<typeof prisma.materialRequest.findFirst>> & {
  requester: { id: string; name: string; employeeCode: string }
  department: { id: string; code: string; name: string }
  priority: { id: string; code: string; name: string; color: string | null }
  status: { id: string; code: string; name: string; color: string | null }
  approver: { id: string; name: string; employeeCode: string } | null
  items: Array<{
    id: string
    materialId: string
    unitId: string
    requestedQuantity: number
    stock: number
    notes: string | null
    material: { id: string; code: string; name: string; partNo: string; stock: number }
    unit: { id: string; code: string; name: string }
  }>
}) {
  return {
    id: req.requestCode,
    requesterId: req.requesterId,
    departmentId: req.departmentId,
    priorityId: req.priorityId,
    statusId: req.statusId,
    approverId: req.approverId,
    requester: req.requester,
    department: req.department,
    priority: req.priority,
    status: req.status,
    approver: req.approver,
    requesterName: req.requester.name,
    requesterDept: req.department.name,
    reason: req.reason,
    requestDate: req.requestDate.toISOString(),
    workOrder: req.workOrder,
    step: req.step,
    items: req.items.map(item => ({
      id: item.id,
      materialId: item.materialId,
      unitId: item.unitId,
      material: item.material,
      unit: item.unit,
      materialCode: item.material.code,
      materialName: item.material.name,
      partNumber: item.material.partNo,
      requestedQuantity: item.requestedQuantity,
      stock: item.stock,
      notes: item.notes,
    }))
  }
}

// GET /api/material-requests/[id] - Get a single request
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    const materialRequest = await prisma.materialRequest.findFirst({
      where: { requestCode: id },
      include: requestInclude
    })

    if (!materialRequest) {
      return NextResponse.json(
        { error: 'Material request not found' },
        { status: 404 }
      )
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = mapRequestToResponse(materialRequest as any)

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error fetching material request:', error)
    return NextResponse.json(
      { error: 'Failed to fetch material request' },
      { status: 500 }
    )
  }
}

// PUT /api/material-requests/[id] - Update a request
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()
    const {
      departmentId,
      priorityId,
      statusId,
      approverId,
      reason,
      workOrder,
      items,
      step
    } = body

    // Find existing request
    const existingRequest = await prisma.materialRequest.findFirst({
      where: { requestCode: id }
    })

    if (!existingRequest) {
      return NextResponse.json(
        { error: 'Material request not found' },
        { status: 404 }
      )
    }

    // Update request
    await prisma.materialRequest.update({
      where: { id: existingRequest.id },
      data: {
        departmentId: departmentId ?? existingRequest.departmentId,
        priorityId: priorityId ?? existingRequest.priorityId,
        statusId: statusId ?? existingRequest.statusId,
        approverId: approverId !== undefined ? approverId : existingRequest.approverId,
        reason: reason ?? existingRequest.reason,
        workOrder: workOrder !== undefined ? workOrder : existingRequest.workOrder,
        step: step ?? existingRequest.step,
      },
    })

    // If items are provided, replace them
    if (items && Array.isArray(items)) {
      // Delete existing items
      await prisma.materialRequestItem.deleteMany({
        where: { requestId: existingRequest.id }
      })

      // Create new items
      await prisma.materialRequestItem.createMany({
        data: items.map((item: {
          materialId: string
          unitId: string
          requestedQuantity: number
          stock: number
          notes?: string
        }) => ({
          requestId: existingRequest.id,
          materialId: item.materialId,
          unitId: item.unitId,
          requestedQuantity: item.requestedQuantity,
          stock: item.stock,
          notes: item.notes || null,
        }))
      })
    }

    // Fetch updated request with items
    const finalRequest = await prisma.materialRequest.findUnique({
      where: { id: existingRequest.id },
      include: requestInclude
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = mapRequestToResponse(finalRequest as any)

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error updating material request:', error)
    return NextResponse.json(
      { error: 'Failed to update material request' },
      { status: 500 }
    )
  }
}

// DELETE /api/material-requests/[id] - Delete (hard delete)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    const existingRequest = await prisma.materialRequest.findFirst({
      where: { requestCode: id }
    })

    if (!existingRequest) {
      return NextResponse.json(
        { error: 'Material request not found' },
        { status: 404 }
      )
    }

    // Hard delete the request (cascade deletes items)
    await prisma.materialRequest.delete({
      where: { id: existingRequest.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting material request:', error)
    return NextResponse.json(
      { error: 'Failed to delete material request' },
      { status: 500 }
    )
  }
}
