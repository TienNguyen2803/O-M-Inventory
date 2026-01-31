import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

// GET /api/departments - Get all departments from database
export async function GET() {
  try {
    const departments = await prisma.department.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        code: true,
        name: true,
        color: true,
      }
    })

    return NextResponse.json({
      data: departments,
    })
  } catch (error) {
    console.error('Error fetching departments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch departments' },
      { status: 500 }
    )
  }
}
