import prisma from "../src/lib/db";

async function main() {
  const materials = await prisma.material.findMany({
    where: { serialNumber: { not: null } },
    select: { id: true, serialNumber: true, name: true },
    take: 5
  });
  console.log("Materials with serialNumber:", materials.length);
  if (materials.length > 0) {
    console.log(JSON.stringify(materials, null, 2));
  }

  const txCount = await prisma.materialTransaction.count();
  console.log("\nTotal transactions:", txCount);

  const eventCount = await prisma.materialEvent.count();
  console.log("Total events:", eventCount);
}

main().catch(console.error).finally(() => prisma.$disconnect());
