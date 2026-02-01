"use server";

import type { Material, GoodsHistoryEvent } from "@/lib/types";

// Mock data for goods history - kept server-side only
const materials: Material[] = [
  {
    id: "mat-026",
    name: "Power supply for Sunfire T2000",
    nameEn: "Power supply for Sunfire T2000",
    code: "HW-PSU-001",
    evnCode: "CHUA_CAP",
    partNo: "#300-1757",
    serialNumber: "39X00139M41734000013",
    managementType: "Serial",
    category: "Phụ tùng máy chủ",
    unit: "Cái",
    status: "Mới",
    description: "Nguồn cho máy chủ Sunfire T2000",
    stock: 1,
    manufacturer: "Gigabyte",
    origin: "Mexico",
    minStock: 1,
    maxStock: 5,
    location: "K19 - Kho phòng Lab - Network - HN (K19-OT-LAB)",
    stockAge: "4 Ngày",
    supplierWarranty: "01/01/2024 - 01/01/2026",
    serviceWarranty: "05/01/2026 - 05/01/2028",
    chassisPn: "SUNFIRE-T2000_NNH4_RO",
    chassisSn: "SF093K25MXL1099",
    originAsPerCustomer: "G7 / USA",
    originOnDocs: "Mexico",
    warrantyCount: 1,
    lifespan: "0.5 năm"
  }
];

const goodsHistoryData: GoodsHistoryEvent[] = [
  {
    id: "evt-1",
    type: 'outbound-warranty-return',
    title: "Xuất trả hàng bảo hành cho Khách (Viettel)",
    timestamp: "2024-08-25T14:30:00Z",
    subEvents: [
      { step: 1, title: "Tạo Đề nghị Xuất thay thế", actor: "Nguyễn Văn An", timestamp: "2024-08-25T08:00:00Z" },
      { step: 2, title: "Duyệt Đề nghị xuất", actor: "Trần Thị Mai", timestamp: "2024-08-25T09:15:00Z" },
      { step: 3, title: "Tạo Phiếu xuất kho", actor: "Nguyễn Văn An", timestamp: "2024-08-25T10:00:00Z", refId: "PXI-2408-005" },
      { step: 4, title: "Duyệt phiếu xuất kho", actor: "Phạm Quốc Khánh", timestamp: "2024-08-25T14:30:00Z" },
    ]
  },
  {
    id: "evt-2",
    type: 'inbound-rma',
    title: "Nhập kho hàng trả bảo hành (Từ DrayTek)",
    timestamp: "2024-08-24T16:00:00Z",
    subEvents: [
      { step: 1, title: "Tạo Đề nghị nhập", actor: "Nguyễn Văn An", timestamp: "2024-08-24T14:00:00Z" },
      { step: 2, title: "Duyệt Đề nghị nhập", actor: "Trần Thị Mai", timestamp: "2024-08-24T14:15:00Z" },
      { step: 3, title: "Tạo Phiếu nhập kho", actor: "Nguyễn Văn An", timestamp: "2024-08-24T15:55:00Z", refId: "PN1-2408-013" },
      { step: 4, title: "Duyệt Phiếu nhập kho", actor: "Phạm Quốc Khánh", timestamp: "2024-08-24T16:00:00Z" },
    ]
  },
  {
    id: "evt-3",
    type: 'outbound-rma',
    title: "Xuất kho gửi bảo hành (DrayTek)",
    timestamp: "2024-08-17T14:30:00Z",
    subEvents: [
      { step: 1, title: "Tạo Đề nghị Xuất hàng hỏng đi bảo hành với hãng", actor: "Nguyễn Văn An", timestamp: "2024-08-16T17:00:00Z" },
      { step: 2, title: "Duyệt Đề nghị xuất", actor: "Trần Thị Mai", timestamp: "2024-08-16T17:15:00Z" },
      { step: 3, title: "Tạo Phiếu xuất kho", actor: "Nguyễn Văn An", timestamp: "2024-08-17T10:00:00Z", refId: "PXI-2408-075" },
      { step: 4, title: "Duyệt phiếu xuất kho", actor: "Phạm Quốc Khánh", timestamp: "2024-08-17T14:30:00Z" },
    ]
  },
  {
    id: "evt-4",
    type: 'inbound-rma',
    title: "Nhập kho hàng hỏng từ khách hàng (Viettel)",
    timestamp: "2024-08-16T16:00:00Z",
    subEvents: [
      { step: 1, title: "Tạo Đề nghị nhập", actor: "Nguyễn Văn An", timestamp: "2024-08-16T14:00:00Z" },
      { step: 2, title: "Duyệt Đề nghị nhập", actor: "Trần Thị Mai", timestamp: "2024-08-16T14:15:00Z" },
      { step: 3, title: "Tạo Phiếu nhập kho", actor: "Nguyễn Văn An", timestamp: "2024-08-16T15:55:00Z", refId: "PN1-2408-013" },
      { step: 4, title: "Duyệt Phiếu nhập kho", actor: "Phạm Quốc Khánh", timestamp: "2024-08-16T16:00:00Z" },
    ]
  },
  {
    id: "evt-5",
    type: 'outbound-customer',
    title: "Xuất bán cho khách hàng (Viettel)",
    timestamp: "2024-02-08T16:00:00Z",
    subEvents: [
      { step: 1, title: "Tạo Đề nghị Xuất bán", actor: "Nguyễn Văn An", timestamp: "2024-02-08T08:00:00Z" },
      { step: 2, title: "Duyệt Đề nghị xuất", actor: "Trần Thị Mai", timestamp: "2024-02-08T09:12:00Z" },
      { step: 3, title: "Tạo Phiếu xuất kho", actor: "Nguyễn Văn An", timestamp: "2024-02-08T14:00:00Z", refId: "CK4-2402-058" },
      { step: 4, title: "Duyệt phiếu xuất kho", actor: "Phạm Quốc Khánh", timestamp: "2024-02-08T16:00:00Z" },
    ]
  },
  {
    id: "evt-6",
    type: 'inbound-po',
    title: "Nhập hàng Theo PO",
    timestamp: "2024-02-02T09:55:00Z",
    subEvents: [
      { step: 1, title: "Tạo Đề nghị nhập", actor: "Nguyễn Văn An", timestamp: "2024-02-01T14:00:00Z" },
      { step: 2, title: "Duyệt Đề nghị nhập", actor: "Trần Thị Mai", timestamp: "2024-02-01T15:00:00Z" },
      { step: 3, title: "Tạo Phiếu nhập kho", actor: "Nguyễn Văn An", timestamp: "2024-02-02T09:05:00Z", refId: "MH1-2408-013" },
      { step: 4, title: "Duyệt Phiếu nhập kho", actor: "Phạm Quốc Khánh", timestamp: "2024-02-02T09:55:00Z" },
    ]
  }
];

export async function getGoodsHistoryAction(serialNumber: string): Promise<{
  material: Material | undefined;
  history: GoodsHistoryEvent[];
}> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const material = materials.find(m => m.serialNumber === serialNumber);
  if (!material) {
    return { material: undefined, history: [] };
  }

  // Return history for the specific material
  if (material.serialNumber === '39X00139M41734000013') {
    return { material, history: goodsHistoryData };
  }

  return { material, history: [] };
}
