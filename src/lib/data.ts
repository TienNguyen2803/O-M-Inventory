import type { Material, InventoryLog, WarehouseLocation, WarehouseItem, Supplier, MaterialRequest, MaterialRequestItem, PurchaseRequest, PurchaseRequestItem, BiddingPackage, InboundReceipt, InboundReceiptItem, InboundReceiptDocument, OutboundVoucher, OutboundVoucherItem, OutboundReceipt, StockTake, StockTakeResult, User, Role, ActivityLog, GoodsHistoryEvent, MasterDataItem } from "./types";
import prisma from "./db";

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
    unitId: "unit-cai",
    unit: { id: "unit-cai", code: "CAI", name: "Cái" },
    batchSerial: "SN-CARD-001A, SN-CARD-001B",
  },
  {
    materialId: "mat-002",
    materialCode: "PM-INST-GT-002",
    materialName: "Cảm biến nhiệt độ ống khói (Thermocouple Type K)",
    quantity: 10,
    unitId: "unit-cai",
    unit: { id: "unit-cai", code: "CAI", name: "Cái" },
    batchSerial: "BATCH-TC-202401",
  },
];

const warehouseItems2: WarehouseItem[] = [
    {
    materialId: "mat-006",
    materialCode: "PM-CHEM-OIL-006",
    materialName: "Dầu bôi trơn tuabin (Turbine Lubricating Oil)",
    quantity: 200,
    unitId: "unit-lit",
    unit: { id: "unit-lit", code: "LIT", name: "Lít" },
    batchSerial: "BATCH-OIL-202405",
  },
   {
    materialId: "mat-009",
    materialCode: "PM-INST-SEN-009",
    materialName: "Cảm biến tốc độ tuabin (Turbine Speed Sensor)",
    quantity: 4,
    unitId: "unit-bo",
    unit: { id: "unit-bo", code: "BO", name: "Bộ" },
    batchSerial: "SN-SPEED-A01, SN-SPEED-A02, SN-SPEED-A03, SN-SPEED-A04",
  },
];

// Mock master data for warehouse locations
const areaA = { id: "area-a", code: "A", name: "Khu A" };
const areaB = { id: "area-b", code: "B", name: "Khu B" };
const areaC = { id: "area-c", code: "C", name: "Khu C" };
const areaCold = { id: "area-cold", code: "COLD", name: "Kho Lạnh" };
const areaChem = { id: "area-chem", code: "CHEM", name: "Kho Hóa chất" };
const typePallet = { id: "type-pallet", code: "PALLET", name: "Kệ Pallet" };
const typeMedium = { id: "type-medium", code: "MEDIUM", name: "Kệ Trung Tải" };
const typeFloor = { id: "type-floor", code: "FLOOR", name: "Sàn" };
const statusActive = { id: "status-act", code: "ACT", name: "Active", color: "bg-green-100 text-green-800" };
const statusInactive = { id: "status-inact", code: "INACT", name: "Inactive", color: "bg-red-100 text-red-800" };

export const warehouseLocations: WarehouseLocation[] = [
  { id: 'wh-1', code: 'A1-01-01', name: 'Kệ 01 - Tầng 1 - Dãy A', areaId: areaA.id, typeId: typePallet.id, statusId: statusActive.id, area: areaA, type: typePallet, status: statusActive, barcode: 'LOC-A10101', maxWeight: 2000, dimensions: '2.7m x 1.2m', items: warehouseItems1 },
  { id: 'wh-2', code: 'A1-01-02', name: 'Kệ 01 - Tầng 2 - Dãy A', areaId: areaA.id, typeId: typePallet.id, statusId: statusActive.id, area: areaA, type: typePallet, status: statusActive, items: warehouseItems2 },
  { id: 'wh-3', code: 'A1-01-03', name: 'Kệ 01 - Tầng 3 - Dãy A', areaId: areaA.id, typeId: typePallet.id, statusId: statusActive.id, area: areaA, type: typePallet, status: statusActive, items: [] },
  { id: 'wh-4', code: 'A1-02-01', name: 'Kệ 02 - Tầng 1 - Dãy A', areaId: areaA.id, typeId: typePallet.id, statusId: statusInactive.id, area: areaA, type: typePallet, status: statusInactive, items: [] },
  { id: 'wh-5', code: 'A1-02-02', name: 'Kệ 02 - Tầng 2 - Dãy A', areaId: areaA.id, typeId: typePallet.id, statusId: statusActive.id, area: areaA, type: typePallet, status: statusActive, items: [] },
  { id: 'wh-6', code: 'B1-01-01', name: 'Kệ 01 - Tầng 1 - Dãy B', areaId: areaB.id, typeId: typeMedium.id, statusId: statusActive.id, area: areaB, type: typeMedium, status: statusActive, items: [] },
  { id: 'wh-7', code: 'B1-01-02', name: 'Kệ 01 - Tầng 2 - Dãy B', areaId: areaB.id, typeId: typeMedium.id, statusId: statusActive.id, area: areaB, type: typeMedium, status: statusActive, items: [] },
  { id: 'wh-8', code: 'B1-02-01', name: 'Kệ 02 - Tầng 1 - Dãy B', areaId: areaB.id, typeId: typeMedium.id, statusId: statusActive.id, area: areaB, type: typeMedium, status: statusActive, items: [] },
  { id: 'wh-9', code: 'B1-02-02', name: 'Kệ 02 - Tầng 2 - Dãy B', areaId: areaB.id, typeId: typeMedium.id, statusId: statusInactive.id, area: areaB, type: typeMedium, status: statusInactive, items: [] },
  { id: 'wh-10', code: 'CL-01-01', name: 'Kệ 01 - Kho Lạnh', areaId: areaCold.id, typeId: typePallet.id, statusId: statusActive.id, area: areaCold, type: typePallet, status: statusActive, items: [] },
  { id: 'wh-11', code: 'CL-01-02', name: 'Kệ 02 - Kho Lạnh', areaId: areaCold.id, typeId: typePallet.id, statusId: statusActive.id, area: areaCold, type: typePallet, status: statusActive, items: [] },
  { id: 'wh-12', code: 'CH-01', name: 'Sàn 01 - Kho Hóa chất', areaId: areaChem.id, typeId: typeFloor.id, statusId: statusActive.id, area: areaChem, type: typeFloor, status: statusActive, items: [] },
  { id: 'wh-13', code: 'CH-02', name: 'Sàn 02 - Kho Hóa chất', areaId: areaChem.id, typeId: typeFloor.id, statusId: statusActive.id, area: areaChem, type: typeFloor, status: statusActive, items: [] },
  { id: 'wh-14', code: 'A2-01-01', name: 'Kệ 01 - Tầng 1 - Dãy A2', areaId: areaA.id, typeId: typePallet.id, statusId: statusActive.id, area: areaA, type: typePallet, status: statusActive, items: [] },
  { id: 'wh-15', code: 'A2-01-02', name: 'Kệ 01 - Tầng 2 - Dãy A2', areaId: areaA.id, typeId: typePallet.id, statusId: statusActive.id, area: areaA, type: typePallet, status: statusActive, items: [] },
  { id: 'wh-16', code: 'A2-02-01', name: 'Kệ 02 - Tầng 1 - Dãy A2', areaId: areaA.id, typeId: typePallet.id, statusId: statusActive.id, area: areaA, type: typePallet, status: statusActive, items: [] },
  { id: 'wh-17', code: 'A2-02-02', name: 'Kệ 02 - Tầng 2 - Dãy A2', areaId: areaA.id, typeId: typePallet.id, statusId: statusActive.id, area: areaA, type: typePallet, status: statusActive, items: [] },
  { id: 'wh-18', code: 'B2-01-01', name: 'Kệ 01 - Tầng 1 - Dãy B2', areaId: areaB.id, typeId: typeMedium.id, statusId: statusActive.id, area: areaB, type: typeMedium, status: statusActive, items: [] },
  { id: 'wh-19', code: 'B2-01-02', name: 'Kệ 01 - Tầng 2 - Dãy B2', areaId: areaB.id, typeId: typeMedium.id, statusId: statusActive.id, area: areaB, type: typeMedium, status: statusActive, items: [] },
  { id: 'wh-20', code: 'B2-02-01', name: 'Kệ 02 - Tầng 1 - Dãy B2', areaId: areaB.id, typeId: typeMedium.id, statusId: statusActive.id, area: areaB, type: typeMedium, status: statusActive, items: [] },
  { id: 'wh-21', code: 'A3-01-01', name: 'Kệ 01 - Tầng 1 - Dãy A3', areaId: areaA.id, typeId: typePallet.id, statusId: statusActive.id, area: areaA, type: typePallet, status: statusActive, items: [] },
  { id: 'wh-22', code: 'A3-01-02', name: 'Kệ 01 - Tầng 2 - Dãy A3', areaId: areaA.id, typeId: typePallet.id, statusId: statusInactive.id, area: areaA, type: typePallet, status: statusInactive, items: [] },
  { id: 'wh-23', code: 'C1-01', name: 'Vị trí sàn C1', areaId: areaC.id, typeId: typeFloor.id, statusId: statusActive.id, area: areaC, type: typeFloor, status: statusActive, items: [] },
  { id: 'wh-24', code: 'C1-02', name: 'Vị trí sàn C2', areaId: areaC.id, typeId: typeFloor.id, statusId: statusActive.id, area: areaC, type: typeFloor, status: statusActive, items: [] },
  { id: 'wh-25', code: 'B3-01-01', name: 'Kệ 01 - Tầng 1 - Dãy B3', areaId: areaB.id, typeId: typeMedium.id, statusId: statusActive.id, area: areaB, type: typeMedium, status: statusActive, items: [] },
];

// Mock master data for suppliers
const mockCountryVN: MasterDataItem = { id: 'country-vn', code: 'VN', name: 'Việt Nam' };
const mockCountryUS: MasterDataItem = { id: 'country-us', code: 'US', name: 'USA' };
const mockCountryDE: MasterDataItem = { id: 'country-de', code: 'DE', name: 'Đức' };
const mockCountryJP: MasterDataItem = { id: 'country-jp', code: 'JP', name: 'Nhật Bản' };

const mockTypeOEM: MasterDataItem = { id: 'type-oem', code: 'OEM', name: 'OEM' };
const mockTypeMFG: MasterDataItem = { id: 'type-mfg', code: 'MFG', name: 'Manufacturer' };
const mockTypeDIST: MasterDataItem = { id: 'type-dist', code: 'DIST', name: 'Distributor' };

const mockTermNet30: MasterDataItem = { id: 'term-net30', code: 'NET30', name: 'Net 30' };
const mockTermNet45: MasterDataItem = { id: 'term-net45', code: 'NET45', name: 'Net 45' };
const mockTermCOD: MasterDataItem = { id: 'term-cod', code: 'COD', name: 'COD' };

const mockCurrVND: MasterDataItem = { id: 'curr-vnd', code: 'VND', name: 'VND' };
const mockCurrUSD: MasterDataItem = { id: 'curr-usd', code: 'USD', name: 'USD' };
const mockCurrEUR: MasterDataItem = { id: 'curr-eur', code: 'EUR', name: 'EUR' };
const mockCurrJPY: MasterDataItem = { id: 'curr-jpy', code: 'JPY', name: 'JPY' };

export const suppliers: Supplier[] = [
  {
    id: 'sup-1',
    code: 'NCC-001',
    taxCode: '0101234567',
    name: 'Siemens Energy Vietnam',
    address: 'Deutsches Haus, TP.HCM',
    countryId: mockCountryDE.id,
    typeId: mockTypeOEM.id,
    paymentTermId: mockTermNet30.id,
    currencyId: mockCurrUSD.id,
    country: mockCountryDE,
    supplierType: mockTypeOEM,
    paymentTerm: mockTermNet30,
    currency: mockCurrUSD,
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
    countryId: mockCountryUS.id,
    typeId: mockTypeMFG.id,
    paymentTermId: mockTermNet45.id,
    currencyId: mockCurrUSD.id,
    country: mockCountryUS,
    supplierType: mockTypeMFG,
    paymentTerm: mockTermNet45,
    currency: mockCurrUSD,
    status: 'Active',
    contacts: []
  },
  {
    id: 'sup-3',
    code: 'NCC-003',
    taxCode: '0101234568',
    name: 'Yokogawa Vietnam',
    address: 'Tokyo, Japan',
    countryId: mockCountryJP.id,
    typeId: mockTypeMFG.id,
    paymentTermId: mockTermNet45.id,
    currencyId: mockCurrJPY.id,
    country: mockCountryJP,
    supplierType: mockTypeMFG,
    paymentTerm: mockTermNet45,
    currency: mockCurrJPY,
    status: 'Active',
    contacts: []
  },
  {
    id: 'sup-4',
    code: 'NCC-004',
    taxCode: '0300123457',
    name: 'Công ty TNHH Bách Tùng',
    address: 'Hanoi, Vietnam',
    countryId: mockCountryVN.id,
    typeId: mockTypeDIST.id,
    paymentTermId: mockTermCOD.id,
    currencyId: mockCurrVND.id,
    country: mockCountryVN,
    supplierType: mockTypeDIST,
    paymentTerm: mockTermCOD,
    currency: mockCurrVND,
    status: 'Inactive',
    contacts: []
  },
  {
    id: 'sup-5',
    code: 'NCC-005',
    taxCode: '0101234569',
    name: 'ABB Vietnam',
    address: 'Ho Chi Minh City, Vietnam',
    countryId: mockCountryDE.id,
    typeId: mockTypeDIST.id,
    paymentTermId: mockTermNet45.id,
    currencyId: mockCurrEUR.id,
    country: mockCountryDE,
    supplierType: mockTypeDIST,
    paymentTerm: mockTermNet45,
    currency: mockCurrEUR,
    status: 'Active',
    contacts: []
  },
];

// MaterialRequests mock data removed - should be fetched from API
export const materialRequests: MaterialRequest[] = [];

// PurchaseRequests mock data removed - now fetched from API via getPurchaseRequests()
export const purchaseRequests: PurchaseRequest[] = [];

// BiddingPackages mock data removed - now fetched from API via getBiddingPackages()
export const biddingPackages: BiddingPackage[] = [];


// OutboundVouchers mock data removed - should be fetched from API
export const outboundVouchers: OutboundVoucher[] = [];

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
  // Fetch from database using Prisma
  const prisma = (await import('@/lib/db')).default;
  
  const dbMaterials = await prisma.material.findMany({
    orderBy: { code: 'asc' },
    include: {
      managementType: true,
      materialCategory: true,
      materialUnit: true,
      materialStatus: true,
      country: true,
    }
  });

  // Map database records to Material type
  return dbMaterials.map(m => ({
    id: m.id,
    name: m.name,
    nameEn: m.nameEn || undefined,
    code: m.code,
    evnCode: m.evnCode || undefined,
    partNo: m.partNo,
    serialNumber: m.serialNumber || undefined,
    managementTypeId: m.managementTypeId || undefined,
    categoryId: m.categoryId || undefined,
    unitId: m.unitId || undefined,
    statusId: m.statusId || undefined,
    countryId: m.countryId || undefined,
    managementType: m.managementType ? { id: m.managementType.id, code: m.managementType.code, name: m.managementType.name } : undefined,
    materialCategory: m.materialCategory ? { id: m.materialCategory.id, code: m.materialCategory.code, name: m.materialCategory.name } : undefined,
    materialUnit: m.materialUnit ? { id: m.materialUnit.id, code: m.materialUnit.code, name: m.materialUnit.name } : undefined,
    materialStatus: m.materialStatus ? { id: m.materialStatus.id, code: m.materialStatus.code, name: m.materialStatus.name } : undefined,
    country: m.country ? { id: m.country.id, code: m.country.code, name: m.country.name } : undefined,
    description: m.description || undefined,
    stock: m.stock,
    manufacturer: m.manufacturer || undefined,
    minStock: m.minStock || undefined,
    maxStock: m.maxStock || undefined,
    location: m.location || undefined,
    stockAge: m.stockAge || undefined,
    supplierWarranty: m.supplierWarranty || undefined,
    serviceWarranty: m.serviceWarranty || undefined,
    chassisPn: m.chassisPn || undefined,
    chassisSn: m.chassisSn || undefined,
    originAsPerCustomer: m.originAsPerCustomer || undefined,
    originOnDocs: m.originOnDocs || undefined,
    warrantyCount: m.warrantyCount || undefined,
    lifespan: m.lifespan || undefined,
    createdAt: m.createdAt?.toISOString(),
    updatedAt: m.updatedAt?.toISOString(),
  }));
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
    try {
        const requests = await prisma.purchaseRequest.findMany({
            take: 100,
            orderBy: { createdAt: 'desc' },
            include: {
                requester: { select: { id: true, name: true, employeeCode: true } },
                department: { select: { id: true, code: true, name: true } },
                status: { select: { id: true, code: true, name: true, color: true } },
                source: { select: { id: true, code: true, name: true } },
                fundingSource: { select: { id: true, code: true, name: true } },
                items: {
                    include: {
                        material: { select: { id: true, code: true, name: true } },
                        unit: { select: { id: true, code: true, name: true } },
                        suggestedSupplier: { select: { id: true, name: true } },
                    },
                },
            }
        });

        return requests.map(req => ({
            id: req.requestCode,
            requestCode: req.requestCode,
            requesterId: req.requesterId,
            departmentId: req.departmentId,
            statusId: req.statusId,
            sourceId: req.sourceId,
            fundingSourceId: req.fundingSourceId,
            requester: req.requester,
            department: req.department,
            status: req.status,
            source: req.source,
            fundingSource: req.fundingSource,
            requesterName: req.requester.name,
            requesterDept: req.department.name,
            description: req.description,
            totalAmount: req.totalAmount,
            step: req.step,
            createdAt: req.createdAt.toISOString(),
            updatedAt: req.updatedAt.toISOString(),
            items: req.items.map(item => ({
                id: item.id,
                materialId: item.materialId,
                name: item.name,
                unitId: item.unitId,
                material: item.material,
                unit: item.unit,
                suggestedSupplier: item.suggestedSupplier,
                suggestedSupplierId: item.suggestedSupplierId,
                quantity: item.quantity,
                estimatedPrice: item.estimatedPrice,
            }))
        })) as PurchaseRequest[];
    } catch (error) {
        console.error('Error fetching purchase requests:', error);
        return [];
    }
}

export const getBiddingPackages = async (): Promise<BiddingPackage[]> => {
    try {
        const packages = await prisma.biddingPackage.findMany({
            take: 100,
            orderBy: { createdAt: 'desc' },
            include: {
                method: { select: { id: true, code: true, name: true } },
                status: { select: { id: true, code: true, name: true, color: true } },
                createdBy: { select: { id: true, name: true, employeeCode: true } },
                winner: { select: { id: true, code: true, name: true } },
                purchaseRequests: {
                    include: {
                        purchaseRequest: {
                            select: { id: true, requestCode: true, description: true, totalAmount: true }
                        }
                    }
                },
                participants: {
                    include: {
                        supplier: { select: { id: true, code: true, name: true } }
                    }
                },
                scopeItems: {
                    include: {
                        material: { select: { id: true, code: true, name: true } },
                        unit: { select: { id: true, code: true, name: true } }
                    }
                }
            }
        });

        return packages.map(pkg => ({
            id: pkg.packageCode,
            packageCode: pkg.packageCode,
            name: pkg.name,
            methodId: pkg.methodId,
            statusId: pkg.statusId,
            createdById: pkg.createdById,
            winnerId: pkg.winnerId,
            method: pkg.method,
            status: pkg.status,
            createdBy: pkg.createdBy,
            winner: pkg.winner,
            estimatedBudget: pkg.estimatedBudget,
            openDate: pkg.openDate?.toISOString(),
            closeDate: pkg.closeDate?.toISOString(),
            step: pkg.step,
            notes: pkg.notes,
            createdAt: pkg.createdAt.toISOString(),
            updatedAt: pkg.updatedAt.toISOString(),
            purchaseRequests: pkg.purchaseRequests?.map(pr => pr.purchaseRequest) || [],
            participants: pkg.participants?.map(p => ({
                id: p.id,
                supplier: p.supplier,
                invitedAt: p.invitedAt?.toISOString(),
                submittedAt: p.submittedAt?.toISOString(),
                isSubmitted: p.isSubmitted,
                technicalScore: p.technicalScore,
                priceScore: p.priceScore,
                totalScore: p.totalScore,
                rank: p.rank
            })) || [],
            scopeItems: pkg.scopeItems?.map(item => ({
                id: item.id,
                materialId: item.materialId,
                name: item.name,
                unitId: item.unitId,
                quantity: item.quantity,
                estimatedAmount: item.estimatedAmount,
                material: item.material,
                unit: item.unit
            })) || []
        })) as BiddingPackage[];
    } catch (error) {
        console.error('Error fetching bidding packages:', error);
        return [];
    }
}


export const getOutboundVouchers = async (): Promise<OutboundVoucher[]> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return outboundVouchers.sort((a, b) => a.id.localeCompare(b.id));
}

export const getOutboundReceipts = async (): Promise<OutboundReceipt[]> => {
    try {
        const receipts = await prisma.outboundReceipt.findMany({
            take: 100,
            orderBy: { createdAt: 'desc' },
            include: {
                purpose: true,
                status: true,
                receiver: {
                    select: { id: true, name: true, employeeCode: true, department: true },
                },
                materialRequest: {
                    select: { id: true, requestCode: true },
                },
                createdBy: {
                    select: { id: true, name: true, employeeCode: true },
                },
                approver: {
                    select: { id: true, name: true, employeeCode: true },
                },
                items: {
                    include: {
                        material: {
                            select: { id: true, code: true, name: true, partNo: true, stock: true },
                        },
                        unit: true,
                        location: {
                            select: { id: true, code: true, name: true },
                        },
                    },
                },
            },
        });

        return receipts.map(receipt => ({
            id: receipt.id,
            receiptCode: receipt.receiptCode,
            purposeId: receipt.purposeId,
            statusId: receipt.statusId,
            receiverId: receipt.receiverId,
            materialRequestId: receipt.materialRequestId,
            createdById: receipt.createdById,
            approverId: receipt.approverId,
            purpose: receipt.purpose,
            status: receipt.status,
            receiver: receipt.receiver,
            materialRequest: receipt.materialRequest,
            createdBy: receipt.createdBy,
            approver: receipt.approver,
            reason: receipt.reason,
            outboundDate: receipt.outboundDate.toISOString(),
            approvedAt: receipt.approvedAt?.toISOString() || null,
            issuedAt: receipt.issuedAt?.toISOString() || null,
            notes: receipt.notes,
            step: receipt.step,
            items: receipt.items.map(item => ({
                id: item.id,
                receiptId: item.receiptId,
                materialId: item.materialId,
                unitId: item.unitId,
                locationId: item.locationId,
                material: item.material,
                unit: item.unit,
                location: item.location,
                requestedQuantity: item.requestedQuantity,
                issuedQuantity: item.issuedQuantity,
                serialBatch: item.serialBatch,
            })),
            createdAt: receipt.createdAt.toISOString(),
            updatedAt: receipt.updatedAt.toISOString(),
        })) as OutboundReceipt[];
    } catch (error) {
        console.error('Error fetching outbound receipts:', error);
        return [];
    }
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
