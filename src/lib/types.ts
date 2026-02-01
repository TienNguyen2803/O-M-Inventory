export interface TechnicalSpec {
  property: string;
  value: string;
}

export interface MasterDataItem {
  id: string;
  code: string;
  name: string;
  color?: string | null;
}

export interface Material {
  id: string;
  name: string; // Tên Vật tư (Tiếng Việt)
  nameEn?: string; // Tên Vật tư (Tiếng Anh)
  code: string; // Mã nội bộ (PhuMyTPC)
  evnCode?: string; // Mã Vật tư (EVN eCat)
  partNo: string; // Part Number / Mã hàng (PN)
  serialNumber?: string; // Số serial (SN)
  
  // FK IDs to Master Data
  managementTypeId?: string;
  categoryId?: string;
  unitId?: string;
  statusId?: string;
  countryId?: string;
  
  // Nested relations (populated from API)
  managementType?: MasterDataItem | string;
  materialCategory?: MasterDataItem | string;
  materialUnit?: MasterDataItem | string;
  materialStatus?: MasterDataItem | string;
  country?: MasterDataItem | string;

  description?: string; // Ghi chú
  stock: number;
  manufacturer?: string; // Nhà sản xuất / Hãng
  origin?: string; // Xuất xứ (Legacy field)
  minStock?: number; // Tồn kho Tối thiểu
  maxStock?: number; // Tồn kho Tối đa

  // Legacy/Mock fields compatibility
  category?: string;
  unit?: string;
  status?: string;
  technicalSpecs?: TechnicalSpec[];
  
  // for goods history & lifecycle
  location?: string;
  stockAge?: string; // Tuổi tồn
  supplierWarranty?: string; // Bảo hành của NCC
  serviceWarranty?: string; // Bảo hành dịch vụ của NCC
  chassisPn?: string;
  chassisSn?: string;
  originAsPerCustomer?: string;
  originOnDocs?: string;
  warrantyCount?: number; // Số lần bảo hành/sửa chữa
  lifespan?: string; // Tuổi thọ tài sản
  createdAt?: string;
  updatedAt?: string;
}

export interface GoodsHistorySubEvent {
  step: number;
  title: string;
  actor: string;
  timestamp: string;
  refId?: string;
}

export interface GoodsHistoryEvent {
  id: string;
  type: 'inbound-po' | 'outbound-customer' | 'inbound-rma' | 'outbound-rma' | 'outbound-warranty-return';
  title: string;
  timestamp: string;
  subEvents: GoodsHistorySubEvent[];
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
  id?: string;
  materialId: string;
  materialCode: string;
  materialName: string;
  quantity: number;
  unitId: string;
  unit?: MasterDataItem;
  batchSerial?: string;
}

export interface WarehouseLocation {
  id: string;
  code: string; // Mã vị trí
  name: string; // Tên vị trí
  areaId: string;
  typeId: string;
  statusId: string;
  area: MasterDataItem; // Nested relation
  type: MasterDataItem; // Nested relation
  status: MasterDataItem; // Nested relation
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

  // FK IDs
  countryId: string;
  typeId: string;
  paymentTermId: string;
  currencyId: string;

  // Nested relations
  country: MasterDataItem;
  supplierType: MasterDataItem;
  paymentTerm: MasterDataItem;
  currency: MasterDataItem;

  status: "Active" | "Inactive";
  contacts: ContactPerson[];
}

export interface MaterialRequestItem {
  id?: string;
  materialId: string;
  unitId: string;
  // Nested relations (populated from API)
  material?: {
    id: string;
    code: string;
    name: string;
    partNo: string;
    stock: number;
  };
  unit?: MasterDataItem;
  // Legacy fields for backward compatibility
  materialCode?: string;
  materialName?: string;
  partNumber?: string;
  requestedQuantity: number;
  stock: number;
  notes?: string;
}

export interface MaterialRequest {
  id: string; // Mã Phiếu (requestCode)

  // FK IDs
  requesterId?: string;
  departmentId?: string;
  priorityId?: string;
  statusId?: string;
  approverId?: string;

  // Nested relations (populated from API)
  requester?: { id: string; name: string; employeeCode?: string };
  department?: MasterDataItem;
  priority?: MasterDataItem;
  status?: MasterDataItem;
  approver?: { id: string; name: string; employeeCode?: string } | null;

  // Legacy fields for backward compatibility
  requesterName?: string;
  requesterDept?: string; // Đơn vị sử dụng

  reason: string; // Lý do / Mục đích
  requestDate: string; // Ngày yêu cầu (ISO 8601 string)
  workOrder?: string; // Mã WO/Công trình
  items: MaterialRequestItem[];
  step: number;
}

export interface PurchaseRequestItem {
  id: string;
  requestId?: string;
  materialId?: string;
  name: string;
  unitId: string;
  quantity: number;
  estimatedPrice: number;
  suggestedSupplierId?: string;
  // Nested relations (populated from API)
  material?: { id: string; code: string; name: string };
  unit?: MasterDataItem;
  suggestedSupplier?: { id: string; name: string };
  // Legacy field for backward compatibility
  suggestedSupplierName?: string;
}

export interface PurchaseRequest {
  id: string; // MÃ PR (requestCode)
  requestCode?: string;

  // FK IDs
  requesterId?: string;
  departmentId?: string;
  statusId?: string;
  sourceId?: string;
  fundingSourceId?: string;

  // Nested relations (populated from API)
  requester?: { id: string; name: string; employeeCode?: string };
  department?: MasterDataItem;
  status?: MasterDataItem & { code?: string };
  source?: MasterDataItem;
  fundingSource?: MasterDataItem;

  // Legacy fields for backward compatibility
  requesterName?: string;
  requesterDept?: string;
  description: string; // NỘI DUNG / Diễn giải mua sắm
  totalAmount: number; // TỔNG TIỀN
  items: PurchaseRequestItem[];
  step?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface BiddingScopeItem {
  id: string;
  materialId?: string;
  name: string;
  unitId: string;
  quantity: number;
  estimatedAmount: number;
  // Nested relations
  material?: { id: string; code: string; name: string };
  unit?: MasterDataItem;
}

export interface BidQuotation {
  id: string;
  scopeItemId: string;
  scopeItemName?: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  notes?: string;
}

export interface BiddingParticipant {
  id: string;
  supplierId?: string;
  supplier?: { id: string; code: string; name: string };
  invitedAt?: string;
  submittedAt?: string;
  isSubmitted: boolean;
  technicalScore?: number;
  priceScore?: number;
  totalScore?: number;
  rank?: number;
  quotations?: BidQuotation[];
}

export interface BiddingPackage {
  id: string; // packageCode (TB-2026-01)
  packageCode?: string;
  name: string; // Tên gói thầu

  // FK IDs
  methodId?: string;
  statusId?: string;
  createdById?: string;
  winnerId?: string;

  // Nested relations
  method?: MasterDataItem;
  status?: MasterDataItem;
  createdBy?: { id: string; name: string; employeeCode?: string };
  winner?: { id: string; code: string; name: string };

  estimatedBudget: number; // Giá dự toán
  openDate?: string; // Ngày mở thầu
  closeDate?: string; // Ngày đóng thầu
  step: number;
  notes?: string;

  // Relations
  purchaseRequests?: Array<{ id: string; requestCode: string; description: string; totalAmount: number }>;
  participants?: BiddingParticipant[];
  scopeItems?: BiddingScopeItem[];

  createdAt?: string;
  updatedAt?: string;

  // Legacy fields for backward compatibility
  purchaseRequestId?: string;
  estimatedPrice?: number;
  openingDate?: string;
  closingDate?: string;
  items?: BiddingScopeItem[];
  result?: {
    winner: string;
    winningPrice: number;
    technicalScore: string;
    negotiationStatus: string;
  };
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
  id: string; // UUID
  receiptCode: string; // SỐ PHIẾU (Display ID)
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
  email: string;
  phone?: string;
  departmentId?: string;
  statusId?: string;
  createdAt?: string;
  updatedAt?: string;
  // Nested relations (populated from API)
  department?: {
    id: string;
    code: string;
    name: string;
    color?: string;
  } | string;
  userStatus?: {
    id: string;
    code: string;
    name: string;
    color?: string;
  } | string;
  userRoles?: Array<{
    id: string;
    role: {
      id: string;
      name: string;
    };
  }>;
  // Legacy
  role?: string;
  status?: string;
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
