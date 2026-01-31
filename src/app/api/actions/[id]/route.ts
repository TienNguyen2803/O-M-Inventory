import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/actions/[id] - Get single action
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    
    const action = await prisma.action.findUnique({
      where: { id },
    })

    if (!action) {
      return NextResponse.json(
        { error: 'Action not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: action })
  } catch (error) {
    console.error('Error fetching action:', error)
    return NextResponse.json(
      { error: 'Failed to fetch action' },
      { status: 500 }
    )
  }
}

// PUT /api/actions/[id] - Update action
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()
    const { code, name, sortOrder, isActive } = body

    const action = await prisma.action.update({
      where: { id },
      data: {
        ...(code !== undefined && { code }),
        ...(name !== undefined && { name }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(isActive !== undefined && { isActive }),
      },
    })

    return NextResponse.json({ data: action })
  } catch (error: unknown) {
    console.error('Error updating action:', error)
    
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Action not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to update action' },
      { status: 500 }
    )
  }
}

// DELETE /api/actions/[id] - Delete action
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    
    await prisma.action.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Action deleted successfully' })
  } catch (error: unknown) {
    console.error('Error deleting action:', error)
    
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Action not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to delete action' },
      { status: 500 }
    )
  }
}
