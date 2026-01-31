import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/features/[id] - Get single feature
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    
    const feature = await prisma.feature.findUnique({
      where: { id },
      include: {
        featureActions: {
          include: {
            action: true,
          },
        },
      },
    })

    if (!feature) {
      return NextResponse.json(
        { error: 'Feature not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      data: {
        ...feature,
        actions: feature.featureActions.map(fa => fa.action),
      }
    })
  } catch (error) {
    console.error('Error fetching feature:', error)
    return NextResponse.json(
      { error: 'Failed to fetch feature' },
      { status: 500 }
    )
  }
}

// PUT /api/features/[id] - Update feature
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()
    const { code, name, groupCode, sortOrder, isActive } = body

    const feature = await prisma.feature.update({
      where: { id },
      data: {
        ...(code !== undefined && { code }),
        ...(name !== undefined && { name }),
        ...(groupCode !== undefined && { groupCode }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(isActive !== undefined && { isActive }),
      },
    })

    return NextResponse.json({ data: feature })
  } catch (error: unknown) {
    console.error('Error updating feature:', error)
    
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Feature not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to update feature' },
      { status: 500 }
    )
  }
}

// DELETE /api/features/[id] - Delete feature
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    
    await prisma.feature.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Feature deleted successfully' })
  } catch (error: unknown) {
    console.error('Error deleting feature:', error)
    
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Feature not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to delete feature' },
      { status: 500 }
    )
  }
}
