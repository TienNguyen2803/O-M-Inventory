import 'dotenv/config'
import { PrismaClient, MaterialEventType, ReferenceType, TransactionStatus } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

// Helper to generate random date within range
function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

// Helper to add days to date
function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

// Sample data for materials
const materialSamples = [
  { name: "Nguồn Sunfire T2000", nameEn: "Power Supply Sunfire T2000", partNo: "#300-1757", manufacturer: "Sun Microsystems", chassisPn: "SUNFIRE-T2000", category: "SERVER" },
  { name: "Card mạng Intel X710", nameEn: "Intel X710 Network Card", partNo: "X710-DA4", manufacturer: "Intel", chassisPn: "DELL-R640", category: "SERVER" },
  { name: "Ổ cứng SSD Samsung 1TB", nameEn: "Samsung SSD 1TB", partNo: "MZ-77E1T0", manufacturer: "Samsung", chassisPn: "HPE-DL380", category: "SERVER" },
  { name: "RAM DDR4 32GB ECC", nameEn: "DDR4 32GB ECC Memory", partNo: "M393A4K40CB2", manufacturer: "Samsung", chassisPn: "DELL-R740", category: "SERVER" },
  { name: "Bộ điều khiển RAID", nameEn: "RAID Controller", partNo: "H740P", manufacturer: "Dell", chassisPn: "DELL-R640", category: "SERVER" },
  { name: "Van điều khiển áp suất", nameEn: "Pressure Control Valve", partNo: "PCV-2500", manufacturer: "Fisher", chassisPn: "GT-2500", category: "VALVE" },
  { name: "Cảm biến nhiệt độ PT100", nameEn: "PT100 Temperature Sensor", partNo: "PT100-SS316", manufacturer: "Honeywell", chassisPn: null, category: "MEAS" },
  { name: "Đồng hồ áp suất 0-10bar", nameEn: "Pressure Gauge 0-10bar", partNo: "PG-100-10", manufacturer: "WIKA", chassisPn: null, category: "MEAS" },
  { name: "Bơm dầu bôi trơn", nameEn: "Lubrication Oil Pump", partNo: "LOP-500", manufacturer: "SKF", chassisPn: "TB-GE-LM6000", category: "TURB" },
  { name: "Lọc dầu thủy lực", nameEn: "Hydraulic Oil Filter", partNo: "HF-2000", manufacturer: "Parker", chassisPn: null, category: "MECH" },
  { name: "Card PLC Siemens S7-1500", nameEn: "Siemens S7-1500 PLC Card", partNo: "6ES7511-1AK02", manufacturer: "Siemens", chassisPn: "S7-1500", category: "TDH" },
  { name: "Biến tần ABB ACS880", nameEn: "ABB VFD ACS880", partNo: "ACS880-01-045A", manufacturer: "ABB", chassisPn: null, category: "TDH" },
  { name: "Màn hình HMI 10 inch", nameEn: "HMI Panel 10 inch", partNo: "KTP1000", manufacturer: "Siemens", chassisPn: null, category: "TDH" },
  { name: "Relay bảo vệ SEL-751", nameEn: "SEL-751 Protection Relay", partNo: "SEL-751A", manufacturer: "Schweitzer", chassisPn: null, category: "TDH" },
  { name: "Cáp nguồn 3x70mm2", nameEn: "Power Cable 3x70mm2", partNo: "CVV-3x70", manufacturer: "Cadivi", chassisPn: null, category: "CONS" },
  { name: "Switch mạng Cisco 48 port", nameEn: "Cisco 48-port Switch", partNo: "C9200-48P", manufacturer: "Cisco", chassisPn: null, category: "SERVER" },
  { name: "UPS APC 10kVA", nameEn: "APC UPS 10kVA", partNo: "SRT10KXLI", manufacturer: "APC", chassisPn: null, category: "SERVER" },
  { name: "Đầu đo mức siêu âm", nameEn: "Ultrasonic Level Transmitter", partNo: "LUT400", manufacturer: "Siemens", chassisPn: null, category: "MEAS" },
  { name: "Van an toàn 150psi", nameEn: "Safety Valve 150psi", partNo: "SV-150-2", manufacturer: "Crosby", chassisPn: "BOILER-01", category: "VALVE" },
  { name: "Bộ lọc khí nén", nameEn: "Compressed Air Filter", partNo: "AF-2000", manufacturer: "SMC", chassisPn: null, category: "MECH" },
]

const countries = ["US", "JP", "DE", "KR", "TW", "CN", "VN"]
const locations = [
  "K01 - Kệ A1-01 - Kho chính HN",
  "K02 - Kệ B2-03 - Kho phụ tùng",
  "K03 - Kệ C1-02 - Kho thiết bị đo",
  "K04 - Sàn D1 - Kho lớn",
  "K05 - Kệ E3-01 - Kho IT",
]

const actors = [
  { name: "Nguyễn Văn An", id: "" },
  { name: "Trần Thị Mai", id: "" },
  { name: "Phạm Quốc Khánh", id: "" },
  { name: "Lê Hoàng Nam", id: "" },
]

async function main() {
  console.log('🌱 Seeding Goods History sample data...')

  // Get master data IDs
  const categories = await prisma.materialCategory.findMany()
  const categoryMap = Object.fromEntries(categories.map(c => [c.code, c.id]))

  const statuses = await prisma.materialStatus.findMany()
  const statusMap = Object.fromEntries(statuses.map(s => [s.code, s.id]))

  const units = await prisma.materialUnit.findMany()
  const unitMap = Object.fromEntries(units.map(u => [u.code, u.id]))

  const managementTypes = await prisma.managementType.findMany()
  const mgmtTypeMap = Object.fromEntries(managementTypes.map(m => [m.code, m.id]))

  const countriesData = await prisma.country.findMany()
  const countryMap = Object.fromEntries(countriesData.map(c => [c.code, c.id]))

  const inboundTypes = await prisma.inboundType.findMany()
  const inboundTypeMap = Object.fromEntries(inboundTypes.map(t => [t.code, t.id]))

  const outboundPurposes = await prisma.outboundPurpose.findMany()
  const outboundPurposeMap = Object.fromEntries(outboundPurposes.map(p => [p.code, p.id]))

  // Get or create sample users
  let users = await prisma.user.findMany({ take: 4 })
  if (users.length < 4) {
    console.log('  Creating sample users...')
    const dept = await prisma.department.findFirst()
    const userStatus = await prisma.userStatus.findFirst({ where: { code: "ACTIVE" } })

    for (let i = users.length; i < 4; i++) {
      const user = await prisma.user.create({
        data: {
          employeeCode: `EMP00${i + 1}`,
          name: actors[i].name,
          email: `user${i + 1}@example.com`,
          departmentId: dept?.id,
          statusId: userStatus?.id,
        }
      })
      users.push(user)
    }
  }
  actors.forEach((a, i) => { a.id = users[i]?.id || "" })

  console.log('  Creating 20 materials with serial numbers...')

  const createdMaterials: { id: string; code: string }[] = []
  const baseDate = new Date('2024-01-01')

  for (let i = 0; i < 20; i++) {
    const sample = materialSamples[i]
    const countryCode = countries[i % countries.length]
    const createdAt = randomDate(baseDate, new Date('2024-06-01'))

    // Generate unique serial number
    const serialNumber = `SN${String(2024).slice(-2)}${String(i + 1).padStart(4, '0')}${Math.random().toString(36).substring(2, 8).toUpperCase()}`

    const material = await prisma.material.create({
      data: {
        code: `GH-${String(i + 1).padStart(3, '0')}`,
        name: sample.name,
        nameEn: sample.nameEn,
        partNo: sample.partNo,
        serialNumber,
        managementTypeId: mgmtTypeMap["SERIAL"],
        categoryId: categoryMap[sample.category] || categoryMap["SERVER"],
        unitId: unitMap["CAI"],
        statusId: statusMap["NEW"],
        countryId: countryMap[countryCode],
        manufacturer: sample.manufacturer,
        location: locations[i % locations.length],
        stockAge: `${Math.floor(Math.random() * 30) + 1} Ngày`,
        supplierWarranty: `01/01/2024 - 01/01/2026`,
        serviceWarranty: `01/01/2026 - 01/01/2028`,
        chassisPn: sample.chassisPn,
        chassisSn: sample.chassisPn ? `${sample.chassisPn}-${String(i + 1).padStart(3, '0')}` : null,
        originAsPerCustomer: countryCode === "US" ? "G7 / USA" : null,
        originOnDocs: countriesData.find(c => c.code === countryCode)?.name,
        warrantyCount: Math.floor(Math.random() * 3),
        lifespan: `${Math.floor(Math.random() * 5) + 1} năm`,
        stock: 1,
        createdAt,
      }
    })
    createdMaterials.push({ id: material.id, code: material.code })
    console.log(`    Created material: ${material.code} - ${sample.name}`)
  }

  console.log('\n  Creating transactions and events for each material...')

  for (const mat of createdMaterials) {
    // Each material has 2-4 transactions representing its lifecycle
    const txCount = Math.floor(Math.random() * 3) + 2 // 2-4 transactions
    let lastDate = randomDate(new Date('2024-01-15'), new Date('2024-03-01'))

    for (let t = 0; t < txCount; t++) {
      const isInbound = t % 2 === 0 // Alternate inbound/outbound
      const referenceType: ReferenceType = isInbound ? "INBOUND_RECEIPT" : "OUTBOUND_RECEIPT"

      // Determine type based on transaction order
      let inboundTypeId: string | null = null
      let outboundPurposeId: string | null = null
      let title: string
      let counterpartyName: string | null = null

      if (isInbound) {
        if (t === 0) {
          // First inbound - PO
          inboundTypeId = inboundTypeMap["PO"]
          title = "Nhập kho theo PO"
          counterpartyName = ["Intel Vietnam", "Samsung VN", "ABB Vietnam", "Siemens VN"][Math.floor(Math.random() * 4)]
        } else {
          // Return from RMA
          inboundTypeId = inboundTypeMap["REPAIR"]
          title = "Nhập kho hàng trả bảo hành"
          counterpartyName = "Hãng SX"
        }
      } else {
        const purposes = ["OM", "PROJECT", "RETURN"]
        const purposeCode = purposes[Math.floor(Math.random() * purposes.length)]
        outboundPurposeId = outboundPurposeMap[purposeCode]

        if (purposeCode === "OM") {
          title = "Xuất cấp O&M"
          counterpartyName = ["Đội vận hành A", "Đội bảo trì B", "Phòng kỹ thuật"][Math.floor(Math.random() * 3)]
        } else if (purposeCode === "PROJECT") {
          title = "Xuất cho dự án"
          counterpartyName = ["Dự án mở rộng NM", "Dự án nâng cấp DCS"][Math.floor(Math.random() * 2)]
        } else {
          title = "Trả hàng NCC"
          counterpartyName = "NCC gốc"
        }
      }

      const startedAt = lastDate
      const completedAt = addDays(startedAt, Math.floor(Math.random() * 3) + 1)
      lastDate = addDays(completedAt, Math.floor(Math.random() * 30) + 7)

      const refCode = isInbound
        ? `PN-${String(lastDate.getFullYear()).slice(-2)}${String(lastDate.getMonth() + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')}`
        : `PX-${String(lastDate.getFullYear()).slice(-2)}${String(lastDate.getMonth() + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')}`

      // Create transaction
      const transaction = await prisma.materialTransaction.create({
        data: {
          materialId: mat.id,
          title,
          status: TransactionStatus.COMPLETED,
          quantity: 1,
          referenceType,
          referenceId: crypto.randomUUID(),
          counterpartyName,
          inboundTypeId,
          outboundPurposeId,
          startedAt,
          completedAt,
        }
      })

      // Create events (steps) for this transaction
      const eventSteps = isInbound
        ? [
            { type: MaterialEventType.REQUEST, title: "Tạo Đề nghị nhập", order: 1 },
            { type: MaterialEventType.APPROVED, title: "Duyệt Đề nghị nhập", order: 2 },
            { type: MaterialEventType.INBOUND, title: "Tạo Phiếu nhập kho", order: 3 },
            { type: MaterialEventType.QC, title: "Duyệt Phiếu nhập kho", order: 4 },
          ]
        : [
            { type: MaterialEventType.REQUEST, title: "Tạo Đề nghị xuất", order: 1 },
            { type: MaterialEventType.APPROVED, title: "Duyệt Đề nghị xuất", order: 2 },
            { type: MaterialEventType.OUTBOUND, title: "Tạo Phiếu xuất kho", order: 3 },
            { type: MaterialEventType.OUTBOUND, title: "Duyệt Phiếu xuất kho", order: 4 },
          ]

      let eventDate = startedAt
      for (const step of eventSteps) {
        const actor = actors[step.order % actors.length]
        eventDate = addDays(eventDate, Math.random() < 0.5 ? 0 : 1)

        await prisma.materialEvent.create({
          data: {
            materialId: mat.id,
            transactionId: transaction.id,
            eventType: step.type,
            eventDate,
            actorId: actor.id,
            actorName: actor.name,
            referenceType: isInbound ? "InboundReceipt" : "OutboundReceipt",
            referenceId: transaction.referenceId,
            referenceCode: refCode,
            description: step.title,
            stepOrder: step.order,
            stepTitle: step.title,
          }
        })
      }
    }
    console.log(`    Created ${txCount} transactions for ${mat.code}`)
  }

  console.log('\n✅ Goods History seed completed!')
  console.log(`   Created ${createdMaterials.length} materials with transactions and events`)

  // Print sample serial numbers for testing
  console.log('\n📋 Sample Serial Numbers for testing:')
  const samples = await prisma.material.findMany({
    where: { code: { startsWith: "GH-" } },
    select: { serialNumber: true, name: true },
    take: 5
  })
  samples.forEach(s => console.log(`   ${s.serialNumber} - ${s.name}`))
}

main()
  .catch(e => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
