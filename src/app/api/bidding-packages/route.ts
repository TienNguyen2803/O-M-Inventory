import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

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
      supplier: { select: { id: true, code: true, name: true } }
    }
  },
  scopeItems: {
    include: {
      material: { select: { id: true, code: true, name: true } },
      unit: { select: { id: true, code: true, name: true } }
    }
  }
}

// Helper to generate package code
async function generatePackageCode(): Promise<string> {
  const year = new Date().getFullYear()
  const prefix = `TB-${year}-`

  const latest = await prisma.biddingPackage.findFirst({
    where: { packageCode: { startsWith: prefix } },
    orderBy: { packageCode: 'desc' }
  })

  let nextNumber = 1
  if (latest) {
    const lastNumber = parseInt(latest.packageCode.replace(prefix, ''))
    nextNumber = lastNumber + 1
  }

  return `${prefix}${String(nextNumber).padStart(2, '0')}`
}

// Helper to get default status ID (INVITE = Đang mời thầu)
async function getDefaultStatusId(): Promise<string> {
  const status = await prisma.biddingStatus.findFirst({
    where: { code: 'INVITE' }
  })
  if (!status) throw new Error('Default status INVITE not found')
  return status.id
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
    }) => ({
      id: p.id,
      supplier: p.supplier,
      invitedAt: p.invitedAt?.toISOString(),
      submittedAt: p.submittedAt?.toISOString(),
      isSubmitted: p.isSubmitted,
      technicalScore: p.technicalScore,
      priceScore: p.priceScore,
      totalScore: p.totalScore,
      rank: p.rank
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

// GET /api/bidding-packages - List all packages with pagination
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const methodId = searchParams.get('methodId') || ''
    const statusId = searchParams.get('statusId') || ''

    const skip = (page - 1) * limit

    // Build where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {}

    if (search) {
      where.OR = [
        { packageCode: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (methodId) where.methodId = methodId
    if (statusId) where.statusId = statusId

    const total = await prisma.biddingPackage.count({ where })

    const packages = await prisma.biddingPackage.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: packageInclude
    })

    const data = packages.map(mapPackageToResponse)

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
    console.error('Error fetching bidding packages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bidding packages' },
      { status: 500 }
    )
  }
}

// POST /api/bidding-packages - Create a new package
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      methodId,
      createdById,
      estimatedBudget,
      openDate,
      closeDate,
      notes,
      purchaseRequestIds = [],
      scopeItems = []
    } = body

    // Validate required fields
    if (!name || !methodId || !createdById || !estimatedBudget || !openDate || !closeDate) {
      return NextResponse.json(
        { error: 'Missing required fields: name, methodId, createdById, estimatedBudget, openDate, closeDate' },
        { status: 400 }
      )
    }

    const packageCode = await generatePackageCode()
    const defaultStatusId = await getDefaultStatusId()

    // Create package with relations
    const biddingPackage = await prisma.biddingPackage.create({
      data: {
        packageCode,
        name,
        methodId,
        statusId: defaultStatusId,
        createdById,
        estimatedBudget,
        openDate: new Date(openDate),
        closeDate: new Date(closeDate),
        notes,
        step: 1,
        purchaseRequests: purchaseRequestIds.length > 0 ? {
          create: purchaseRequestIds.map((prId: string) => ({
            purchaseRequestId: prId
          }))
        } : undefined,
        scopeItems: scopeItems.length > 0 ? {
          create: scopeItems.map((item: {
            materialId?: string
            name: string
            unitId: string
            quantity: number
            estimatedAmount: number
          }) => ({
            materialId: item.materialId || null,
            name: item.name,
            unitId: item.unitId,
            quantity: item.quantity,
            estimatedAmount: item.estimatedAmount
          }))
        } : undefined
      },
      include: packageInclude
    })

    const data = mapPackageToResponse(biddingPackage)

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('Error creating bidding package:', error)

    if ((error as { code?: string }).code === 'P2002') {
      return NextResponse.json(
        { error: 'Package with this code already exists' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create bidding package' },
      { status: 500 }
    )
  }
}
