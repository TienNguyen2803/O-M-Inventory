import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

// GET /api/roles - Get all roles
export async function GET() {
  try {
    const roles = await prisma.role.findMany({
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({
      data: roles,
    })
  } catch (error) {
    console.error('Error fetching roles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch roles' },
      { status: 500 }
    )
  }
}

// POST /api/roles - Create a new role
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, description, permissions } = body

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Missing required field: name' },
        { status: 400 }
      )
    }

    // Create role
    const role = await prisma.role.create({
      data: {
        name,
        description: description || null,
        permissions: permissions || {},
        userCount: 0,
      },
    })

    return NextResponse.json(role, { status: 201 })
  } catch (error) {
    console.error('Error creating role:', error)

    // Handle unique constraint violation
    if ((error as { code?: string }).code === 'P2002') {
      return NextResponse.json(
        { error: 'Role with this name already exists' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create role' },
      { status: 500 }
    )
  }
}
