import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

// GET all suppliers with relations
export async function GET() {
  try {
    const suppliers = await prisma.supplier.findMany({
      include: {
        country: true,
        supplierType: true,
        paymentTerm: true,
        currency: true,
        contacts: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(suppliers);
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch suppliers' },
      { status: 500 }
    );
  }
}

// POST create new supplier
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, taxCode, name, address, countryId, typeId, paymentTermId, currencyId, status, contacts } = body;

    // Validate required fields
    if (!code || !taxCode || !name || !address || !countryId || !typeId || !paymentTermId || !currencyId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check for duplicate code
    const existingSupplier = await prisma.supplier.findUnique({
      where: { code },
    });

    if (existingSupplier) {
      return NextResponse.json(
        { error: 'Supplier code already exists' },
        { status: 409 }
      );
    }

    const supplier = await prisma.supplier.create({
      data: {
        code,
        taxCode,
        name,
        address,
        countryId,
        typeId,
        paymentTermId,
        currencyId,
        status: status || 'Active',
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

    return NextResponse.json(supplier, { status: 201 });
  } catch (error) {
    console.error('Error creating supplier:', error);
    return NextResponse.json(
      { error: 'Failed to create supplier' },
      { status: 500 }
    );
  }
}
