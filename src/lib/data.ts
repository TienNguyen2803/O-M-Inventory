import type { Material, InventoryLog } from "./types";

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
