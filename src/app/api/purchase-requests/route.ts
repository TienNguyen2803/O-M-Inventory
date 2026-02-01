import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

// Helper function to generate request code
async function generateRequestCode(): Promise<string> {
  const year = new Date().getFullYear()
  const prefix = `PR-${year}-`

  // Find the latest request code for this year
  const latestRequest = await prisma.purchaseRequest.findFirst({
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

// GET /api/purchase-requests - Get all requests with pagination, search, and filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const sourceId = searchParams.get('sourceId') || ''
    const statusId = searchParams.get('statusId') || ''

    const skip = (page - 1) * limit

    // Build where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {}

    if (search) {
      where.OR = [
        { requestCode: { contains: search, mode: 'insensitive' } },
        { requester: { name: { contains: search, mode: 'insensitive' } } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    // FK ID filters
    if (sourceId) {
      where.sourceId = sourceId
    }
    if (statusId) {
      where.statusId = statusId
    }

    // Get total count for pagination
    const total = await prisma.purchaseRequest.count({ where })

    // Get requests with pagination and items
    const requests = await prisma.purchaseRequest.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
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
    })

    // Map to frontend format
    const data = requests.map(req => ({
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
      // Legacy fields for backward compatibility
      requesterName: req.requester.name,
      requesterDept: req.department.name,
      description: req.description,
      totalAmount: req.totalAmount,
      step: req.step,
      createdAt: req.createdAt.toISOString(),
      updatedAt: req.updatedAt.toISOString(),
      items: req.items.map(item => ({
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
    console.error('Error fetching purchase requests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch purchase requests' },
      { status: 500 }
    )
  }
}

// POST /api/purchase-requests - Create a new request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      requesterId,
      departmentId,
      sourceId,
      fundingSourceId,
      description,
      items = []
    } = body

    // Validate required fields
    if (!requesterId || !departmentId || !sourceId || !fundingSourceId || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: requesterId, departmentId, sourceId, fundingSourceId, description' },
        { status: 400 }
      )
    }

    // Generate request code
    const requestCode = await generateRequestCode()

    // Get default status (Pending)
    const defaultStatusId = await getDefaultStatusId()

    // Calculate total amount
    const totalAmount = items.reduce((sum: number, item: { quantity: number; estimatedPrice: number }) =>
      sum + (item.quantity * item.estimatedPrice), 0)

    // Create request with items
    const purchaseRequest = await prisma.purchaseRequest.create({
      data: {
        requestCode,
        requesterId,
        departmentId,
        statusId: defaultStatusId,
        sourceId,
        fundingSourceId,
        description,
        totalAmount,
        step: 2, // After creation, move to pending
        items: {
          create: items.map((item: {
            materialId?: string
            name: string
            unitId: string
            quantity: number
            estimatedPrice: number
            suggestedSupplierId?: string
          }) => ({
            materialId: item.materialId || null,
            name: item.name,
            unitId: item.unitId,
            quantity: item.quantity,
            estimatedPrice: item.estimatedPrice,
            suggestedSupplierId: item.suggestedSupplierId || null,
          }))
        }
      },
      include: {
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
    })

    // Map to frontend format
    const data = {
      id: purchaseRequest.requestCode,
      requestCode: purchaseRequest.requestCode,
      requesterId: purchaseRequest.requesterId,
      departmentId: purchaseRequest.departmentId,
      statusId: purchaseRequest.statusId,
      sourceId: purchaseRequest.sourceId,
      fundingSourceId: purchaseRequest.fundingSourceId,
      requester: purchaseRequest.requester,
      department: purchaseRequest.department,
      status: purchaseRequest.status,
      source: purchaseRequest.source,
      fundingSource: purchaseRequest.fundingSource,
      requesterName: purchaseRequest.requester.name,
      requesterDept: purchaseRequest.department.name,
      description: purchaseRequest.description,
      totalAmount: purchaseRequest.totalAmount,
      step: purchaseRequest.step,
      createdAt: purchaseRequest.createdAt.toISOString(),
      updatedAt: purchaseRequest.updatedAt.toISOString(),
      items: purchaseRequest.items.map(item => ({
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

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('Error creating purchase request:', error)

    // Handle unique constraint violation
    if ((error as { code?: string }).code === 'P2002') {
      return NextResponse.json(
        { error: 'Request with this code already exists' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create purchase request' },
      { status: 500 }
    )
  }
}
