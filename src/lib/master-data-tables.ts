// Master Data Table Mapping
// Maps category IDs to Prisma model names for dynamic API handling

import type { PrismaClient } from '@prisma/client'

export interface MasterDataTableConfig {
  id: string
  name: string
  group: string
  // Prisma model name (camelCase)
  modelName: keyof Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>
}

// All 24 master data tables with their configurations
export const MASTER_DATA_TABLES: MasterDataTableConfig[] = [
  // === VẬT TƯ ===
  { id: 'material-status', name: 'Trạng thái Vật tư', group: 'Vật tư', modelName: 'materialStatus' },
  { id: 'material-category', name: 'Danh mục Vật tư', group: 'Vật tư', modelName: 'materialCategory' },
  { id: 'material-unit', name: 'Đơn vị tính', group: 'Vật tư', modelName: 'materialUnit' },
  { id: 'management-type', name: 'Loại quản lý', group: 'Vật tư', modelName: 'managementType' },

  // === KHO ===
  { id: 'warehouse-area', name: 'Khu vực kho', group: 'Kho', modelName: 'warehouseArea' },
  { id: 'warehouse-type', name: 'Loại kệ/vị trí', group: 'Kho', modelName: 'warehouseType' },
  { id: 'warehouse-status', name: 'Trạng thái vị trí kho', group: 'Kho', modelName: 'warehouseStatus' },

  // === NHÀ CUNG CẤP ===
  { id: 'supplier-type', name: 'Loại nhà cung cấp', group: 'Nhà cung cấp', modelName: 'supplierType' },
  { id: 'payment-term', name: 'Điều khoản thanh toán', group: 'Nhà cung cấp', modelName: 'paymentTerm' },
  { id: 'currency', name: 'Loại tiền tệ', group: 'Nhà cung cấp', modelName: 'currency' },

  // === YÊU CẦU VẬT TƯ ===
  { id: 'request-priority', name: 'Độ ưu tiên', group: 'Yêu cầu vật tư', modelName: 'requestPriority' },
  { id: 'request-status', name: 'Trạng thái yêu cầu', group: 'Yêu cầu vật tư', modelName: 'requestStatus' },

  // === MUA SẮM ===
  { id: 'purchase-source', name: 'Nguồn gốc mua sắm', group: 'Mua sắm', modelName: 'purchaseSource' },
  { id: 'purchase-status', name: 'Trạng thái PR', group: 'Mua sắm', modelName: 'purchaseStatus' },

  // === ĐẤU THẦU ===
  { id: 'bidding-method', name: 'Hình thức đấu thầu', group: 'Đấu thầu', modelName: 'biddingMethod' },
  { id: 'bidding-status', name: 'Trạng thái gói thầu', group: 'Đấu thầu', modelName: 'biddingStatus' },

  // === NHẬP KHO ===
  { id: 'inbound-type', name: 'Loại nhập kho', group: 'Nhập kho', modelName: 'inboundType' },
  { id: 'inbound-status', name: 'Trạng thái nhập kho', group: 'Nhập kho', modelName: 'inboundStatus' },

  // === XUẤT KHO ===
  { id: 'outbound-purpose', name: 'Mục đích xuất kho', group: 'Xuất kho', modelName: 'outboundPurpose' },
  { id: 'outbound-status', name: 'Trạng thái xuất kho', group: 'Xuất kho', modelName: 'outboundStatus' },

  // === KIỂM KÊ ===
  { id: 'stocktake-status', name: 'Trạng thái kiểm kê', group: 'Kiểm kê', modelName: 'stocktakeStatus' },
  { id: 'stocktake-area', name: 'Khu vực kiểm kê', group: 'Kiểm kê', modelName: 'stocktakeArea' },

  // === NGƯỜI DÙNG & NHẬT KÝ ===
  { id: 'user-status', name: 'Trạng thái người dùng', group: 'Người dùng', modelName: 'userStatus' },
  { id: 'activity-action', name: 'Loại hành động', group: 'Nhật ký', modelName: 'activityAction' },

  // === TỔ CHỨC ===
  { id: 'department', name: 'Phòng ban', group: 'Tổ chức', modelName: 'department' },
]

// Helper: Get table config by ID
export function getMasterDataTable(tableId: string): MasterDataTableConfig | undefined {
  return MASTER_DATA_TABLES.find(t => t.id === tableId)
}

// Helper: Get all tables grouped by group name
export function getMasterDataGroups(): { group: string; tables: MasterDataTableConfig[] }[] {
  const groups = new Map<string, MasterDataTableConfig[]>()

  for (const table of MASTER_DATA_TABLES) {
    const existing = groups.get(table.group) || []
    existing.push(table)
    groups.set(table.group, existing)
  }

  return Array.from(groups.entries()).map(([group, tables]) => ({
    group,
    tables,
  }))
}

// Helper: Get all valid table IDs
export function getValidTableIds(): string[] {
  return MASTER_DATA_TABLES.map(t => t.id)
}
