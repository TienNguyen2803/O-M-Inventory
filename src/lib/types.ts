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
