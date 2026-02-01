import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

// GET /api/materials - List materials with pagination, search, and filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const categoryId = searchParams.get('categoryId') || ''
    const statusId = searchParams.get('statusId') || ''
    const managementTypeId = searchParams.get('managementTypeId') || ''

    const skip = (page - 1) * limit

    // Build where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {}

    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { partNo: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (categoryId) {
      where.categoryId = categoryId
    }

    if (statusId) {
      where.statusId = statusId
    }

    if (managementTypeId) {
      where.managementTypeId = managementTypeId
    }

    // Get total count for pagination
    const total = await prisma.material.count({ where })

    // Get materials with pagination and include relations
    const materials = await prisma.material.findMany({
      where,
      skip,
      take: limit,
      orderBy: { code: 'asc' },
      include: {
        managementType: true,
        materialCategory: true,
        materialUnit: true,
        materialStatus: true,
        country: true,
      }
    })

    return NextResponse.json({
      data: materials,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching materials:', error)
    return NextResponse.json(
      { error: 'Failed to fetch materials' },
      { status: 500 }
    )
  }
}

// POST /api/materials - Create a new material
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      name, nameEn, code, evnCode, partNo, serialNumber,
      managementTypeId, categoryId, unitId, statusId, countryId,
      description, manufacturer, minStock, maxStock, technicalSpecs,
      location, stockAge, supplierWarranty, serviceWarranty,
      chassisPn, chassisSn, originAsPerCustomer, originOnDocs,
      warrantyCount, lifespan
    } = body

    // Validate required fields
    if (!name || !code || !partNo || !managementTypeId || !categoryId || !unitId || !statusId) {
      return NextResponse.json(
        { error: 'Missing required fields: name, code, partNo, managementTypeId, categoryId, unitId, statusId' },
        { status: 400 }
      )
    }

    // Create material
    const material = await prisma.material.create({
      data: {
        name,
        nameEn: nameEn || null,
        code,
        evnCode: evnCode || null,
        partNo,
        serialNumber: serialNumber || null,
        managementTypeId,
        categoryId,
        unitId,
        statusId,
        countryId: countryId || null,
        description: description || null,
        manufacturer: manufacturer || null,
        minStock: minStock || null,
        maxStock: maxStock || null,
        technicalSpecs: technicalSpecs || null,
        location: location || null,
        stockAge: stockAge || null,
        supplierWarranty: supplierWarranty || null,
        serviceWarranty: serviceWarranty || null,
        chassisPn: chassisPn || null,
        chassisSn: chassisSn || null,
        originAsPerCustomer: originAsPerCustomer || null,
        originOnDocs: originOnDocs || null,
        warrantyCount: warrantyCount || null,
        lifespan: lifespan || null,
      },
      include: {
        managementType: true,
        materialCategory: true,
        materialUnit: true,
        materialStatus: true,
        country: true,
      }
    })

    return NextResponse.json(material, { status: 201 })
  } catch (error) {
    console.error('Error creating material:', error)

    // Handle unique constraint violation
    if ((error as { code?: string }).code === 'P2002') {
      return NextResponse.json(
        { error: 'Material with this code already exists' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create material' },
      { status: 500 }
    )
  }
}
