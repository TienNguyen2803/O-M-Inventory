export interface Material {
  id: string;
  name: string;
  code: string;
  category: string;
  unit: string;
  description: string;
  stock: number;
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
