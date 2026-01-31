import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

// GET /api/feature-actions - List all feature-action mappings
export async function GET() {
  try {
    const featureActions = await prisma.featureAction.findMany({
      include: {
        feature: true,
        action: true,
      },
    })

    return NextResponse.json({ data: featureActions })
  } catch (error) {
    console.error('Error fetching feature-actions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch feature-actions' },
      { status: 500 }
    )
  }
}

// POST /api/feature-actions - Add action to feature
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { featureId, actionId } = body

    if (!featureId || !actionId) {
      return NextResponse.json(
        { error: 'featureId and actionId are required' },
        { status: 400 }
      )
    }

    const featureAction = await prisma.featureAction.create({
      data: {
        featureId,
        actionId,
      },
      include: {
        feature: true,
        action: true,
      },
    })

    return NextResponse.json({ data: featureAction }, { status: 201 })
  } catch (error: unknown) {
    console.error('Error creating feature-action:', error)
    
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json(
        { error: 'This action is already assigned to this feature' },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create feature-action' },
      { status: 500 }
    )
  }
}

// DELETE /api/feature-actions - Remove action from feature (by query params)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const featureId = searchParams.get('featureId')
    const actionId = searchParams.get('actionId')
    const id = searchParams.get('id')

    if (id) {
      // Delete by ID
      await prisma.featureAction.delete({
        where: { id },
      })
    } else if (featureId && actionId) {
      // Delete by composite key
      await prisma.featureAction.delete({
        where: {
          featureId_actionId: { featureId, actionId },
        },
      })
    } else {
      return NextResponse.json(
        { error: 'Either id or both featureId and actionId are required' },
        { status: 400 }
      )
    }

    return NextResponse.json({ message: 'Feature-action mapping deleted successfully' })
  } catch (error: unknown) {
    console.error('Error deleting feature-action:', error)
    
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Feature-action mapping not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to delete feature-action' },
      { status: 500 }
    )
  }
}
