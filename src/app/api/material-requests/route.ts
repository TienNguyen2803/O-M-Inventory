import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

// Helper function to generate request code
async function generateRequestCode(): Promise<string> {
  const year = new Date().getFullYear()
  const prefix = `YCVT-${year}-`

  // Find the latest request code for this year
  const latestRequest = await prisma.materialRequest.findFirst({
    where: {
      requestCode: { startsWith: prefix }
    },
    orderBy: { requestCode: 'desc' }
  })

  let nextNumber = 1
  if (latestRequest) {
    const lastNumber = parseInt(latestRequest.requestCode.replace(prefix, ''))
    nextNumber = lastNumber + 1
  }

  return `${prefix}${String(nextNumber).padStart(3, '0')}`
}

// Helper to get default status ID (PEND = Chờ duyệt)
async function getDefaultStatusId(): Promise<string> {
  const status = await prisma.requestStatus.findFirst({
    where: { code: 'PEND' }
  })
  if (!status) throw new Error('Default status PEND not found')
  return status.id
}

// GET /api/material-requests - Get all requests with pagination, search, and filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const departmentId = searchParams.get('departmentId') || ''
    const statusId = searchParams.get('statusId') || ''
    const priorityId = searchParams.get('priorityId') || ''
    // Legacy string filters for backward compatibility
    const department = searchParams.get('department') || ''
    const status = searchParams.get('status') || ''
    const priority = searchParams.get('priority') || ''

    const skip = (page - 1) * limit

    // Build where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {}

    if (search) {
      where.OR = [
        { requestCode: { contains: search, mode: 'insensitive' } },
        { requester: { name: { contains: search, mode: 'insensitive' } } },
        { reason: { contains: search, mode: 'insensitive' } },
      ]
    }

    // FK ID filters
    if (departmentId) {
      where.departmentId = departmentId
    }
    if (statusId) {
      where.statusId = statusId
    }
    if (priorityId) {
      where.priorityId = priorityId
    }

    // Legacy string filters (search by name)
    if (department && !departmentId) {
      where.department = { name: department }
    }
    if (status && !statusId) {
      where.status = { name: status }
    }
    if (priority && !priorityId) {
      where.priority = { name: priority }
    }

    // Get total count for pagination
    const total = await prisma.materialRequest.count({ where })

    // Get requests with pagination and items
    const requests = await prisma.materialRequest.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
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
    })

    // Map to frontend format
    const data = requests.map(req => ({
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
      // Legacy fields for backward compatibility
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
        // Legacy fields for backward compatibility
        materialCode: item.material.code,
        materialName: item.material.name,
        partNumber: item.material.partNo,
        requestedQuantity: item.requestedQuantity,
        stock: item.stock,
        notes: item.notes,
      }))
    }))

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching material requests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch material requests' },
      { status: 500 }
    )
  }
}

// POST /api/material-requests - Create a new request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      requesterId,
      departmentId,
      priorityId,
      reason,
      requestDate,
      workOrder,
      items = []
    } = body

    // Validate required fields
    if (!requesterId || !departmentId || !priorityId || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields: requesterId, departmentId, priorityId, reason' },
        { status: 400 }
      )
    }

    // Generate request code
    const requestCode = await generateRequestCode()

    // Get default status (Pending)
    const defaultStatusId = await getDefaultStatusId()

    // Create request with items
    const materialRequest = await prisma.materialRequest.create({
      data: {
        requestCode,
        requesterId,
        departmentId,
        priorityId,
        statusId: defaultStatusId,
        reason,
        requestDate: requestDate ? new Date(requestDate) : new Date(),
        workOrder: workOrder || null,
        step: 2, // After creation, move to pending
        items: {
          create: items.map((item: {
            materialId: string
            unitId: string
            requestedQuantity: number
            stock: number
            notes?: string
          }) => ({
            materialId: item.materialId,
            unitId: item.unitId,
            requestedQuantity: item.requestedQuantity,
            stock: item.stock,
            notes: item.notes || null,
          }))
        }
      },
      include: {
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
    })

    // Map to frontend format
    const data = {
      id: materialRequest.requestCode,
      requesterId: materialRequest.requesterId,
      departmentId: materialRequest.departmentId,
      priorityId: materialRequest.priorityId,
      statusId: materialRequest.statusId,
      approverId: materialRequest.approverId,
      requester: materialRequest.requester,
      department: materialRequest.department,
      priority: materialRequest.priority,
      status: materialRequest.status,
      approver: materialRequest.approver,
      requesterName: materialRequest.requester.name,
      requesterDept: materialRequest.department.name,
      reason: materialRequest.reason,
      requestDate: materialRequest.requestDate.toISOString(),
      workOrder: materialRequest.workOrder,
      step: materialRequest.step,
      items: materialRequest.items.map(item => ({
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

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('Error creating material request:', error)

    // Handle unique constraint violation
    if ((error as { code?: string }).code === 'P2002') {
      return NextResponse.json(
        { error: 'Request with this code already exists' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create material request' },
      { status: 500 }
    )
  }
}
