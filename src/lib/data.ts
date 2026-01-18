import type { Material, InventoryLog, WarehouseLocation, WarehouseItem } from "./types";

export const materials: Material[] = [
  {
    id: "mat-001",
    name: "Mỡ hàn Amtech 100g",
    nameEn: "Amtech Solder Paste 100g",
    code: "PM-MAT-2508-001",
    evnCode: "Chưa cấp",
    partNo: "NC-559-ASM",
    managementType: "Batch",
    category: "Vật tư tiêu hao",
    unit: "Hộp",
    description: "Ghi chú cho mỡ hàn.",
    stock: 150,
    manufacturer: "AMTECH Inc.",
    origin: "USA",
    minStock: 10,
    maxStock: 200,
    technicalSpecs: [
      { property: "Trọng lượng", value: "100g" },
      { property: "Loại Flux", value: "No-Clean" },
      { property: "Nhiệt độ bảo quản", value: "20°C - 25°C" },
    ],
  },
  {
    id: "mat-002",
    name: "Gioăng đệm chịu nhiệt",
    code: "1.51.45.002.USA",
    partNo: "GASKET-XYZ",
    managementType: "Serial",
    category: "Phụ tùng",
    unit: "Cái",
    description: "Gioăng đệm chịu nhiệt cho đường ống hơi.",
    stock: 88,
    minStock: 50,
    maxStock: 200,
  },
  {
    id: "mat-003",
    name: "Mỡ hàn Amtech 100g",
    code: "1.51.45.003.USA",
    partNo: "NC-559-ASM",
    managementType: "Batch",
    category: "Vật tư tiêu hao",
    unit: "Hộp",
    description: "Mỡ hàn Amtech 100g.",
    stock: 20,
    minStock: 10,
    maxStock: 50,
  },
  {
    id: "mat-004",
    name: "Gioăng đệm chịu nhiệt",
    code: "1.51.45.004.USA",
    partNo: "GASKET-XYZ",
    managementType: "Serial",
    category: "Phụ tùng",
    unit: "Cái",
    description: "Gioăng đệm chịu nhiệt cho đường ống hơi.",
    stock: 120,
    minStock: 100,
    maxStock: 300,
  },
  {
    id: "mat-005",
    name: "Mỡ hàn Amtech 100g",
    code: "1.51.45.005.USA",
    partNo: "NC-559-ASM",
    managementType: "Batch",
    category: "Vật tư tiêu hao",
    unit: "Hộp",
    description: "Mỡ hàn Amtech 100g.",
    stock: 0,
    minStock: 10,
    maxStock: 50,
  },
  {
    id: "mat-006",
    name: "Gioăng đệm chịu nhiệt",
    code: "1.51.45.006.USA",
    partNo: "GASKET-XYZ",
    managementType: "Serial",
    category: "Phụ tùng",
    unit: "Cái",
    description: "Gioăng đệm chịu nhiệt cho đường ống hơi.",
    stock: 300,
    minStock: 100,
    maxStock: 500,
  },
];

export const inventoryLogs: InventoryLog[] = [
  {
    id: "log-001",
    materialId: "mat-001",
    materialName: "Mỡ hàn Amtech 100g",
    quantity: 500,
    type: "inbound",
    date: "2024-07-20",
    actor: "Vinacomin",
  },
  {
    id: "log-002",
    materialId: "mat-003",
    materialName: "Vòng bi SKF 6205",
    quantity: 100,
    type: "inbound",
    date: "2024-07-19",
    actor: "Công ty TNHH BMT",
  },
  {
    id: "log-003",
    materialId: "mat-002",
    materialName: "Gioăng đệm chịu nhiệt",
    quantity: 2000,
    type: "outbound",
    date: "2024-07-21",
    actor: "Phân xưởng vận hành lò",
  },
  {
    id: "log-004",
    materialId: "mat-005",
    materialName: "Cáp điện 3 pha",
    quantity: 200,
    type: "outbound",
    date: "2024-07-22",
    actor: "Đội bảo trì điện",
  },
  {
    id: "log-005",
    materialId: "mat-004",
    materialName: "Bơm nước ly tâm",
    quantity: 2,
    type: "inbound",
    date: "2024-07-18",
    actor: "Nhà cung cấp ABC",
  },
  {
    id: "log-006",
    materialId: "mat-007",
    materialName: "Dầu bôi trơn Shell",
    quantity: 50,
    type: "outbound",
    date: "2024-07-23",
    actor: "Phân xưởng cơ khí",
  },
  {
    id: "log-007",
    materialId: "mat-006",
    materialName: "Van cầu DN50",
    quantity: 20,
    type: "inbound",
    date: "2024-07-20",
    actor: "Công ty XYZ",
  },
  {
    id: "log-008",
    materialId: "mat-003",
    materialName: "Vòng bi SKF 6205",
    quantity: 10,
    type: "outbound",
    date: "2024-07-24",
    actor: "Đội sửa chữa",
  },
];

const warehouseItems1: WarehouseItem[] = [
  {
    materialId: "mat-001",
    materialCode: "PM-MAT-2508-001",
    materialName: "Mỡ hàn Amtech 100g",
    quantity: 50,
    unit: "Hộp",
    batchSerial: "BATCH-20240701",
  },
  {
    materialId: "mat-002",
    materialCode: "1.51.45.002.USA",
    materialName: "Gioăng đệm chịu nhiệt",
    quantity: 30,
    unit: "Cái",
    batchSerial: "SN-Gasket-12345",
  },
];

const warehouseItems2: WarehouseItem[] = [
    {
    materialId: "mat-004",
    materialCode: "1.51.45.004.USA",
    materialName: "Gioăng đệm chịu nhiệt",
    quantity: 100,
    unit: "Cái",
    batchSerial: "SN-Gasket-67890",
  },
   {
    materialId: "mat-005",
    materialCode: "1.51.45.005.USA",
    materialName: "Mỡ hàn Amtech 100g",
    quantity: 0,
    unit: "Hộp",
    batchSerial: "BATCH-20240702",
  },
];


export const warehouseLocations: WarehouseLocation[] = [
  { id: 'wh-1', code: 'A1-01-01', name: 'Kệ 01 - Tầng 1 - Dãy A', area: 'Khu A', type: 'Kệ Pallet', status: 'Active', barcode: 'LOC-A10101', maxWeight: 2000, dimensions: '2.7m x 1.2m', items: warehouseItems1 },
  { id: 'wh-2', code: 'A1-02-01', name: 'Kệ 02 - Tầng 1 - Dãy A', area: 'Khu A', type: 'Kệ Pallet', status: 'Active', items: warehouseItems2 },
  { id: 'wh-3', code: 'A1-03-01', name: 'Kệ 03 - Tầng 1 - Dãy A', area: 'Khu A', type: 'Kệ Pallet', status: 'Active', items: [] },
  { id: 'wh-4', code: 'A1-04-01', name: 'Kệ 04 - Tầng 1 - Dãy A', area: 'Khu A', type: 'Kệ Pallet', status: 'Inactive', items: [] },
  { id: 'wh-5', code: 'A1-05-01', name: 'Kệ 05 - Tầng 1 - Dãy A', area: 'Khu A', type: 'Kệ Pallet', status: 'Active', items: [] },
  { id: 'wh-6', code: 'A1-06-01', name: 'Kệ 06 - Tầng 1 - Dãy A', area: 'Khu B', type: 'Kệ Pallet', status: 'Active', items: [] },
  { id: 'wh-7', code: 'A1-07-01', name: 'Kệ 07 - Tầng 1 - Dãy A', area: 'Khu B', type: 'Kệ Pallet', status: 'Active', items: [] },
  { id: 'wh-8', code: 'A1-08-01', name: 'Kệ 08 - Tầng 1 - Dãy A', area: 'Khu B', type: 'Kệ Pallet', status: 'Active', items: [] },
  { id: 'wh-9', code: 'A1-09-01', name: 'Kệ 09 - Tầng 1 - Dãy A', area: 'Khu B', type: 'Kệ Pallet', status: 'Inactive', items: [] },
  { id: 'wh-10', code: 'A1-010-01', name: 'Kệ 010 - Tầng 1 - Dãy A', area: 'Khu B', type: 'Kệ Pallet', status: 'Active', items: [] },
  { id: 'wh-11', code: 'A1-11-01', name: 'Kệ 11 - Tầng 1 - Dãy B', area: 'Khu B', type: 'Kệ Pallet', status: 'Active', items: [] },
];


export const getMaterials = async (): Promise<Material[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100));
  // sort by code
  return [...materials].sort((a, b) => a.code.localeCompare(b.code));
};

export const getInventoryLogs = async (): Promise<InventoryLog[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100));
  return inventoryLogs;
};

export const getWarehouseLocations = async (): Promise<WarehouseLocation[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));
  return warehouseLocations;
};
