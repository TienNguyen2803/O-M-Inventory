import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

// GET /api/warehouse-locations - List with pagination, search, and filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const areaId = searchParams.get('areaId') || ''
    const typeId = searchParams.get('typeId') || ''
    const statusId = searchParams.get('statusId') || ''

    const skip = (page - 1) * limit

    // Build where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {}

    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (areaId) {
      where.areaId = areaId
    }

    if (typeId) {
      where.typeId = typeId
    }

    if (statusId) {
      where.statusId = statusId
    }

    // Get total count for pagination
    const total = await prisma.warehouseLocation.count({ where })

    // Get locations with pagination and nested relations
    const locations = await prisma.warehouseLocation.findMany({
      where,
      skip,
      take: limit,
      orderBy: { code: 'asc' },
      include: {
        area: true,
        type: true,
        status: true,
        items: {
          include: {
            unit: true,
          },
        },
      },
    })

    return NextResponse.json({
      data: locations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching warehouse locations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch warehouse locations' },
      { status: 500 }
    )
  }
}

// POST /api/warehouse-locations - Create a new location
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, name, areaId, typeId, statusId, barcode, maxWeight, dimensions } = body

    // Validate required fields
    if (!code || !name || !areaId || !typeId || !statusId) {
      return NextResponse.json(
        { error: 'Các trường bắt buộc: code, name, areaId, typeId, statusId' },
        { status: 400 }
      )
    }

    // Create location
    const location = await prisma.warehouseLocation.create({
      data: {
        code,
        name,
        areaId,
        typeId,
        statusId,
        barcode: barcode || null,
        maxWeight: maxWeight || null,
        dimensions: dimensions || null,
      },
      include: {
        area: true,
        type: true,
        status: true,
        items: {
          include: {
            unit: true,
          },
        },
      },
    })

    return NextResponse.json(location, { status: 201 })
  } catch (error) {
    console.error('Error creating warehouse location:', error)

    // Handle unique constraint violation
    if ((error as { code?: string }).code === 'P2002') {
      return NextResponse.json(
        { error: 'Mã vị trí đã tồn tại' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create warehouse location' },
      { status: 500 }
    )
  }
}
