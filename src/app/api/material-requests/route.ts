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

// GET /api/material-requests - Get all requests with pagination, search, and filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
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
        { requesterName: { contains: search, mode: 'insensitive' } },
        { reason: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (department) {
      where.requesterDept = department
    }

    if (status) {
      where.status = status
    }

    if (priority) {
      where.priority = priority
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
        items: true
      }
    })

    // Map to frontend format
    const data = requests.map(req => ({
      id: req.requestCode,
      requesterName: req.requesterName,
      requesterDept: req.requesterDept,
      reason: req.reason,
      requestDate: req.requestDate.toISOString(),
      workOrder: req.workOrder,
      priority: req.priority,
      status: req.status,
      approver: req.approver,
      step: req.step,
      items: req.items.map(item => ({
        materialId: item.materialId,
        materialCode: item.materialCode,
        materialName: item.materialName,
        partNumber: item.partNumber,
        unit: item.unit,
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
      requesterName = 'Nguyễn Văn A', // Default placeholder, will be from session
      requesterDept, 
      reason, 
      requestDate, 
      workOrder, 
      priority = 'Bình thường',
      items = []
    } = body

    // Validate required fields
    if (!requesterDept || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields: requesterDept, reason' },
        { status: 400 }
      )
    }

    // Generate request code
    const requestCode = await generateRequestCode()

    // Create request with items
    const materialRequest = await prisma.materialRequest.create({
      data: {
        requestCode,
        requesterName,
        requesterDept,
        reason,
        requestDate: requestDate ? new Date(requestDate) : new Date(),
        workOrder: workOrder || null,
        priority,
        status: 'Chờ duyệt',
        step: 2, // After creation, move to pending
        items: {
          create: items.map((item: {
            materialId: string
            materialCode: string
            materialName: string
            partNumber: string
            unit: string
            requestedQuantity: number
            stock: number
            notes?: string
          }) => ({
            materialId: item.materialId,
            materialCode: item.materialCode,
            materialName: item.materialName,
            partNumber: item.partNumber,
            unit: item.unit,
            requestedQuantity: item.requestedQuantity,
            stock: item.stock,
            notes: item.notes || null,
          }))
        }
      },
      include: { items: true }
    })

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
