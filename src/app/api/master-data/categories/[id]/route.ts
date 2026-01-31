import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

interface Params {
  params: Promise<{ id: string }>
}

// GET category by ID
export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = await params
    const category = await prisma.masterDataCategory.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: { sortOrder: 'asc' }
        }
      }
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error('Error fetching category:', error)
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    )
  }
}

// PUT update category
export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, groupName, description, isActive } = body

    const category = await prisma.masterDataCategory.update({
      where: { id },
      data: {
        name,
        groupName,
        description,
        isActive
      }
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    )
  }
}

// DELETE category
export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = await params
    await prisma.masterDataCategory.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    )
  }
}
