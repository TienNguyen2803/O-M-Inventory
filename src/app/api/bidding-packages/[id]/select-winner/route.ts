import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

type RouteParams = {
  params: Promise<{ id: string }>
}

// POST /api/bidding-packages/[id]/select-winner - Select winner for bidding
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()
    const { winnerId } = body

    if (!winnerId) {
      return NextResponse.json(
        { error: 'winnerId is required' },
        { status: 400 }
      )
    }

    const biddingPackage = await prisma.biddingPackage.findFirst({
      where: { packageCode: id },
      include: {
        participants: { include: { supplier: true } }
      }
    })

    if (!biddingPackage) {
      return NextResponse.json(
        { error: 'Bidding package not found' },
        { status: 404 }
      )
    }

    // Check if winner is a participant
    const winnerParticipant = biddingPackage.participants.find(
      p => p.supplierId === winnerId
    )

    if (!winnerParticipant) {
      return NextResponse.json(
        { error: 'Winner must be a participant in this bidding package' },
        { status: 400 }
      )
    }

    // Get DONE status
    const doneStatus = await prisma.biddingStatus.findFirst({
      where: { code: 'DONE' }
    })

    if (!doneStatus) {
      return NextResponse.json(
        { error: 'DONE status not found in system' },
        { status: 500 }
      )
    }

    // Update package with winner and status
    const updated = await prisma.biddingPackage.update({
      where: { id: biddingPackage.id },
      data: {
        winnerId,
        statusId: doneStatus.id,
        step: 4 // Final step
      },
      include: {
        method: { select: { id: true, code: true, name: true } },
        status: { select: { id: true, code: true, name: true, color: true } },
        winner: { select: { id: true, code: true, name: true } },
        participants: {
          include: { supplier: { select: { id: true, code: true, name: true } } },
          orderBy: { rank: 'asc' }
        }
      }
    })

    return NextResponse.json({
      data: {
        id: updated.packageCode,
        packageCode: updated.packageCode,
        name: updated.name,
        status: updated.status,
        winner: updated.winner,
        step: updated.step,
        participants: updated.participants.map(p => ({
          id: p.id,
          supplier: p.supplier,
          rank: p.rank,
          totalScore: p.totalScore,
          isWinner: p.supplierId === winnerId
        }))
      },
      message: `Winner selected: ${updated.winner?.name}`
    })
  } catch (error) {
    console.error('Error selecting winner:', error)
    return NextResponse.json(
      { error: 'Failed to select winner' },
      { status: 500 }
    )
  }
}
