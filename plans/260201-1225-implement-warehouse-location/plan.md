---
title: "Implement Màn hình Danh mục Kho (Warehouse Location)"
description: "Triển khai đầy đủ module quản lý vị trí kho với API, UI và validation."
status: completed
priority: P1
effort: 2d
branch: main
tags: [warehouse, location, crud, frontend, backend]
created: 2026-02-01
---

# Kế Hoạch Triển Khai: Màn Hình Danh Mục Kho

## Bối Cảnh

Dựa trên các mockup UI được cung cấp, module này cần:
- **Màn hình danh sách**: Hiển thị danh sách vị trí kho với bộ lọc và phân trang
- **Modal tạo/chỉnh sửa**: Form đầy đủ để quản lý thông tin vị trí
- **Modal xem chi tiết**: Hiển thị thông tin vị trí và tồn kho hiện tại

### Phân Tích UI Mockup

| Thành phần | Mô tả |
|------------|-------|
| **Bộ lọc** | Dropdown Khu vực, Input tìm kiếm, Dropdown Loại |
| **Bảng danh sách** | STT, Mã VT, Tên vị trí, Khu vực, Loại, Trạng thái, Thao tác |
| **Form tạo/sửa** | Mã Vị trí, Mã Barcode, Tên/Mô tả, Khu vực, Loại lưu trữ, Tải trọng Max, Kích thước |
| **Modal chi tiết** | Hiển thị readonly + bảng "Tồn kho hiện tại" |

## Mục Tiêu

1. **API Backend**: Tạo CRUD endpoints cho `WarehouseLocation`
2. **UI Frontend**: Implement các component theo mockup
3. **Relational Schema**: Refactor model để sử dụng FK cho `area`, `type`, `status`
4. **Seed Data**: Thêm dữ liệu mẫu cho vị trí kho

---

## Phase 1: API Implementation (Backend)

### 1.1 Validation Schema

**File mới**: `src/lib/validations/warehouse-location.ts`

```typescript
// Schema cho create/update WarehouseLocation
{
  code: z.string().min(1, "Mã vị trí là bắt buộc"),
  name: z.string().min(1, "Tên/Mô tả là bắt buộc"),
  area: z.string().min(1, "Khu vực là bắt buộc"),
  type: z.string().min(1, "Loại lưu trữ là bắt buộc"),
  status: z.string().default("Active"),
  barcode: z.string().optional(),
  maxWeight: z.number().optional(),
  dimensions: z.string().optional(),
}
```

### 1.2 API Routes

#### [NEW] `src/app/api/warehouse-locations/route.ts`
- **GET**: Danh sách với phân trang, lọc theo `area`, `type`, `status`, `search`
- **POST**: Tạo vị trí mới

#### [NEW] `src/app/api/warehouse-locations/[id]/route.ts`
- **GET**: Chi tiết vị trí + danh sách `WarehouseItem` (tồn kho)
- **PUT**: Cập nhật vị trí
- **DELETE**: Xóa vị trí (kiểm tra không có `WarehouseItem` liên quan)

---

## Phase 2: Frontend Implementation

### 2.1 Components

#### [MODIFY] `src/app/warehouses/page.tsx`
- Server Component wrapper, fetch initial data

#### [NEW] `src/app/warehouses/_components/warehouses-client.tsx`
- Component chính với state management, filters, pagination
- Pattern tương tự `materials-client.tsx`

#### [NEW] `src/app/warehouses/_components/warehouse-form.tsx`
- Form để tạo/sửa vị trí kho
- Sử dụng react-hook-form + zod validation
- Các trường:
  - Mã Vị trí (Bin) - text input
  - Mã Barcode - text input với icon QR
  - Tên/Mô tả - text input
  - Khu vực - Select dropdown (từ master-data)
  - Loại lưu trữ - Select dropdown (từ master-data)
  - Tải trọng Max (kg) - number input
  - Kích thước - text input (placeholder: "2.7m x 1.2m")

#### [NEW] `src/app/warehouses/_components/warehouse-detail.tsx`
- Modal hiển thị chi tiết readonly
- Bảng "Tồn kho hiện tại" với cột: Mã VT, Tên, SL, ĐVT, BATCH/SERIAL

### 2.2 State Management

```typescript
// States cần thiết
const [locations, setLocations] = useState<WarehouseLocation[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [isFormOpen, setIsFormOpen] = useState(false);
const [isDetailOpen, setIsDetailOpen] = useState(false);
const [selectedLocation, setSelectedLocation] = useState<WarehouseLocation | null>(null);
const [viewMode, setViewMode] = useState(false);

// Filters
const [searchQuery, setSearchQuery] = useState("");
const [areaFilter, setAreaFilter] = useState("all");
const [typeFilter, setTypeFilter] = useState("all");

// Pagination
const [currentPage, setCurrentPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);
const [total, setTotal] = useState(0);
```

---

## Phase 3: Data & Types

### 3.1 TypeScript Types

**[MODIFY]** `src/lib/types.ts`

```typescript
export interface WarehouseLocation {
  id: string;
  code: string;
  name: string;
  area: string;
  type: string;
  status: string;
  barcode?: string | null;
  maxWeight?: number | null;
  dimensions?: string | null;
  createdAt: Date;
  updatedAt: Date;
  items?: WarehouseItem[];
}

export interface WarehouseItem {
  id: string;
  locationId: string;
  materialId: string;
  materialCode: string;
  materialName: string;
  quantity: number;
  unit: string;
  batchSerial?: string | null;
}
```

### 3.2 Seed Data

**[MODIFY]** `prisma/seed.ts`

Thêm seed cho `WarehouseLocation`:
```typescript
const warehouseLocations = [
  { code: "A1-01-01", name: "Kệ 01 - Tầng 1 - Dãy A", area: "Khu A", type: "Kệ Pallet", status: "Active", barcode: "LOC-A10101", maxWeight: 2000, dimensions: "2.7m x 1.2m" },
  { code: "A1-01-02", name: "Kệ 01 - Tầng 2 - Dãy A", area: "Khu A", type: "Kệ Pallet", status: "Active" },
  { code: "A1-01-03", name: "Kệ 01 - Tầng 3 - Dãy A", area: "Khu A", type: "Kệ Pallet", status: "Active" },
  { code: "A1-02-01", name: "Kệ 02 - Tầng 1 - Dãy A", area: "Khu A", type: "Kệ Pallet", status: "Inactive" },
  { code: "A1-02-02", name: "Kệ 02 - Tầng 2 - Dãy A", area: "Khu A", type: "Kệ Pallet", status: "Active" },
  { code: "B1-01-01", name: "Kệ 01 - Tầng 1 - Dãy B", area: "Khu B", type: "Kệ Trung Tải", status: "Active" },
];
```

---

## Phase 4: Kết Nối Master Data

Module sử dụng các bảng master data:
- `WarehouseArea` - cho dropdown "Khu vực"
- `WarehouseType` - cho dropdown "Loại lưu trữ"
- `WarehouseStatus` - cho dropdown "Trạng thái"

Sử dụng hook `useMasterDataItems()` có sẵn:
```typescript
const { items: areas } = useMasterDataItems('warehouse-area');
const { items: types } = useMasterDataItems('warehouse-type');
const { items: statuses } = useMasterDataItems('warehouse-status');
```

---

## Kế Hoạch Xác Minh (Verification)

### Kiểm Tra Thủ Công

1. **Kiểm tra danh sách**:
   - Truy cập `/warehouses` → Xác nhận bảng hiển thị đúng dữ liệu
   - Thay đổi bộ lọc → Xác nhận kết quả lọc chính xác
   - Nhấn nút phân trang → Xác nhận chuyển trang đúng

2. **Kiểm tra tạo mới**:
   - Nhấn "Thêm mới" → Modal mở
   - Điền form → Nhấn "Lưu dữ liệu" → Xác nhận toast thành công
   - Kiểm tra bản ghi mới trong danh sách

3. **Kiểm tra chỉnh sửa**:
   - Nhấn icon bút chì → Modal mở với dữ liệu có sẵn
   - Sửa và lưu → Xác nhận cập nhật thành công

4. **Kiểm tra xem chi tiết**:
   - Nhấn icon mắt → Modal chi tiết mở
   - Xác nhận hiển thị "Tồn kho hiện tại" (nếu có)

5. **Kiểm tra xóa**:
   - Nhấn icon thùng rác → Dialog xác nhận hiện
   - Xác nhận xóa → Toast thành công

### Lệnh Chạy Ứng Dụng

```bash
# Chạy development server
npm run dev

# Truy cập: http://localhost:3000/warehouses
```

---

## Cấu Trúc File

```
src/
├── app/
│   ├── api/
│   │   └── warehouse-locations/
│   │       ├── route.ts           [NEW]
│   │       └── [id]/
│   │           └── route.ts       [NEW]
│   └── warehouses/
│       ├── page.tsx               [MODIFY]
│       └── _components/
│           ├── warehouses-client.tsx  [NEW]
│           ├── warehouse-form.tsx     [NEW]
│           └── warehouse-detail.tsx   [NEW]
├── lib/
│   ├── types.ts                   [MODIFY]
│   └── validations/
│       └── warehouse-location.ts  [NEW]
└── prisma/
    └── seed.ts                    [MODIFY]
```

---

## Rủi Ro & Giải Pháp

| Rủi ro | Ảnh hưởng | Giải pháp |
|--------|-----------|-----------|
| Xóa vị trí đang có hàng | Mất dữ liệu tồn kho | Kiểm tra `WarehouseItem` trước khi xóa, từ chối nếu còn hàng |
| Master data chưa seed | Dropdown rỗng | Đảm bảo `prisma db seed` đã chạy xong |
| Trùng mã vị trí | Lỗi unique constraint | Validate phía backend, hiển thị lỗi rõ ràng |

---

## TODO Checklist

- [x] Phase 1.1: Tạo validation schema (`src/lib/validations/warehouse-location.ts`)
- [x] Phase 1.2: Tạo API routes (`src/app/api/warehouse-locations/route.ts` + `[id]/route.ts`)
- [x] Phase 2.1: Cập nhật warehouses-client.tsx (sử dụng API thay vì mock data)
- [x] Phase 2.2: Cập nhật warehouse-form.tsx (sử dụng master data hooks)
- [x] Phase 2.3: Warehouse detail được tích hợp trong form (hiển thị "Tồn kho hiện tại")
- [x] Phase 3.1: types.ts đã có sẵn WarehouseLocation & WarehouseItem
- [x] Phase 3.2: Thêm seed data (11 records trong prisma/seed.ts)
- [ ] Kiểm tra thủ công hoàn tất
