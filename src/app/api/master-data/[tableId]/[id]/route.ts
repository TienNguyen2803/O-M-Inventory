import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { getMasterDataTable } from '@/lib/master-data-tables'

interface RouteParams {
  params: Promise<{ tableId: string; id: string }>
}

// GET single item by ID
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { tableId, id } = await params
    const tableConfig = getMasterDataTable(tableId)

    if (!tableConfig) {
      return NextResponse.json(
        { error: `Invalid table ID: ${tableId}` },
        { status: 400 }
      )
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const model = (prisma as any)[tableConfig.modelName]

    const item = await model.findUnique({
      where: { id }
    })

    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(item)
  } catch (error) {
    console.error('Error fetching master data item:', error)
    return NextResponse.json(
      { error: 'Failed to fetch master data item' },
      { status: 500 }
    )
  }
}

// PUT update item by ID
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { tableId, id } = await params
    const tableConfig = getMasterDataTable(tableId)

    if (!tableConfig) {
      return NextResponse.json(
        { error: `Invalid table ID: ${tableId}` },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { code, name, color, sortOrder, isActive } = body

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const model = (prisma as any)[tableConfig.modelName]

    const item = await model.update({
      where: { id },
      data: {
        ...(code !== undefined && { code }),
        ...(name !== undefined && { name }),
        ...(color !== undefined && { color }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(isActive !== undefined && { isActive })
      }
    })

    return NextResponse.json(item)
  } catch (error) {
    console.error('Error updating master data item:', error)

    if ((error as { code?: string }).code === 'P2025') {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      )
    }

    if ((error as { code?: string }).code === 'P2002') {
      return NextResponse.json(
        { error: 'Item with this code already exists' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update master data item' },
      { status: 500 }
    )
  }
}

// DELETE item by ID (soft delete - set isActive = false)
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { tableId, id } = await params
    const tableConfig = getMasterDataTable(tableId)

    if (!tableConfig) {
      return NextResponse.json(
        { error: `Invalid table ID: ${tableId}` },
        { status: 400 }
      )
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const model = (prisma as any)[tableConfig.modelName]

    // Soft delete: set isActive = false
    await model.update({
      where: { id },
      data: { isActive: false }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting master data item:', error)

    if ((error as { code?: string }).code === 'P2025') {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to delete master data item' },
      { status: 500 }
    )
  }
}
