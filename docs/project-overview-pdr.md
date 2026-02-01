# Project Overview & Product Development Requirements (PDR)

**Project:** PowerTrack Logistics (O-M-Inventory)
**Date:** 2026-02-01
**Type:** Inventory Management System (O&M)

## 1. Project Vision
To provide a comprehensive, real-time inventory management solution for power plant operations and maintenance (O&M). The system aims to digitize the entire material lifecycle from request to disposal, ensuring accuracy, traceability, and operational efficiency.

## 2. Core Modules & Status

### 2.1 Materials Management (✅ Live)
**Goal:** Centralized registry of all spare parts and consumables.
- **Features:**
    - CRUD operations for materials.
    - Classification (Category, Unit, Management Type).
    - Status tracking (New, Used, Broken).
    - Master Data management.
- **Current State:** Fully implemented with Database backing.

### 2.2 Material Requests (✅ Live)
**Goal:** Workflow for operational teams to request materials.
- **Features:**
    - Request creation with justification.
    - Multi-level approval workflow.
    - Status tracking (Pending, Approved, Rejected).
- **Current State:** Functional API and UI.

### 2.3 Warehouse Locations (✅ Live)
**Goal:** Manage warehouse storage locations and zones.
- **Features:**
    - CRUD operations for warehouse locations.
    - FK relations to master data (Area, Type, Status).
    - Barcode/QR support, weight/dimension tracking.
- **Current State:** Full CRUD with API backend. Uses Zod validation.

### 2.4 Suppliers Management (✅ Live)
**Goal:** Centralized registry of all material suppliers and vendors.
- **Features:**
    - CRUD operations for suppliers.
    - FK relations to master data (Country, Type, PaymentTerm, Currency).
    - Nested contacts management (create/update/delete with supplier).
    - Cascade delete for contacts.
- **Current State:** Full CRUD with API backend. Transactional updates.

### 2.5 Inbound Logistics (🚧 Prototype)
**Goal:** Manage the receipt of goods into warehouses.
- **Requirements:**
    - Create Goods Receipt Notes (GRN).
    - Purchase Order (PO) matching.
    - Barcode/QR scanning for entry.
    - Batch/Serial number recording.
- **Current State:** UI Mockups available. No backend logic.

### 2.5 Inbound Logistics (🚧 Prototype)
**Goal:** Manage the receipt of goods into warehouses.
- **Requirements:**
    - Create Goods Receipt Notes (GRN).
    - Purchase Order (PO) matching.
    - Barcode/QR scanning for entry.
    - Batch/Serial number recording.
- **Current State:** UI Mockups available. No backend logic.

### 2.6 Outbound Logistics (🚧 Prototype)
**Goal:** Control the issuance of materials to plant subsystems.
- **Requirements:**
    - Create Goods Issue Vouchers (GIV).
    - FIFO/FEFO picking strategies.
    - Cost center allocation.
- **Current State:** UI Mockups available. No backend logic.

### 2.7 Reports & Analytics (⚠️ Hybrid)
**Goal:** Operational insights and inventory valuation.
- **Requirements:**
    - Stock Level Reports.
    - Movement History (Cardex).
    - Slow-moving items analysis.
- **Current State:** UI exists with mock/client-side calculation. Needs server-side aggregation.

## 3. Technical Requirements

### 3.1 Architecture
- **Frontend**: Next.js 14 (App Router).
- **Backend**: Next.js API Routes (Serverless functions).
- **Database**: PostgreSQL.
- **ORM**: Prisma.

### 3.2 Performance Constraints
- **Page Load**: < 2 seconds for dashboard and list views.
- **Search**: < 500ms for material lookup.
- **Concurrent Users**: Support for 50+ simultaneous active users.

### 3.3 Security
- **Authentication**: Secure login (currently basic).
- **Authorization**: Role-Based Access Control (RBAC) - Admin, Warehouse Manager, Staff, Viewer.
- **Audit**: Full traceability of who changed what and when (Activity Log).

## 4. User Personas

| Persona | Role | Primary Goals |
|---------|------|---------------|
| **Plant Manager** | Admin/Viewer | View dashboards, approve high-value requests, check budget. |
| **Warehouse Manager** | Manager | Oversee stock levels, manage team, approve discrepancies. |
| **Storekeeper** | Staff | Execute Inbound/Outbound, physical counting, updating locations. |
| **Engineer** | User | Search parts, submit material requests, track request status. |

## 5. Success Metrics
1.  **Inventory Accuracy**: > 98% match between system and physical stock.
2.  **Request Cycle Time**: Reduce average time from Request to Issue by 30%.
3.  **Paper Reduction**: Eliminate 90% of paper-based logbooks.
