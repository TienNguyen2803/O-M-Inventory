// Master Data Types and Definitions

export interface MasterDataItem {
  id: string;
  name: string;
  code?: string;
  color?: string;
  isActive: boolean;
}

export interface MasterDataCategory {
  id: string;
  name: string;
  group: string;
  description?: string;
  items: MasterDataItem[];
}

// Preset colors for badges
export const BADGE_COLORS = [
  { name: "Xanh lá", value: "bg-green-100 text-green-800" },
  { name: "Xanh dương", value: "bg-sky-100 text-sky-800" },
  { name: "Vàng", value: "bg-yellow-100 text-yellow-800" },
  { name: "Đỏ", value: "bg-red-100 text-red-800" },
  { name: "Xám", value: "bg-gray-200 text-gray-600" },
  { name: "Tím", value: "bg-purple-100 text-purple-800" },
  { name: "Cam", value: "bg-orange-100 text-orange-800" },
  { name: "Hồng", value: "bg-pink-100 text-pink-800" },
  { name: "Ngọc lam", value: "bg-emerald-100 text-emerald-800" },
];

// Master Data Categories Definition
export const MASTER_DATA_CATEGORIES: MasterDataCategory[] = [
  // === VẬT TƯ ===
  {
    id: "material-status",
    name: "Trạng thái Vật tư",
    group: "Vật tư",
    items: [
      { id: "ms-1", name: "Mới", code: "NEW", color: "bg-green-100 text-green-800", isActive: true },
      { id: "ms-2", name: "Cũ nhưng dùng được", code: "USED", color: "bg-sky-100 text-sky-800", isActive: true },
      { id: "ms-3", name: "Hư hỏng", code: "DMG", color: "bg-yellow-100 text-yellow-800", isActive: true },
      { id: "ms-4", name: "Hư hỏng không thể sửa chữa", code: "UNREP", color: "bg-red-100 text-red-800", isActive: true },
      { id: "ms-5", name: "Thanh lý", code: "DISP", color: "bg-gray-200 text-gray-600", isActive: true },
    ],
  },
  {
    id: "material-category",
    name: "Danh mục Vật tư",
    group: "Vật tư",
    items: [
      { id: "mc-1", name: "Phụ tùng TĐH", code: "TDH", isActive: true },
      { id: "mc-2", name: "Thiết bị đo lường", code: "MEAS", isActive: true },
      { id: "mc-3", name: "Phụ tùng tuabin", code: "TURB", isActive: true },
      { id: "mc-4", name: "Phụ tùng van", code: "VALVE", isActive: true },
      { id: "mc-5", name: "Vật tư tiêu hao", code: "CONS", isActive: true },
      { id: "mc-6", name: "Hóa chất/Dầu mỡ", code: "CHEM", isActive: true },
      { id: "mc-7", name: "Phụ tùng cơ khí", code: "MECH", isActive: true },
      { id: "mc-8", name: "BHLĐ", code: "PPE", isActive: true },
      { id: "mc-9", name: "Phụ tùng máy chủ", code: "SERVER", isActive: true },
    ],
  },
  {
    id: "material-unit",
    name: "Đơn vị tính",
    group: "Vật tư",
    items: [
      { id: "mu-1", name: "Cái", code: "CAI", isActive: true },
      { id: "mu-2", name: "Bộ", code: "BO", isActive: true },
      { id: "mu-3", name: "Lít", code: "LIT", isActive: true },
      { id: "mu-4", name: "Kg", code: "KG", isActive: true },
      { id: "mu-5", name: "Mét", code: "MET", isActive: true },
      { id: "mu-6", name: "Đôi", code: "DOI", isActive: true },
    ],
  },
  {
    id: "management-type",
    name: "Loại quản lý",
    group: "Vật tư",
    items: [
      { id: "mt-1", name: "Batch", code: "BATCH", color: "bg-sky-100 text-sky-800", isActive: true },
      { id: "mt-2", name: "Serial", code: "SERIAL", color: "bg-emerald-100 text-emerald-800", isActive: true },
    ],
  },

  // === KHO ===
  {
    id: "warehouse-area",
    name: "Khu vực kho",
    group: "Kho",
    items: [
      { id: "wa-1", name: "Khu A", code: "A", isActive: true },
      { id: "wa-2", name: "Khu B", code: "B", isActive: true },
      { id: "wa-3", name: "Khu C", code: "C", isActive: true },
      { id: "wa-4", name: "Kho Lạnh", code: "COLD", isActive: true },
      { id: "wa-5", name: "Kho Hóa chất", code: "CHEM", isActive: true },
    ],
  },
  {
    id: "warehouse-type",
    name: "Loại kệ/vị trí",
    group: "Kho",
    items: [
      { id: "wt-1", name: "Kệ Pallet", code: "PALLET", isActive: true },
      { id: "wt-2", name: "Kệ Trung Tải", code: "MEDIUM", isActive: true },
      { id: "wt-3", name: "Sàn", code: "FLOOR", isActive: true },
    ],
  },
  {
    id: "warehouse-status",
    name: "Trạng thái vị trí kho",
    group: "Kho",
    items: [
      { id: "ws-1", name: "Active", code: "ACT", color: "bg-green-100 text-green-800", isActive: true },
      { id: "ws-2", name: "Inactive", code: "INACT", color: "bg-red-100 text-red-800", isActive: true },
    ],
  },

  // === NHÀ CUNG CẤP ===
  {
    id: "supplier-type",
    name: "Loại nhà cung cấp",
    group: "Nhà cung cấp",
    items: [
      { id: "st-1", name: "OEM", code: "OEM", isActive: true },
      { id: "st-2", name: "Manufacturer", code: "MFG", isActive: true },
      { id: "st-3", name: "Distributor", code: "DIST", isActive: true },
    ],
  },
  {
    id: "payment-term",
    name: "Điều khoản thanh toán",
    group: "Nhà cung cấp",
    items: [
      { id: "pt-1", name: "Net 30", code: "NET30", isActive: true },
      { id: "pt-2", name: "Net 45", code: "NET45", isActive: true },
      { id: "pt-3", name: "Net 60", code: "NET60", isActive: true },
      { id: "pt-4", name: "COD", code: "COD", isActive: true },
    ],
  },
  {
    id: "currency",
    name: "Loại tiền tệ",
    group: "Nhà cung cấp",
    items: [
      { id: "cur-1", name: "VND", code: "VND", isActive: true },
      { id: "cur-2", name: "USD", code: "USD", isActive: true },
      { id: "cur-3", name: "EUR", code: "EUR", isActive: true },
      { id: "cur-4", name: "JPY", code: "JPY", isActive: true },
      { id: "cur-5", name: "CHF", code: "CHF", isActive: true },
    ],
  },

  // === YÊU CẦU VẬT TƯ ===
  {
    id: "request-priority",
    name: "Độ ưu tiên",
    group: "Yêu cầu vật tư",
    items: [
      { id: "rp-1", name: "Khẩn cấp", code: "URG", color: "bg-red-100 text-red-800", isActive: true },
      { id: "rp-2", name: "Bình thường", code: "NOR", color: "bg-sky-100 text-sky-800", isActive: true },
    ],
  },
  {
    id: "request-status",
    name: "Trạng thái yêu cầu",
    group: "Yêu cầu vật tư",
    items: [
      { id: "rs-1", name: "Chờ duyệt", code: "PEND", color: "bg-yellow-100 text-yellow-800", isActive: true },
      { id: "rs-2", name: "Đã duyệt", code: "APPR", color: "bg-green-100 text-green-800", isActive: true },
      { id: "rs-3", name: "Hoàn thành", code: "DONE", color: "bg-sky-100 text-sky-800", isActive: true },
    ],
  },

  // === MUA SẮM ===
  {
    id: "purchase-source",
    name: "Nguồn gốc mua sắm",
    group: "Mua sắm",
    items: [
      { id: "ps-1", name: "Trong nước", code: "DOM", isActive: true },
      { id: "ps-2", name: "Nhập khẩu", code: "IMP", isActive: true },
    ],
  },
  {
    id: "purchase-status",
    name: "Trạng thái PR",
    group: "Mua sắm",
    items: [
      { id: "prs-1", name: "Pending", code: "PEND", color: "bg-yellow-100 text-yellow-800", isActive: true },
      { id: "prs-2", name: "Approved", code: "APPR", color: "bg-green-100 text-green-800", isActive: true },
      { id: "prs-3", name: "Rejected", code: "REJ", color: "bg-red-100 text-red-800", isActive: true },
      { id: "prs-4", name: "Completed", code: "DONE", color: "bg-sky-100 text-sky-800", isActive: true },
    ],
  },

  // === ĐẤU THẦU ===
  {
    id: "bidding-method",
    name: "Hình thức đấu thầu",
    group: "Đấu thầu",
    items: [
      { id: "bm-1", name: "Đấu thầu rộng rãi", code: "OPEN", isActive: true },
      { id: "bm-2", name: "Chỉ định thầu", code: "DIRECT", isActive: true },
    ],
  },
  {
    id: "bidding-status",
    name: "Trạng thái gói thầu",
    group: "Đấu thầu",
    items: [
      { id: "bs-1", name: "Đang mời thầu", code: "INVITE", color: "bg-yellow-100 text-yellow-800", isActive: true },
      { id: "bs-2", name: "Đã mở thầu", code: "OPENED", color: "bg-sky-100 text-sky-800", isActive: true },
      { id: "bs-3", name: "Đang chấm thầu", code: "EVAL", color: "bg-purple-100 text-purple-800", isActive: true },
      { id: "bs-4", name: "Hoàn thành", code: "DONE", color: "bg-green-100 text-green-800", isActive: true },
      { id: "bs-5", name: "Đã hủy", code: "CANCEL", color: "bg-red-100 text-red-800", isActive: true },
    ],
  },

  // === NHẬP KHO ===
  {
    id: "inbound-type",
    name: "Loại nhập kho",
    group: "Nhập kho",
    items: [
      { id: "it-1", name: "Theo PO", code: "PO", isActive: true },
      { id: "it-2", name: "Sau Sửa chữa", code: "REPAIR", isActive: true },
      { id: "it-3", name: "Hàng Mượn", code: "LOAN", isActive: true },
      { id: "it-4", name: "Hoàn trả", code: "RETURN", isActive: true },
    ],
  },
  {
    id: "inbound-status",
    name: "Trạng thái nhập kho",
    group: "Nhập kho",
    items: [
      { id: "is-1", name: "Yêu cầu nhập", code: "REQ", color: "bg-yellow-100 text-yellow-800", isActive: true },
      { id: "is-2", name: "KCS & Hồ sơ", code: "KCS", color: "bg-purple-100 text-purple-800", isActive: true },
      { id: "is-3", name: "Đang nhập", code: "PROC", color: "bg-sky-100 text-sky-800", isActive: true },
      { id: "is-4", name: "Hoàn thành", code: "DONE", color: "bg-green-100 text-green-800", isActive: true },
    ],
  },

  // === XUẤT KHO ===
  {
    id: "outbound-purpose",
    name: "Mục đích xuất kho",
    group: "Xuất kho",
    items: [
      { id: "op-1", name: "Cấp O&M", code: "OM", isActive: true },
      { id: "op-2", name: "Khẩn cấp", code: "URG", isActive: true },
      { id: "op-3", name: "Cho mượn", code: "LOAN", isActive: true },
      { id: "op-4", name: "Đi Sửa chữa", code: "REPAIR", isActive: true },
    ],
  },
  {
    id: "outbound-status",
    name: "Trạng thái xuất kho",
    group: "Xuất kho",
    items: [
      { id: "os-1", name: "Chờ xuất", code: "WAIT", color: "bg-yellow-100 text-yellow-800", isActive: true },
      { id: "os-2", name: "Đang soạn hàng", code: "PICK", color: "bg-purple-100 text-purple-800", isActive: true },
      { id: "os-3", name: "Đã xuất", code: "DONE", color: "bg-green-100 text-green-800", isActive: true },
      { id: "os-4", name: "Đã hủy", code: "CANCEL", color: "bg-red-100 text-red-800", isActive: true },
    ],
  },

  // === KIỂM KÊ ===
  {
    id: "stocktake-status",
    name: "Trạng thái kiểm kê",
    group: "Kiểm kê",
    items: [
      { id: "sts-1", name: "Đang tiến hành", code: "PROG", color: "bg-yellow-100 text-yellow-800", isActive: true },
      { id: "sts-2", name: "Đã hoàn thành", code: "DONE", color: "bg-green-100 text-green-800", isActive: true },
      { id: "sts-3", name: "Đã hủy", code: "CANCEL", color: "bg-red-100 text-red-800", isActive: true },
    ],
  },
  {
    id: "stocktake-area",
    name: "Khu vực kiểm kê",
    group: "Kiểm kê",
    items: [
      { id: "sta-1", name: "Toàn bộ", code: "ALL", isActive: true },
      { id: "sta-2", name: "Khu A", code: "A", isActive: true },
      { id: "sta-3", name: "Khu B", code: "B", isActive: true },
      { id: "sta-4", name: "Kho Lạnh", code: "COLD", isActive: true },
    ],
  },

  // === NGƯỜI DÙNG ===
  {
    id: "user-status",
    name: "Trạng thái người dùng",
    group: "Người dùng",
    items: [
      { id: "us-1", name: "Active", code: "ACT", color: "bg-green-100 text-green-800", isActive: true },
      { id: "us-2", name: "Inactive", code: "INACT", color: "bg-red-100 text-red-800", isActive: true },
    ],
  },

  // === NHẬT KÝ ===
  {
    id: "activity-action",
    name: "Loại hành động",
    group: "Nhật ký",
    items: [
      { id: "aa-1", name: "Tạo", code: "CREATE", color: "bg-green-100 text-green-800", isActive: true },
      { id: "aa-2", name: "Cập nhật", code: "UPDATE", color: "bg-sky-100 text-sky-800", isActive: true },
      { id: "aa-3", name: "Xóa", code: "DELETE", color: "bg-red-100 text-red-800", isActive: true },
      { id: "aa-4", name: "Đăng nhập", code: "LOGIN", color: "bg-purple-100 text-purple-800", isActive: true },
      { id: "aa-5", name: "Duyệt", code: "APPROVE", color: "bg-emerald-100 text-emerald-800", isActive: true },
      { id: "aa-6", name: "Xuất file", code: "EXPORT", color: "bg-orange-100 text-orange-800", isActive: true },
    ],
  },
];

// Helper function to get categories grouped by group name
export function getMasterDataGroups(): { group: string; categories: MasterDataCategory[] }[] {
  const groups = new Map<string, MasterDataCategory[]>();
  
  for (const category of MASTER_DATA_CATEGORIES) {
    const existing = groups.get(category.group) || [];
    existing.push(category);
    groups.set(category.group, existing);
  }
  
  return Array.from(groups.entries()).map(([group, categories]) => ({
    group,
    categories,
  }));
}

// Helper function to get a category by ID
export function getMasterDataCategory(categoryId: string): MasterDataCategory | undefined {
  return MASTER_DATA_CATEGORIES.find(c => c.id === categoryId);
}

// Helper function to get items from a category
export function getMasterDataItems(categoryId: string): MasterDataItem[] {
  const category = getMasterDataCategory(categoryId);
  return category?.items || [];
}
