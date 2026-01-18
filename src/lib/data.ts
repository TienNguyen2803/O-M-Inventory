import type { Material, InventoryLog, WarehouseLocation, WarehouseItem, Supplier } from "./types";

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

export const suppliers: Supplier[] = [
  { 
    id: 'sup-1', 
    code: 'NCC-001', 
    taxCode: '0101234567',
    name: 'Siemens Energy Vietnam', 
    address: 'Deutsches Haus, TP.HCM',
    country: 'Vietnam',
    type: 'OEM',
    paymentTerm: 'Net 30',
    currency: 'VND',
    status: 'Active',
    contacts: [
      { id: 'cont-1-1', name: 'Mr. John', position: 'Sales Mgr', email: 'john@siemens.com', phone: '+84 909 123 456' },
      { id: 'cont-1-2', name: 'Ms. Anna', position: 'Tech Support', email: 'anna@siemens.com', phone: '+84 918 654 321' },
    ]
  },
  { 
    id: 'sup-2', 
    code: 'NCC-002', 
    taxCode: '0300123456',
    name: 'General Electric', 
    address: 'New York, USA',
    country: 'USA',
    type: 'Manufacturer',
    paymentTerm: 'Net 60',
    currency: 'USD',
    status: 'Active',
    contacts: [] 
  },
  { 
    id: 'sup-3', 
    code: 'NCC-003', 
    taxCode: '0101234568',
    name: 'ABB', 
    address: 'Zurich, Switzerland',
    country: 'Switzerland',
    type: 'OEM',
    paymentTerm: 'Net 30',
    currency: 'EUR',
    status: 'Active',
    contacts: []
  },
  { 
    id: 'sup-4', 
    code: 'NCC-004', 
    taxCode: '0300123457',
    name: 'Công ty TNHH BMT', 
    address: 'Hanoi, Vietnam',
    country: 'Vietnam',
    type: 'Distributor',
    paymentTerm: 'COD',
    currency: 'VND',
    status: 'Inactive',
    contacts: []
  },
  { 
    id: 'sup-5', 
    code: 'NCC-005', 
    taxCode: '0101234569',
    name: 'Schneider Electric', 
    address: 'Paris, France',
    country: 'France',
    type: 'Manufacturer',
    paymentTerm: 'Net 45',
    currency: 'EUR',
    status: 'Active',
    contacts: []
  },
  { 
    id: 'sup-6', 
    code: 'NCC-006', 
    taxCode: '0300123458',
    name: 'Honeywell Vietnam', 
    address: 'Ho Chi Minh City, Vietnam',
    country: 'Vietnam',
    type: 'Distributor',
    paymentTerm: 'Net 30',
    currency: 'VND',
    status: 'Active',
    contacts: []
  },
  { 
    id: 'sup-7', 
    code: 'NCC-007', 
    taxCode: '0101234570',
    name: 'Rockwell Automation', 
    address: 'Milwaukee, USA',
    country: 'USA',
    type: 'Manufacturer',
    paymentTerm: 'Net 60',
    currency: 'USD',
    status: 'Active',
    contacts: []
  },
  { 
    id: 'sup-8', 
    code: 'NCC-008', 
    taxCode: '0300123459',
    name: 'Mitsubishi Electric', 
    address: 'Tokyo, Japan',
    country: 'Japan',
    type: 'OEM',
    paymentTerm: 'Net 30',
    currency: 'JPY',
    status: 'Active',
    contacts: []
  },
  { 
    id: 'sup-9', 
    code: 'NCC-009', 
    taxCode: '0101234571',
    name: 'Emerson Electric', 
    address: 'St. Louis, USA',
    country: 'USA',
    type: 'Manufacturer',
    paymentTerm: 'Net 60',
    currency: 'USD',
    status: 'Inactive',
    contacts: []
  },
  { 
    id: 'sup-10', 
    code: 'NCC-010', 
    taxCode: '0300123460',
    name: 'Bosch Rexroth', 
    address: 'Lohr am Main, Germany',
    country: 'Germany',
    type: 'OEM',
    paymentTerm: 'Net 30',
    currency: 'EUR',
    status: 'Active',
    contacts: []
  },
  { 
    id: 'sup-11', 
    code: 'NCC-011', 
    taxCode: '0101234572',
    name: 'Yokogawa Electric', 
    address: 'Tokyo, Japan',
    country: 'Japan',
    type: 'Manufacturer',
    paymentTerm: 'Net 45',
    currency: 'JPY',
    status: 'Active',
    contacts: []
  },
  { 
    id: 'sup-12', 
    code: 'NCC-012', 
    taxCode: '0300123461',
    name: 'Danfoss', 
    address: 'Nordborg, Denmark',
    country: 'Denmark',
    type: 'Manufacturer',
    paymentTerm: 'Net 30',
    currency: 'EUR',
    status: 'Active',
    contacts: []
  },
  { 
    id: 'sup-13', 
    code: 'NCC-013', 
    taxCode: '0101234573',
    name: 'Parker Hannifin', 
    address: 'Cleveland, USA',
    country: 'USA',
    type: 'Manufacturer',
    paymentTerm: 'Net 60',
    currency: 'USD',
    status: 'Active',
    contacts: []
  },
  { 
    id: 'sup-14', 
    code: 'NCC-014', 
    taxCode: '0300123462',
    name: 'Festo', 
    address: 'Esslingen, Germany',
    country: 'Germany',
    type: 'OEM',
    paymentTerm: 'Net 30',
    currency: 'EUR',
    status: 'Active',
    contacts: []
  },
  { 
    id: 'sup-15', 
    code: 'NCC-015', 
    taxCode: '0101234574',
    name: 'SMC Corporation', 
    address: 'Tokyo, Japan',
    country: 'Japan',
    type: 'Manufacturer',
    paymentTerm: 'Net 30',
    currency: 'JPY',
    status: 'Inactive',
    contacts: []
  },
  { 
    id: 'sup-16', 
    code: 'NCC-016', 
    taxCode: '0300123463',
    name: 'Endress+Hauser', 
    address: 'Reinach, Switzerland',
    country: 'Switzerland',
    type: 'OEM',
    paymentTerm: 'Net 45',
    currency: 'CHF',
    status: 'Active',
    contacts: []
  },
  { 
    id: 'sup-17', 
    code: 'NCC-017', 
    taxCode: '0101234575',
    name: 'WIKA Alexander Wiegand', 
    address: 'Klingenberg, Germany',
    country: 'Germany',
    type: 'Manufacturer',
    paymentTerm: 'Net 30',
    currency: 'EUR',
    status: 'Active',
    contacts: []
  },
  { 
    id: 'sup-18', 
    code: 'NCC-018', 
    taxCode: '0300123464',
    name: 'Phoenix Contact', 
    address: 'Blomberg, Germany',
    country: 'Germany',
    type: 'Manufacturer',
    paymentTerm: 'Net 30',
    currency: 'EUR',
    status: 'Active',
    contacts: []
  },
  { 
    id: 'sup-19', 
    code: 'NCC-019', 
    taxCode: '0101234576',
    name: 'Weidmüller', 
    address: 'Detmold, Germany',
    country: 'Germany',
    type: 'Manufacturer',
    paymentTerm: 'Net 30',
    currency: 'EUR',
    status: 'Active',
    contacts: []
  },
  { 
    id: 'sup-20', 
    code: 'NCC-020', 
    taxCode: '0300123465',
    name: 'OMRON Corporation', 
    address: 'Kyoto, Japan',
    country: 'Japan',
    type: 'OEM',
    paymentTerm: 'Net 45',
    currency: 'JPY',
    status: 'Active',
    contacts: []
  },
  { 
    id: 'sup-21', 
    code: 'NCC-021', 
    taxCode: '0101234577',
    name: 'Pilz GmbH & Co. KG', 
    address: 'Ostfildern, Germany',
    country: 'Germany',
    type: 'OEM',
    paymentTerm: 'Net 30',
    currency: 'EUR',
    status: 'Active',
    contacts: []
  },
  { 
    id: 'sup-22', 
    code: 'NCC-022', 
    taxCode: '0300123466',
    name: 'IFM Electronic', 
    address: 'Essen, Germany',
    country: 'Germany',
    type: 'Manufacturer',
    paymentTerm: 'Net 30',
    currency: 'EUR',
    status: 'Active',
    contacts: []
  },
  { 
    id: 'sup-23', 
    code: 'NCC-023', 
    taxCode: '0101234578',
    name: 'Pepperl+Fuchs', 
    address: 'Mannheim, Germany',
    country: 'Germany',
    type: 'Manufacturer',
    paymentTerm: 'Net 30',
    currency: 'EUR',
    status: 'Active',
    contacts: []
  },
  { 
    id: 'sup-24', 
    code: 'NCC-024', 
    taxCode: '0300123467',
    name: 'Turck', 
    address: 'Mülheim, Germany',
    country: 'Germany',
    type: 'Manufacturer',
    paymentTerm: 'Net 30',
    currency: 'EUR',
    status: 'Inactive',
    contacts: []
  },
  { 
    id: 'sup-25', 
    code: 'NCC-025', 
    taxCode: '0101234579',
    name: 'Balluff', 
    address: 'Neuhausen, Germany',
    country: 'Germany',
    type: 'OEM',
    paymentTerm: 'Net 30',
    currency: 'EUR',
    status: 'Active',
    contacts: []
  }
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

export const getSuppliers = async (): Promise<Supplier[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));
  return suppliers;
};
