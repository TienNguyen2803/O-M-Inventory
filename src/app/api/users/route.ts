import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

// GET /api/users - Get all users with pagination, search, and filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const departmentId = searchParams.get('departmentId') || ''
    const statusId = searchParams.get('statusId') || ''

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

    if (departmentId) {
      where.departmentId = departmentId
    }

    if (statusId) {
      where.statusId = statusId
    }

    // Get total count for pagination
    const total = await prisma.user.count({ where })

    // Get users with pagination and include relations
    const users = await prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { employeeCode: 'asc' },
      include: {
        department: true,
        userStatus: true,
        userRoles: {
          include: {
            role: true
          }
        }
      }
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
    const { employeeCode, name, email, phone, departmentId, statusId } = body

    // Validate required fields
    if (!employeeCode || !name || !email || !departmentId || !statusId) {
      return NextResponse.json(
        { error: 'Missing required fields: employeeCode, name, email, departmentId, statusId' },
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
        departmentId,
        statusId,
      },
      include: {
        department: true,
        userStatus: true,
      }
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
