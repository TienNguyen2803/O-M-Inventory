import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

type RouteParams = {
  params: Promise<{ id: string }>
}

// GET /api/materials/[id] - Get single material
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    const material = await prisma.material.findUnique({
      where: { id },
      include: {
        managementType: true,
        materialCategory: true,
        materialUnit: true,
        materialStatus: true,
        country: true,
      }
    })

    if (!material) {
      return NextResponse.json(
        { error: 'Material not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(material)
  } catch (error) {
    console.error('Error fetching material:', error)
    return NextResponse.json(
      { error: 'Failed to fetch material' },
      { status: 500 }
    )
  }
}

// PUT /api/materials/[id] - Update material
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
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

    const material = await prisma.material.update({
      where: { id },
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

    return NextResponse.json(material)
  } catch (error) {
    console.error('Error updating material:', error)

    if ((error as { code?: string }).code === 'P2025') {
      return NextResponse.json(
        { error: 'Material not found' },
        { status: 404 }
      )
    }

    if ((error as { code?: string }).code === 'P2002') {
      return NextResponse.json(
        { error: 'Material with this code already exists' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update material' },
      { status: 500 }
    )
  }
}

// DELETE /api/materials/[id] - Delete material
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    await prisma.material.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Material deleted successfully' })
  } catch (error) {
    console.error('Error deleting material:', error)

    if ((error as { code?: string }).code === 'P2025') {
      return NextResponse.json(
        { error: 'Material not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to delete material' },
      { status: 500 }
    )
  }
}
