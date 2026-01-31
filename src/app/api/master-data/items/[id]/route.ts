import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

interface Params {
  params: Promise<{ id: string }>
}

// GET item by ID
export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = await params
    const item = await prisma.masterDataItem.findUnique({
      where: { id },
      include: { category: true }
    })

    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(item)
  } catch (error) {
    console.error('Error fetching item:', error)
    return NextResponse.json(
      { error: 'Failed to fetch item' },
      { status: 500 }
    )
  }
}

// PUT update item
export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, code, color, sortOrder, isActive } = body

    const item = await prisma.masterDataItem.update({
      where: { id },
      data: {
        name,
        code,
        color,
        sortOrder,
        isActive
      }
    })

    return NextResponse.json(item)
  } catch (error) {
    console.error('Error updating item:', error)
    return NextResponse.json(
      { error: 'Failed to update item' },
      { status: 500 }
    )
  }
}

// DELETE item
export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = await params
    await prisma.masterDataItem.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting item:', error)
    return NextResponse.json(
      { error: 'Failed to delete item' },
      { status: 500 }
    )
  }
}
