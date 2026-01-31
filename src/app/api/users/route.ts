import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

// GET /api/users - Get all users with pagination, search, and filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const department = searchParams.get('department') || ''
    const role = searchParams.get('role') || ''
    const status = searchParams.get('status') || ''

    const skip = (page - 1) * limit

    // Build where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {}

    if (search) {
      where.OR = [
        { employeeCode: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (department) {
      where.department = department
    }

    if (role) {
      where.role = role
    }

    if (status) {
      where.status = status
    }

    // Get total count for pagination
    const total = await prisma.user.count({ where })

    // Get users with pagination
    const users = await prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { employeeCode: 'asc' },
    })

    return NextResponse.json({
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

// POST /api/users - Create a new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { employeeCode, name, email, phone, department, role, status } = body

    // Validate required fields
    if (!employeeCode || !name || !email || !department || !role) {
      return NextResponse.json(
        { error: 'Missing required fields: employeeCode, name, email, department, role' },
        { status: 400 }
      )
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        employeeCode,
        name,
        email,
        phone: phone || null,
        department,
        role,
        status: status || 'Active',
      },
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)

    // Handle unique constraint violation
    if ((error as { code?: string }).code === 'P2002') {
      return NextResponse.json(
        { error: 'User with this employee code or email already exists' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}
