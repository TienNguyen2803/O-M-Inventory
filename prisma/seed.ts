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
      { code: "AGENT", name: "Agent", sortOrder: 4 },
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

  // 11. Country (Xuất xứ)
  console.log('  Seeding Country...')
  await prisma.country.createMany({
    data: [
      { code: "VN", name: "Việt Nam", sortOrder: 1 },
      { code: "US", name: "USA", sortOrder: 2 },
      { code: "CN", name: "Trung Quốc", sortOrder: 3 },
      { code: "JP", name: "Nhật Bản", sortOrder: 4 },
      { code: "DE", name: "Đức", sortOrder: 5 },
      { code: "KR", name: "Hàn Quốc", sortOrder: 6 },
      { code: "TW", name: "Đài Loan", sortOrder: 7 },
      { code: "SG", name: "Singapore", sortOrder: 8 },
      { code: "UK", name: "Anh", sortOrder: 9 },
      { code: "FR", name: "Pháp", sortOrder: 10 },
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
      { code: "REJ", name: "Từ chối", color: "bg-red-100 text-red-800", sortOrder: 3 },
      { code: "DONE", name: "Hoàn thành", color: "bg-sky-100 text-sky-800", sortOrder: 4 },
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

  // 14a. MaterialOrigin (Nguồn gốc vật tư)
  console.log('  Seeding MaterialOrigin...')
  await prisma.materialOrigin.createMany({
    data: [
      { code: "DOMESTIC", name: "Trong nước", sortOrder: 1 },
      { code: "IMPORT", name: "Nhập khẩu", sortOrder: 2 },
    ],
    skipDuplicates: true
  })

  // 14b. FundingSource (Nguồn vốn)
  console.log('  Seeding FundingSource...')
  await prisma.fundingSource.createMany({
    data: [
      { code: "SCL", name: "Sửa chữa lớn", sortOrder: 1 },
      { code: "DTXD", name: "Đầu tư xây dựng", sortOrder: 2 },
      { code: "QDTX", name: "Quỹ đầu tư", sortOrder: 3 },
    ],
    skipDuplicates: true
  })

  // === ĐẤU THẦU ===

  // 15. Bidding Method
  console.log('  Seeding BiddingMethod...')
  await prisma.biddingMethod.createMany({
    data: [
      { code: "OPEN", name: "Đấu thầu rộng rãi", sortOrder: 1 },
      { code: "LIMITED", name: "Đấu thầu hạn chế", sortOrder: 2 },
      { code: "DIRECT", name: "Chỉ định thầu", sortOrder: 3 },
      { code: "COMPETITIVE", name: "Chào hàng cạnh tranh", sortOrder: 4 },
    ],
    skipDuplicates: true
  })

  // 16. Bidding Status
  console.log('  Seeding BiddingStatus...')
  await prisma.biddingStatus.createMany({
    data: [
      { code: "INVITE", name: "Đang mời thầu", color: "bg-blue-100 text-blue-800", sortOrder: 1 },
      { code: "OPEN", name: "Đã mở thầu", color: "bg-yellow-100 text-yellow-800", sortOrder: 2 },
      { code: "EVAL", name: "Đang chấm thầu", color: "bg-orange-100 text-orange-800", sortOrder: 3 },
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
      { code: "DRAFT", name: "Nháp", color: "bg-gray-100 text-gray-800", sortOrder: 1 },
      { code: "REQUESTED", name: "Yêu cầu nhập", color: "bg-blue-100 text-blue-800", sortOrder: 2 },
      { code: "KCS", name: "Đang KCS", color: "bg-yellow-100 text-yellow-800", sortOrder: 3 },
      { code: "RECEIVING", name: "Đang nhập", color: "bg-orange-100 text-orange-800", sortOrder: 4 },
      { code: "COMPLETED", name: "Hoàn thành", color: "bg-green-100 text-green-800", sortOrder: 5 },
      { code: "CANCELLED", name: "Đã hủy", color: "bg-red-100 text-red-800", sortOrder: 6 },
    ],
    skipDuplicates: true
  })

  // 18b. Inbound Document Type
  console.log('  Seeding InboundDocumentType...')
  await prisma.inboundDocumentType.createMany({
    data: [
      { code: "INVOICE", name: "Hóa đơn", sortOrder: 1 },
      { code: "DELIVERY_NOTE", name: "Phiếu giao hàng", sortOrder: 2 },
      { code: "PACKING_LIST", name: "Packing List", sortOrder: 3 },
      { code: "COO", name: "Chứng nhận xuất xứ (C/O)", sortOrder: 4 },
      { code: "COA", name: "Chứng nhận chất lượng (COA)", sortOrder: 5 },
      { code: "WARRANTY", name: "Giấy bảo hành", sortOrder: 6 },
      { code: "OTHER", name: "Khác", sortOrder: 99 },
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
  
  await prisma.role.createMany({
    data: [
      { name: 'Quản trị hệ thống', description: 'Toàn quyền quản lý hệ thống' },
      { name: 'Quản lý kho', description: 'Quản lý và phê duyệt các hoạt động kho' },
      { name: 'Nhân viên kho', description: 'Thực hiện nhập/xuất kho' },
      { name: 'Kế toán', description: 'Xem báo cáo và phê duyệt tài chính' },
      { name: 'Người xem', description: 'Chỉ xem dữ liệu' },
    ],
    skipDuplicates: true
  })

  // 29. RoleFeatureAction - Assign all permissions to Admin role
  console.log('  Seeding RoleFeatureAction...')
  const adminRole = await prisma.role.findUnique({ where: { name: 'Quản trị hệ thống' } })
  const allFeatureActions = await prisma.featureAction.findMany()
  
  if (adminRole && allFeatureActions.length > 0) {
    const roleFeatureActionData = allFeatureActions.map(fa => ({
      roleId: adminRole.id,
      featureActionId: fa.id
    }))
    
    await prisma.roleFeatureAction.createMany({
      data: roleFeatureActionData,
      skipDuplicates: true
    })
  }

  console.log('Permission management seeded!')

  // === USERS ===
  console.log('  Seeding Users...')
  
  // Get departments for reference
  const departments = await prisma.department.findMany()
  const deptMap = Object.fromEntries(departments.map(d => [d.code, d.id]))
  
  // Get user statuses for reference
  const userStatuses = await prisma.userStatus.findMany()
  const statusMap = Object.fromEntries(userStatuses.map(s => [s.code, s.id]))
  const activeStatusId = statusMap['active'] || statusMap['Active'] || userStatuses[0]?.id
  
  await prisma.user.createMany({
    data: [
      { employeeCode: 'NV001', name: 'Nguyễn Văn Admin', email: 'admin@powertrack.vn', departmentId: deptMap['BGD'], statusId: activeStatusId },
      { employeeCode: 'NV002', name: 'Trần Thị Kho', email: 'kho@powertrack.vn', departmentId: deptMap['PKH'], statusId: activeStatusId },
      { employeeCode: 'NV003', name: 'Lê Văn Nhập', email: 'nhap@powertrack.vn', departmentId: deptMap['PKH'], statusId: activeStatusId },
      { employeeCode: 'NV004', name: 'Phạm Thị Xuất', email: 'xuat@powertrack.vn', departmentId: deptMap['PKH'], statusId: activeStatusId },
      { employeeCode: 'NV005', name: 'Hoàng Văn Kế', email: 'ketoan@powertrack.vn', departmentId: deptMap['PTC'], statusId: activeStatusId },
      { employeeCode: 'NV006', name: 'Vũ Thị Xem', email: 'viewer@powertrack.vn', departmentId: deptMap['PKT'], statusId: activeStatusId },
      { employeeCode: 'NV007', name: 'Đặng Văn Kỹ', email: 'kythuat@powertrack.vn', phone: '0901234567', departmentId: deptMap['PKT'], statusId: activeStatusId },
      { employeeCode: 'NV008', name: 'Bùi Thị Vận', email: 'vanhanh@powertrack.vn', phone: '0907654321', departmentId: deptMap['PXVH'], statusId: activeStatusId },
    ],
    skipDuplicates: true
  })
  
  console.log('Users seeded!')

  // === SEED MATERIALS ===
  console.log('  Seeding Materials...')
  
  // Get master data IDs for FK relations
  const categoryMap: Record<string, string> = {}
  const categories = await prisma.materialCategory.findMany()
  categories.forEach(c => { categoryMap[c.code] = c.id })
  
  const unitMap: Record<string, string> = {}
  const units = await prisma.materialUnit.findMany()
  units.forEach(u => { unitMap[u.code] = u.id })
  
  const materialStatusMap: Record<string, string> = {}
  const statuses = await prisma.materialStatus.findMany()
  statuses.forEach(s => { materialStatusMap[s.code] = s.id })
  
  const mgmtTypeMap: Record<string, string> = {}
  const mgmtTypes = await prisma.managementType.findMany()
  mgmtTypes.forEach(m => { mgmtTypeMap[m.code] = m.id })
  
  const countryMap: Record<string, string> = {}
  const countries = await prisma.country.findMany()
  countries.forEach(c => { countryMap[c.code] = c.id })

  await prisma.material.createMany({
    data: [
      { code: 'PM-TDH-001', name: 'Cảm biến áp suất', nameEn: 'Pressure Sensor', partNo: 'PS-2021-A1', categoryId: categoryMap['TDH'], unitId: unitMap['CAI'], statusId: materialStatusMap['NEW'], managementTypeId: mgmtTypeMap['SERIAL'], countryId: countryMap['JP'], manufacturer: 'Yokogawa', stock: 15, minStock: 5, maxStock: 50 },
      { code: 'PM-TDH-002', name: 'Cảm biến nhiệt độ PT100', nameEn: 'PT100 Temperature Sensor', partNo: 'TS-PT100-B2', categoryId: categoryMap['TDH'], unitId: unitMap['CAI'], statusId: materialStatusMap['NEW'], managementTypeId: mgmtTypeMap['SERIAL'], countryId: countryMap['DE'], manufacturer: 'Siemens', stock: 25, minStock: 10, maxStock: 100 },
      { code: 'PM-TDH-003', name: 'PLC S7-1500', nameEn: 'PLC S7-1500', partNo: 'S7-1516-3PN', categoryId: categoryMap['TDH'], unitId: unitMap['CAI'], statusId: materialStatusMap['NEW'], managementTypeId: mgmtTypeMap['SERIAL'], countryId: countryMap['DE'], manufacturer: 'Siemens', stock: 5, minStock: 2, maxStock: 10 },
      { code: 'PM-MEAS-001', name: 'Đồng hồ đo lưu lượng', nameEn: 'Flow Meter', partNo: 'FM-2022-C3', categoryId: categoryMap['MEAS'], unitId: unitMap['CAI'], statusId: materialStatusMap['NEW'], managementTypeId: mgmtTypeMap['SERIAL'], countryId: countryMap['JP'], manufacturer: 'Yokogawa', stock: 8, minStock: 3, maxStock: 20 },
      { code: 'PM-MEAS-002', name: 'Thiết bị đo pH', nameEn: 'pH Meter', partNo: 'PH-M100-D4', categoryId: categoryMap['MEAS'], unitId: unitMap['CAI'], statusId: materialStatusMap['USED'], managementTypeId: mgmtTypeMap['SERIAL'], countryId: countryMap['US'], manufacturer: 'Emerson', stock: 3, minStock: 2, maxStock: 10 },
      { code: 'PM-TURB-001', name: 'Cánh tuabin HPT', nameEn: 'HPT Blade', partNo: 'HPT-BLD-E5', categoryId: categoryMap['TURB'], unitId: unitMap['CAI'], statusId: materialStatusMap['NEW'], managementTypeId: mgmtTypeMap['SERIAL'], countryId: countryMap['US'], manufacturer: 'GE', stock: 20, minStock: 5, maxStock: 50 },
      { code: 'PM-TURB-002', name: 'Vòng bi trục tuabin', nameEn: 'Turbine Bearing', partNo: 'TB-BRG-F6', categoryId: categoryMap['TURB'], unitId: unitMap['BO'], statusId: materialStatusMap['NEW'], managementTypeId: mgmtTypeMap['SERIAL'], countryId: countryMap['JP'], manufacturer: 'NSK', stock: 6, minStock: 2, maxStock: 15 },
      { code: 'PM-VALVE-001', name: 'Van điều khiển DN100', nameEn: 'Control Valve DN100', partNo: 'CV-DN100-G7', categoryId: categoryMap['VALVE'], unitId: unitMap['CAI'], statusId: materialStatusMap['NEW'], managementTypeId: mgmtTypeMap['SERIAL'], countryId: countryMap['DE'], manufacturer: 'Samson', stock: 4, minStock: 2, maxStock: 10 },
      { code: 'PM-VALVE-002', name: 'Van an toàn PSV', nameEn: 'Pressure Safety Valve', partNo: 'PSV-200-H8', categoryId: categoryMap['VALVE'], unitId: unitMap['CAI'], statusId: materialStatusMap['USED'], managementTypeId: mgmtTypeMap['SERIAL'], countryId: countryMap['US'], manufacturer: 'Fisher', stock: 10, minStock: 5, maxStock: 30 },
      { code: 'PM-CONS-001', name: 'Gioăng cao su chịu nhiệt', nameEn: 'Heat Resistant Gasket', partNo: 'GSK-HR-I9', categoryId: categoryMap['CONS'], unitId: unitMap['CAI'], statusId: materialStatusMap['NEW'], managementTypeId: mgmtTypeMap['BATCH'], stock: 500, minStock: 100, maxStock: 2000 },
      { code: 'PM-CONS-002', name: 'Bulong M12x50 inox', nameEn: 'Stainless Bolt M12x50', partNo: 'BLT-M12-J0', categoryId: categoryMap['CONS'], unitId: unitMap['CAI'], statusId: materialStatusMap['NEW'], managementTypeId: mgmtTypeMap['BATCH'], countryId: countryMap['VN'], stock: 1000, minStock: 200, maxStock: 5000 },
      { code: 'PM-CONS-003', name: 'Đai ốc M12 inox', nameEn: 'Stainless Nut M12', partNo: 'NUT-M12-K1', categoryId: categoryMap['CONS'], unitId: unitMap['CAI'], statusId: materialStatusMap['NEW'], managementTypeId: mgmtTypeMap['BATCH'], countryId: countryMap['VN'], stock: 1200, minStock: 300, maxStock: 6000 },
      { code: 'PM-CHEM-001', name: 'Dầu bôi trơn tuabin', nameEn: 'Turbine Lube Oil', partNo: 'OIL-T46-L2', categoryId: categoryMap['CHEM'], unitId: unitMap['LIT'], statusId: materialStatusMap['NEW'], managementTypeId: mgmtTypeMap['BATCH'], countryId: countryMap['US'], manufacturer: 'ExxonMobil', stock: 2000, minStock: 500, maxStock: 10000 },
      { code: 'PM-CHEM-002', name: 'Hóa chất xử lý nước', nameEn: 'Water Treatment Chemical', partNo: 'WTC-PH-M3', categoryId: categoryMap['CHEM'], unitId: unitMap['KG'], statusId: materialStatusMap['NEW'], managementTypeId: mgmtTypeMap['BATCH'], countryId: countryMap['KR'], manufacturer: 'LG Chem', stock: 500, minStock: 100, maxStock: 2000 },
      { code: 'PM-MECH-001', name: 'Bơm ly tâm 10HP', nameEn: 'Centrifugal Pump 10HP', partNo: 'PUMP-10HP-N4', categoryId: categoryMap['MECH'], unitId: unitMap['CAI'], statusId: materialStatusMap['NEW'], managementTypeId: mgmtTypeMap['SERIAL'], countryId: countryMap['JP'], manufacturer: 'Ebara', stock: 2, minStock: 1, maxStock: 5 },
      { code: 'PM-MECH-002', name: 'Khớp nối mềm', nameEn: 'Flexible Coupling', partNo: 'CPL-FLX-O5', categoryId: categoryMap['MECH'], unitId: unitMap['CAI'], statusId: materialStatusMap['NEW'], managementTypeId: mgmtTypeMap['BATCH'], countryId: countryMap['CN'], stock: 30, minStock: 10, maxStock: 100 },
      { code: 'PM-PPE-001', name: 'Găng tay chịu nhiệt', nameEn: 'Heat Resistant Gloves', partNo: 'GLV-HT-P6', categoryId: categoryMap['PPE'], unitId: unitMap['DOI'], statusId: materialStatusMap['NEW'], managementTypeId: mgmtTypeMap['BATCH'], countryId: countryMap['VN'], stock: 100, minStock: 30, maxStock: 300 },
      { code: 'PM-PPE-002', name: 'Kính bảo hộ', nameEn: 'Safety Glasses', partNo: 'GLS-SF-Q7', categoryId: categoryMap['PPE'], unitId: unitMap['CAI'], statusId: materialStatusMap['NEW'], managementTypeId: mgmtTypeMap['BATCH'], countryId: countryMap['VN'], stock: 80, minStock: 20, maxStock: 200 },
      { code: 'PM-SERVER-001', name: 'RAM Server 32GB DDR4', nameEn: 'Server RAM 32GB DDR4', partNo: 'RAM-32G-R8', categoryId: categoryMap['SERVER'], unitId: unitMap['CAI'], statusId: materialStatusMap['NEW'], managementTypeId: mgmtTypeMap['SERIAL'], countryId: countryMap['KR'], manufacturer: 'Samsung', stock: 10, minStock: 4, maxStock: 30 },
      { code: 'PM-SERVER-002', name: 'SSD Server 1TB NVMe', nameEn: 'Server SSD 1TB NVMe', partNo: 'SSD-1TB-S9', categoryId: categoryMap['SERVER'], unitId: unitMap['CAI'], statusId: materialStatusMap['NEW'], managementTypeId: mgmtTypeMap['SERIAL'], countryId: countryMap['US'], manufacturer: 'Intel', stock: 8, minStock: 3, maxStock: 25 },
    ],
    skipDuplicates: true
  })
  
  console.log('Materials seeded! 20 records added.')

  // === WAREHOUSE LOCATIONS ===
  console.log('  Seeding WarehouseLocations...')

  // Get warehouse master data IDs for FK relations
  const warehouseAreas = await prisma.warehouseArea.findMany()
  const warehouseAreaMap = Object.fromEntries(warehouseAreas.map(a => [a.code, a.id]))

  const warehouseTypes = await prisma.warehouseType.findMany()
  const warehouseTypeMap = Object.fromEntries(warehouseTypes.map(t => [t.code, t.id]))

  const warehouseStatuses = await prisma.warehouseStatus.findMany()
  const warehouseStatusMap = Object.fromEntries(warehouseStatuses.map(s => [s.code, s.id]))

  await prisma.warehouseLocation.createMany({
    data: [
      { code: 'A1-01-01', name: 'Kệ 01 - Tầng 1 - Dãy A', areaId: warehouseAreaMap['A'], typeId: warehouseTypeMap['PALLET'], statusId: warehouseStatusMap['ACT'], barcode: 'LOC-A10101', maxWeight: 2000, dimensions: '2.7m x 1.2m' },
      { code: 'A1-01-02', name: 'Kệ 01 - Tầng 2 - Dãy A', areaId: warehouseAreaMap['A'], typeId: warehouseTypeMap['PALLET'], statusId: warehouseStatusMap['ACT'], barcode: 'LOC-A10102', maxWeight: 1500, dimensions: '2.7m x 1.2m' },
      { code: 'A1-01-03', name: 'Kệ 01 - Tầng 3 - Dãy A', areaId: warehouseAreaMap['A'], typeId: warehouseTypeMap['PALLET'], statusId: warehouseStatusMap['ACT'], barcode: 'LOC-A10103', maxWeight: 1000, dimensions: '2.7m x 1.2m' },
      { code: 'A1-02-01', name: 'Kệ 02 - Tầng 1 - Dãy A', areaId: warehouseAreaMap['A'], typeId: warehouseTypeMap['PALLET'], statusId: warehouseStatusMap['INACT'], barcode: 'LOC-A10201', maxWeight: 2000 },
      { code: 'A1-02-02', name: 'Kệ 02 - Tầng 2 - Dãy A', areaId: warehouseAreaMap['A'], typeId: warehouseTypeMap['PALLET'], statusId: warehouseStatusMap['ACT'] },
      { code: 'B1-01-01', name: 'Kệ 01 - Tầng 1 - Dãy B', areaId: warehouseAreaMap['B'], typeId: warehouseTypeMap['MEDIUM'], statusId: warehouseStatusMap['ACT'], barcode: 'LOC-B10101', maxWeight: 800, dimensions: '2.0m x 1.0m' },
      { code: 'B1-01-02', name: 'Kệ 01 - Tầng 2 - Dãy B', areaId: warehouseAreaMap['B'], typeId: warehouseTypeMap['MEDIUM'], statusId: warehouseStatusMap['ACT'], barcode: 'LOC-B10102', maxWeight: 600 },
      { code: 'B1-02-01', name: 'Kệ 02 - Tầng 1 - Dãy B', areaId: warehouseAreaMap['B'], typeId: warehouseTypeMap['MEDIUM'], statusId: warehouseStatusMap['ACT'] },
      { code: 'C1-FLOOR-01', name: 'Vị trí sàn - Khu C', areaId: warehouseAreaMap['C'], typeId: warehouseTypeMap['FLOOR'], statusId: warehouseStatusMap['ACT'], maxWeight: 5000, dimensions: '10m x 5m' },
      { code: 'COLD-01-01', name: 'Kệ Lạnh - Tầng 1', areaId: warehouseAreaMap['COLD'], typeId: warehouseTypeMap['PALLET'], statusId: warehouseStatusMap['ACT'], maxWeight: 1500, dimensions: '2.5m x 1.2m' },
      { code: 'CHEM-01-01', name: 'Kệ Hóa chất - Tầng 1', areaId: warehouseAreaMap['CHEM'], typeId: warehouseTypeMap['MEDIUM'], statusId: warehouseStatusMap['ACT'], maxWeight: 500, dimensions: '2.0m x 0.8m' },
    ],
    skipDuplicates: true
  })
  console.log('WarehouseLocations seeded! 11 records added.')

  // === SUPPLIERS ===
  console.log('  Seeding Suppliers...')

  // Get supplier master data IDs for FK relations
  const supplierTypes = await prisma.supplierType.findMany()
  const supplierTypeMap = Object.fromEntries(supplierTypes.map(t => [t.code, t.id]))

  const paymentTerms = await prisma.paymentTerm.findMany()
  const paymentTermMap = Object.fromEntries(paymentTerms.map(p => [p.code, p.id]))

  const currencies = await prisma.currency.findMany()
  const currencyMap = Object.fromEntries(currencies.map(c => [c.code, c.id]))

  // Supplier seed data
  const suppliersData = [
    {
      code: 'NCC-001',
      taxCode: '0101234567',
      name: 'Siemens Energy Vietnam',
      address: 'Deutsches Haus, 33 Le Duan, District 1, Ho Chi Minh City',
      countryId: countryMap['DE'],
      typeId: supplierTypeMap['OEM'],
      paymentTermId: paymentTermMap['NET30'],
      currencyId: currencyMap['USD'],
      status: 'Active',
      contacts: [
        { name: 'Mr. John Schmidt', position: 'Sales Manager', email: 'john.schmidt@siemens.com', phone: '+84 909 123 456' },
        { name: 'Ms. Anna Weber', position: 'Technical Support', email: 'anna.weber@siemens.com', phone: '+84 918 654 321' },
      ]
    },
    {
      code: 'NCC-002',
      taxCode: '0309876543',
      name: 'Yokogawa Vietnam',
      address: 'Saigon Tower, 29 Le Duan, District 1, Ho Chi Minh City',
      countryId: countryMap['JP'],
      typeId: supplierTypeMap['MFG'],
      paymentTermId: paymentTermMap['NET45'],
      currencyId: currencyMap['JPY'],
      status: 'Active',
      contacts: [
        { name: 'Mr. Tanaka Hiroshi', position: 'Country Manager', email: 'tanaka@yokogawa.com', phone: '+84 903 111 222' },
      ]
    },
    {
      code: 'NCC-003',
      taxCode: '0105551234',
      name: 'ABB Vietnam',
      address: '2 Hai Trieu, District 1, Ho Chi Minh City',
      countryId: countryMap['DE'],
      typeId: supplierTypeMap['DIST'],
      paymentTermId: paymentTermMap['NET60'],
      currencyId: currencyMap['EUR'],
      status: 'Active',
      contacts: [
        { name: 'Ms. Nguyen Thi Mai', position: 'Sales Representative', email: 'mai.nguyen@abb.com', phone: '+84 907 333 444' },
        { name: 'Mr. Tran Van Duc', position: 'Service Engineer', email: 'duc.tran@abb.com', phone: '+84 912 555 666' },
      ]
    },
    {
      code: 'NCC-004',
      taxCode: '0100112233',
      name: 'Emerson Vietnam',
      address: 'Bitexco Tower, 2 Hai Trieu, District 1, Ho Chi Minh City',
      countryId: countryMap['US'],
      typeId: supplierTypeMap['OEM'],
      paymentTermId: paymentTermMap['NET30'],
      currencyId: currencyMap['USD'],
      status: 'Active',
      contacts: [
        { name: 'Mr. David Brown', position: 'Account Manager', email: 'david.brown@emerson.com', phone: '+84 908 777 888' },
      ]
    },
    {
      code: 'NCC-005',
      taxCode: '0108889999',
      name: 'NSK Vietnam',
      address: 'Amata Industrial Park, Bien Hoa, Dong Nai',
      countryId: countryMap['JP'],
      typeId: supplierTypeMap['MFG'],
      paymentTermId: paymentTermMap['COD'],
      currencyId: currencyMap['VND'],
      status: 'Inactive',
      contacts: [
        { name: 'Mr. Sato Kenji', position: 'Factory Manager', email: 'sato@nsk.com', phone: '+84 251 123 456' },
      ]
    },
  ]

  for (const supplierData of suppliersData) {
    const { contacts, ...supplier } = supplierData
    const existingSupplier = await prisma.supplier.findUnique({ where: { code: supplier.code } })
    if (!existingSupplier) {
      await prisma.supplier.create({
        data: {
          ...supplier,
          contacts: { create: contacts }
        }
      })
    }
  }

  console.log('Suppliers seeded! 5 records added.')

  // === MATERIAL REQUESTS ===
  console.log('  Seeding MaterialRequests...')

  // Get User IDs for FK relations
  const users = await prisma.user.findMany()
  const userMap = Object.fromEntries(users.map(u => [u.employeeCode, u.id]))

  // Get Request Priority IDs
  const requestPriorities = await prisma.requestPriority.findMany()
  const priorityMap = Object.fromEntries(requestPriorities.map(p => [p.code, p.id]))

  // Get Request Status IDs
  const requestStatuses = await prisma.requestStatus.findMany()
  const requestStatusMap = Object.fromEntries(requestStatuses.map(s => [s.code, s.id]))

  // Get Materials for FK relations
  const materials = await prisma.material.findMany()
  const materialMap = Object.fromEntries(materials.map(m => [m.code, m.id]))

  // Helper function to generate request code
  const generateRequestCode = (index: number) => `YCVT-2026-${String(index).padStart(3, '0')}`

  // Create 20 Material Requests with items
  const materialRequestsData = [
    {
      requestCode: generateRequestCode(1),
      requesterId: userMap['NV007'],
      departmentId: deptMap['PKT'],
      priorityId: priorityMap['URG'],
      statusId: requestStatusMap['APPR'],
      approverId: userMap['NV001'],
      reason: 'Thay thế cảm biến áp suất tổ máy 1 bị lỗi, cần gấp để đảm bảo vận hành',
      requestDate: new Date('2026-01-15'),
      workOrder: 'WO-2026-001',
      step: 3,
      items: [
        { materialId: materialMap['PM-TDH-001'], unitId: unitMap['CAI'], requestedQuantity: 2, stock: 15 },
        { materialId: materialMap['PM-TDH-002'], unitId: unitMap['CAI'], requestedQuantity: 1, stock: 25, notes: 'Loại PT100 cho nhiệt độ cao' },
      ]
    },
    {
      requestCode: generateRequestCode(2),
      requesterId: userMap['NV008'],
      departmentId: deptMap['PXVH'],
      priorityId: priorityMap['NOR'],
      statusId: requestStatusMap['PEND'],
      reason: 'Bổ sung vật tư bảo trì định kỳ quý 1/2026',
      requestDate: new Date('2026-01-18'),
      step: 1,
      items: [
        { materialId: materialMap['PM-CONS-001'], unitId: unitMap['CAI'], requestedQuantity: 50, stock: 500 },
        { materialId: materialMap['PM-CONS-002'], unitId: unitMap['CAI'], requestedQuantity: 100, stock: 1000 },
        { materialId: materialMap['PM-CONS-003'], unitId: unitMap['CAI'], requestedQuantity: 100, stock: 1200 },
      ]
    },
    {
      requestCode: generateRequestCode(3),
      requesterId: userMap['NV003'],
      departmentId: deptMap['PXSCC'],
      priorityId: priorityMap['URG'],
      statusId: requestStatusMap['DONE'],
      approverId: userMap['NV002'],
      reason: 'Sửa chữa khẩn cấp bơm ly tâm hệ thống làm mát',
      requestDate: new Date('2026-01-10'),
      workOrder: 'WO-2026-002',
      step: 4,
      items: [
        { materialId: materialMap['PM-MECH-001'], unitId: unitMap['CAI'], requestedQuantity: 1, stock: 2 },
        { materialId: materialMap['PM-MECH-002'], unitId: unitMap['CAI'], requestedQuantity: 2, stock: 30 },
      ]
    },
    {
      requestCode: generateRequestCode(4),
      requesterId: userMap['NV007'],
      departmentId: deptMap['PKT'],
      priorityId: priorityMap['NOR'],
      statusId: requestStatusMap['APPR'],
      approverId: userMap['NV001'],
      reason: 'Chuẩn bị vật tư cho đại tu tuabin định kỳ T3/2026',
      requestDate: new Date('2026-01-20'),
      workOrder: 'WO-2026-003',
      step: 2,
      items: [
        { materialId: materialMap['PM-TURB-001'], unitId: unitMap['CAI'], requestedQuantity: 5, stock: 20 },
        { materialId: materialMap['PM-TURB-002'], unitId: unitMap['BO'], requestedQuantity: 2, stock: 6 },
        { materialId: materialMap['PM-CHEM-001'], unitId: unitMap['LIT'], requestedQuantity: 200, stock: 2000, notes: 'Dầu tuabin T46' },
      ]
    },
    {
      requestCode: generateRequestCode(5),
      requesterId: userMap['NV008'],
      departmentId: deptMap['PXVH'],
      priorityId: priorityMap['NOR'],
      statusId: requestStatusMap['PEND'],
      reason: 'Cấp đồ bảo hộ lao động cho nhân viên mới',
      requestDate: new Date('2026-01-22'),
      step: 1,
      items: [
        { materialId: materialMap['PM-PPE-001'], unitId: unitMap['DOI'], requestedQuantity: 10, stock: 100 },
        { materialId: materialMap['PM-PPE-002'], unitId: unitMap['CAI'], requestedQuantity: 10, stock: 80 },
      ]
    },
    {
      requestCode: generateRequestCode(6),
      requesterId: userMap['NV006'],
      departmentId: deptMap['TDHDK'],
      priorityId: priorityMap['URG'],
      statusId: requestStatusMap['APPR'],
      approverId: userMap['NV001'],
      reason: 'Thay thế PLC S7-1500 hệ thống điều khiển chính bị lỗi',
      requestDate: new Date('2026-01-25'),
      workOrder: 'WO-2026-004',
      step: 3,
      items: [
        { materialId: materialMap['PM-TDH-003'], unitId: unitMap['CAI'], requestedQuantity: 1, stock: 5, notes: 'CPU 1516-3PN' },
      ]
    },
    {
      requestCode: generateRequestCode(7),
      requesterId: userMap['NV003'],
      departmentId: deptMap['PXSCD'],
      priorityId: priorityMap['NOR'],
      statusId: requestStatusMap['DONE'],
      approverId: userMap['NV002'],
      reason: 'Kiểm tra và thay thế van điều khiển khu vực xử lý nước',
      requestDate: new Date('2026-01-08'),
      workOrder: 'WO-2026-005',
      step: 4,
      items: [
        { materialId: materialMap['PM-VALVE-001'], unitId: unitMap['CAI'], requestedQuantity: 2, stock: 4 },
        { materialId: materialMap['PM-VALVE-002'], unitId: unitMap['CAI'], requestedQuantity: 1, stock: 10 },
      ]
    },
    {
      requestCode: generateRequestCode(8),
      requesterId: userMap['NV004'],
      departmentId: deptMap['PKH'],
      priorityId: priorityMap['NOR'],
      statusId: requestStatusMap['PEND'],
      reason: 'Bổ sung thiết bị đo lường cho phòng thí nghiệm',
      requestDate: new Date('2026-01-26'),
      step: 1,
      items: [
        { materialId: materialMap['PM-MEAS-001'], unitId: unitMap['CAI'], requestedQuantity: 1, stock: 8 },
        { materialId: materialMap['PM-MEAS-002'], unitId: unitMap['CAI'], requestedQuantity: 1, stock: 3 },
      ]
    },
    {
      requestCode: generateRequestCode(9),
      requesterId: userMap['NV007'],
      departmentId: deptMap['PKT'],
      priorityId: priorityMap['NOR'],
      statusId: requestStatusMap['APPR'],
      approverId: userMap['NV001'],
      reason: 'Nâng cấp phần cứng máy chủ hệ thống SCADA',
      requestDate: new Date('2026-01-28'),
      workOrder: 'WO-2026-006',
      step: 2,
      items: [
        { materialId: materialMap['PM-SERVER-001'], unitId: unitMap['CAI'], requestedQuantity: 4, stock: 10 },
        { materialId: materialMap['PM-SERVER-002'], unitId: unitMap['CAI'], requestedQuantity: 2, stock: 8 },
      ]
    },
    {
      requestCode: generateRequestCode(10),
      requesterId: userMap['NV008'],
      departmentId: deptMap['PXVH'],
      priorityId: priorityMap['URG'],
      statusId: requestStatusMap['DONE'],
      approverId: userMap['NV002'],
      reason: 'Khẩn cấp: Thay thế hóa chất xử lý nước đã hết',
      requestDate: new Date('2026-01-05'),
      workOrder: 'WO-2026-007',
      step: 4,
      items: [
        { materialId: materialMap['PM-CHEM-002'], unitId: unitMap['KG'], requestedQuantity: 100, stock: 500 },
      ]
    },
    {
      requestCode: generateRequestCode(11),
      requesterId: userMap['NV006'],
      departmentId: deptMap['TDHDK'],
      priorityId: priorityMap['NOR'],
      statusId: requestStatusMap['PEND'],
      reason: 'Dự phòng cảm biến cho hệ thống TĐH',
      requestDate: new Date('2026-01-29'),
      step: 1,
      items: [
        { materialId: materialMap['PM-TDH-001'], unitId: unitMap['CAI'], requestedQuantity: 5, stock: 15 },
        { materialId: materialMap['PM-TDH-002'], unitId: unitMap['CAI'], requestedQuantity: 10, stock: 25 },
      ]
    },
    {
      requestCode: generateRequestCode(12),
      requesterId: userMap['NV003'],
      departmentId: deptMap['PXSCC'],
      priorityId: priorityMap['NOR'],
      statusId: requestStatusMap['APPR'],
      approverId: userMap['NV001'],
      reason: 'Vật tư cho kế hoạch bảo trì tháng 2',
      requestDate: new Date('2026-01-30'),
      workOrder: 'WO-2026-008',
      step: 2,
      items: [
        { materialId: materialMap['PM-CONS-001'], unitId: unitMap['CAI'], requestedQuantity: 100, stock: 500 },
        { materialId: materialMap['PM-MECH-002'], unitId: unitMap['CAI'], requestedQuantity: 5, stock: 30 },
      ]
    },
    {
      requestCode: generateRequestCode(13),
      requesterId: userMap['NV007'],
      departmentId: deptMap['PKT'],
      priorityId: priorityMap['URG'],
      statusId: requestStatusMap['DONE'],
      approverId: userMap['NV002'],
      reason: 'Sự cố tuabin - Thay thế vòng bi trục',
      requestDate: new Date('2026-01-02'),
      workOrder: 'WO-2026-009',
      step: 4,
      items: [
        { materialId: materialMap['PM-TURB-002'], unitId: unitMap['BO'], requestedQuantity: 1, stock: 6 },
      ]
    },
    {
      requestCode: generateRequestCode(14),
      requesterId: userMap['NV004'],
      departmentId: deptMap['PKH'],
      priorityId: priorityMap['NOR'],
      statusId: requestStatusMap['PEND'],
      reason: 'Chuẩn bị vật tư năm mới 2026',
      requestDate: new Date('2026-01-31'),
      step: 1,
      items: [
        { materialId: materialMap['PM-PPE-001'], unitId: unitMap['DOI'], requestedQuantity: 20, stock: 100 },
        { materialId: materialMap['PM-PPE-002'], unitId: unitMap['CAI'], requestedQuantity: 20, stock: 80 },
        { materialId: materialMap['PM-CONS-002'], unitId: unitMap['CAI'], requestedQuantity: 200, stock: 1000 },
      ]
    },
    {
      requestCode: generateRequestCode(15),
      requesterId: userMap['NV008'],
      departmentId: deptMap['PXVH'],
      priorityId: priorityMap['NOR'],
      statusId: requestStatusMap['APPR'],
      approverId: userMap['NV001'],
      reason: 'Bổ sung dầu bôi trơn định kỳ',
      requestDate: new Date('2026-01-27'),
      workOrder: 'WO-2026-010',
      step: 3,
      items: [
        { materialId: materialMap['PM-CHEM-001'], unitId: unitMap['LIT'], requestedQuantity: 500, stock: 2000, notes: 'Turbo oil ISO 46' },
      ]
    },
    {
      requestCode: generateRequestCode(16),
      requesterId: userMap['NV006'],
      departmentId: deptMap['TDHDK'],
      priorityId: priorityMap['URG'],
      statusId: requestStatusMap['DONE'],
      approverId: userMap['NV002'],
      reason: 'Thay thế khẩn cấp đồng hồ đo lưu lượng hệ thống khí',
      requestDate: new Date('2026-01-03'),
      workOrder: 'WO-2026-011',
      step: 4,
      items: [
        { materialId: materialMap['PM-MEAS-001'], unitId: unitMap['CAI'], requestedQuantity: 1, stock: 8 },
      ]
    },
    {
      requestCode: generateRequestCode(17),
      requesterId: userMap['NV003'],
      departmentId: deptMap['PXSCD'],
      priorityId: priorityMap['NOR'],
      statusId: requestStatusMap['PEND'],
      reason: 'Vật tư sửa chữa điện quý 1',
      requestDate: new Date('2026-02-01'),
      step: 1,
      items: [
        { materialId: materialMap['PM-TDH-001'], unitId: unitMap['CAI'], requestedQuantity: 3, stock: 15 },
        { materialId: materialMap['PM-CONS-001'], unitId: unitMap['CAI'], requestedQuantity: 30, stock: 500 },
      ]
    },
    {
      requestCode: generateRequestCode(18),
      requesterId: userMap['NV007'],
      departmentId: deptMap['PKT'],
      priorityId: priorityMap['NOR'],
      statusId: requestStatusMap['APPR'],
      approverId: userMap['NV001'],
      reason: 'Chuẩn bị vật tư cho đại tu máy phát T2',
      requestDate: new Date('2026-01-24'),
      workOrder: 'WO-2026-012',
      step: 2,
      items: [
        { materialId: materialMap['PM-TURB-001'], unitId: unitMap['CAI'], requestedQuantity: 3, stock: 20 },
        { materialId: materialMap['PM-VALVE-001'], unitId: unitMap['CAI'], requestedQuantity: 1, stock: 4 },
        { materialId: materialMap['PM-CHEM-001'], unitId: unitMap['LIT'], requestedQuantity: 100, stock: 2000 },
      ]
    },
    {
      requestCode: generateRequestCode(19),
      requesterId: userMap['NV004'],
      departmentId: deptMap['PKH'],
      priorityId: priorityMap['URG'],
      statusId: requestStatusMap['DONE'],
      approverId: userMap['NV002'],
      reason: 'Thay thế khẩn cấp thiết bị đo pH bị hỏng',
      requestDate: new Date('2026-01-06'),
      workOrder: 'WO-2026-013',
      step: 4,
      items: [
        { materialId: materialMap['PM-MEAS-002'], unitId: unitMap['CAI'], requestedQuantity: 1, stock: 3 },
      ]
    },
    {
      requestCode: generateRequestCode(20),
      requesterId: userMap['NV008'],
      departmentId: deptMap['PXVH'],
      priorityId: priorityMap['NOR'],
      statusId: requestStatusMap['PEND'],
      reason: 'Yêu cầu bổ sung vật tư tiêu hao tháng 2/2026',
      requestDate: new Date('2026-02-01'),
      step: 1,
      items: [
        { materialId: materialMap['PM-CONS-001'], unitId: unitMap['CAI'], requestedQuantity: 80, stock: 500 },
        { materialId: materialMap['PM-CONS-002'], unitId: unitMap['CAI'], requestedQuantity: 150, stock: 1000 },
        { materialId: materialMap['PM-CONS-003'], unitId: unitMap['CAI'], requestedQuantity: 150, stock: 1200 },
        { materialId: materialMap['PM-PPE-001'], unitId: unitMap['DOI'], requestedQuantity: 5, stock: 100 },
      ]
    },
  ]

  for (const requestData of materialRequestsData) {
    const { items, ...requestFields } = requestData
    await prisma.materialRequest.create({
      data: {
        ...requestFields,
        items: {
          create: items
        }
      }
    })
  }

  console.log('MaterialRequests seeded! 20 records added.')

  // === PURCHASE REQUESTS (Yêu cầu Mua sắm) ===
  console.log('\\n📦 Phase 3: Seeding Purchase Requests...')

  // Get MaterialOrigin IDs
  const materialOrigins = await prisma.materialOrigin.findMany()
  const originMap = Object.fromEntries(materialOrigins.map(o => [o.code, o.id]))

  // Get FundingSource IDs
  const fundingSources = await prisma.fundingSource.findMany()
  const fundingMap = Object.fromEntries(fundingSources.map(f => [f.code, f.id]))

  // Get Supplier IDs for suggested supplier
  const suppliers = await prisma.supplier.findMany()
  const supplierMap = Object.fromEntries(suppliers.map(s => [s.code, s.id]))

  // Helper function for PR code
  const generatePRCode = (index: number) => `PR-2026-${String(index).padStart(3, '0')}`

  const purchaseRequestsData = [
    {
      requestCode: generatePRCode(1),
      requesterId: userMap['NV007'],
      departmentId: deptMap['PKT'],
      statusId: requestStatusMap['APPR'],
      sourceId: originMap['DOMESTIC'],
      fundingSourceId: fundingMap['SCL'],
      description: 'Mua cảm biến áp suất thay thế cho tổ máy 1',
      totalAmount: 75000000,
      step: 2,
      items: [
        { name: 'Cảm biến áp suất P003', materialId: materialMap['PM-TDH-001'], unitId: unitMap['CAI'], quantity: 5, estimatedPrice: 15000000, suggestedSupplierId: supplierMap['NCC01'] },
      ]
    },
    {
      requestCode: generatePRCode(2),
      requesterId: userMap['NV008'],
      departmentId: deptMap['PXVH'],
      statusId: requestStatusMap['PEND'],
      sourceId: originMap['IMPORT'],
      fundingSourceId: fundingMap['DTXD'],
      description: 'Mua bơm ly tâm công suất lớn cho hệ thống làm mát',
      totalAmount: 450000000,
      step: 1,
      items: [
        { name: 'Bơm ly tâm 500HP', materialId: materialMap['PM-MECH-001'], unitId: unitMap['CAI'], quantity: 2, estimatedPrice: 225000000, suggestedSupplierId: supplierMap['NCC02'] },
      ]
    },
    {
      requestCode: generatePRCode(3),
      requesterId: userMap['NV003'],
      departmentId: deptMap['PXSCC'],
      statusId: requestStatusMap['DONE'],
      sourceId: originMap['DOMESTIC'],
      fundingSourceId: fundingMap['SCL'],
      description: 'Mua vòng bi cho động cơ quạt làm mát',
      totalAmount: 35000000,
      step: 4,
      items: [
        { name: 'Vòng bi SKF 6208', materialId: materialMap['PM-MECH-002'], unitId: unitMap['CAI'], quantity: 20, estimatedPrice: 1750000, suggestedSupplierId: supplierMap['NCC01'] },
      ]
    },
    {
      requestCode: generatePRCode(4),
      requesterId: userMap['NV006'],
      departmentId: deptMap['TDHDK'],
      statusId: requestStatusMap['APPR'],
      sourceId: originMap['IMPORT'],
      fundingSourceId: fundingMap['DTXD'],
      description: 'Mua hệ thống điều khiển DCS mới cho tổ máy 3',
      totalAmount: 2500000000,
      step: 2,
      items: [
        { name: 'Bộ điều khiển DCS ABB', materialId: materialMap['PM-TDH-001'], unitId: unitMap['BO'], quantity: 1, estimatedPrice: 2000000000, suggestedSupplierId: supplierMap['NCC03'] },
        { name: 'Module I/O', materialId: materialMap['PM-TDH-002'], unitId: unitMap['CAI'], quantity: 50, estimatedPrice: 10000000, suggestedSupplierId: supplierMap['NCC03'] },
      ]
    },
    {
      requestCode: generatePRCode(5),
      requesterId: userMap['NV004'],
      departmentId: deptMap['PKH'],
      statusId: requestStatusMap['PEND'],
      sourceId: originMap['DOMESTIC'],
      fundingSourceId: fundingMap['SCL'],
      description: 'Mua hóa chất xử lý nước lò hơi',
      totalAmount: 180000000,
      step: 1,
      items: [
        { name: 'Hóa chất xử lý nước N2820', materialId: materialMap['PM-CHEM-001'], unitId: unitMap['LIT'], quantity: 2000, estimatedPrice: 90000, suggestedSupplierId: supplierMap['NCC04'] },
      ]
    },
    {
      requestCode: generatePRCode(6),
      requesterId: userMap['NV007'],
      departmentId: deptMap['PKT'],
      statusId: requestStatusMap['DONE'],
      sourceId: originMap['DOMESTIC'],
      fundingSourceId: fundingMap['QDTX'],
      description: 'Mua thiết bị an toàn và bảo hộ lao động',
      totalAmount: 85000000,
      step: 4,
      items: [
        { name: 'Giày bảo hộ chống tĩnh điện', materialId: materialMap['PM-PPE-001'], unitId: unitMap['DOI'], quantity: 100, estimatedPrice: 500000, suggestedSupplierId: supplierMap['NCC01'] },
        { name: 'Mũ bảo hộ 3M', materialId: materialMap['PM-PPE-002'], unitId: unitMap['CAI'], quantity: 100, estimatedPrice: 350000, suggestedSupplierId: supplierMap['NCC01'] },
      ]
    },
    {
      requestCode: generatePRCode(7),
      requesterId: userMap['NV008'],
      departmentId: deptMap['PXVH'],
      statusId: requestStatusMap['REJ'],
      sourceId: originMap['IMPORT'],
      fundingSourceId: fundingMap['DTXD'],
      description: 'Mua máy biến áp dự phòng 110kV',
      totalAmount: 15000000000,
      step: 1,
      items: [
        { name: 'Máy biến áp 110kV/22kV 100MVA', materialId: materialMap['PM-MEAS-001'], unitId: unitMap['CAI'], quantity: 1, estimatedPrice: 15000000000, suggestedSupplierId: supplierMap['NCC03'] },
      ]
    },
    {
      requestCode: generatePRCode(8),
      requesterId: userMap['NV003'],
      departmentId: deptMap['PXSCC'],
      statusId: requestStatusMap['APPR'],
      sourceId: originMap['DOMESTIC'],
      fundingSourceId: fundingMap['SCL'],
      description: 'Mua van điều khiển cho hệ thống nhiên liệu',
      totalAmount: 320000000,
      step: 3,
      items: [
        { name: 'Van điều khiển DN100 PN40', materialId: materialMap['PM-VALVE-001'], unitId: unitMap['CAI'], quantity: 8, estimatedPrice: 40000000, suggestedSupplierId: supplierMap['NCC02'] },
      ]
    },
    {
      requestCode: generatePRCode(9),
      requesterId: userMap['NV006'],
      departmentId: deptMap['TDHDK'],
      statusId: requestStatusMap['PEND'],
      sourceId: originMap['DOMESTIC'],
      fundingSourceId: fundingMap['QDTX'],
      description: 'Mua cáp điều khiển cho dự án nâng cấp SCADA',
      totalAmount: 125000000,
      step: 1,
      items: [
        { name: 'Cáp điều khiển 12x1.5mm²', materialId: materialMap['PM-TDH-001'], unitId: unitMap['MET'], quantity: 5000, estimatedPrice: 25000, suggestedSupplierId: supplierMap['NCC01'] },
      ]
    },
    {
      requestCode: generatePRCode(10),
      requesterId: userMap['NV004'],
      departmentId: deptMap['PKH'],
      statusId: requestStatusMap['DONE'],
      sourceId: originMap['IMPORT'],
      fundingSourceId: fundingMap['SCL'],
      description: 'Mua thiết bị đo phân tích môi trường',
      totalAmount: 280000000,
      step: 4,
      items: [
        { name: 'Máy đo pH online', materialId: materialMap['PM-MEAS-002'], unitId: unitMap['CAI'], quantity: 2, estimatedPrice: 80000000, suggestedSupplierId: supplierMap['NCC03'] },
        { name: 'Máy đo turbidity', materialId: materialMap['PM-MEAS-002'], unitId: unitMap['CAI'], quantity: 2, estimatedPrice: 60000000, suggestedSupplierId: supplierMap['NCC03'] },
      ]
    },
    {
      requestCode: generatePRCode(11),
      requesterId: userMap['NV007'],
      departmentId: deptMap['PKT'],
      statusId: requestStatusMap['APPR'],
      sourceId: originMap['DOMESTIC'],
      fundingSourceId: fundingMap['DTXD'],
      description: 'Mua cánh tuabin dự phòng',
      totalAmount: 890000000,
      step: 2,
      items: [
        { name: 'Cánh tuabin hạ áp', materialId: materialMap['PM-TURB-001'], unitId: unitMap['CAI'], quantity: 10, estimatedPrice: 89000000, suggestedSupplierId: supplierMap['NCC02'] },
      ]
    },
    {
      requestCode: generatePRCode(12),
      requesterId: userMap['NV008'],
      departmentId: deptMap['PXVH'],
      statusId: requestStatusMap['PEND'],
      sourceId: originMap['DOMESTIC'],
      fundingSourceId: fundingMap['SCL'],
      description: 'Mua vật tư tiêu hao bảo dưỡng quý 2/2026',
      totalAmount: 65000000,
      step: 1,
      items: [
        { name: 'Ốc vít các loại', materialId: materialMap['PM-CONS-001'], unitId: unitMap['CAI'], quantity: 1000, estimatedPrice: 25000, suggestedSupplierId: supplierMap['NCC01'] },
        { name: 'Bulong M16', materialId: materialMap['PM-CONS-002'], unitId: unitMap['CAI'], quantity: 500, estimatedPrice: 40000, suggestedSupplierId: supplierMap['NCC01'] },
        { name: 'Đệm phẳng các loại', materialId: materialMap['PM-CONS-003'], unitId: unitMap['CAI'], quantity: 2000, estimatedPrice: 10000, suggestedSupplierId: supplierMap['NCC01'] },
      ]
    },
    {
      requestCode: generatePRCode(13),
      requesterId: userMap['NV003'],
      departmentId: deptMap['PXSCC'],
      statusId: requestStatusMap['DONE'],
      sourceId: originMap['IMPORT'],
      fundingSourceId: fundingMap['QDTX'],
      description: 'Mua bộ phốt cho bơm thủy lực',
      totalAmount: 45000000,
      step: 4,
      items: [
        { name: 'Bộ phốt bơm thủy lực Rexroth', materialId: materialMap['PM-MECH-002'], unitId: unitMap['BO'], quantity: 5, estimatedPrice: 9000000, suggestedSupplierId: supplierMap['NCC02'] },
      ]
    },
    {
      requestCode: generatePRCode(14),
      requesterId: userMap['NV006'],
      departmentId: deptMap['TDHDK'],
      statusId: requestStatusMap['APPR'],
      sourceId: originMap['DOMESTIC'],
      fundingSourceId: fundingMap['SCL'],
      description: 'Mua rơ le bảo vệ cho trạm 110kV',
      totalAmount: 520000000,
      step: 2,
      items: [
        { name: 'Rơ le bảo vệ khoảng cách', materialId: materialMap['PM-TDH-002'], unitId: unitMap['CAI'], quantity: 4, estimatedPrice: 130000000, suggestedSupplierId: supplierMap['NCC03'] },
      ]
    },
    {
      requestCode: generatePRCode(15),
      requesterId: userMap['NV004'],
      departmentId: deptMap['PKH'],
      statusId: requestStatusMap['PEND'],
      sourceId: originMap['DOMESTIC'],
      fundingSourceId: fundingMap['DTXD'],
      description: 'Mua dầu bôi trơn tuabin',
      totalAmount: 185000000,
      step: 1,
      items: [
        { name: 'Dầu tuabin T46', materialId: materialMap['PM-CHEM-001'], unitId: unitMap['LIT'], quantity: 2000, estimatedPrice: 92500, suggestedSupplierId: supplierMap['NCC04'] },
      ]
    },
    {
      requestCode: generatePRCode(16),
      requesterId: userMap['NV007'],
      departmentId: deptMap['PKT'],
      statusId: requestStatusMap['DONE'],
      sourceId: originMap['IMPORT'],
      fundingSourceId: fundingMap['QDTX'],
      description: 'Mua cảm biến nhiệt độ cao cấp',
      totalAmount: 156000000,
      step: 4,
      items: [
        { name: 'Cảm biến nhiệt PT100', materialId: materialMap['PM-TDH-002'], unitId: unitMap['CAI'], quantity: 12, estimatedPrice: 13000000, suggestedSupplierId: supplierMap['NCC03'] },
      ]
    },
    {
      requestCode: generatePRCode(17),
      requesterId: userMap['NV008'],
      departmentId: deptMap['PXVH'],
      statusId: requestStatusMap['APPR'],
      sourceId: originMap['DOMESTIC'],
      fundingSourceId: fundingMap['SCL'],
      description: 'Mua khớp nối mềm cho đường ống',
      totalAmount: 78000000,
      step: 3,
      items: [
        { name: 'Khớp nối mềm DN200', materialId: materialMap['PM-VALVE-001'], unitId: unitMap['CAI'], quantity: 6, estimatedPrice: 13000000, suggestedSupplierId: supplierMap['NCC02'] },
      ]
    },
    {
      requestCode: generatePRCode(18),
      requesterId: userMap['NV003'],
      departmentId: deptMap['PXSCC'],
      statusId: requestStatusMap['REJ'],
      sourceId: originMap['IMPORT'],
      fundingSourceId: fundingMap['DTXD'],
      description: 'Mua rotor máy phát dự phòng (từ chối do ngân sách)',
      totalAmount: 8500000000,
      step: 1,
      items: [
        { name: 'Rotor máy phát 300MW', materialId: materialMap['PM-TURB-002'], unitId: unitMap['CAI'], quantity: 1, estimatedPrice: 8500000000, suggestedSupplierId: supplierMap['NCC02'] },
      ]
    },
    {
      requestCode: generatePRCode(19),
      requesterId: userMap['NV006'],
      departmentId: deptMap['TDHDK'],
      statusId: requestStatusMap['APPR'],
      sourceId: originMap['DOMESTIC'],
      fundingSourceId: fundingMap['QDTX'],
      description: 'Mua thiết bị UPS cho phòng điều khiển',
      totalAmount: 245000000,
      step: 2,
      items: [
        { name: 'UPS 10kVA online', materialId: materialMap['PM-TDH-001'], unitId: unitMap['CAI'], quantity: 5, estimatedPrice: 49000000, suggestedSupplierId: supplierMap['NCC01'] },
      ]
    },
    {
      requestCode: generatePRCode(20),
      requesterId: userMap['NV004'],
      departmentId: deptMap['PKH'],
      statusId: requestStatusMap['PEND'],
      sourceId: originMap['IMPORT'],
      fundingSourceId: fundingMap['SCL'],
      description: 'Mua thiết bị lấy mẫu và phân tích khí thải',
      totalAmount: 680000000,
      step: 1,
      items: [
        { name: 'Hệ thống CEMS', materialId: materialMap['PM-MEAS-001'], unitId: unitMap['BO'], quantity: 2, estimatedPrice: 340000000, suggestedSupplierId: supplierMap['NCC03'] },
      ]
    },
  ]

  for (const prData of purchaseRequestsData) {
    const { items, ...requestFields } = prData
    
    // Create PurchaseRequest first
    const createdPR = await prisma.purchaseRequest.create({
      data: {
        requestCode: requestFields.requestCode,
        requesterId: requestFields.requesterId,
        departmentId: requestFields.departmentId,
        statusId: requestFields.statusId,
        sourceId: requestFields.sourceId,
        fundingSourceId: requestFields.fundingSourceId,
        description: requestFields.description,
        totalAmount: requestFields.totalAmount,
        step: requestFields.step,
      }
    })
    
    // Then create items
    for (const item of items) {
      await prisma.purchaseRequestItem.create({
        data: {
          requestId: createdPR.id,
          name: item.name,
          materialId: item.materialId || null,
          unitId: item.unitId,
          quantity: item.quantity,
          estimatedPrice: item.estimatedPrice,
          suggestedSupplierId: item.suggestedSupplierId || null,
        }
      })
    }
  }

  console.log('PurchaseRequests seeded! 20 records added.')

  // === BIDDING PACKAGES ===
  console.log('  Seeding BiddingPackages...')

  // Get bidding master data IDs for FK relations
  const biddingMethods = await prisma.biddingMethod.findMany()
  const biddingMethodMap = Object.fromEntries(biddingMethods.map(m => [m.code, m.id]))

  const biddingStatuses = await prisma.biddingStatus.findMany()
  const biddingStatusMap = Object.fromEntries(biddingStatuses.map(s => [s.code, s.id]))

  // Get suppliers for FK relations
  const suppliersList = await prisma.supplier.findMany()
  const supplierIdMap = Object.fromEntries(suppliersList.map(s => [s.code, s.id]))

  // Helper function to generate package code
  const generatePackageCode = (index: number) => `TB-2026-${String(index).padStart(2, '0')}`

  // Create 20 Bidding Packages with scope items and participants
  const biddingPackagesData = [
    {
      packageCode: generatePackageCode(1),
      name: 'Mua sắm cảm biến áp suất và nhiệt độ cho hệ thống giám sát',
      methodId: biddingMethodMap['OPEN'],
      statusId: biddingStatusMap['DONE'],
      createdById: userMap['NV002'],
      winnerId: supplierIdMap['NCC-002'],
      estimatedBudget: 850000000,
      openDate: new Date('2026-01-05'),
      closeDate: new Date('2026-01-20'),
      step: 4,
      notes: 'Gói thầu đã hoàn thành, nhà thầu Yokogawa trúng thầu',
      scopeItems: [
        { name: 'Cảm biến áp suất 0-100 bar', unitId: unitMap['CAI'], quantity: 10, estimatedAmount: 350000000 },
        { name: 'Cảm biến nhiệt độ PT100', unitId: unitMap['CAI'], quantity: 15, estimatedAmount: 250000000 },
        { name: 'Cảm biến lưu lượng DN50', unitId: unitMap['CAI'], quantity: 5, estimatedAmount: 250000000 },
      ],
      participants: ['NCC-001', 'NCC-002', 'NCC-004']
    },
    {
      packageCode: generatePackageCode(2),
      name: 'Mua PLC S7-1500 và phụ kiện cho hệ thống điều khiển',
      methodId: biddingMethodMap['LIMITED'],
      statusId: biddingStatusMap['EVAL'],
      createdById: userMap['NV003'],
      estimatedBudget: 1250000000,
      openDate: new Date('2026-01-10'),
      closeDate: new Date('2026-01-25'),
      step: 3,
      notes: 'Đang chấm thầu, dự kiến chọn nhà thầu tuần sau',
      scopeItems: [
        { name: 'PLC S7-1516-3PN/DP', unitId: unitMap['CAI'], quantity: 3, estimatedAmount: 600000000 },
        { name: 'Module I/O SM1231', unitId: unitMap['CAI'], quantity: 20, estimatedAmount: 400000000 },
        { name: 'Module truyền thông CP1543-1', unitId: unitMap['CAI'], quantity: 5, estimatedAmount: 250000000 },
      ],
      participants: ['NCC-001', 'NCC-003']
    },
    {
      packageCode: generatePackageCode(3),
      name: 'Cung cấp vật tư van điều khiển DN100-DN200',
      methodId: biddingMethodMap['OPEN'],
      statusId: biddingStatusMap['OPEN'],
      createdById: userMap['NV004'],
      estimatedBudget: 680000000,
      openDate: new Date('2026-01-15'),
      closeDate: new Date('2026-02-01'),
      step: 2,
      notes: 'Đã mở thầu, đang tiếp nhận hồ sơ dự thầu',
      scopeItems: [
        { name: 'Van điều khiển DN100 PN16', unitId: unitMap['CAI'], quantity: 8, estimatedAmount: 320000000 },
        { name: 'Van điều khiển DN200 PN16', unitId: unitMap['CAI'], quantity: 4, estimatedAmount: 280000000 },
        { name: 'Actuator điện cho van', unitId: unitMap['CAI'], quantity: 12, estimatedAmount: 80000000 },
      ],
      participants: ['NCC-001', 'NCC-003', 'NCC-004']
    },
    {
      packageCode: generatePackageCode(4),
      name: 'Mua sắm dầu bôi trơn tuabin ISO VG46',
      methodId: biddingMethodMap['COMPETITIVE'],
      statusId: biddingStatusMap['DONE'],
      createdById: userMap['NV002'],
      winnerId: supplierIdMap['NCC-004'],
      estimatedBudget: 450000000,
      openDate: new Date('2025-12-01'),
      closeDate: new Date('2025-12-15'),
      step: 4,
      notes: 'Đã hoàn thành, giao hàng tháng 1/2026',
      scopeItems: [
        { name: 'Dầu tuabin ISO VG46', unitId: unitMap['LIT'], quantity: 5000, estimatedAmount: 350000000 },
        { name: 'Dầu thủy lực ISO VG32', unitId: unitMap['LIT'], quantity: 2000, estimatedAmount: 100000000 },
      ],
      participants: ['NCC-004', 'NCC-005']
    },
    {
      packageCode: generatePackageCode(5),
      name: 'Cung cấp vòng bi chính xác cao cho tuabin khí',
      methodId: biddingMethodMap['DIRECT'],
      statusId: biddingStatusMap['DONE'],
      createdById: userMap['NV003'],
      winnerId: supplierIdMap['NCC-005'],
      estimatedBudget: 980000000,
      openDate: new Date('2025-11-15'),
      closeDate: new Date('2025-12-01'),
      step: 4,
      notes: 'Chỉ định thầu do yêu cầu kỹ thuật đặc biệt của OEM',
      scopeItems: [
        { name: 'Vòng bi trục chính SKF 6330', unitId: unitMap['BO'], quantity: 4, estimatedAmount: 480000000 },
        { name: 'Vòng bi trục phụ SKF 6324', unitId: unitMap['BO'], quantity: 6, estimatedAmount: 360000000 },
        { name: 'Seal và phụ kiện', unitId: unitMap['BO'], quantity: 10, estimatedAmount: 140000000 },
      ],
      participants: ['NCC-005']
    },
    {
      packageCode: generatePackageCode(6),
      name: 'Mua thiết bị đo lường và phân tích nước',
      methodId: biddingMethodMap['OPEN'],
      statusId: biddingStatusMap['INVITE'],
      createdById: userMap['NV006'],
      estimatedBudget: 520000000,
      openDate: new Date('2026-02-01'),
      closeDate: new Date('2026-02-15'),
      step: 1,
      notes: 'Đang mời thầu, hạn nộp hồ sơ 15/02/2026',
      scopeItems: [
        { name: 'Máy đo pH online', unitId: unitMap['CAI'], quantity: 3, estimatedAmount: 180000000 },
        { name: 'Máy đo độ dẫn điện', unitId: unitMap['CAI'], quantity: 3, estimatedAmount: 150000000 },
        { name: 'Máy đo oxy hòa tan', unitId: unitMap['CAI'], quantity: 2, estimatedAmount: 190000000 },
      ],
      participants: []
    },
    {
      packageCode: generatePackageCode(7),
      name: 'Cung cấp hóa chất xử lý nước làm mát',
      methodId: biddingMethodMap['COMPETITIVE'],
      statusId: biddingStatusMap['DONE'],
      createdById: userMap['NV004'],
      winnerId: supplierIdMap['NCC-003'],
      estimatedBudget: 320000000,
      openDate: new Date('2025-12-10'),
      closeDate: new Date('2025-12-25'),
      step: 4,
      notes: 'Hợp đồng cung cấp hóa chất năm 2026',
      scopeItems: [
        { name: 'Hóa chất chống ăn mòn', unitId: unitMap['KG'], quantity: 500, estimatedAmount: 150000000 },
        { name: 'Hóa chất chống cáu cặn', unitId: unitMap['KG'], quantity: 400, estimatedAmount: 120000000 },
        { name: 'Hóa chất diệt khuẩn', unitId: unitMap['KG'], quantity: 200, estimatedAmount: 50000000 },
      ],
      participants: ['NCC-003', 'NCC-004']
    },
    {
      packageCode: generatePackageCode(8),
      name: 'Mua sắm bơm ly tâm và phụ kiện',
      methodId: biddingMethodMap['LIMITED'],
      statusId: biddingStatusMap['INVITE'],
      createdById: userMap['NV007'],
      estimatedBudget: 780000000,
      openDate: new Date('2026-01-25'),
      closeDate: new Date('2026-02-10'),
      step: 1,
      notes: 'Đấu thầu hạn chế với 3 nhà cung cấp đã được sơ tuyển',
      scopeItems: [
        { name: 'Bơm ly tâm 15HP', unitId: unitMap['CAI'], quantity: 4, estimatedAmount: 480000000 },
        { name: 'Bơm ly tâm 10HP', unitId: unitMap['CAI'], quantity: 6, estimatedAmount: 240000000 },
        { name: 'Phụ tùng thay thế', unitId: unitMap['BO'], quantity: 10, estimatedAmount: 60000000 },
      ],
      participants: []
    },
    {
      packageCode: generatePackageCode(9),
      name: 'Mua thiết bị bảo hộ lao động năm 2026',
      methodId: biddingMethodMap['OPEN'],
      statusId: biddingStatusMap['EVAL'],
      createdById: userMap['NV002'],
      estimatedBudget: 180000000,
      openDate: new Date('2026-01-08'),
      closeDate: new Date('2026-01-22'),
      step: 3,
      notes: 'Đang đánh giá hồ sơ kỹ thuật',
      scopeItems: [
        { name: 'Găng tay chịu nhiệt', unitId: unitMap['DOI'], quantity: 200, estimatedAmount: 40000000 },
        { name: 'Kính bảo hộ chống tia UV', unitId: unitMap['CAI'], quantity: 150, estimatedAmount: 30000000 },
        { name: 'Mũ bảo hộ công nghiệp', unitId: unitMap['CAI'], quantity: 100, estimatedAmount: 50000000 },
        { name: 'Giày bảo hộ chống tĩnh điện', unitId: unitMap['DOI'], quantity: 120, estimatedAmount: 60000000 },
      ],
      participants: ['NCC-003', 'NCC-005']
    },
    {
      packageCode: generatePackageCode(10),
      name: 'Cung cấp cánh tuabin HPT dự phòng',
      methodId: biddingMethodMap['DIRECT'],
      statusId: biddingStatusMap['EVAL'],
      createdById: userMap['NV003'],
      estimatedBudget: 4500000000,
      openDate: new Date('2026-01-02'),
      closeDate: new Date('2026-01-20'),
      step: 3,
      notes: 'Chỉ định thầu OEM GE, đang đàm phán hợp đồng',
      scopeItems: [
        { name: 'Cánh HPT Stage 1', unitId: unitMap['CAI'], quantity: 40, estimatedAmount: 2000000000 },
        { name: 'Cánh HPT Stage 2', unitId: unitMap['CAI'], quantity: 40, estimatedAmount: 1500000000 },
        { name: 'Vòng dẫn hướng', unitId: unitMap['BO'], quantity: 2, estimatedAmount: 1000000000 },
      ],
      participants: ['NCC-004']
    },
    {
      packageCode: generatePackageCode(11),
      name: 'Mua RAM và SSD cho hệ thống máy chủ',
      methodId: biddingMethodMap['COMPETITIVE'],
      statusId: biddingStatusMap['DONE'],
      createdById: userMap['NV006'],
      winnerId: supplierIdMap['NCC-001'],
      estimatedBudget: 280000000,
      openDate: new Date('2025-12-05'),
      closeDate: new Date('2025-12-20'),
      step: 4,
      notes: 'Nâng cấp hệ thống SCADA server',
      scopeItems: [
        { name: 'RAM DDR4 32GB ECC', unitId: unitMap['CAI'], quantity: 20, estimatedAmount: 160000000 },
        { name: 'SSD NVMe 2TB Enterprise', unitId: unitMap['CAI'], quantity: 10, estimatedAmount: 120000000 },
      ],
      participants: ['NCC-001', 'NCC-003']
    },
    {
      packageCode: generatePackageCode(12),
      name: 'Cung cấp gioăng và seal chịu nhiệt cao',
      methodId: biddingMethodMap['OPEN'],
      statusId: biddingStatusMap['OPEN'],
      createdById: userMap['NV004'],
      estimatedBudget: 150000000,
      openDate: new Date('2026-01-18'),
      closeDate: new Date('2026-02-05'),
      step: 2,
      notes: 'Gói thầu vật tư tiêu hao hàng năm',
      scopeItems: [
        { name: 'Gioăng graphite DN50-DN200', unitId: unitMap['CAI'], quantity: 500, estimatedAmount: 75000000 },
        { name: 'O-ring chịu nhiệt 200°C', unitId: unitMap['CAI'], quantity: 1000, estimatedAmount: 50000000 },
        { name: 'Seal cơ khí bơm', unitId: unitMap['BO'], quantity: 20, estimatedAmount: 25000000 },
      ],
      participants: ['NCC-002', 'NCC-005']
    },
    {
      packageCode: generatePackageCode(13),
      name: 'Mua sắm thiết bị đo rung và chẩn đoán',
      methodId: biddingMethodMap['LIMITED'],
      statusId: biddingStatusMap['INVITE'],
      createdById: userMap['NV007'],
      estimatedBudget: 650000000,
      openDate: new Date('2026-01-28'),
      closeDate: new Date('2026-02-12'),
      step: 1,
      notes: 'Thiết bị chẩn đoán CBM cho tuabin',
      scopeItems: [
        { name: 'Máy đo rung Bently Nevada', unitId: unitMap['CAI'], quantity: 2, estimatedAmount: 400000000 },
        { name: 'Cảm biến gia tốc', unitId: unitMap['CAI'], quantity: 10, estimatedAmount: 150000000 },
        { name: 'Phần mềm phân tích', unitId: unitMap['BO'], quantity: 1, estimatedAmount: 100000000 },
      ],
      participants: []
    },
    {
      packageCode: generatePackageCode(14),
      name: 'Cung cấp bulong và đai ốc inox',
      methodId: biddingMethodMap['COMPETITIVE'],
      statusId: biddingStatusMap['DONE'],
      createdById: userMap['NV002'],
      winnerId: supplierIdMap['NCC-005'],
      estimatedBudget: 85000000,
      openDate: new Date('2025-11-25'),
      closeDate: new Date('2025-12-10'),
      step: 4,
      notes: 'Vật tư tiêu hao quý 1/2026',
      scopeItems: [
        { name: 'Bulong M12x50 inox 304', unitId: unitMap['CAI'], quantity: 2000, estimatedAmount: 40000000 },
        { name: 'Đai ốc M12 inox 304', unitId: unitMap['CAI'], quantity: 2500, estimatedAmount: 25000000 },
        { name: 'Vòng đệm phẳng M12', unitId: unitMap['CAI'], quantity: 3000, estimatedAmount: 20000000 },
      ],
      participants: ['NCC-003', 'NCC-005']
    },
    {
      packageCode: generatePackageCode(15),
      name: 'Mua van an toàn PSV cho lò hơi',
      methodId: biddingMethodMap['OPEN'],
      statusId: biddingStatusMap['CANCEL'],
      createdById: userMap['NV003'],
      estimatedBudget: 920000000,
      openDate: new Date('2025-12-15'),
      closeDate: new Date('2026-01-05'),
      step: 1,
      notes: 'Hủy do thay đổi kế hoạch sửa chữa lớn',
      scopeItems: [
        { name: 'Van an toàn PSV DN80', unitId: unitMap['CAI'], quantity: 6, estimatedAmount: 480000000 },
        { name: 'Van an toàn PSV DN100', unitId: unitMap['CAI'], quantity: 4, estimatedAmount: 440000000 },
      ],
      participants: []
    },
    {
      packageCode: generatePackageCode(16),
      name: 'Cung cấp khớp nối mềm chống rung',
      methodId: biddingMethodMap['COMPETITIVE'],
      statusId: biddingStatusMap['OPEN'],
      createdById: userMap['NV004'],
      estimatedBudget: 195000000,
      openDate: new Date('2026-01-20'),
      closeDate: new Date('2026-02-03'),
      step: 2,
      notes: 'Thay thế khớp nối hệ thống nước làm mát',
      scopeItems: [
        { name: 'Khớp nối mềm DN150', unitId: unitMap['CAI'], quantity: 10, estimatedAmount: 100000000 },
        { name: 'Khớp nối mềm DN200', unitId: unitMap['CAI'], quantity: 6, estimatedAmount: 95000000 },
      ],
      participants: ['NCC-002', 'NCC-003']
    },
    {
      packageCode: generatePackageCode(17),
      name: 'Mua thiết bị hiệu chuẩn cảm biến',
      methodId: biddingMethodMap['LIMITED'],
      statusId: biddingStatusMap['DONE'],
      createdById: userMap['NV006'],
      winnerId: supplierIdMap['NCC-002'],
      estimatedBudget: 380000000,
      openDate: new Date('2025-11-20'),
      closeDate: new Date('2025-12-05'),
      step: 4,
      notes: 'Thiết bị chuẩn cho phòng đo lường',
      scopeItems: [
        { name: 'Calibrator áp suất 0-400bar', unitId: unitMap['CAI'], quantity: 2, estimatedAmount: 200000000 },
        { name: 'Calibrator nhiệt độ -50 đến 650°C', unitId: unitMap['CAI'], quantity: 2, estimatedAmount: 180000000 },
      ],
      participants: ['NCC-001', 'NCC-002']
    },
    {
      packageCode: generatePackageCode(18),
      name: 'Cung cấp biến tần cho quạt làm mát',
      methodId: biddingMethodMap['OPEN'],
      statusId: biddingStatusMap['INVITE'],
      createdById: userMap['NV007'],
      estimatedBudget: 720000000,
      openDate: new Date('2026-01-30'),
      closeDate: new Date('2026-02-15'),
      step: 1,
      notes: 'Nâng cấp hệ thống điều khiển quạt AHU',
      scopeItems: [
        { name: 'Biến tần 30kW', unitId: unitMap['CAI'], quantity: 4, estimatedAmount: 360000000 },
        { name: 'Biến tần 22kW', unitId: unitMap['CAI'], quantity: 6, estimatedAmount: 300000000 },
        { name: 'Phụ kiện lắp đặt', unitId: unitMap['BO'], quantity: 10, estimatedAmount: 60000000 },
      ],
      participants: []
    },
    {
      packageCode: generatePackageCode(19),
      name: 'Mua lọc dầu và phụ tùng hệ thống bôi trơn',
      methodId: biddingMethodMap['COMPETITIVE'],
      statusId: biddingStatusMap['EVAL'],
      createdById: userMap['NV002'],
      estimatedBudget: 210000000,
      openDate: new Date('2026-01-12'),
      closeDate: new Date('2026-01-28'),
      step: 3,
      notes: 'Đang đánh giá giá thầu từ 3 nhà cung cấp',
      scopeItems: [
        { name: 'Lọc dầu chính 25 micron', unitId: unitMap['CAI'], quantity: 50, estimatedAmount: 100000000 },
        { name: 'Lọc dầu bypass 3 micron', unitId: unitMap['CAI'], quantity: 30, estimatedAmount: 75000000 },
        { name: 'Housing lọc và phụ kiện', unitId: unitMap['BO'], quantity: 5, estimatedAmount: 35000000 },
      ],
      participants: ['NCC-003', 'NCC-004', 'NCC-005']
    },
    {
      packageCode: generatePackageCode(20),
      name: 'Cung cấp cáp điện và phụ kiện đấu nối',
      methodId: biddingMethodMap['OPEN'],
      statusId: biddingStatusMap['OPEN'],
      createdById: userMap['NV003'],
      estimatedBudget: 420000000,
      openDate: new Date('2026-01-22'),
      closeDate: new Date('2026-02-08'),
      step: 2,
      notes: 'Cáp điều khiển và cáp nguồn cho dự án mở rộng',
      scopeItems: [
        { name: 'Cáp điều khiển 12x1.5mm2', unitId: unitMap['MET'], quantity: 2000, estimatedAmount: 160000000 },
        { name: 'Cáp nguồn 4x25mm2', unitId: unitMap['MET'], quantity: 500, estimatedAmount: 175000000 },
        { name: 'Đầu cốt và phụ kiện', unitId: unitMap['BO'], quantity: 100, estimatedAmount: 85000000 },
      ],
      participants: ['NCC-001', 'NCC-003']
    },
  ]

  for (const pkgData of biddingPackagesData) {
    const { scopeItems, participants, ...packageFields } = pkgData

    // Check if package exists
    const existingPkg = await prisma.biddingPackage.findUnique({ where: { packageCode: packageFields.packageCode } })
    if (existingPkg) {
      console.log(`  Package ${packageFields.packageCode} already exists, skipping...`)
      continue
    }

    // Create BiddingPackage first
    const createdPackage = await prisma.biddingPackage.create({
      data: {
        packageCode: packageFields.packageCode,
        name: packageFields.name,
        methodId: packageFields.methodId,
        statusId: packageFields.statusId,
        createdById: packageFields.createdById,
        winnerId: packageFields.winnerId || null,
        estimatedBudget: packageFields.estimatedBudget,
        openDate: packageFields.openDate,
        closeDate: packageFields.closeDate,
        step: packageFields.step,
        notes: packageFields.notes,
      }
    })

    // Create scope items
    for (const item of scopeItems) {
      await prisma.biddingScopeItem.create({
        data: {
          biddingPackageId: createdPackage.id,
          name: item.name,
          unitId: item.unitId,
          quantity: item.quantity,
          estimatedAmount: item.estimatedAmount,
        }
      })
    }

    // Create participants
    for (const supplierCode of participants) {
      const supplierId = supplierIdMap[supplierCode]
      if (supplierId) {
        await prisma.biddingParticipant.create({
          data: {
            biddingPackageId: createdPackage.id,
            supplierId: supplierId,
            invitedAt: packageFields.openDate,
            isSubmitted: packageFields.step >= 2,
            submittedAt: packageFields.step >= 2 ? packageFields.closeDate : null,
            technicalScore: packageFields.step >= 3 ? Math.floor(Math.random() * 20) + 80 : null,
            priceScore: packageFields.step >= 3 ? Math.floor(Math.random() * 15) + 85 : null,
          }
        })
      }
    }
  }

  console.log('BiddingPackages seeded! 20 records added.')

  // === INBOUND RECEIPTS (Phiếu nhập kho) ===
  console.log('\n📦 Phase 5: Seeding InboundReceipts...')

  // Get InboundType IDs
  const inboundTypes = await prisma.inboundType.findMany()
  const inboundTypeMap = Object.fromEntries(inboundTypes.map(t => [t.code, t.id]))

  // Get InboundStatus IDs
  const inboundStatuses = await prisma.inboundStatus.findMany()
  const inboundStatusMap = Object.fromEntries(inboundStatuses.map(s => [s.code, s.id]))

  // Get WarehouseLocation IDs
  const locations = await prisma.warehouseLocation.findMany()
  const locationMap = Object.fromEntries(locations.map(l => [l.code, l.id]))

  // Get PurchaseRequest IDs for linking
  const purchaseRequests = await prisma.purchaseRequest.findMany()
  const prMap = Object.fromEntries(purchaseRequests.map(pr => [pr.requestCode, pr.id]))

  // Helper function to generate receipt code
  const generateReceiptCode = (index: number) => `PNK-2026-${String(index).padStart(3, '0')}`

  // Type for inbound receipt items
  interface InboundItemData {
    materialCode: string
    unitCode: string
    locationCode?: string
    orderedQuantity: number
    receivedQuantity: number
    receivingQuantity: number
    serialBatch?: string
    kcs?: boolean
  }

  const inboundReceiptsData: Array<{
    receiptCode: string
    typeId: string
    statusId: string
    supplierId: string
    purchaseRequestId?: string
    createdById: string
    referenceCode: string | null
    inboundDate: Date
    notes: string
    step: number
    items: InboundItemData[]
  }> = [
    {
      receiptCode: generateReceiptCode(1),
      typeId: inboundTypeMap['PO'],
      statusId: inboundStatusMap['COMPLETED'],
      supplierId: supplierIdMap['NCC-001'],
      purchaseRequestId: prMap['PR-2026-001'],
      createdById: userMap['NV003'],
      referenceCode: 'PO-2026-001',
      inboundDate: new Date('2026-01-10'),
      notes: 'Nhập cảm biến áp suất theo PO đã duyệt',
      step: 4,
      items: [
        { materialCode: 'PM-TDH-001', unitCode: 'CAI', locationCode: 'A1-01-01', orderedQuantity: 5, receivedQuantity: 5, receivingQuantity: 0, serialBatch: 'BATCH-2026-001', kcs: true },
        { materialCode: 'PM-TDH-002', unitCode: 'CAI', locationCode: 'A1-01-02', orderedQuantity: 10, receivedQuantity: 10, receivingQuantity: 0, serialBatch: 'BATCH-2026-002', kcs: true },
      ]
    },
    {
      receiptCode: generateReceiptCode(2),
      typeId: inboundTypeMap['PO'],
      statusId: inboundStatusMap['RECEIVING'],
      supplierId: supplierIdMap['NCC-002'],
      purchaseRequestId: prMap['PR-2026-004'],
      createdById: userMap['NV003'],
      referenceCode: 'PO-2026-002',
      inboundDate: new Date('2026-01-15'),
      notes: 'Đang nhập hệ thống DCS mới',
      step: 3,
      items: [
        { materialCode: 'PM-TDH-003', unitCode: 'CAI', orderedQuantity: 3, receivedQuantity: 1, receivingQuantity: 2, serialBatch: 'SN-PLC-001', kcs: true },
      ]
    },
    {
      receiptCode: generateReceiptCode(3),
      typeId: inboundTypeMap['REPAIR'],
      statusId: inboundStatusMap['COMPLETED'],
      supplierId: supplierIdMap['NCC-003'],
      createdById: userMap['NV004'],
      referenceCode: 'SC-2026-001',
      inboundDate: new Date('2026-01-08'),
      notes: 'Nhập lại bơm sau sửa chữa',
      step: 4,
      items: [
        { materialCode: 'PM-MECH-001', unitCode: 'CAI', locationCode: 'C1-FLOOR-01', orderedQuantity: 1, receivedQuantity: 1, receivingQuantity: 0, serialBatch: 'SN-PUMP-R01', kcs: true },
      ]
    },
    {
      receiptCode: generateReceiptCode(4),
      typeId: inboundTypeMap['PO'],
      statusId: inboundStatusMap['KCS'],
      supplierId: supplierIdMap['NCC-004'],
      purchaseRequestId: prMap['PR-2026-005'],
      createdById: userMap['NV003'],
      referenceCode: 'PO-2026-003',
      inboundDate: new Date('2026-01-18'),
      notes: 'Đang KCS hóa chất xử lý nước',
      step: 2,
      items: [
        { materialCode: 'PM-CHEM-002', unitCode: 'KG', orderedQuantity: 500, receivedQuantity: 0, receivingQuantity: 500, kcs: false },
      ]
    },
    {
      receiptCode: generateReceiptCode(5),
      typeId: inboundTypeMap['LOAN'],
      statusId: inboundStatusMap['COMPLETED'],
      supplierId: supplierIdMap['NCC-001'],
      createdById: userMap['NV004'],
      referenceCode: 'LOAN-2026-001',
      inboundDate: new Date('2026-01-05'),
      notes: 'Nhập hàng mượn để thử nghiệm',
      step: 4,
      items: [
        { materialCode: 'PM-MEAS-001', unitCode: 'CAI', locationCode: 'B1-01-01', orderedQuantity: 2, receivedQuantity: 2, receivingQuantity: 0, serialBatch: 'LOAN-FM-001', kcs: true },
      ]
    },
    {
      receiptCode: generateReceiptCode(6),
      typeId: inboundTypeMap['PO'],
      statusId: inboundStatusMap['COMPLETED'],
      supplierId: supplierIdMap['NCC-005'],
      purchaseRequestId: prMap['PR-2026-003'],
      createdById: userMap['NV003'],
      referenceCode: 'PO-2026-004',
      inboundDate: new Date('2026-01-12'),
      notes: 'Nhập vòng bi cho động cơ quạt',
      step: 4,
      items: [
        { materialCode: 'PM-TURB-002', unitCode: 'BO', locationCode: 'A1-02-02', orderedQuantity: 20, receivedQuantity: 20, receivingQuantity: 0, serialBatch: 'BATCH-BRG-001', kcs: true },
      ]
    },
    {
      receiptCode: generateReceiptCode(7),
      typeId: inboundTypeMap['PO'],
      statusId: inboundStatusMap['REQUESTED'],
      supplierId: supplierIdMap['NCC-002'],
      purchaseRequestId: prMap['PR-2026-008'],
      createdById: userMap['NV003'],
      referenceCode: 'PO-2026-005',
      inboundDate: new Date('2026-01-25'),
      notes: 'Chờ nhập van điều khiển',
      step: 1,
      items: [
        { materialCode: 'PM-VALVE-001', unitCode: 'CAI', orderedQuantity: 8, receivedQuantity: 0, receivingQuantity: 0 },
        { materialCode: 'PM-VALVE-002', unitCode: 'CAI', orderedQuantity: 4, receivedQuantity: 0, receivingQuantity: 0 },
      ]
    },
    {
      receiptCode: generateReceiptCode(8),
      typeId: inboundTypeMap['RETURN'],
      statusId: inboundStatusMap['COMPLETED'],
      supplierId: supplierIdMap['NCC-003'],
      createdById: userMap['NV004'],
      referenceCode: 'RET-2026-001',
      inboundDate: new Date('2026-01-20'),
      notes: 'Hoàn trả thiết bị từ công trường',
      step: 4,
      items: [
        { materialCode: 'PM-PPE-001', unitCode: 'DOI', locationCode: 'B1-02-01', orderedQuantity: 15, receivedQuantity: 15, receivingQuantity: 0, kcs: true },
        { materialCode: 'PM-PPE-002', unitCode: 'CAI', locationCode: 'B1-02-01', orderedQuantity: 20, receivedQuantity: 20, receivingQuantity: 0, kcs: true },
      ]
    },
    {
      receiptCode: generateReceiptCode(9),
      typeId: inboundTypeMap['PO'],
      statusId: inboundStatusMap['COMPLETED'],
      supplierId: supplierIdMap['NCC-004'],
      purchaseRequestId: prMap['PR-2026-006'],
      createdById: userMap['NV003'],
      referenceCode: 'PO-2026-006',
      inboundDate: new Date('2026-01-14'),
      notes: 'Nhập thiết bị bảo hộ lao động',
      step: 4,
      items: [
        { materialCode: 'PM-PPE-001', unitCode: 'DOI', locationCode: 'B1-01-02', orderedQuantity: 100, receivedQuantity: 100, receivingQuantity: 0, serialBatch: 'BATCH-PPE-001', kcs: true },
        { materialCode: 'PM-PPE-002', unitCode: 'CAI', locationCode: 'B1-01-02', orderedQuantity: 100, receivedQuantity: 100, receivingQuantity: 0, serialBatch: 'BATCH-PPE-002', kcs: true },
      ]
    },
    {
      receiptCode: generateReceiptCode(10),
      typeId: inboundTypeMap['PO'],
      statusId: inboundStatusMap['RECEIVING'],
      supplierId: supplierIdMap['NCC-001'],
      purchaseRequestId: prMap['PR-2026-011'],
      createdById: userMap['NV003'],
      referenceCode: 'PO-2026-007',
      inboundDate: new Date('2026-01-22'),
      notes: 'Đang nhập cánh tuabin dự phòng',
      step: 3,
      items: [
        { materialCode: 'PM-TURB-001', unitCode: 'CAI', orderedQuantity: 10, receivedQuantity: 6, receivingQuantity: 4, serialBatch: 'SN-BLADE-001', kcs: true },
      ]
    },
    {
      receiptCode: generateReceiptCode(11),
      typeId: inboundTypeMap['PO'],
      statusId: inboundStatusMap['COMPLETED'],
      supplierId: supplierIdMap['NCC-003'],
      purchaseRequestId: prMap['PR-2026-010'],
      createdById: userMap['NV004'],
      referenceCode: 'PO-2026-008',
      inboundDate: new Date('2026-01-16'),
      notes: 'Nhập thiết bị đo phân tích môi trường',
      step: 4,
      items: [
        { materialCode: 'PM-MEAS-002', unitCode: 'CAI', locationCode: 'CHEM-01-01', orderedQuantity: 4, receivedQuantity: 4, receivingQuantity: 0, serialBatch: 'SN-PH-001', kcs: true },
      ]
    },
    {
      receiptCode: generateReceiptCode(12),
      typeId: inboundTypeMap['PO'],
      statusId: inboundStatusMap['KCS'],
      supplierId: supplierIdMap['NCC-002'],
      createdById: userMap['NV003'],
      referenceCode: 'PO-2026-009',
      inboundDate: new Date('2026-01-28'),
      notes: 'Đang KCS cảm biến nhiệt độ cao cấp',
      step: 2,
      items: [
        { materialCode: 'PM-TDH-002', unitCode: 'CAI', orderedQuantity: 12, receivedQuantity: 0, receivingQuantity: 12, kcs: false },
      ]
    },
    {
      receiptCode: generateReceiptCode(13),
      typeId: inboundTypeMap['PO'],
      statusId: inboundStatusMap['COMPLETED'],
      supplierId: supplierIdMap['NCC-005'],
      purchaseRequestId: prMap['PR-2026-012'],
      createdById: userMap['NV003'],
      referenceCode: 'PO-2026-010',
      inboundDate: new Date('2026-01-19'),
      notes: 'Nhập vật tư tiêu hao quý 2',
      step: 4,
      items: [
        { materialCode: 'PM-CONS-001', unitCode: 'CAI', locationCode: 'A1-01-03', orderedQuantity: 1000, receivedQuantity: 1000, receivingQuantity: 0, serialBatch: 'BATCH-CONS-001', kcs: true },
        { materialCode: 'PM-CONS-002', unitCode: 'CAI', locationCode: 'A1-01-03', orderedQuantity: 500, receivedQuantity: 500, receivingQuantity: 0, serialBatch: 'BATCH-CONS-002', kcs: true },
        { materialCode: 'PM-CONS-003', unitCode: 'CAI', locationCode: 'A1-01-03', orderedQuantity: 2000, receivedQuantity: 2000, receivingQuantity: 0, serialBatch: 'BATCH-CONS-003', kcs: true },
      ]
    },
    {
      receiptCode: generateReceiptCode(14),
      typeId: inboundTypeMap['REPAIR'],
      statusId: inboundStatusMap['RECEIVING'],
      supplierId: supplierIdMap['NCC-003'],
      createdById: userMap['NV004'],
      referenceCode: 'SC-2026-002',
      inboundDate: new Date('2026-01-26'),
      notes: 'Đang nhập lại valve sau hiệu chuẩn',
      step: 3,
      items: [
        { materialCode: 'PM-VALVE-001', unitCode: 'CAI', orderedQuantity: 3, receivedQuantity: 2, receivingQuantity: 1, serialBatch: 'SN-VALVE-R01', kcs: true },
      ]
    },
    {
      receiptCode: generateReceiptCode(15),
      typeId: inboundTypeMap['PO'],
      statusId: inboundStatusMap['COMPLETED'],
      supplierId: supplierIdMap['NCC-004'],
      purchaseRequestId: prMap['PR-2026-015'],
      createdById: userMap['NV003'],
      referenceCode: 'PO-2026-011',
      inboundDate: new Date('2026-01-21'),
      notes: 'Nhập dầu bôi trơn tuabin',
      step: 4,
      items: [
        { materialCode: 'PM-CHEM-001', unitCode: 'LIT', locationCode: 'CHEM-01-01', orderedQuantity: 2000, receivedQuantity: 2000, receivingQuantity: 0, serialBatch: 'BATCH-OIL-001', kcs: true },
      ]
    },
    {
      receiptCode: generateReceiptCode(16),
      typeId: inboundTypeMap['LOAN'],
      statusId: inboundStatusMap['REQUESTED'],
      supplierId: supplierIdMap['NCC-001'],
      createdById: userMap['NV004'],
      referenceCode: 'LOAN-2026-002',
      inboundDate: new Date('2026-01-30'),
      notes: 'Chờ nhập thiết bị đo mượn để thử nghiệm',
      step: 1,
      items: [
        { materialCode: 'PM-MEAS-001', unitCode: 'CAI', orderedQuantity: 1, receivedQuantity: 0, receivingQuantity: 0 },
      ]
    },
    {
      receiptCode: generateReceiptCode(17),
      typeId: inboundTypeMap['PO'],
      statusId: inboundStatusMap['COMPLETED'],
      supplierId: supplierIdMap['NCC-001'],
      createdById: userMap['NV003'],
      referenceCode: 'PO-2026-012',
      inboundDate: new Date('2026-01-17'),
      notes: 'Nhập RAM và SSD cho máy chủ SCADA',
      step: 4,
      items: [
        { materialCode: 'PM-SERVER-001', unitCode: 'CAI', locationCode: 'A1-01-01', orderedQuantity: 20, receivedQuantity: 20, receivingQuantity: 0, serialBatch: 'SN-RAM-001', kcs: true },
        { materialCode: 'PM-SERVER-002', unitCode: 'CAI', locationCode: 'A1-01-01', orderedQuantity: 10, receivedQuantity: 10, receivingQuantity: 0, serialBatch: 'SN-SSD-001', kcs: true },
      ]
    },
    {
      receiptCode: generateReceiptCode(18),
      typeId: inboundTypeMap['RETURN'],
      statusId: inboundStatusMap['KCS'],
      supplierId: supplierIdMap['NCC-002'],
      createdById: userMap['NV004'],
      referenceCode: 'RET-2026-002',
      inboundDate: new Date('2026-01-29'),
      notes: 'Đang KCS khớp nối trả về từ công trường',
      step: 2,
      items: [
        { materialCode: 'PM-MECH-002', unitCode: 'CAI', orderedQuantity: 8, receivedQuantity: 0, receivingQuantity: 8, kcs: false },
      ]
    },
    {
      receiptCode: generateReceiptCode(19),
      typeId: inboundTypeMap['PO'],
      statusId: inboundStatusMap['RECEIVING'],
      supplierId: supplierIdMap['NCC-003'],
      purchaseRequestId: prMap['PR-2026-014'],
      createdById: userMap['NV003'],
      referenceCode: 'PO-2026-013',
      inboundDate: new Date('2026-01-27'),
      notes: 'Đang nhập rơ le bảo vệ',
      step: 3,
      items: [
        { materialCode: 'PM-TDH-002', unitCode: 'CAI', orderedQuantity: 4, receivedQuantity: 2, receivingQuantity: 2, serialBatch: 'SN-RELAY-001', kcs: true },
      ]
    },
    {
      receiptCode: generateReceiptCode(20),
      typeId: inboundTypeMap['PO'],
      statusId: inboundStatusMap['DRAFT'],
      supplierId: supplierIdMap['NCC-004'],
      createdById: userMap['NV003'],
      referenceCode: null,
      inboundDate: new Date('2026-02-01'),
      notes: 'Phiếu nháp - chờ xác nhận thông tin',
      step: 1,
      items: [
        { materialCode: 'PM-CHEM-001', unitCode: 'LIT', orderedQuantity: 1000, receivedQuantity: 0, receivingQuantity: 0 },
        { materialCode: 'PM-CHEM-002', unitCode: 'KG', orderedQuantity: 200, receivedQuantity: 0, receivingQuantity: 0 },
      ]
    },
  ]

  for (const receiptData of inboundReceiptsData) {
    const { items, ...receiptFields } = receiptData

    // Check if receipt already exists
    const existingReceipt = await prisma.inboundReceipt.findUnique({ where: { receiptCode: receiptFields.receiptCode } })
    if (existingReceipt) {
      console.log(`  Receipt ${receiptFields.receiptCode} already exists, skipping...`)
      continue
    }

    // Create InboundReceipt
    const createdReceipt = await prisma.inboundReceipt.create({
      data: {
        receiptCode: receiptFields.receiptCode,
        typeId: receiptFields.typeId,
        statusId: receiptFields.statusId,
        supplierId: receiptFields.supplierId,
        purchaseRequestId: receiptFields.purchaseRequestId || null,
        createdById: receiptFields.createdById,
        referenceCode: receiptFields.referenceCode || null,
        inboundDate: receiptFields.inboundDate,
        notes: receiptFields.notes,
        step: receiptFields.step,
      }
    })

    // Create items
    for (const item of items) {
      await prisma.inboundReceiptItem.create({
        data: {
          receiptId: createdReceipt.id,
          materialId: materialMap[item.materialCode],
          unitId: unitMap[item.unitCode],
          locationId: item.locationCode ? locationMap[item.locationCode] : null,
          orderedQuantity: item.orderedQuantity,
          receivedQuantity: item.receivedQuantity,
          receivingQuantity: item.receivingQuantity,
          serialBatch: item.serialBatch || null,
          kcs: item.kcs || false,
        }
      })
    }
  }

  console.log('InboundReceipts seeded! 20 records added.')
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

