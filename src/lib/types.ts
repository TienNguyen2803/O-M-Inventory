export interface TechnicalSpec {
  property: string;
  value: string;
}

export interface Material {
  id: string;
  name: string; // Tên Vật tư (Tiếng Việt)
  nameEn?: string; // Tên Vật tư (Tiếng Anh)
  code: string; // Mã nội bộ (PhuMyTPC)
  evnCode?: string; // Mã Vật tư (EVN eCat)
  partNo: string; // Part Number
  managementType: "Batch" | "Serial"; // Quản lý theo Serial/IMEI (Checkbox)
  category: string;
  unit: string; // Đơn vị tính
  status: "Mới" | "Cũ nhưng dùng được" | "Hư hỏng" | "Hư hỏng không thể sửa chữa" | "Thanh lý";
  description?: string; // Ghi chú
  stock: number;
  manufacturer?: string; // Nhà sản xuất
  origin?: string; // Xuất xứ
  minStock?: number; // Tồn kho Tối thiểu
  maxStock?: number; // Tồn kho Tối đa
  technicalSpecs?: TechnicalSpec[];
}

export interface InventoryLog {
  id: string;
  materialId: string;
  materialName: string;
  quantity: number;
  type: "inbound" | "outbound";
  date: string; // ISO 8601 string format
  actor: string; // Could be supplier or department
}

export interface WarehouseItem {
  materialId: string;
  materialCode: string;
  materialName: string;
  quantity: number;
  unit: string;
  batchSerial: string;
}

export interface WarehouseLocation {
  id: string;
  code: string; // Mã vị trí
  name: string; // Tên vị trí
  area: string; // Khu vực
  type: string; // Loại
  status: "Active" | "Inactive"; // Trạng thái
  barcode?: string;
  maxWeight?: number;
  dimensions?: string;
  items?: WarehouseItem[];
}

export interface ContactPerson {
  id: string;
  name: string;
  position: string;
  email: string;
  phone: string;
}

export interface Supplier {
  id: string;
  code: string;
  taxCode: string;
  name: string;
  address: string;
  country: string;
  type: string;
  paymentTerm: string;
  currency: string;
  status: "Active" | "Inactive";
  contacts: ContactPerson[];
}

export interface MaterialRequestItem {
  materialId: string;
  materialCode: string;
  materialName: string;
  partNumber: string;
  unit: string;
  requestedQuantity: number;
  stock: number;
  notes?: string;
}

export interface MaterialRequest {
  id: string; // Mã Phiếu
  requesterName: string;
  requesterDept: string; // Đơn vị sử dụng
  reason: string; // Lý do / Mục đích
  requestDate: string; // Ngày yêu cầu (ISO 8601 string)
  workOrder?: string; // Mã WO/Công trình
  priority: "Khẩn cấp" | "Bình thường";
  status: "Đã duyệt" | "Chờ duyệt";
  approver?: string; // Người duyệt kỹ thuật
  items: MaterialRequestItem[];
}

export interface PurchaseRequestItem {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  estimatedPrice: number;
  suggestedSupplier: string;
}

export interface PurchaseRequest {
  id: string; // MÃ PR
  requesterName: string; 
  requesterDept: string; 
  description: string; // NỘI DUNG / Diễn giải mua sắm
  source: 'Trong nước' | 'Nhập khẩu'; // NGUỒN GỐC
  fundingSource: string; // Nguồn vốn
  totalAmount: number; // TỔNG TIỀN
  status: 'Approved' | 'Pending' | 'Rejected'; // TRẠNG THÁI
  items: PurchaseRequestItem[];
}

export interface BiddingItem {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  amount: number;
}

export interface BiddingResult {
  winner: string;
  winningPrice: number;
  technicalScore: string;
  negotiationStatus: string;
}

export interface BiddingPackage {
  id: string; // Mã gói
  name: string; // Tên gói thầu
  purchaseRequestId: string; // Căn cứ PR
  estimatedPrice: number; // Giá dự toán
  method: 'Đấu thầu rộng rãi' | 'Chỉ định thầu'; // Hình thức
  status: 'Đang mời thầu' | 'Đang chấm thầu' | 'Đã có kết quả' | 'Đã hủy'; // Trạng thái
  openingDate?: string; // Ngày mở thầu
  closingDate?: string; // Ngày đóng thầu
  items?: BiddingItem[]; // Phạm vi cung cấp
  result?: BiddingResult; // Kết quả lựa chọn
}

export interface OutboundVoucherItem {
  id: string;
  materialId: string;
  materialCode: string;
  materialName: string;
  unit: string;
  requestedQuantity: number;
  issuedQuantity: number;
  pickLocationSuggestion: string;
  actualSerial: string;
}

export interface OutboundVoucher {
  id: string;
  purpose: 'Cấp O&M' | 'Khẩn cấp' | 'Cho mượn' | 'Đi Sửa chữa';
  materialRequestId: string;
  department: string;
  receiverName: string;
  reason: string;
  status: 'Đã xuất' | 'Chờ xuất' | 'Đã hủy' | 'Đang soạn hàng';
  step: number;
  issueDate: string;
  items?: OutboundVoucherItem[];
}


export interface InboundReceiptItem {
  id: string;
  materialCode: string;
  materialName: string;
  orderedQuantity: number;
  receivedQuantity: number;
  receivingQuantity: number;
  serialBatch: string;
  location: string;
  kcs: boolean;
}

export interface InboundReceiptDocument {
  id: string;
  type: string;
  fileName: string;
}

export interface InboundReceipt {
  id: string; // SỐ PHIẾU
  inboundType: 'Theo PO' | 'Sau Sửa chữa' | 'Hàng Mượn' | 'Hoàn trả'; // LOẠI NHẬP
  reference: string; // THAM CHIẾU
  inboundDate: string; // NGÀY NHẬP
  partner: string; // ĐỐI TÁC
  status: 'Hoàn thành' | 'Đang nhập' | 'KCS & Hồ sơ' | 'Yêu cầu nhập'; // TRẠNG THÁI
  step: number;
  items?: InboundReceiptItem[];
  documents?: InboundReceiptDocument[];
}


export interface StockTakeResult {
    id: string;
    materialId: string;
    materialCode: string;
    materialName: string;
    location: string;
    bookQuantity: number;
    actualQuantity: number;
    notes?: string;
}

export interface StockTake {
  id: string; // MÃ SỐ
  name: string; // TÊN/THAM CHIẾU
  date: string; // THÔNG TIN (Date)
  status: 'Đã hoàn thành' | 'Đang tiến hành' | 'Đã hủy'; // TRẠNG THÁI
  area: 'Toàn bộ' | 'Khu A' | 'Khu B' | 'Kho Lạnh';
  leader: string;
  results?: StockTakeResult[];
}

export interface User {
  id: string;
  employeeCode: string; // MÃ NV
  name: string; // HỌ TÊN
  department: string; // PHÒNG BAN
  role: string; // VAI TRÒ
  status: 'Active' | 'Inactive'; // TRẠNG THÁI
}

export interface RolePermission {
  feature: string;
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  approve: boolean;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  userCount: number;
  permissions: {
    [group: string]: RolePermission[];
  };
}

export interface ActivityLog {
  id: string;
  timestamp: string; // ISO 8601
  user: {
    name: string;
    avatarUrl?: string;
  };
  action: 'Tạo' | 'Cập nhật' | 'Xóa' | 'Đăng nhập' | 'Duyệt' | 'Xuất file';
  target: {
    type: string; // e.g., "Yêu cầu Vật tư", "Phiếu nhập kho"
    id: string; // e.g., "YCVT-2025-001", "PNK-2025-003"
  };
  details: string;
}
