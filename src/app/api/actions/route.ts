import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

// GET /api/actions - List all actions
export async function GET() {
  try {
    const actions = await prisma.action.findMany({
      orderBy: { sortOrder: 'asc' },
    })
    return NextResponse.json({ data: actions })
  } catch (error) {
    console.error('Error fetching actions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch actions' },
      { status: 500 }
    )
  }
}

// POST /api/actions - Create new action
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, name, sortOrder, isActive } = body

    if (!code || !name) {
      return NextResponse.json(
        { error: 'Code and name are required' },
        { status: 400 }
      )
    }

    const action = await prisma.action.create({
      data: {
        code,
        name,
        sortOrder: sortOrder ?? 0,
        isActive: isActive ?? true,
      },
    })

    return NextResponse.json({ data: action }, { status: 201 })
  } catch (error: unknown) {
    console.error('Error creating action:', error)
    
    // Handle unique constraint violation
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Action code already exists' },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create action' },
      { status: 500 }
    )
  }
}
