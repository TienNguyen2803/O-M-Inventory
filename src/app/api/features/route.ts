import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

// GET /api/features - List all features (grouped by groupCode)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const grouped = searchParams.get('grouped') === 'true'

    const features = await prisma.feature.findMany({
      where: { isActive: true },
      include: {
        featureActions: {
          include: {
            action: true,
          },
        },
      },
      orderBy: { sortOrder: 'asc' },
    })

    if (grouped) {
      // Group features by groupCode
      type FeatureWithActions = typeof features[0] & { actions: typeof features[0]['featureActions'][0]['action'][] }
      const groupedFeatures = features.reduce<Record<string, FeatureWithActions[]>>((acc, feature) => {
        const group = feature.groupCode
        if (!acc[group]) {
          acc[group] = []
        }
        acc[group].push({
          ...feature,
          actions: feature.featureActions.map(fa => fa.action),
        })
        return acc
      }, {})

      return NextResponse.json({ data: groupedFeatures })
    }

    return NextResponse.json({ 
      data: features.map(f => ({
        ...f,
        actions: f.featureActions.map(fa => fa.action),
      }))
    })
  } catch (error) {
    console.error('Error fetching features:', error)
    return NextResponse.json(
      { error: 'Failed to fetch features' },
      { status: 500 }
    )
  }
}

// POST /api/features - Create new feature
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, name, groupCode, sortOrder, isActive } = body

    if (!code || !name || !groupCode) {
      return NextResponse.json(
        { error: 'Code, name, and groupCode are required' },
        { status: 400 }
      )
    }

    const feature = await prisma.feature.create({
      data: {
        code,
        name,
        groupCode,
        sortOrder: sortOrder ?? 0,
        isActive: isActive ?? true,
      },
    })

    return NextResponse.json({ data: feature }, { status: 201 })
  } catch (error: unknown) {
    console.error('Error creating feature:', error)
    
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Feature code already exists' },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create feature' },
      { status: 500 }
    )
  }
}
