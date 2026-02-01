import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

type RouteParams = {
  params: Promise<{ id: string }>
}

// GET /api/warehouse-locations/[id] - Get single location with items
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    const location = await prisma.warehouseLocation.findUnique({
      where: { id },
      include: {
        items: true,
      },
    })

    if (!location) {
      return NextResponse.json(
        { error: 'Không tìm thấy vị trí kho' },
        { status: 404 }
      )
    }

    return NextResponse.json(location)
  } catch (error) {
    console.error('Error fetching warehouse location:', error)
    return NextResponse.json(
      { error: 'Failed to fetch warehouse location' },
      { status: 500 }
    )
  }
}

// PUT /api/warehouse-locations/[id] - Update location
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()
    const { code, name, area, type, status, barcode, maxWeight, dimensions } = body

    // Validate required fields
    if (!code || !name || !area || !type) {
      return NextResponse.json(
        { error: 'Các trường bắt buộc: code, name, area, type' },
        { status: 400 }
      )
    }

    const location = await prisma.warehouseLocation.update({
      where: { id },
      data: {
        code,
        name,
        area,
        type,
        status: status || 'Active',
        barcode: barcode || null,
        maxWeight: maxWeight || null,
        dimensions: dimensions || null,
      },
      include: {
        items: true,
      },
    })

    return NextResponse.json(location)
  } catch (error) {
    console.error('Error updating warehouse location:', error)

    if ((error as { code?: string }).code === 'P2025') {
      return NextResponse.json(
        { error: 'Không tìm thấy vị trí kho' },
        { status: 404 }
      )
    }

    if ((error as { code?: string }).code === 'P2002') {
      return NextResponse.json(
        { error: 'Mã vị trí đã tồn tại' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update warehouse location' },
      { status: 500 }
    )
  }
}

// DELETE /api/warehouse-locations/[id] - Delete location
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    // Check if location has items
    const location = await prisma.warehouseLocation.findUnique({
      where: { id },
      include: {
        items: true,
      },
    })

    if (!location) {
      return NextResponse.json(
        { error: 'Không tìm thấy vị trí kho' },
        { status: 404 }
      )
    }

    if (location.items && location.items.length > 0) {
      return NextResponse.json(
        { error: 'Không thể xóa vị trí kho đang có hàng tồn' },
        { status: 400 }
      )
    }

    await prisma.warehouseLocation.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Đã xóa vị trí kho thành công' })
  } catch (error) {
    console.error('Error deleting warehouse location:', error)

    if ((error as { code?: string }).code === 'P2025') {
      return NextResponse.json(
        { error: 'Không tìm thấy vị trí kho' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to delete warehouse location' },
      { status: 500 }
    )
  }
}
