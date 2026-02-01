import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

type RouteParams = {
  params: Promise<{ id: string }>
}

// Common include for fetching full material request data
const requestInclude = {
  requester: { select: { id: true, name: true, employeeCode: true } },
  department: { select: { id: true, code: true, name: true } },
  priority: { select: { id: true, code: true, name: true } },
  status: { select: { id: true, code: true, name: true, color: true } },
  approver: { select: { id: true, name: true, employeeCode: true } },
  items: {
    include: {
      material: { select: { id: true, code: true, name: true, partNo: true, stock: true } },
      unit: { select: { id: true, code: true, name: true } }
    }
  }
}

// POST /api/material-requests/[id]/approve - Approve a request
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()
    const { approverId } = body

    if (!approverId) {
      return NextResponse.json(
        { error: 'Approver ID is required' },
        { status: 400 }
      )
    }

    // Find existing request
    const existingRequest = await prisma.materialRequest.findFirst({
      where: { requestCode: id },
      include: { status: true }
    })

    if (!existingRequest) {
      return NextResponse.json(
        { error: 'Material request not found' },
        { status: 404 }
      )
    }

    // Check if already approved
    if (existingRequest.status?.code === 'APPR' || existingRequest.status?.code === 'DONE') {
      return NextResponse.json(
        { error: 'Request is already approved' },
        { status: 400 }
      )
    }

    // Get approved status ID
    const approvedStatus = await prisma.requestStatus.findFirst({
      where: { code: 'APPR' }
    })

    if (!approvedStatus) {
      return NextResponse.json(
        { error: 'Approved status not found' },
        { status: 500 }
      )
    }

    // Update request to approved status
    const updatedRequest = await prisma.materialRequest.update({
      where: { id: existingRequest.id },
      data: {
        statusId: approvedStatus.id,
        approverId,
        step: 3, // Move to approved step
      },
      include: requestInclude
    })

    // Map to frontend format
    const data = {
      id: updatedRequest.requestCode,
      requestCode: updatedRequest.requestCode,
      requesterId: updatedRequest.requesterId,
      departmentId: updatedRequest.departmentId,
      priorityId: updatedRequest.priorityId,
      statusId: updatedRequest.statusId,
      approverId: updatedRequest.approverId,
      requester: updatedRequest.requester,
      department: updatedRequest.department,
      priority: updatedRequest.priority,
      status: updatedRequest.status,
      approver: updatedRequest.approver,
      reason: updatedRequest.reason,
      requestDate: updatedRequest.requestDate.toISOString(),
      workOrder: updatedRequest.workOrder,
      step: updatedRequest.step,
      items: updatedRequest.items.map(item => ({
        id: item.id,
        materialId: item.materialId,
        unitId: item.unitId,
        material: item.material,
        unit: item.unit,
        requestedQuantity: item.requestedQuantity,
        stock: item.material?.stock || 0,
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
