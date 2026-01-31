import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { getMasterDataTable } from '@/lib/master-data-tables'

interface RouteParams {
  params: Promise<{ tableId: string }>
}

// GET all items from a master data table
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { tableId } = await params
    const tableConfig = getMasterDataTable(tableId)

    if (!tableConfig) {
      return NextResponse.json(
        { error: `Invalid table ID: ${tableId}` },
        { status: 400 }
      )
    }

    // Dynamic access to Prisma model
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const model = (prisma as any)[tableConfig.modelName]

    if (!model) {
      return NextResponse.json(
        { error: `Model not found: ${tableConfig.modelName}` },
        { status: 500 }
      )
    }

    const items = await model.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
    })

    return NextResponse.json({
      tableId,
      tableName: tableConfig.name,
      group: tableConfig.group,
      items
    })
  } catch (error) {
    console.error('Error fetching master data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch master data' },
      { status: 500 }
    )
  }
}

// POST create new item in a master data table
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { tableId } = await params
    const tableConfig = getMasterDataTable(tableId)

    if (!tableConfig) {
      return NextResponse.json(
        { error: `Invalid table ID: ${tableId}` },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { code, name, color, sortOrder } = body

    // Validate required fields
    if (!code || !name) {
      return NextResponse.json(
        { error: 'Missing required fields: code, name' },
        { status: 400 }
      )
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const model = (prisma as any)[tableConfig.modelName]

    const item = await model.create({
      data: {
        code,
        name,
        color: color || null,
        sortOrder: sortOrder || 0,
        isActive: true
      }
    })

    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error('Error creating master data item:', error)

    // Handle unique constraint violation
    if ((error as { code?: string }).code === 'P2002') {
      return NextResponse.json(
        { error: 'Item with this code already exists' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create master data item' },
      { status: 500 }
    )
  }
}
