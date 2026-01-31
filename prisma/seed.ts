import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

// Create Prisma adapter
const adapter = new PrismaPg(pool)

// Create Prisma client with adapter
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Start seeding master data...')

  // === VẬT TƯ ===

  // 1. Material Status
  console.log('  Seeding MaterialStatus...')
  await prisma.materialStatus.createMany({
    data: [
      { code: "NEW", name: "Mới", color: "bg-green-100 text-green-800", sortOrder: 1 },
      { code: "USED", name: "Cũ nhưng dùng được", color: "bg-sky-100 text-sky-800", sortOrder: 2 },
      { code: "DMG", name: "Hư hỏng", color: "bg-yellow-100 text-yellow-800", sortOrder: 3 },
      { code: "UNREP", name: "Hư hỏng không thể sửa chữa", color: "bg-red-100 text-red-800", sortOrder: 4 },
      { code: "DISP", name: "Thanh lý", color: "bg-gray-200 text-gray-600", sortOrder: 5 },
    ],
    skipDuplicates: true
  })

  // 2. Material Category
  console.log('  Seeding MaterialCategory...')
  await prisma.materialCategory.createMany({
    data: [
      { code: "TDH", name: "Phụ tùng TĐH", sortOrder: 1 },
      { code: "MEAS", name: "Thiết bị đo lường", sortOrder: 2 },
      { code: "TURB", name: "Phụ tùng tuabin", sortOrder: 3 },
      { code: "VALVE", name: "Phụ tùng van", sortOrder: 4 },
      { code: "CONS", name: "Vật tư tiêu hao", sortOrder: 5 },
      { code: "CHEM", name: "Hóa chất/Dầu mỡ", sortOrder: 6 },
      { code: "MECH", name: "Phụ tùng cơ khí", sortOrder: 7 },
      { code: "PPE", name: "BHLĐ", sortOrder: 8 },
      { code: "SERVER", name: "Phụ tùng máy chủ", sortOrder: 9 },
    ],
    skipDuplicates: true
  })

  // 3. Material Unit
  console.log('  Seeding MaterialUnit...')
  await prisma.materialUnit.createMany({
    data: [
      { code: "CAI", name: "Cái", sortOrder: 1 },
      { code: "BO", name: "Bộ", sortOrder: 2 },
      { code: "LIT", name: "Lít", sortOrder: 3 },
      { code: "KG", name: "Kg", sortOrder: 4 },
      { code: "MET", name: "Mét", sortOrder: 5 },
      { code: "DOI", name: "Đôi", sortOrder: 6 },
    ],
    skipDuplicates: true
  })

  // 4. Management Type
  console.log('  Seeding ManagementType...')
  await prisma.managementType.createMany({
    data: [
      { code: "BATCH", name: "Batch", color: "bg-sky-100 text-sky-800", sortOrder: 1 },
      { code: "SERIAL", name: "Serial", color: "bg-emerald-100 text-emerald-800", sortOrder: 2 },
    ],
    skipDuplicates: true
  })

  // === KHO ===

  // 5. Warehouse Area
  console.log('  Seeding WarehouseArea...')
  await prisma.warehouseArea.createMany({
    data: [
      { code: "A", name: "Khu A", sortOrder: 1 },
      { code: "B", name: "Khu B", sortOrder: 2 },
      { code: "C", name: "Khu C", sortOrder: 3 },
      { code: "COLD", name: "Kho Lạnh", sortOrder: 4 },
      { code: "CHEM", name: "Kho Hóa chất", sortOrder: 5 },
    ],
    skipDuplicates: true
  })

  // 6. Warehouse Type
  console.log('  Seeding WarehouseType...')
  await prisma.warehouseType.createMany({
    data: [
      { code: "PALLET", name: "Kệ Pallet", sortOrder: 1 },
      { code: "MEDIUM", name: "Kệ Trung Tải", sortOrder: 2 },
      { code: "FLOOR", name: "Sàn", sortOrder: 3 },
    ],
    skipDuplicates: true
  })

  // 7. Warehouse Status
  console.log('  Seeding WarehouseStatus...')
  await prisma.warehouseStatus.createMany({
    data: [
      { code: "ACT", name: "Active", color: "bg-green-100 text-green-800", sortOrder: 1 },
      { code: "INACT", name: "Inactive", color: "bg-red-100 text-red-800", sortOrder: 2 },
    ],
    skipDuplicates: true
  })

  // === NHÀ CUNG CẤP ===

  // 8. Supplier Type
  console.log('  Seeding SupplierType...')
  await prisma.supplierType.createMany({
    data: [
      { code: "OEM", name: "OEM", sortOrder: 1 },
      { code: "MFG", name: "Manufacturer", sortOrder: 2 },
      { code: "DIST", name: "Distributor", sortOrder: 3 },
    ],
    skipDuplicates: true
  })

  // 9. Payment Term
  console.log('  Seeding PaymentTerm...')
  await prisma.paymentTerm.createMany({
    data: [
      { code: "NET30", name: "Net 30", sortOrder: 1 },
      { code: "NET45", name: "Net 45", sortOrder: 2 },
      { code: "NET60", name: "Net 60", sortOrder: 3 },
      { code: "COD", name: "COD", sortOrder: 4 },
    ],
    skipDuplicates: true
  })

  // 10. Currency
  console.log('  Seeding Currency...')
  await prisma.currency.createMany({
    data: [
      { code: "VND", name: "VND", sortOrder: 1 },
      { code: "USD", name: "USD", sortOrder: 2 },
      { code: "EUR", name: "EUR", sortOrder: 3 },
      { code: "JPY", name: "JPY", sortOrder: 4 },
      { code: "CHF", name: "CHF", sortOrder: 5 },
    ],
    skipDuplicates: true
  })

  // === YÊU CẦU VẬT TƯ ===

  // 11. Request Priority
  console.log('  Seeding RequestPriority...')
  await prisma.requestPriority.createMany({
    data: [
      { code: "URG", name: "Khẩn cấp", color: "bg-red-100 text-red-800", sortOrder: 1 },
      { code: "NOR", name: "Bình thường", color: "bg-sky-100 text-sky-800", sortOrder: 2 },
    ],
    skipDuplicates: true
  })

  // 12. Request Status
  console.log('  Seeding RequestStatus...')
  await prisma.requestStatus.createMany({
    data: [
      { code: "PEND", name: "Chờ duyệt", color: "bg-yellow-100 text-yellow-800", sortOrder: 1 },
      { code: "APPR", name: "Đã duyệt", color: "bg-green-100 text-green-800", sortOrder: 2 },
      { code: "DONE", name: "Hoàn thành", color: "bg-sky-100 text-sky-800", sortOrder: 3 },
    ],
    skipDuplicates: true
  })

  // === MUA SẮM ===

  // 13. Purchase Source
  console.log('  Seeding PurchaseSource...')
  await prisma.purchaseSource.createMany({
    data: [
      { code: "DOM", name: "Trong nước", sortOrder: 1 },
      { code: "IMP", name: "Nhập khẩu", sortOrder: 2 },
    ],
    skipDuplicates: true
  })

  // 14. Purchase Status
  console.log('  Seeding PurchaseStatus...')
  await prisma.purchaseStatus.createMany({
    data: [
      { code: "PEND", name: "Pending", color: "bg-yellow-100 text-yellow-800", sortOrder: 1 },
      { code: "APPR", name: "Approved", color: "bg-green-100 text-green-800", sortOrder: 2 },
      { code: "REJ", name: "Rejected", color: "bg-red-100 text-red-800", sortOrder: 3 },
      { code: "DONE", name: "Completed", color: "bg-sky-100 text-sky-800", sortOrder: 4 },
    ],
    skipDuplicates: true
  })

  // === ĐẤU THẦU ===

  // 15. Bidding Method
  console.log('  Seeding BiddingMethod...')
  await prisma.biddingMethod.createMany({
    data: [
      { code: "OPEN", name: "Đấu thầu rộng rãi", sortOrder: 1 },
      { code: "DIRECT", name: "Chỉ định thầu", sortOrder: 2 },
    ],
    skipDuplicates: true
  })

  // 16. Bidding Status
  console.log('  Seeding BiddingStatus...')
  await prisma.biddingStatus.createMany({
    data: [
      { code: "INVITE", name: "Đang mời thầu", color: "bg-yellow-100 text-yellow-800", sortOrder: 1 },
      { code: "OPENED", name: "Đã mở thầu", color: "bg-sky-100 text-sky-800", sortOrder: 2 },
      { code: "EVAL", name: "Đang chấm thầu", color: "bg-purple-100 text-purple-800", sortOrder: 3 },
      { code: "DONE", name: "Hoàn thành", color: "bg-green-100 text-green-800", sortOrder: 4 },
      { code: "CANCEL", name: "Đã hủy", color: "bg-red-100 text-red-800", sortOrder: 5 },
    ],
    skipDuplicates: true
  })

  // === NHẬP KHO ===

  // 17. Inbound Type
  console.log('  Seeding InboundType...')
  await prisma.inboundType.createMany({
    data: [
      { code: "PO", name: "Theo PO", sortOrder: 1 },
      { code: "REPAIR", name: "Sau Sửa chữa", sortOrder: 2 },
      { code: "LOAN", name: "Hàng Mượn", sortOrder: 3 },
      { code: "RETURN", name: "Hoàn trả", sortOrder: 4 },
    ],
    skipDuplicates: true
  })

  // 18. Inbound Status
  console.log('  Seeding InboundStatus...')
  await prisma.inboundStatus.createMany({
    data: [
      { code: "REQ", name: "Yêu cầu nhập", color: "bg-yellow-100 text-yellow-800", sortOrder: 1 },
      { code: "KCS", name: "KCS & Hồ sơ", color: "bg-purple-100 text-purple-800", sortOrder: 2 },
      { code: "PROC", name: "Đang nhập", color: "bg-sky-100 text-sky-800", sortOrder: 3 },
      { code: "DONE", name: "Hoàn thành", color: "bg-green-100 text-green-800", sortOrder: 4 },
    ],
    skipDuplicates: true
  })

  // === XUẤT KHO ===

  // 19. Outbound Purpose
  console.log('  Seeding OutboundPurpose...')
  await prisma.outboundPurpose.createMany({
    data: [
      { code: "OM", name: "Cấp O&M", sortOrder: 1 },
      { code: "URG", name: "Khẩn cấp", sortOrder: 2 },
      { code: "LOAN", name: "Cho mượn", sortOrder: 3 },
      { code: "REPAIR", name: "Đi Sửa chữa", sortOrder: 4 },
    ],
    skipDuplicates: true
  })

  // 20. Outbound Status
  console.log('  Seeding OutboundStatus...')
  await prisma.outboundStatus.createMany({
    data: [
      { code: "WAIT", name: "Chờ xuất", color: "bg-yellow-100 text-yellow-800", sortOrder: 1 },
      { code: "PICK", name: "Đang soạn hàng", color: "bg-purple-100 text-purple-800", sortOrder: 2 },
      { code: "DONE", name: "Đã xuất", color: "bg-green-100 text-green-800", sortOrder: 3 },
      { code: "CANCEL", name: "Đã hủy", color: "bg-red-100 text-red-800", sortOrder: 4 },
    ],
    skipDuplicates: true
  })

  // === KIỂM KÊ ===

  // 21. Stocktake Status
  console.log('  Seeding StocktakeStatus...')
  await prisma.stocktakeStatus.createMany({
    data: [
      { code: "PROG", name: "Đang tiến hành", color: "bg-yellow-100 text-yellow-800", sortOrder: 1 },
      { code: "DONE", name: "Đã hoàn thành", color: "bg-green-100 text-green-800", sortOrder: 2 },
      { code: "CANCEL", name: "Đã hủy", color: "bg-red-100 text-red-800", sortOrder: 3 },
    ],
    skipDuplicates: true
  })

  // 22. Stocktake Area
  console.log('  Seeding StocktakeArea...')
  await prisma.stocktakeArea.createMany({
    data: [
      { code: "ALL", name: "Toàn bộ", sortOrder: 1 },
      { code: "A", name: "Khu A", sortOrder: 2 },
      { code: "B", name: "Khu B", sortOrder: 3 },
      { code: "COLD", name: "Kho Lạnh", sortOrder: 4 },
    ],
    skipDuplicates: true
  })

  // === NGƯỜI DÙNG & NHẬT KÝ ===

  // 23. User Status
  console.log('  Seeding UserStatus...')
  await prisma.userStatus.createMany({
    data: [
      { code: "ACT", name: "Active", color: "bg-green-100 text-green-800", sortOrder: 1 },
      { code: "INACT", name: "Inactive", color: "bg-red-100 text-red-800", sortOrder: 2 },
    ],
    skipDuplicates: true
  })

  // 24. Activity Action
  console.log('  Seeding ActivityAction...')
  await prisma.activityAction.createMany({
    data: [
      { code: "CREATE", name: "Tạo", color: "bg-green-100 text-green-800", sortOrder: 1 },
      { code: "UPDATE", name: "Cập nhật", color: "bg-sky-100 text-sky-800", sortOrder: 2 },
      { code: "DELETE", name: "Xóa", color: "bg-red-100 text-red-800", sortOrder: 3 },
      { code: "LOGIN", name: "Đăng nhập", color: "bg-purple-100 text-purple-800", sortOrder: 4 },
      { code: "APPROVE", name: "Duyệt", color: "bg-emerald-100 text-emerald-800", sortOrder: 5 },
      { code: "EXPORT", name: "Xuất file", color: "bg-orange-100 text-orange-800", sortOrder: 6 },
    ],
    skipDuplicates: true
  })

  console.log('Seeding completed! 24 master data tables seeded.')

  // === PHÒNG BAN ===

  // 25. Department
  console.log('  Seeding Department...')
  await prisma.department.createMany({
    data: [
      { code: "PKT", name: "Phòng Kỹ thuật", sortOrder: 1 },
      { code: "PXVH", name: "PX Vận hành", sortOrder: 2 },
      { code: "PKH", name: "Phòng Kế hoạch", sortOrder: 3 },
      { code: "BGD", name: "Ban Giám đốc", sortOrder: 4 },
      { code: "PTC", name: "Phòng Tài chính", sortOrder: 5 },
      { code: "PXSCC", name: "PX Sửa chữa Cơ", sortOrder: 6 },
      { code: "PXSCD", name: "PX Sửa chữa Điện", sortOrder: 7 },
      { code: "TDHDK", name: "PX TĐH-ĐK", sortOrder: 8 },
    ],
    skipDuplicates: true
  })

  // === PERMISSION MANAGEMENT ===

  // 25. Actions
  console.log('  Seeding Actions...')
  await prisma.action.createMany({
    data: [
      { code: 'view', name: 'Xem', sortOrder: 1 },
      { code: 'create', name: 'Tạo', sortOrder: 2 },
      { code: 'edit', name: 'Sửa', sortOrder: 3 },
      { code: 'delete', name: 'Xóa', sortOrder: 4 },
      { code: 'approve', name: 'Duyệt', sortOrder: 5 },
    ],
    skipDuplicates: true
  })

  // 26. Features
  console.log('  Seeding Features...')
  await prisma.feature.createMany({
    data: [
      // BÁO CÁO & PHÂN TÍCH
      { code: 'dashboard', name: 'Tổng quan', groupCode: 'BÁO CÁO & PHÂN TÍCH', sortOrder: 1 },
      { code: 'reports', name: 'Báo cáo nhập/xuất/tồn', groupCode: 'BÁO CÁO & PHÂN TÍCH', sortOrder: 2 },
      { code: 'slow-moving', name: 'Vật tư chậm luân chuyển', groupCode: 'BÁO CÁO & PHÂN TÍCH', sortOrder: 3 },
      { code: 'stock-level', name: 'Định mức tồn kho an toàn', groupCode: 'BÁO CÁO & PHÂN TÍCH', sortOrder: 4 },
      // KẾ HOẠCH & MUA SẮM
      { code: 'material-request', name: 'Yêu cầu Vật tư', groupCode: 'KẾ HOẠCH & MUA SẮM', sortOrder: 5 },
      { code: 'purchase-request', name: 'Yêu cầu Mua sắm', groupCode: 'KẾ HOẠCH & MUA SẮM', sortOrder: 6 },
      { code: 'bidding', name: 'Quản lý Đấu thầu', groupCode: 'KẾ HOẠCH & MUA SẮM', sortOrder: 7 },
      // NHẬP XUẤT KHO
      { code: 'inbound', name: 'Nhập kho', groupCode: 'NHẬP XUẤT KHO', sortOrder: 8 },
      { code: 'outbound', name: 'Xuất kho', groupCode: 'NHẬP XUẤT KHO', sortOrder: 9 },
      { code: 'stock-take', name: 'Kiểm kê', groupCode: 'NHẬP XUẤT KHO', sortOrder: 10 },
      // DANH MỤC
      { code: 'materials', name: 'Danh mục vật tư', groupCode: 'DANH MỤC', sortOrder: 11 },
      { code: 'suppliers', name: 'Nhà cung cấp', groupCode: 'DANH MỤC', sortOrder: 12 },
      { code: 'warehouses', name: 'Vị trí kho', groupCode: 'DANH MỤC', sortOrder: 13 },
      // HỆ THỐNG
      { code: 'users', name: 'Người dùng', groupCode: 'HỆ THỐNG', sortOrder: 14 },
      { code: 'roles', name: 'Vai trò', groupCode: 'HỆ THỐNG', sortOrder: 15 },
      { code: 'settings', name: 'Cài đặt', groupCode: 'HỆ THỐNG', sortOrder: 16 },
    ],
    skipDuplicates: true
  })

  // 27. Feature-Action Mappings (all features get all 5 actions by default)
  console.log('  Seeding FeatureActions...')
  const allActions = await prisma.action.findMany()
  const allFeatures = await prisma.feature.findMany()
  
  const featureActionData = allFeatures.flatMap(feature =>
    allActions.map(action => ({
      featureId: feature.id,
      actionId: action.id
    }))
  )
  
  await prisma.featureAction.createMany({
    data: featureActionData,
    skipDuplicates: true
  })

  // 28. Roles
  console.log('  Seeding Roles...')
  
  // Build permissions object from all feature-actions
  const permissionsObj: Record<string, string[]> = {}
  for (const feature of allFeatures) {
    permissionsObj[feature.code] = allActions.map(action => action.code)
  }
  
  await prisma.role.createMany({
    data: [
      { name: 'Quản trị hệ thống', description: 'Toàn quyền quản lý hệ thống', permissions: permissionsObj },
      { name: 'Quản lý kho', description: 'Quản lý và phê duyệt các hoạt động kho', permissions: {} },
      { name: 'Nhân viên kho', description: 'Thực hiện nhập/xuất kho', permissions: {} },
      { name: 'Kế toán', description: 'Xem báo cáo và phê duyệt tài chính', permissions: {} },
      { name: 'Người xem', description: 'Chỉ xem dữ liệu', permissions: {} },
    ],
    skipDuplicates: true
  })

  console.log('Permission management seeded!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
