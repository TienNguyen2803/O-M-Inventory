import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

type RouteParams = { params: Promise<{ id: string }> };

// GET supplier by id
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supplier = await prisma.supplier.findUnique({
      where: { id },
      include: {
        country: true,
        supplierType: true,
        paymentTerm: true,
        currency: true,
        contacts: true,
      },
    });

    if (!supplier) {
      return NextResponse.json(
        { error: 'Supplier not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(supplier);
  } catch (error) {
    console.error('Error fetching supplier:', error);
    return NextResponse.json(
      { error: 'Failed to fetch supplier' },
      { status: 500 }
    );
  }
}

// PUT update supplier
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { code, taxCode, name, address, countryId, typeId, paymentTermId, currencyId, status, contacts } = body;

    // Check if supplier exists
    const existingSupplier = await prisma.supplier.findUnique({
      where: { id },
      include: { contacts: true },
    });

    if (!existingSupplier) {
      return NextResponse.json(
        { error: 'Supplier not found' },
        { status: 404 }
      );
    }

    // Check for duplicate code (excluding current supplier)
    if (code && code !== existingSupplier.code) {
      const duplicateCode = await prisma.supplier.findUnique({
        where: { code },
      });
      if (duplicateCode) {
        return NextResponse.json(
          { error: 'Supplier code already exists' },
          { status: 409 }
        );
      }
    }

    // Update supplier with contacts using transaction
    const supplier = await prisma.$transaction(async (tx) => {
      // Delete existing contacts
      await tx.supplierContact.deleteMany({
        where: { supplierId: id },
      });

      // Update supplier and create new contacts
      return tx.supplier.update({
        where: { id },
        data: {
          code,
          taxCode,
          name,
          address,
          countryId,
          typeId,
          paymentTermId,
          currencyId,
          status,
          contacts: contacts?.length > 0 ? {
            create: contacts.map((c: { name: string; position: string; email: string; phone: string }) => ({
              name: c.name,
              position: c.position,
              email: c.email,
              phone: c.phone,
            })),
          } : undefined,
        },
        include: {
          country: true,
          supplierType: true,
          paymentTerm: true,
          currency: true,
          contacts: true,
        },
      });
    });

    return NextResponse.json(supplier);
  } catch (error) {
    console.error('Error updating supplier:', error);
    return NextResponse.json(
      { error: 'Failed to update supplier' },
      { status: 500 }
    );
  }
}

// DELETE supplier (cascade deletes contacts)
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Check if supplier exists
    const existingSupplier = await prisma.supplier.findUnique({
      where: { id },
    });

    if (!existingSupplier) {
      return NextResponse.json(
        { error: 'Supplier not found' },
        { status: 404 }
      );
    }

    await prisma.supplier.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    console.error('Error deleting supplier:', error);
    return NextResponse.json(
      { error: 'Failed to delete supplier' },
      { status: 500 }
    );
  }
}
