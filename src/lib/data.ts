import type { Material, InventoryLog, WarehouseLocation, WarehouseItem, Supplier, MaterialRequest, MaterialRequestItem, PurchaseRequest, PurchaseRequestItem, BiddingPackage, BiddingItem, BiddingResult, InboundReceipt, InboundReceiptItem, InboundReceiptDocument } from "./types";

export const materials: Material[] = [
  {
    id: "mat-001",
    name: "Card điều khiển Tuabin khí Siemens SGT5-4000F",
    nameEn: "Siemens SGT5-4000F Gas Turbine Control Card",
    code: "PM-ELEC-GT-001",
    evnCode: "5.12.99.101",
    partNo: "6DD1607-0AA2",
    managementType: "Serial",
    category: "Phụ tùng TĐH",
    unit: "Cái",
    status: "Mới",
    description: "Card điều khiển chính cho hệ thống SPPA-T3000.",
    stock: 4,
    manufacturer: "Siemens",
    origin: "Germany",
    minStock: 2,
    maxStock: 5,
    technicalSpecs: [ { property: "Model", value: "6DD1607-0AA2" }, { property: "Dùng cho", value: "SPPA-T3000" } ],
  },
  {
    id: "mat-002",
    name: "Cảm biến nhiệt độ ống khói (Thermocouple Type K)",
    nameEn: "Exhaust Gas Thermocouple (Type K)",
    code: "PM-INST-GT-002",
    evnCode: "5.18.21.034",
    partNo: "TC-K-1200C",
    managementType: "Serial",
    category: "Thiết bị đo lường",
    unit: "Cái",
    status: "Mới",
    description: "Đo nhiệt độ khí thải sau tuabin, dải đo 0-1200°C.",
    stock: 25,
    manufacturer: "WIKA",
    origin: "Germany",
    minStock: 10,
    maxStock: 30,
    technicalSpecs: [ { property: "Dải đo", value: "0-1200°C" }, { property: "Loại", value: "K" } ],
  },
  {
    id: "mat-003",
    name: "Bộ cánh tĩnh Tuabin khí (Stator Vane Set)",
    nameEn: "Gas Turbine Stator Vane Set",
    code: "PM-MECH-GT-003",
    evnCode: "3.21.15.008",
    partNo: "SVS-SGT5-ROW1",
    managementType: "Serial",
    category: "Phụ tùng tuabin",
    unit: "Bộ",
    status: "Mới",
    description: "Bộ cánh tĩnh hàng số 1 cho tuabin SGT5-4000F.",
    stock: 1,
    manufacturer: "Siemens",
    origin: "USA",
    minStock: 1,
    maxStock: 2,
  },
  {
    id: "mat-004",
    name: "Van điều khiển khí nhiên liệu (Gas Control Valve)",
    nameEn: "Fuel Gas Control Valve",
    code: "PM-MECH-GV-004",
    evnCode: "4.11.23.110",
    partNo: "GCV-DN150-PN100",
    managementType: "Serial",
    category: "Phụ tùng van",
    unit: "Cái",
    status: "Cũ nhưng dùng được",
    description: "Van điều khiển khí nhiên liệu chính, DN150.",
    stock: 2,
    manufacturer: "Emerson",
    origin: "USA",
    minStock: 1,
    maxStock: 3,
  },
  {
    id: "mat-005",
    name: "Lọc khí đầu vào tuabin (Air Inlet Filter)",
    nameEn: "Turbine Air Inlet Filter",
    code: "PM-MECH-FIL-005",
    evnCode: "4.55.01.002",
    partNo: "AIF-SGT5-SET",
    managementType: "Batch",
    category: "Vật tư tiêu hao",
    unit: "Bộ",
    status: "Mới",
    description: "Bộ lọc tinh cho hệ thống lọc khí đầu vào tuabin.",
    stock: 50,
    manufacturer: "Donaldson",
    origin: "USA",
    minStock: 20,
    maxStock: 60,
  },
  {
    id: "mat-006",
    name: "Dầu bôi trơn tuabin (Turbine Lubricating Oil)",
    nameEn: "Turbine Lubricating Oil",
    code: "PM-CHEM-OIL-006",
    evnCode: "8.12.01.001",
    partNo: "SHELL-TURBO-T46",
    managementType: "Batch",
    category: "Hóa chất/Dầu mỡ",
    unit: "Lít",
    status: "Mới",
    description: "Dầu bôi trơn cho hệ thống tuabin và máy phát.",
    stock: 8000,
    manufacturer: "Shell",
    origin: "Singapore",
    minStock: 5000,
    maxStock: 15000,
  },
  {
    id: "mat-007",
    name: "Gioăng chịu nhiệt cao (High-Temperature Gasket)",
    nameEn: "High-Temperature Gasket",
    code: "PM-MECH-GSK-007",
    evnCode: "3.88.12.301",
    partNo: "HTG-SPIRAL-DN200",
    managementType: "Batch",
    category: "Vật tư tiêu hao",
    unit: "Cái",
    status: "Mới",
    description: "Gioăng kim loại xoắn cho mặt bích đường ống hơi.",
    stock: 200,
    manufacturer: "Garlock",
    origin: "USA",
    minStock: 100,
    maxStock: 300,
  },
  {
    id: "mat-008",
    name: "Bơm dầu bôi trơn (Lube Oil Pump)",
    nameEn: "Lube Oil Pump",
    code: "PM-MECH-PMP-008",
    evnCode: "4.01.02.011",
    partNo: "AOP-SGT5-1",
    managementType: "Serial",
    category: "Phụ tùng cơ khí",
    unit: "Cái",
    status: "Hư hỏng",
    description: "Bơm dầu bôi trơn chính (AOP) cho tuabin.",
    stock: 1,
    manufacturer: "KSB",
    origin: "Germany",
    minStock: 1,
    maxStock: 2,
  },
  {
    id: "mat-009",
    name: "Cảm biến tốc độ tuabin (Turbine Speed Sensor)",
    nameEn: "Turbine Speed Sensor",
    code: "PM-INST-SEN-009",
    evnCode: "5.18.21.050",
    partNo: "BENTLY-3300-XL",
    managementType: "Serial",
    category: "Thiết bị đo lường",
    unit: "Bộ",
    status: "Mới",
    description: "Cảm biến đo tốc độ và độ rung trục tuabin.",
    stock: 8,
    manufacturer: "Bently Nevada",
    origin: "USA",
    minStock: 4,
    maxStock: 10,
  },
  {
    id: "mat-010",
    name: "Đầu báo lửa (Flame Detector)",
    nameEn: "Flame Detector",
    code: "PM-INST-SEN-010",
    evnCode: "5.18.21.099",
    partNo: "DET-TRONICS-X3301",
    managementType: "Serial",
    category: "Thiết bị đo lường",
    unit: "Cái",
    status: "Mới",
    description: "Đầu báo lửa hồng ngoại/cực tím cho buồng đốt tuabin.",
    stock: 12,
    manufacturer: "Det-Tronics",
    origin: "USA",
    minStock: 8,
    maxStock: 16,
  },
  {
    id: "mat-011",
    name: "Van chặn khẩn cấp (ESD Valve)",
    nameEn: "Emergency Shutdown Valve",
    code: "PM-MECH-GV-011",
    evnCode: "4.11.23.111",
    partNo: "ESD-DN200-PN100",
    managementType: "Serial",
    category: "Phụ tùng van",
    unit: "Cái",
    status: "Cũ nhưng dùng được",
    description: "Van ESD cho tuyến ống khí nhiên liệu chính.",
    stock: 1,
    manufacturer: "Metso",
    origin: "Finland",
    minStock: 1,
    maxStock: 2,
  },
  {
    id: "mat-012",
    name: "Vòng bi cầu SKF 6310",
    nameEn: "SKF 6310 Deep Groove Ball Bearing",
    code: "PM-MECH-BRG-012",
    evnCode: "3.71.01.010",
    partNo: "SKF-6310-2RS1",
    managementType: "Batch",
    category: "Vật tư tiêu hao",
    unit: "Cái",
    status: "Mới",
    description: "Vòng bi cầu cho các động cơ phụ trợ.",
    stock: 150,
    manufacturer: "SKF",
    origin: "Sweden",
    minStock: 50,
    maxStock: 200,
  },
  {
    id: "mat-013",
    name: "Cáp điều khiển chống cháy (Fire-Resistant Cable)",
    nameEn: "Fire-Resistant Control Cable",
    code: "PM-ELEC-CAB-013",
    evnCode: "5.04.11.005",
    partNo: "FRC-16x1.5mm2",
    managementType: "Batch",
    category: "Vật tư tiêu hao",
    unit: "Mét",
    status: "Mới",
    description: "Cáp tín hiệu 16 lõi x 1.5mm2, chống cháy, chống nhiễu.",
    stock: 850,
    manufacturer: "Cadivi",
    origin: "Việt Nam",
    minStock: 500,
    maxStock: 2000,
  },
  {
    id: "mat-014",
    name: "Ắc quy cho hệ thống UPS (UPS Battery)",
    nameEn: "Battery for UPS System",
    code: "PM-ELEC-BAT-014",
    evnCode: "5.10.02.001",
    partNo: "VISION-12V-100AH",
    managementType: "Batch",
    category: "Phụ tùng TĐH",
    unit: "Cái",
    status: "Hư hỏng không thể sửa chữa",
    description: "Ắc quy khô, 12V 100Ah cho hệ thống UPS điều khiển.",
    stock: 64,
    manufacturer: "Vision",
    origin: "Việt Nam",
    minStock: 32,
    maxStock: 80,
  },
  {
    id: "mat-015",
    name: "Mô-đun I/O Analog cho PLC",
    nameEn: "Analog I/O Module for PLC",
    code: "PM-ELEC-PLC-015",
    evnCode: "5.12.99.105",
    partNo: "6ES7331-7KF02-0AB0",
    managementType: "Serial",
    category: "Phụ tùng TĐH",
    unit: "Cái",
    status: "Mới",
    description: "Module 8 đầu vào analog cho PLC Siemens S7-300.",
    stock: 15,
    manufacturer: "Siemens",
    origin: "Germany",
    minStock: 5,
    maxStock: 20,
  },
  {
    id: "mat-016",
    name: "Đồng hồ đo áp suất 0-100 bar",
    nameEn: "Pressure Gauge 0-100 bar",
    code: "PM-INST-GAU-016",
    evnCode: "5.18.11.010",
    partNo: "WIKA-232.50.100",
    managementType: "Serial",
    category: "Thiết bị đo lường",
    unit: "Cái",
    status: "Mới",
    description: "Đồng hồ áp suất WIKA, chân đứng, dải đo 0-100 bar.",
    stock: 45,
    manufacturer: "WIKA",
    origin: "Germany",
    minStock: 20,
    maxStock: 60,
  },
  {
    id: "mat-017",
    name: "Khớp nối trục đàn hồi",
    nameEn: "Flexible Shaft Coupling",
    code: "PM-MECH-CPL-017",
    evnCode: "3.61.11.002",
    partNo: "FLENDER-N-EUPEX-225",
    managementType: "Serial",
    category: "Phụ tùng cơ khí",
    unit: "Bộ",
    status: "Thanh lý",
    description: "Khớp nối nối trục động cơ và bơm nước làm mát.",
    stock: 3,
    manufacturer: "Flender",
    origin: "Germany",
    minStock: 2,
    maxStock: 5,
  },
  {
    id: "mat-018",
    name: "Dầu thủy lực chống cháy",
    nameEn: "Fire-Resistant Hydraulic Fluid",
    code: "PM-CHEM-OIL-018",
    evnCode: "8.12.01.005",
    partNo: "QUINTOLUBRIC-888",
    managementType: "Batch",
    category: "Hóa chất/Dầu mỡ",
    unit: "Lít",
    status: "Mới",
    description: "Dầu thủy lực chống cháy cho hệ thống điều khiển van.",
    stock: 2500,
    manufacturer: "Quaker Houghton",
    origin: "USA",
    minStock: 1000,
    maxStock: 4000,
  },
  {
    id: "mat-019",
    name: "Găng tay cách điện 24kV",
    nameEn: "24kV Electrical Insulating Gloves",
    code: "PM-PPE-GLV-019",
    evnCode: "7.01.01.001",
    partNo: "REGELTEX-CLASS-3",
    managementType: "Batch",
    category: "BHLĐ",
    unit: "Đôi",
    status: "Mới",
    description: "Găng tay cách điện hạ thế, cấp 3 (24kV).",
    stock: 50,
    manufacturer: "Regeltex",
    origin: "France",
    minStock: 20,
    maxStock: 60,
  },
  {
    id: "mat-020",
    name: "Mặt nạ phòng khí độc Amoniac",
    nameEn: "Ammonia Gas Mask",
    code: "PM-PPE-MSK-020",
    evnCode: "7.01.03.002",
    partNo: "3M-6800-NH3",
    managementType: "Serial",
    category: "BHLĐ",
    unit: "Bộ",
    status: "Mới",
    description: "Mặt nạ nguyên mặt kèm phin lọc khí Amoniac (NH3).",
    stock: 20,
    manufacturer: "3M",
    origin: "USA",
    minStock: 10,
    maxStock: 30,
  },
  {
    id: "mat-021",
    name: "Cảm biến độ rung",
    nameEn: "Vibration Sensor",
    code: "PM-INST-SEN-021",
    evnCode: "5.18.21.051",
    partNo: "PCH-1220",
    managementType: "Serial",
    category: "Thiết bị đo lường",
    unit: "Cái",
    status: "Cũ nhưng dùng được",
    description: "Cảm biến đo độ rung cho các bơm và quạt lớn.",
    stock: 30,
    manufacturer: "PCH Engineering",
    origin: "Denmark",
    minStock: 15,
    maxStock: 40,
  },
  {
    id: "mat-022",
    name: "Phớt cơ khí cho bơm",
    nameEn: "Mechanical Seal for Pump",
    code: "PM-MECH-SEL-022",
    evnCode: "3.81.01.003",
    partNo: "JOHNCRANE-T5610-50MM",
    managementType: "Batch",
    category: "Phụ tùng cơ khí",
    unit: "Bộ",
    status: "Mới",
    description: "Phớt cơ khí cho bơm nước làm mát, đường kính trục 50mm.",
    stock: 10,
    manufacturer: "John Crane",
    origin: "UK",
    minStock: 4,
    maxStock: 12,
  },
  {
    id: "mat-023",
    name: "Bơm nước làm mát phụ (ECW)",
    nameEn: "Auxiliary Cooling Water Pump",
    code: "PM-MECH-PMP-023",
    evnCode: "4.01.02.012",
    partNo: "ECW-PUMP-MODEL-X",
    managementType: "Serial",
    category: "Phụ tùng cơ khí",
    unit: "Cái",
    status: "Hư hỏng",
    description: "Bơm nước làm mát tuần hoàn phụ.",
    stock: 1,
    manufacturer: "Grundfos",
    origin: "Denmark",
    minStock: 1,
    maxStock: 2,
  },
  {
    id: "mat-024",
    name: "Hóa chất chống cáu cặn (Antiscalant)",
    nameEn: "Antiscalant Chemical",
    code: "PM-CHEM-TRT-024",
    evnCode: "8.21.11.001",
    partNo: "NALCO-3D-TRSAR",
    managementType: "Batch",
    category: "Hóa chất/Dầu mỡ",
    unit: "Kg",
    status: "Mới",
    description: "Hóa chất chống cáu cặn cho hệ thống tháp giải nhiệt.",
    stock: 1500,
    manufacturer: "Nalco",
    origin: "USA",
    minStock: 800,
    maxStock: 2000,
  },
  {
    id: "mat-025",
    name: "Que hàn hợp kim Inconel 625",
    nameEn: "Inconel 625 Welding Rod",
    code: "PM-MECH-WLD-025",
    evnCode: "2.11.05.011",
    partNo: "AWS-A5.14-ERNiCrMo-3",
    managementType: "Batch",
    category: "Vật tư tiêu hao",
    unit: "Kg",
    status: "Mới",
    description: "Que hàn cho các bộ phận chịu nhiệt độ cao trong tuabin.",
    stock: 25,
    manufacturer: "Lincoln Electric",
    origin: "USA",
    minStock: 10,
    maxStock: 50,
  }
];


export const inventoryLogs: InventoryLog[] = Array.from({ length: 25 }, (_, i) => {
  const material = materials[i % materials.length];
  const type = i % 3 === 0 ? "outbound" : "inbound";
  const quantity = type === 'inbound' ? Math.floor(Math.random() * 100) + 20 : Math.floor(Math.random() * 20) + 1;
  const date = new Date();
  date.setDate(date.getDate() - (i % 28)); // Dates within the last month
  const dateString = date.toISOString().split('T')[0];


  return {
    id: `log-${String(i + 1).padStart(3, '0')}`,
    materialId: material.id,
    materialName: material.name,
    quantity: quantity,
    type: type,
    date: dateString,
    actor: type === 'inbound' ? `NCC ${i % 5 + 1}` : `PX Vận hành ${i % 3 + 1}`,
  };
});

const warehouseItems1: WarehouseItem[] = [
  {
    materialId: "mat-001",
    materialCode: "PM-ELEC-GT-001",
    materialName: "Card điều khiển Tuabin khí Siemens SGT5-4000F",
    quantity: 2,
    unit: "Cái",
    batchSerial: "SN-CARD-001A, SN-CARD-001B",
  },
  {
    materialId: "mat-002",
    materialCode: "PM-INST-GT-002",
    materialName: "Cảm biến nhiệt độ ống khói (Thermocouple Type K)",
    quantity: 10,
    unit: "Cái",
    batchSerial: "BATCH-TC-202401",
  },
];

const warehouseItems2: WarehouseItem[] = [
    {
    materialId: "mat-006",
    materialCode: "PM-CHEM-OIL-006",
    materialName: "Dầu bôi trơn tuabin (Turbine Lubricating Oil)",
    quantity: 200,
    unit: "Lít",
    batchSerial: "BATCH-OIL-202405",
  },
   {
    materialId: "mat-009",
    materialCode: "PM-INST-SEN-009",
    materialName: "Cảm biến tốc độ tuabin (Turbine Speed Sensor)",
    quantity: 4,
    unit: "Bộ",
    batchSerial: "SN-SPEED-A01, SN-SPEED-A02, SN-SPEED-A03, SN-SPEED-A04",
  },
];


export const warehouseLocations: WarehouseLocation[] = [
  { id: 'wh-1', code: 'A1-01-01', name: 'Kệ 01 - Tầng 1 - Dãy A', area: 'Khu A', type: 'Kệ Pallet', status: 'Active', barcode: 'LOC-A10101', maxWeight: 2000, dimensions: '2.7m x 1.2m', items: warehouseItems1 },
  { id: 'wh-2', code: 'A1-01-02', name: 'Kệ 01 - Tầng 2 - Dãy A', area: 'Khu A', type: 'Kệ Pallet', status: 'Active', items: warehouseItems2 },
  { id: 'wh-3', code: 'A1-01-03', name: 'Kệ 01 - Tầng 3 - Dãy A', area: 'Khu A', type: 'Kệ Pallet', status: 'Active', items: [] },
  { id: 'wh-4', code: 'A1-02-01', name: 'Kệ 02 - Tầng 1 - Dãy A', area: 'Khu A', type: 'Kệ Pallet', status: 'Inactive', items: [] },
  { id: 'wh-5', code: 'A1-02-02', name: 'Kệ 02 - Tầng 2 - Dãy A', area: 'Khu A', type: 'Kệ Pallet', status: 'Active', items: [] },
  { id: 'wh-6', code: 'B1-01-01', name: 'Kệ 01 - Tầng 1 - Dãy B', area: 'Khu B', type: 'Kệ Trung Tải', status: 'Active', items: [] },
  { id: 'wh-7', code: 'B1-01-02', name: 'Kệ 01 - Tầng 2 - Dãy B', area: 'Khu B', type: 'Kệ Trung Tải', status: 'Active', items: [] },
  { id: 'wh-8', code: 'B1-02-01', name: 'Kệ 02 - Tầng 1 - Dãy B', area: 'Khu B', type: 'Kệ Trung Tải', status: 'Active', items: [] },
  { id: 'wh-9', code: 'B1-02-02', name: 'Kệ 02 - Tầng 2 - Dãy B', area: 'Khu B', type: 'Kệ Trung Tải', status: 'Inactive', items: [] },
  { id: 'wh-10', code: 'CL-01-01', name: 'Kệ 01 - Kho Lạnh', area: 'Kho Lạnh', type: 'Kệ Pallet', status: 'Active', items: [] },
  { id: 'wh-11', code: 'CL-01-02', name: 'Kệ 02 - Kho Lạnh', area: 'Kho Lạnh', type: 'Kệ Pallet', status: 'Active', items: [] },
  { id: 'wh-12', code: 'CH-01', name: 'Sàn 01 - Kho Hóa chất', area: 'Kho Hóa chất', type: 'Sàn', status: 'Active', items: [] },
  { id: 'wh-13', code: 'CH-02', name: 'Sàn 02 - Kho Hóa chất', area: 'Kho Hóa chất', type: 'Sàn', status: 'Active', items: [] },
  { id: 'wh-14', code: 'A2-01-01', name: 'Kệ 01 - Tầng 1 - Dãy A2', area: 'Khu A', type: 'Kệ Pallet', status: 'Active', items: [] },
  { id: 'wh-15', code: 'A2-01-02', name: 'Kệ 01 - Tầng 2 - Dãy A2', area: 'Khu A', type: 'Kệ Pallet', status: 'Active', items: [] },
  { id: 'wh-16', code: 'A2-02-01', name: 'Kệ 02 - Tầng 1 - Dãy A2', area: 'Khu A', type: 'Kệ Pallet', status: 'Active', items: [] },
  { id: 'wh-17', code: 'A2-02-02', name: 'Kệ 02 - Tầng 2 - Dãy A2', area: 'Khu A', type: 'Kệ Pallet', status: 'Active', items: [] },
  { id: 'wh-18', code: 'B2-01-01', name: 'Kệ 01 - Tầng 1 - Dãy B2', area: 'Khu B', type: 'Kệ Trung Tải', status: 'Active', items: [] },
  { id: 'wh-19', code: 'B2-01-02', name: 'Kệ 01 - Tầng 2 - Dãy B2', area: 'Khu B', type: 'Kệ Trung Tải', status: 'Active', items: [] },
  { id: 'wh-20', code: 'B2-02-01', name: 'Kệ 02 - Tầng 1 - Dãy B2', area: 'Khu B', type: 'Kệ Trung Tải', status: 'Active', items: [] },
  { id: 'wh-21', code: 'A3-01-01', name: 'Kệ 01 - Tầng 1 - Dãy A3', area: 'Khu A', type: 'Kệ Pallet', status: 'Active', items: [] },
  { id: 'wh-22', code: 'A3-01-02', name: 'Kệ 01 - Tầng 2 - Dãy A3', area: 'Khu A', type: 'Kệ Pallet', status: 'Inactive', items: [] },
  { id: 'wh-23', code: 'C1-01', name: 'Vị trí sàn C1', area: 'Khu C', type: 'Sàn', status: 'Active', items: [] },
  { id: 'wh-24', code: 'C1-02', name: 'Vị trí sàn C2', area: 'Khu C', type: 'Sàn', status: 'Active', items: [] },
  { id: 'wh-25', code: 'B3-01-01', name: 'Kệ 01 - Tầng 1 - Dãy B3', area: 'Khu B', type: 'Kệ Trung Tải', status: 'Active', items: [] },
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
    name: 'General Electric (GE)', 
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
    name: 'ABB Ltd', 
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
    name: 'Công ty TNHH Bách Tùng', 
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
    name: 'Bosch Rexroth AG', 
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

export const materialRequests: MaterialRequest[] = Array.from({ length: 25 }, (_, i) => {
    const id = i + 1;
    const priority = id % 5 === 0 ? 'Khẩn cấp' : 'Bình thường';
    const status = id % 3 === 0 ? 'Đã duyệt' : 'Chờ duyệt';
    const depts = ['PX Vận hành 1', 'PX Vận hành 2', 'PX Sửa chữa Cơ', 'PX Sửa chữa Điện', 'PX TĐH-ĐK'];
    const dept = depts[i % depts.length];
    
    const reasons = ['Thay thế định kỳ', 'Sửa chữa đột xuất', 'Dự phòng cho đại tu', 'Lắp đặt mới', 'Thử nghiệm'];
    const reason = reasons[i % reasons.length];

    const item1 = materials[i % materials.length];
    const item2 = materials[(i + 5) % materials.length];
    
    const requestItems: MaterialRequestItem[] = [
        {
            materialId: item1.id,
            materialCode: item1.code,
            materialName: item1.name,
            partNumber: item1.partNo,
            unit: item1.unit,
            requestedQuantity: Math.floor(Math.random() * 5) + 1,
            stock: item1.stock,
            notes: `Cho tổ máy GT1${i % 2 + 1}`
        },
    ];

    if (i % 2 === 0) {
      requestItems.push({
            materialId: item2.id,
            materialCode: item2.code,
            materialName: item2.name,
            partNumber: item2.partNo,
            unit: item2.unit,
            requestedQuantity: Math.floor(Math.random() * 10) + 1,
            stock: item2.stock,
            notes: 'Dự phòng'
        });
    }

    return {
        id: `YCVT-2025-${String(id).padStart(3, '0')}`,
        requesterName: 'Nguyễn Văn A',
        requesterDept: dept,
        reason: `${reason} tổ máy GT1${i % 2 + 1}`,
        requestDate: new Date(2025, i % 6, id % 28 + 1).toISOString(),
        priority: priority,
        status: status,
        workOrder: `WO-2025-${String(id + 98).padStart(3, '0')}`,
        approver: status === 'Đã duyệt' ? 'Lê Văn Kỹ (P.Kỹ thuật)' : undefined,
        items: requestItems
    };
});

export const purchaseRequests: PurchaseRequest[] = Array.from({ length: 25 }, (_, i) => {
    const id = i + 1;
    const item1 = materials[i % materials.length];
    const item2 = materials[(i + 7) % materials.length];
    
    const items: PurchaseRequestItem[] = [
        { id: `item-${id}-1`, name: item1.name, unit: item1.unit, quantity: Math.max(1, (item1.maxStock || 2) - item1.stock), estimatedPrice: Math.floor(Math.random() * 5000000) + 100000, suggestedSupplier: suppliers[i % suppliers.length].name },
        { id: `item-${id}-2`, name: item2.name, unit: item2.unit, quantity: Math.max(1, (item2.maxStock || 2) - item2.stock), estimatedPrice: Math.floor(Math.random() * 2000000) + 50000, suggestedSupplier: suppliers[(i + 1) % suppliers.length].name },
    ];
    const totalAmount = items.reduce((acc, item) => acc + (item.quantity * item.estimatedPrice), 0);

    return {
        id: `PR-2025-${String(id).padStart(3, '0')}`,
        requesterName: 'Kho Vật tư',
        requesterDept: 'P.Kế hoạch',
        description: `Mua sắm bổ sung vật tư tồn kho Quý ${Math.floor(i/6) + 1}`,
        source: i % 2 !== 0 ? 'Trong nước' : 'Nhập khẩu',
        fundingSource: i % 3 === 0 ? 'ĐTXD' : 'SCL',
        totalAmount: totalAmount,
        status: id % 3 === 0 ? 'Rejected' : (id % 2 !== 0 ? 'Approved' : 'Pending'),
        items: items,
    };
});

export const biddingPackages: BiddingPackage[] = Array.from({ length: 25 }, (_, i) => {
    const id = i + 1;
    const method = id % 3 === 0 ? 'Chỉ định thầu' : 'Đấu thầu rộng rãi';
    const status = id < 6 ? 'Đang mời thầu' : id < 11 ? 'Đang chấm thầu' : id < 18 ? 'Đã có kết quả' : 'Đã hủy';

    const items: BiddingItem[] = [
        { id: 'item-1', name: 'Gói dịch vụ Đại tu Tuabin khí', unit: 'Gói', quantity: 1, amount: 120000000000 },
        { id: 'item-2', name: 'Vật tư thay thế chính', unit: 'Gói', quantity: 1, amount: 80000000000 },
        { id: 'item-3', name: 'Chuyên gia kỹ thuật', unit: 'Man-day', quantity: 100, amount: 5000000000 },
    ];
    
    const result: BiddingResult | undefined = status === 'Đã có kết quả' ? {
        winner: suppliers[i % suppliers.length].name,
        winningPrice: 204500000000,
        technicalScore: `${Math.floor(Math.random() * 15) + 85}/100`,
        negotiationStatus: `Đã hoàn tất ${id}/${id%12+1}/2025`
    } : undefined;

    return {
        id: `TB-2025-${String(id).padStart(2, '0')}`,
        name: `Gói thầu số ${String(id).padStart(2, '0')} - Đại tu tổ máy GT1${id % 2 + 1}`,
        purchaseRequestId: `PR-2025-${String(id).padStart(3, '0')}`,
        estimatedPrice: 210000000000,
        method: method,
        status: status,
        openingDate: new Date(2025, 4, id, 9, 0).toISOString(),
        closingDate: new Date(2025, 8, id, 16, 0).toISOString(),
        items,
        result,
    };
});

export const inboundReceipts: InboundReceipt[] = Array.from({ length: 25 }, (_, i) => {
  const id = i + 1;
  const types: InboundReceipt['inboundType'][] = ['Theo PO', 'Sau Sửa chữa', 'Hàng Mượn', 'Hoàn trả'];
  const statuses: InboundReceipt['status'][] = ['Hoàn thành', 'Đang nhập', 'KCS & Hồ sơ', 'Yêu cầu nhập'];
  const material = materials[i % materials.length];
  
  const items: InboundReceiptItem[] = [
      { id: `item-${id}-1`, materialCode: material.code, materialName: material.name, orderedQuantity: 20, receivedQuantity: 0, receivingQuantity: 20, serialBatch: `SN-2025-${i}`, location: `A${id%5+1}-01-01`, kcs: true },
  ];

  const documents: InboundReceiptDocument[] = [
      { id: `doc-${id}-1`, type: 'CO (Certificate of Origin)', fileName: `CO_NCC_${id}.pdf` },
      { id: `doc-${id}-2`, type: 'CQ (Certificate of Quality)', fileName: `CQ_NCC_${id}.pdf` },
  ];

  return {
      id: `PNK-2025-${String(id).padStart(3, '0')}`,
      inboundType: types[i % types.length],
      reference: `PO-2025-${String(id + 9).padStart(2, '0')}`,
      inboundDate: new Date(2025, i%6, id%28 + 1).toISOString(),
      partner: suppliers[i % suppliers.length].name,
      status: statuses[i % statuses.length],
      step: (i % 4) + 1,
      items: items,
      documents: documents,
  };
});

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

export const getMaterialRequests = async (): Promise<MaterialRequest[]> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return materialRequests.sort((a, b) => b.id.localeCompare(a.id));
}

export const getPurchaseRequests = async (): Promise<PurchaseRequest[]> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return purchaseRequests.sort((a, b) => a.id.localeCompare(b.id));
}

export const getBiddingPackages = async (): Promise<BiddingPackage[]> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return biddingPackages.sort((a, b) => a.id.localeCompare(b.id));
}

export const getInboundReceipts = async (): Promise<InboundReceipt[]> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  return inboundReceipts.sort((a, b) => a.id.localeCompare(b.id));
}
