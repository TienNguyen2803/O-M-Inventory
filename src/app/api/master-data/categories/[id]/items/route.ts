import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

interface Params {
  params: Promise<{ id: string }>
}

// GET items by category ID
export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = await params
    const items = await prisma.masterDataItem.findMany({
      where: { categoryId: id },
      orderBy: { sortOrder: 'asc' }
    })

    return NextResponse.json(items)
  } catch (error) {
    console.error('Error fetching items:', error)
    return NextResponse.json(
      { error: 'Failed to fetch items' },
      { status: 500 }
    )
  }
}

// POST create new item in category
export async function POST(request: Request, { params }: Params) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, code, color, sortOrder = 0 } = body

    // Get max sortOrder if not provided
    let finalSortOrder = sortOrder
    if (sortOrder === 0) {
      const maxItem = await prisma.masterDataItem.findFirst({
        where: { categoryId: id },
        orderBy: { sortOrder: 'desc' }
      })
      finalSortOrder = (maxItem?.sortOrder ?? 0) + 1
    }

    const item = await prisma.masterDataItem.create({
      data: {
        categoryId: id,
        name,
        code,
        color,
        sortOrder: finalSortOrder
      }
    })

    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error('Error creating item:', error)
    return NextResponse.json(
      { error: 'Failed to create item' },
      { status: 500 }
    )
  }
}
