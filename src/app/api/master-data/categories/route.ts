import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

// GET all categories
export async function GET() {
  try {
    const categories = await prisma.masterDataCategory.findMany({
      include: {
        items: {
          orderBy: { sortOrder: 'asc' }
        }
      },
      orderBy: [
        { groupName: 'asc' },
        { name: 'asc' }
      ]
    })

    // Group categories by groupName
    const groups = categories.reduce((acc, category) => {
      const group = acc.find(g => g.group === category.groupName)
      if (group) {
        group.categories.push(category)
      } else {
        acc.push({
          group: category.groupName,
          categories: [category]
        })
      }
      return acc
    }, [] as { group: string; categories: typeof categories }[])

    return NextResponse.json(groups)
  } catch (error) {
    console.error('Error fetching master data categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

// POST create new category
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { code, name, groupName, description } = body

    const category = await prisma.masterDataCategory.create({
      data: {
        code,
        name,
        groupName,
        description
      }
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    )
  }
}
