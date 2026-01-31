import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

type RouteParams = {
  params: Promise<{ id: string }>
}

// POST /api/material-requests/[id]/approve - Approve a request
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()
    const { approver } = body

    if (!approver) {
      return NextResponse.json(
        { error: 'Approver name is required' },
        { status: 400 }
      )
    }

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

    // Check if already approved
    if (existingRequest.status === 'Đã duyệt' || existingRequest.status === 'Hoàn thành') {
      return NextResponse.json(
        { error: 'Request is already approved' },
        { status: 400 }
      )
    }

    // Update request to approved status
    const updatedRequest = await prisma.materialRequest.update({
      where: { id: existingRequest.id },
      data: {
        status: 'Đã duyệt',
        approver,
        step: 3, // Move to approved step
      },
      include: { items: true }
    })

    // Map to frontend format
    const data = {
      id: updatedRequest.requestCode,
      requesterName: updatedRequest.requesterName,
      requesterDept: updatedRequest.requesterDept,
      reason: updatedRequest.reason,
      requestDate: updatedRequest.requestDate.toISOString(),
      workOrder: updatedRequest.workOrder,
      priority: updatedRequest.priority,
      status: updatedRequest.status,
      approver: updatedRequest.approver,
      step: updatedRequest.step,
      items: updatedRequest.items.map(item => ({
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
    console.error('Error approving material request:', error)
    return NextResponse.json(
      { error: 'Failed to approve material request' },
      { status: 500 }
    )
  }
}
