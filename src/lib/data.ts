import type { Material, InventoryLog } from "./types";

export const materials: Material[] = [
  {
    id: "mat-001",
    name: "Than Antraxit",
    code: "TA-01",
    category: "Nhiên liệu",
    unit: "Tấn",
    description: "Than Antraxit chất lượng cao, nhiệt trị 7500 kcal/kg.",
    stock: 1500,
  },
  {
    id: "mat-002",
    name: "Dầu DO",
    code: "DO-01",
    category: "Nhiên liệu",
    unit: "Lít",
    description: "Dầu Diesel Oil dùng để khởi động lò.",
    stock: 50000,
  },
  {
    id: "mat-003",
    name: "Vòng bi SKF 6205",
    code: "VB-SKF-6205",
    category: "Phụ tùng",
    unit: "Cái",
    description: "Vòng bi cho động cơ quạt gió.",
    stock: 45,
  },
  {
    id: "mat-004",
    name: "Bơm nước ly tâm",
    code: "BN-LT-01",
    category: "Thiết bị",
    unit: "Cái",
    description: "Bơm nước làm mát tuần hoàn.",
    stock: 15,
  },
  {
    id: "mat-005",
    name: "Cáp điện 3 pha",
    code: "CD-3P-01",
    category: "Vật tư điện",
    unit: "Mét",
    description: "Cáp điện 3 pha, lõi đồng 25mm2.",
    stock: 2500,
  },
  {
    id: "mat-006",
    name: "Van cầu DN50",
    code: "VC-DN50",
    category: "Phụ tùng",
    unit: "Cái",
    description: "Van cầu chịu áp lực cao PN25.",
    stock: 80,
  },
  {
    id: "mat-007",
    name: "Dầu bôi trơn Shell",
    code: "DBT-SH-01",
    category: "Vật tư tiêu hao",
    unit: "Lít",
    description: "Dầu bôi trơn cho hộp số.",
    stock: 1200,
  },
];

export const inventoryLogs: InventoryLog[] = [
  {
    id: "log-001",
    materialId: "mat-001",
    materialName: "Than Antraxit",
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
    materialName: "Dầu DO",
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
  await new Promise((resolve) => setTimeout(resolve, 200));
  return materials;
};

export const getInventoryLogs = async (): Promise<InventoryLog[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 200));
  return inventoryLogs;
};
