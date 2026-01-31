import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

type RouteParams = {
  params: Promise<{ id: string }>
}

// GET /api/material-requests/[id] - Get a single request
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    const materialRequest = await prisma.materialRequest.findFirst({
      where: { requestCode: id },
      include: { items: true }
    })

    if (!materialRequest) {
      return NextResponse.json(
        { error: 'Material request not found' },
        { status: 404 }
      )
    }

    // Map to frontend format
    const data = {
      id: materialRequest.requestCode,
      requesterName: materialRequest.requesterName,
      requesterDept: materialRequest.requesterDept,
      reason: materialRequest.reason,
      requestDate: materialRequest.requestDate.toISOString(),
      workOrder: materialRequest.workOrder,
      priority: materialRequest.priority,
      status: materialRequest.status,
      approver: materialRequest.approver,
      step: materialRequest.step,
      items: materialRequest.items.map(item => ({
        materialId: item.materialId,
        materialCode: item.materialCode,
        materialName: item.materialName,
        partNumber: item.partNumber,
        unit: item.unit,
        requestedQuantity: item.requestedQuantity,
        stock: item.stock,
        notes: item.notes,
      }))
    }

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
    const { requesterDept, reason, workOrder, priority, items, status, approver, step } = body

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
    const updatedRequest = await prisma.materialRequest.update({
      where: { id: existingRequest.id },
      data: {
        requesterDept: requesterDept ?? existingRequest.requesterDept,
        reason: reason ?? existingRequest.reason,
        workOrder: workOrder !== undefined ? workOrder : existingRequest.workOrder,
        priority: priority ?? existingRequest.priority,
        status: status ?? existingRequest.status,
        approver: approver !== undefined ? approver : existingRequest.approver,
        step: step ?? existingRequest.step,
      },
      include: { items: true }
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
          materialCode: string
          materialName: string
          partNumber: string
          unit: string
          requestedQuantity: number
          stock: number
          notes?: string
        }) => ({
          requestId: existingRequest.id,
          materialId: item.materialId,
          materialCode: item.materialCode,
          materialName: item.materialName,
          partNumber: item.partNumber,
          unit: item.unit,
          requestedQuantity: item.requestedQuantity,
          stock: item.stock,
          notes: item.notes || null,
        }))
      })
    }

    // Fetch updated request with items
    const finalRequest = await prisma.materialRequest.findUnique({
      where: { id: existingRequest.id },
      include: { items: true }
    })

    // Map to frontend format
    const data = {
      id: finalRequest!.requestCode,
      requesterName: finalRequest!.requesterName,
      requesterDept: finalRequest!.requesterDept,
      reason: finalRequest!.reason,
      requestDate: finalRequest!.requestDate.toISOString(),
      workOrder: finalRequest!.workOrder,
      priority: finalRequest!.priority,
      status: finalRequest!.status,
      approver: finalRequest!.approver,
      step: finalRequest!.step,
      items: finalRequest!.items.map(item => ({
        materialId: item.materialId,
        materialCode: item.materialCode,
        materialName: item.materialName,
        partNumber: item.partNumber,
        unit: item.unit,
        requestedQuantity: item.requestedQuantity,
        stock: item.stock,
        notes: item.notes,
      }))
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error updating material request:', error)
    return NextResponse.json(
      { error: 'Failed to update material request' },
      { status: 500 }
    )
  }
}

// DELETE /api/material-requests/[id] - Delete (soft delete via status change)
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
