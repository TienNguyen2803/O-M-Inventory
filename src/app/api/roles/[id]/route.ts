import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/roles/[id] - Get single role with permissions
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    
    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        roleFeatureActions: {
          include: {
            featureAction: {
              include: {
                feature: true,
                action: true,
              }
            }
          }
        }
      }
    })

    if (!role) {
      return NextResponse.json(
        { error: 'Role not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: role })
  } catch (error) {
    console.error('Error fetching role:', error)
    return NextResponse.json(
      { error: 'Failed to fetch role' },
      { status: 500 }
    )
  }
}

// PUT /api/roles/[id] - Update role info and permissions
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, description, featureActionIds } = body

    // If featureActionIds is provided, update permissions
    if (featureActionIds !== undefined) {
      // Delete existing RoleFeatureAction records
      await prisma.roleFeatureAction.deleteMany({
        where: { roleId: id }
      })

      // Create new RoleFeatureAction records
      if (featureActionIds.length > 0) {
        await prisma.roleFeatureAction.createMany({
          data: featureActionIds.map((faId: string) => ({
            roleId: id,
            featureActionId: faId
          }))
        })
      }
    }

    // Update role basic info if provided
    const role = await prisma.role.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
      },
      include: {
        roleFeatureActions: {
          include: {
            featureAction: {
              include: {
                feature: true,
                action: true,
              }
            }
          }
        }
      }
    })

    return NextResponse.json({ data: role })
  } catch (error: unknown) {
    console.error('Error updating role:', error)
    
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Role not found' },
        { status: 404 }
      )
    }

    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Role name already exists' },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to update role' },
      { status: 500 }
    )
  }
}

// DELETE /api/roles/[id] - Delete role
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    
    await prisma.role.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Role deleted successfully' })
  } catch (error: unknown) {
    console.error('Error deleting role:', error)
    
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Role not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to delete role' },
      { status: 500 }
    )
  }
}
