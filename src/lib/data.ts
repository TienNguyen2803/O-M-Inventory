import type { Material, InventoryLog, WarehouseLocation, WarehouseItem, Supplier, MaterialRequest, MaterialRequestItem, PurchaseRequest, PurchaseRequestItem, BiddingPackage, BiddingItem, BiddingResult, InboundReceipt, InboundReceiptItem, InboundReceiptDocument, OutboundVoucher, OutboundVoucherItem, StockTake, StockTakeResult, User, Role, ActivityLog, GoodsHistoryEvent, OutboundVoucherPick } from "./types";

export const materials: Material[] = [
  {
    id: "mat-001",
    name: "Card điều khiển Tuabin khí Siemens SGT5-4000F",
    nameEn: "Siemens SGT5-4000F Gas Turbine Control Card",
    code: "PM-ELEC-GT-001",
    evnCode: "5.12.99.101",
    partNo: "6DD1607-0AA2",
    serialNumber: "SIEMENS-2025-999",
    managementType: "Serial",
    category: "Phụ tùng TĐH",
    unit: "Cái",
    status: "Mới",
    description: "Card điều khiển chính cho hệ thống SPPA-T3000.",
    stock: 2,
    manufacturer: "Siemens",
    origin: "Germany",
    minStock: 4,
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
    stock: 12,
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
    stock: 2,
    manufacturer: "Siemens",
    origin: "USA",
    minStock: 1,
    maxStock: 3,
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
    stock: 4,
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
    stock: 25,
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
    stock: 130,
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
    stock: 3,
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
    stock: 9,
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
  },
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


export const inventoryLogs: InventoryLog[] = Array.from({ length: 100 }, (_, i) => {
  const material = materials[i % materials.length];
  const type = i % 3 === 0 ? "outbound" : "inbound";
  const quantity = type === 'inbound' ? Math.floor(Math.random() * 50) + 10 : Math.floor(Math.random() * 15) + 1;
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * (365 * 2.5))); // Spread dates over the last 2.5 years
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
  { id: 'wh-5', code: 'A1-02-02', name: 'Kệ 02 - Tầng 2 - Dãy A', area: 'Khu A', type: 'Kệ Pallet', status: 'Active', items: [
      {
        materialId: "mat-001",
        materialCode: "PM-ELEC-GT-001",
        materialName: "Card điều khiển Tuabin khí Siemens SGT5-4000F",
        quantity: 1,
        unit: "Cái",
        batchSerial: "SN-CARD-001C",
      }
  ] },
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
    taxCode: '0101234569',
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
    name: 'Pilz GmbH &amp; Co. KG', 
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
    const statusOptions: MaterialRequest['status'][] = ['Chờ duyệt', 'Đã duyệt', 'Hoàn thành'];
    const status = statusOptions[i % statusOptions.length];
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

    let step = 2;
    if (status === 'Đã duyệt') {
        step = 3;
    } else if (status === 'Hoàn thành') {
        step = 4;
    }

    return {
        id: `YCVT-2025-${String(id).padStart(3, '0')}`,
        requesterName: 'Nguyễn Văn A',
        requesterDept: dept,
        reason: `${reason} tổ máy GT1${i % 2 + 1}`,
        requestDate: new Date(2025, i % 6, id % 28 + 1).toISOString(),
        priority: priority,
        status: status,
        step: step,
        workOrder: `WO-2025-${String(id + 98).padStart(3, '0')}`,
        approver: status === 'Đã duyệt' || status === 'Hoàn thành' ? 'Lê Văn Kỹ (P.Kỹ thuật)' : undefined,
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

    const statuses: PurchaseRequest['status'][] = ['Approved', 'Pending', 'Rejected', 'Completed'];
    const status = statuses[i % statuses.length];

    let step;
    switch (status) {
        case 'Pending':
            step = 2;
            break;
        case 'Approved':
            step = 3;
            break;
        case 'Completed':
            step = 4;
            break;
        case 'Rejected':
            step = 2; // Rejected at step 2
            break;
        default:
            step = 1;
    }

    return {
        id: `PR-2025-${String(id).padStart(3, '0')}`,
        requesterName: 'Kho Vật tư',
        requesterDept: 'P.Kế hoạch',
        description: `Mua sắm bổ sung vật tư tồn kho Quý ${Math.floor(i/6) + 1}`,
        source: i % 2 !== 0 ? 'Trong nước' : 'Nhập khẩu',
        fundingSource: i % 3 === 0 ? 'ĐTXD' : 'SCL',
        totalAmount: totalAmount,
        status: status,
        step: step,
        items: items,
    };
});

export const biddingPackages: BiddingPackage[] = Array.from({ length: 25 }, (_, i) => {
    const id = i + 1;
    const method = id % 3 === 0 ? 'Chỉ định thầu' : 'Đấu thầu rộng rãi';
    const statuses: BiddingPackage['status'][] = ['Đang mời thầu', 'Đã mở thầu', 'Đang chấm thầu', 'Hoàn thành', 'Đã hủy'];
    const status = statuses[i % statuses.length];
    
    let step = 1;
    if (status === 'Đã mở thầu') step = 2;
    else if (status === 'Đang chấm thầu') step = 3;
    else if (status === 'Hoàn thành') step = 4;
    else if (status === 'Đã hủy') step = 0; // or some value to indicate it's off the path

    const items: BiddingItem[] = [
        { id: 'item-1', name: 'Gói dịch vụ Đại tu Tuabin khí', unit: 'Gói', quantity: 1, amount: 120000000000 },
        { id: 'item-2', name: 'Vật tư thay thế chính', unit: 'Gói', quantity: 1, amount: 80000000000 },
        { id: 'item-3', name: 'Chuyên gia kỹ thuật', unit: 'Man-day', quantity: 100, amount: 5000000000 },
    ];
    
    const result: BiddingResult | undefined = status === 'Hoàn thành' ? {
        winner: suppliers[i % suppliers.length].name,
        winningPrice: 204500000000,
        technicalScore: `${Math.floor(Math.random() * 15) + 85}/100`,
        negotiationStatus: `Đã hoàn tất ${id}/${(id%12)+1}/2025`
    } : undefined;

    return {
        id: `TB-2025-${String(id).padStart(2, '0')}`,
        name: `Gói thầu số ${String(id).padStart(2, '0')} - Đại tu tổ máy GT1${id % 2 + 1}`,
        purchaseRequestId: `PR-2025-${String(id).padStart(3, '0')}`,
        estimatedPrice: 210000000000,
        method: method,
        status: status,
        step,
        openingDate: new Date(2025, 4, id, 9, 0).toISOString(),
        closingDate: new Date(2025, 8, id, 16, 0).toISOString(),
        items,
        result,
    };
});

export const inboundReceipts: InboundReceipt[] = Array.from({ length: 25 }, (_, i) => {
    const id = i + 1;
    const types: InboundReceipt['inboundType'][] = ['Theo PO', 'Sau Sửa chữa', 'Hàng Mượn', 'Hoàn trả'];
    const statuses: InboundReceipt['status'][] = ['Hoàn thành', 'Đang nhập', 'KCS & Hồ sơ', 'Yêu cầu nhập', 'Chờ xếp hàng'];
    const status = statuses[i % statuses.length];
    
    let step = 1;
    if (status === 'KCS & Hồ sơ') {
      step = 2;
    } else if (status === 'Chờ xếp hàng') {
      step = 3;
    } else if (status === 'Hoàn thành') {
      step = 4;
    }

    // Create a list of items for the receipt
    const items: InboundReceiptItem[] = [];

    // Add the first item
    const material1 = materials[i % materials.length];
    items.push({
        id: `item-${id}-1`,
        materialCode: material1.code,
        materialName: material1.name,
        unit: material1.unit,
        orderedQuantity: 20,
        receivedQuantity: 0,
        receivingQuantity: 20,
        serialBatch: `SN-2025-${id}-1`,
        location: `A${id % 5 + 1}-01-01`,
        kcs: true,
        putAwayLocations: status === 'Hoàn thành' ? [
            { location: `A${id % 5 + 1}-01-01`, quantity: 15 },
            { location: `A${id % 5 + 1}-01-02`, quantity: 5 }
        ] : undefined,
    });

    // Add a second item for even-numbered receipts
    if (i % 2 === 0) {
        const material2 = materials[(i + 5) % materials.length];
        items.push({
            id: `item-${id}-2`,
            materialCode: material2.code,
            materialName: material2.name,
            unit: material2.unit,
            orderedQuantity: 15,
            receivedQuantity: 0,
            receivingQuantity: 15,
            serialBatch: `BATCH-2025-${id}-2`,
            location: `B${id % 3 + 1}-02-03`,
            kcs: true,
            putAwayLocations: status === 'Hoàn thành' ? [{ location: `B${id % 3 + 1}-02-03`, quantity: 15 }] : undefined,
        });
    }

    // Add a third item for receipts divisible by 5
    if (i % 5 === 0) {
        const material3 = materials[(i + 10) % materials.length];
        items.push({
            id: `item-${id}-3`,
            materialCode: material3.code,
            materialName: material3.name,
            unit: material3.unit,
            orderedQuantity: 5,
            receivedQuantity: 0,
            receivingQuantity: 5,
            serialBatch: `SN-2025-${id}-3`,
            location: `C1-01-05`,
            kcs: true,
            putAwayLocations: status === 'Hoàn thành' ? [{ location: `C1-01-05`, quantity: 5 }] : undefined,
        });
    }

    const documents: InboundReceiptDocument[] = [
        { id: `doc-${id}-1`, type: 'CO (Certificate of Origin)', fileName: `CO_NCC_${id}.pdf` },
        { id: `doc-${id}-2`, type: 'CQ (Certificate of Quality)', fileName: `CQ_NCC_${id}.pdf` },
    ];

    return {
        id: `PNK-2025-${String(id).padStart(3, '0')}`,
        inboundType: types[i % types.length],
        reference: `PO-2025-${String(id + 9).padStart(2, '0')}`,
        inboundDate: new Date(2025, i % 6, id % 28 + 1).toISOString(),
        partner: suppliers[i % suppliers.length].name,
        status: status,
        step: step,
        items: items,
        documents: documents,
    };
});

export const outboundVouchers: OutboundVoucher[] = Array.from({ length: 25 }, (_, i) => {
    const id = i + 1;
    const purposes: OutboundVoucher['purpose'][] = ['Cấp O&M', 'Khẩn cấp', 'Cho mượn', 'Đi Sửa chữa'];
    const statuses: OutboundVoucher['status'][] = ['Đã xuất', 'Chờ xuất', 'Đã hủy', 'Đang soạn hàng'];
    const status = statuses[i % statuses.length];
    const materialRequest = materialRequests[i];

    const findLocationForMaterial = (materialId: string): string => {
        for (const location of warehouseLocations) {
            const itemInLocation = location.items?.find(item => item.materialId === materialId);
            if (itemInLocation) {
                return `${location.code}`;
            }
        }
        return `N/A`;
    }

    return {
        id: `PXK-2025-${String(id).padStart(3, '0')}`,
        purpose: purposes[i % purposes.length],
        materialRequestId: materialRequest.id,
        department: materialRequest.requesterDept,
        receiverName: "Nguyễn Văn A",
        reason: 'Sửa chữa thường xuyên',
        status: status,
        step: (i % 4) + 1,
        issueDate: new Date(2025, i % 7, id % 28 + 1).toISOString(),
        items: materialRequest.items.map((item, index) => ({
            id: `out-item-${id}-${index}`,
            materialId: item.materialId,
            materialCode: item.materialCode,
            materialName: item.materialName,
            unit: item.unit,
            requestedQuantity: item.requestedQuantity,
            issuedQuantity: item.requestedQuantity,
            pickLocationSuggestion: findLocationForMaterial(item.materialId),
            actualSerial: index % 2 === 0 ? `Lô ${2023 + index}` : `-`,
            pickLocations: status === 'Đã xuất' && item.requestedQuantity > 1 ?
            [
                { location: findLocationForMaterial(item.materialId), quantity: item.requestedQuantity -1, serial: `BATCH-${id}-A`},
                { location: 'A1-02-02', quantity: 1, serial: `BATCH-${id}-B`}
            ] : undefined,
        })),
    };
});

export const stockTakes: StockTake[] = Array.from({ length: 25 }, (_, i) => {
  const id = i + 1;
  const quarter = Math.floor(i / 6) + 1;
  const statuses: StockTake['status'][] = ['Đã hoàn thành', 'Đang tiến hành', 'Đã hủy'];
  const areas: StockTake['area'][] = ['Toàn bộ', 'Khu A', 'Khu B', 'Kho Lạnh'];

  const results: StockTakeResult[] = [
    {
        id: `res-${id}-1`,
        materialId: 'mat-001',
        materialCode: 'PM-ELEC-GT-001',
        materialName: 'Card điều khiển Tuabin khí Siemens SGT5-4000F',
        location: 'A1-01-01',
        bookQuantity: 10,
        actualQuantity: 10,
        notes: ''
    },
    {
        id: `res-${id}-2`,
        materialId: 'mat-002',
        materialCode: 'PM-INST-GT-002',
        materialName: 'Cảm biến nhiệt độ ống khói',
        location: 'A1-01-02',
        bookQuantity: 50,
        actualQuantity: 48,
        notes: 'Mất/Hỏng'
    },
     {
        id: `res-${id}-3`,
        materialId: 'mat-005',
        materialCode: 'PM-MECH-FIL-005',
        materialName: 'Lọc khí đầu vào tuabin (Air Inlet Filter)',
        location: 'A1-02-01',
        bookQuantity: 100,
        actualQuantity: 102,
        notes: 'Thừa 2 bộ'
    }
  ];

  return {
    id: `KK-2025-Q${quarter}-${String(id % 6 + 1).padStart(2, '0')}`,
    name: `Đợt kiểm kê Quý ${quarter}`,
    date: new Date(2025, quarter * 3 - 1, 28).toISOString(),
    status: statuses[i % statuses.length],
    area: areas[i % areas.length],
    leader: 'Trần Văn Kho',
    results: statuses[i % statuses.length] === 'Đã hoàn thành' ? results : [],
  };
});

export const users: User[] = Array.from({ length: 25 }, (_, i) => {
    const id = i + 1;
    const departments = ['Phòng Kỹ thuật', 'PX Vận hành', 'Phòng Kế hoạch', 'Ban Giám đốc', 'Phòng Tài chính'];
    const roles = ['Staff', 'Manager', 'Technician', 'Admin'];
    const char = String.fromCharCode(65 + i);
    
    return {
        id: `user-${id}`,
        employeeCode: `NV${String(id).padStart(3, '0')}`,
        name: `Nguyễn Văn ${char}`,
        email: `nguyen.van.${char.toLowerCase()}@phumypower.vn`,
        phone: `090${String(id).padStart(3, '0')}${String(id*3).padStart(4,'0')}`.slice(0,10),
        department: departments[i % departments.length],
        role: roles[i % roles.length],
        status: i % 10 === 0 ? 'Inactive' : 'Active',
    };
});

const allPermissions = {
  "BÁO CÁO & PHÂN TÍCH": [
    { feature: "Tổng quan", view: true, create: false, edit: false, delete: false, approve: false },
    { feature: "Báo cáo nhập, xuất, tồn", view: true, create: false, edit: false, delete: false, approve: false },
    { feature: "Vật tư chậm luân chuyển", view: true, create: false, edit: false, delete: false, approve: false },
    { feature: "Định mức tồn kho an toàn", view: true, create: false, edit: false, delete: false, approve: false },
  ],
  "KẾ HOẠCH & MUA SẮM": [
    { feature: "Yêu cầu Vật tư", view: true, create: true, edit: true, delete: true, approve: false },
    { feature: "Yêu cầu Mua sắm", view: true, create: true, edit: true, delete: false, approve: true },
    { feature: "Quản lý Đấu thầu", view: true, create: true, edit: true, delete: false, approve: true },
  ],
  "DỮ LIỆU DANH MỤC": [
    { feature: "Danh mục Vật tư", view: true, create: true, edit: true, delete: false, approve: false },
    { feature: "Danh mục Kho", view: true, create: true, edit: true, delete: false, approve: false },
    { feature: "Nhà cung cấp", view: true, create: true, edit: true, delete: true, approve: false },
  ],
  "VẬN HÀNH KHO": [
    { feature: "Nhập kho (Inbound)", view: true, create: true, edit: true, delete: false, approve: false },
    { feature: "Xuất kho (Outbound)", view: true, create: true, edit: true, delete: false, approve: false },
    { feature: "Kiểm kê (Stock Take)", view: true, create: true, edit: true, delete: false, approve: true },
    { feature: "Truy vết Vòng đời", view: true, create: false, edit: false, delete: false, approve: false },
  ],
  "HỆ THỐNG & BẢO MẬT": [
    { feature: "Quản lý Người dùng", view: true, create: true, edit: true, delete: true, approve: false },
    { feature: "Phân quyền Vai trò", view: true, create: true, edit: true, delete: true, approve: false },
    { feature: "Nhật ký Hoạt động", view: true, create: false, edit: false, delete: false, approve: false },
  ],
};

export const roles: Role[] = [
  {
    id: "role-1",
    name: "Quản trị viên hệ thống",
    description: "Toàn quyền truy cập và cấu hình hệ thống.",
    userCount: 2,
    permissions: JSON.parse(JSON.stringify(allPermissions)), // Full permissions
  },
  {
    id: "role-2",
    name: "Trưởng phòng vật tư",
    description: "Quản lý toàn bộ hoạt động mua sắm và kho.",
    userCount: 1,
    permissions: {
      "BÁO CÁO & PHÂN TÍCH": allPermissions["BÁO CÁO & PHÂN TÍCH"].map(p => ({ ...p, view: true })),
      "KẾ HOẠCH & MUA SẮM": allPermissions["KẾ HOẠCH & MUA SẮM"].map(p => ({ ...p, view: true, approve: true })),
      "DỮ LIỆU DANH MỤC": allPermissions["DỮ LIỆU DANH MỤC"].map(p => ({ ...p, view: true, create: true, edit: true })),
      "VẬN HÀNH KHO": allPermissions["VẬN HÀNH KHO"].map(p => ({ ...p, view: true, approve: true })),
      "HỆ THỐNG & BẢO MẬT": allPermissions["HỆ THỐNG & BẢO MẬT"].map(p => ({ ...p, view: true, create: false, edit: false, delete: false, approve: false })),
    },
  },
  {
    id: "role-3",
    name: "Chuyên viên mua hàng",
    description: "Thực hiện các nghiệp vụ mua sắm, đấu thầu.",
    userCount: 5,
    permissions: {
      "BÁO CÁO & PHÂN TÍCH": allPermissions["BÁO CÁO & PHÂN TÍCH"].map(p => ({ ...p, view: true, create: false, edit: false, delete: false, approve: false })),
      "KẾ HOẠCH & MUA SẮM": allPermissions["KẾ HOẠCH & MUA SẮM"].map(p => ({ ...p, view: true, create: true, edit: true, delete: false, approve: false })),
      "DỮ LIỆU DANH MỤC": [{ feature: "Nhà cung cấp", view: true, create: true, edit: true, delete: false, approve: false }, ...allPermissions["DỮ LIỆU DANH MỤC"].slice(1).map(p => ({ ...p, view: true, create: false, edit: false, delete: false, approve: false }))],
      "VẬN HÀNH KHO": [],
      "HỆ THỐNG & BẢO MẬT": [],
    },
  },
  {
    id: "role-4",
    name: "Thủ kho",
    description: "Thực hiện các nghiệp vụ nhập, xuất, kiểm kê kho.",
    userCount: 3,
    permissions: {
        "BÁO CÁO & PHÂN TÍCH": [],
        "KẾ HOẠCH & MUA SẮM": [],
        "DỮ LIỆU DANH MỤC": [{ feature: "Danh mục Vật tư", view: true, create: false, edit: false, delete: false, approve: false }, { feature: "Danh mục Kho", view: true, create: true, edit: true, delete: false, approve: false }, { feature: "Nhà cung cấp", view: true, create: false, edit: false, delete: false, approve: false }],
        "VẬN HÀNH KHO": allPermissions["VẬN HÀNH KHO"].map(p => ({ ...p, view: true, create: true, edit: true, delete: false, approve: false })),
        "HỆ THỐNG & BẢO MẬT": [],
    },
  },
];
// For admin, all permissions are true.
roles[0].permissions = Object.entries(allPermissions).reduce((acc, [group, perms]) => {
  acc[group] = perms.map(p => ({ ...p, view: true, create: true, edit: true, delete: true, approve: true }));
  return acc;
}, {} as Role['permissions']);

export const activityLogs: ActivityLog[] = Array.from({ length: 50 }, (_, i) => {
    const id = i + 1;
    const users = [
        { name: 'Nguyễn Văn A', avatarUrl: 'https://i.pravatar.cc/150?u=nguyen-van-a' },
        { name: 'Trần Thị B', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704e' },
        { name: 'Lê Văn Kỹ', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704f' },
        { name: 'Phạm Minh Khoa', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704g' }
    ];
    const actions: ActivityLog['action'][] = ['Tạo', 'Cập nhật', 'Xóa', 'Đăng nhập', 'Duyệt', 'Xuất file'];
    const targets = [
        { type: 'Yêu cầu Vật tư', id: `YCVT-2025-${String(id % 25 + 1).padStart(3, '0')}` },
        { type: 'Phiếu nhập kho', id: `PNK-2025-${String(id % 25 + 1).padStart(3, '0')}` },
        { type: 'Nhà cung cấp', id: `NCC-${String(id % 25 + 1).padStart(3, '0')}` },
        { type: 'Vật tư', id: `PM-MECH-FIL-005` }
    ];
    const action = actions[i % actions.length];
    const user = users[i % users.length];
    const target = targets[i % targets.length];
    const date = new Date();
    date.setHours(date.getHours() - i * 2);

    return {
        id: `log-${id}`,
        timestamp: date.toISOString(),
        user: user,
        action: action,
        target: target,
        details: `${user.name} đã ${action.toLowerCase()} ${target.type.toLowerCase()} với mã ${target.id}`
    };
});

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

export const getOutboundVouchers = async (): Promise<OutboundVoucher[]> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return outboundVouchers.sort((a, b) => a.id.localeCompare(b.id));
}

export const getStockTakes = async (): Promise<StockTake[]> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  return stockTakes.sort((a,b) => b.id.localeCompare(a.id));
};

export const getUsers = async (): Promise<User[]> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return users.sort((a,b) => a.employeeCode.localeCompare(b.employeeCode));
};

export const getRoles = async (): Promise<Role[]> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return roles;
};

export const getActivityLogs = async (): Promise<ActivityLog[]> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return activityLogs.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const getGoodsHistory = async (serialNumber: string): Promise<{material: Material | undefined, history: GoodsHistoryEvent[]}> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const material = materials.find(m => m.serialNumber === serialNumber);
  if (!material) {
    return { material: undefined, history: [] };
  }
  // For now, return the same history for the specific material
  if (material.serialNumber === '39X00139M41734000013') {
    return { material, history: goodsHistoryData };
  }
  return { material, history: [] };
}
