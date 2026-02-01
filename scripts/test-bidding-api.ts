import 'dotenv/config';
import prisma from '../src/lib/db';

async function main() {
  try {
    console.log('Testing BiddingPackage model with full includes...');

    const packageInclude = {
      method: { select: { id: true, code: true, name: true } },
      status: { select: { id: true, code: true, name: true, color: true } },
      createdBy: { select: { id: true, name: true, employeeCode: true } },
      winner: { select: { id: true, code: true, name: true } },
      purchaseRequests: {
        include: {
          purchaseRequest: {
            select: { id: true, requestCode: true, description: true, totalAmount: true }
          }
        }
      },
      participants: {
        include: {
          supplier: { select: { id: true, code: true, name: true } }
        }
      },
      scopeItems: {
        include: {
          material: { select: { id: true, code: true, name: true } },
          unit: { select: { id: true, code: true, name: true } }
        }
      }
    };

    const packages = await prisma.biddingPackage.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: packageInclude
    });

    console.log('Success! Found', packages.length, 'packages');
    console.log('Packages:', JSON.stringify(packages, null, 2));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
