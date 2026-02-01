import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

type RouteParams = {
  params: Promise<{ id: string }>
}

// GET /api/bidding-packages/[id]/participants - List participants
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    const biddingPackage = await prisma.biddingPackage.findFirst({
      where: { packageCode: id }
    })

    if (!biddingPackage) {
      return NextResponse.json(
        { error: 'Bidding package not found' },
        { status: 404 }
      )
    }

    const participants = await prisma.biddingParticipant.findMany({
      where: { biddingPackageId: biddingPackage.id },
      include: {
        supplier: { select: { id: true, code: true, name: true, address: true } },
        quotations: {
          include: {
            scopeItem: { select: { id: true, name: true, quantity: true, estimatedAmount: true } }
          }
        }
      },
      orderBy: [{ rank: 'asc' }, { invitedAt: 'asc' }]
    })

    const data = participants.map(p => ({
      id: p.id,
      supplierId: p.supplierId,
      supplier: p.supplier,
      invitedAt: p.invitedAt.toISOString(),
      submittedAt: p.submittedAt?.toISOString(),
      isSubmitted: p.isSubmitted,
      technicalScore: p.technicalScore,
      priceScore: p.priceScore,
      totalScore: p.totalScore,
      rank: p.rank,
      quotations: p.quotations.map(q => ({
        id: q.id,
        scopeItemId: q.scopeItemId,
        scopeItem: q.scopeItem,
        unitPrice: q.unitPrice,
        quantity: q.quantity,
        totalPrice: q.totalPrice,
        notes: q.notes
      }))
    }))

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error fetching participants:', error)
    return NextResponse.json(
      { error: 'Failed to fetch participants' },
      { status: 500 }
    )
  }
}

// POST /api/bidding-packages/[id]/participants - Add participant(s)
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()
    const { supplierIds } = body

    if (!supplierIds || !Array.isArray(supplierIds) || supplierIds.length === 0) {
      return NextResponse.json(
        { error: 'supplierIds array is required' },
        { status: 400 }
      )
    }

    const biddingPackage = await prisma.biddingPackage.findFirst({
      where: { packageCode: id }
    })

    if (!biddingPackage) {
      return NextResponse.json(
        { error: 'Bidding package not found' },
        { status: 404 }
      )
    }

    // Create participants (skip duplicates)
    const created = await prisma.biddingParticipant.createMany({
      data: supplierIds.map((supplierId: string) => ({
        biddingPackageId: biddingPackage.id,
        supplierId
      })),
      skipDuplicates: true
    })

    // Fetch all participants
    const participants = await prisma.biddingParticipant.findMany({
      where: { biddingPackageId: biddingPackage.id },
      include: {
        supplier: { select: { id: true, code: true, name: true } }
      },
      orderBy: { invitedAt: 'asc' }
    })

    return NextResponse.json({
      data: participants.map(p => ({
        id: p.id,
        supplierId: p.supplierId,
        supplier: p.supplier,
        invitedAt: p.invitedAt.toISOString(),
        isSubmitted: p.isSubmitted
      })),
      created: created.count
    }, { status: 201 })
  } catch (error) {
    console.error('Error adding participants:', error)
    return NextResponse.json(
      { error: 'Failed to add participants' },
      { status: 500 }
    )
  }
}

// DELETE /api/bidding-packages/[id]/participants - Remove participant
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const participantId = searchParams.get('participantId')

    if (!participantId) {
      return NextResponse.json(
        { error: 'participantId query parameter is required' },
        { status: 400 }
      )
    }

    const biddingPackage = await prisma.biddingPackage.findFirst({
      where: { packageCode: id }
    })

    if (!biddingPackage) {
      return NextResponse.json(
        { error: 'Bidding package not found' },
        { status: 404 }
      )
    }

    await prisma.biddingParticipant.delete({
      where: {
        id: participantId,
        biddingPackageId: biddingPackage.id
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing participant:', error)
    return NextResponse.json(
      { error: 'Failed to remove participant' },
      { status: 500 }
    )
  }
}

// PATCH /api/bidding-packages/[id]/participants - Update participant scores/quotations
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()
    const { participantId, technicalScore, priceScore, isSubmitted, quotations } = body

    if (!participantId) {
      return NextResponse.json(
        { error: 'participantId is required' },
        { status: 400 }
      )
    }

    const biddingPackage = await prisma.biddingPackage.findFirst({
      where: { packageCode: id }
    })

    if (!biddingPackage) {
      return NextResponse.json(
        { error: 'Bidding package not found' },
        { status: 404 }
      )
    }

    const participant = await prisma.biddingParticipant.findFirst({
      where: { id: participantId, biddingPackageId: biddingPackage.id }
    })

    if (!participant) {
      return NextResponse.json(
        { error: 'Participant not found' },
        { status: 404 }
      )
    }

    // Calculate total score if both scores provided
    let totalScore = participant.totalScore
    const newTechScore = technicalScore ?? participant.technicalScore
    const newPriceScore = priceScore ?? participant.priceScore
    if (newTechScore !== null && newPriceScore !== null) {
      totalScore = (newTechScore * 0.6) + (newPriceScore * 0.4) // Example weighting
    }

    // Update participant
    await prisma.biddingParticipant.update({
      where: { id: participantId },
      data: {
        technicalScore: technicalScore !== undefined ? technicalScore : undefined,
        priceScore: priceScore !== undefined ? priceScore : undefined,
        totalScore,
        isSubmitted: isSubmitted !== undefined ? isSubmitted : undefined,
        submittedAt: isSubmitted === true ? new Date() : undefined
      }
    })

    // Update quotations if provided
    if (quotations && Array.isArray(quotations)) {
      for (const q of quotations) {
        await prisma.bidQuotation.upsert({
          where: {
            participantId_scopeItemId: {
              participantId,
              scopeItemId: q.scopeItemId
            }
          },
          create: {
            participantId,
            scopeItemId: q.scopeItemId,
            unitPrice: q.unitPrice,
            quantity: q.quantity,
            totalPrice: q.unitPrice * q.quantity,
            notes: q.notes
          },
          update: {
            unitPrice: q.unitPrice,
            quantity: q.quantity,
            totalPrice: q.unitPrice * q.quantity,
            notes: q.notes
          }
        })
      }
    }

    // Recalculate ranks for all participants in this package
    const allParticipants = await prisma.biddingParticipant.findMany({
      where: { biddingPackageId: biddingPackage.id, totalScore: { not: null } },
      orderBy: { totalScore: 'desc' }
    })

    for (let i = 0; i < allParticipants.length; i++) {
      await prisma.biddingParticipant.update({
        where: { id: allParticipants[i].id },
        data: { rank: i + 1 }
      })
    }

    // Fetch updated participant
    const updated = await prisma.biddingParticipant.findUnique({
      where: { id: participantId },
      include: {
        supplier: { select: { id: true, code: true, name: true } },
        quotations: {
          include: { scopeItem: { select: { id: true, name: true } } }
        }
      }
    })

    return NextResponse.json({
      data: {
        id: updated!.id,
        supplier: updated!.supplier,
        technicalScore: updated!.technicalScore,
        priceScore: updated!.priceScore,
        totalScore: updated!.totalScore,
        rank: updated!.rank,
        isSubmitted: updated!.isSubmitted,
        quotations: updated!.quotations
      }
    })
  } catch (error) {
    console.error('Error updating participant:', error)
    return NextResponse.json(
      { error: 'Failed to update participant' },
      { status: 500 }
    )
  }
}
