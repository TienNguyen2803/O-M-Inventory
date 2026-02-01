# Project Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Bidding Management Module**: Full bidding package workflow implementation:
  - `BiddingPackage` model with FK relations to BiddingMethod, BiddingStatus, User (creator), Supplier (winner).
  - `BiddingPurchaseRequest` N:M junction for linking Purchase Requests.
  - `BiddingScopeItem` for managing bid scope items from PRs.
  - `BiddingParticipant` for supplier participation with scoring (technical, price, total).
  - `BidQuotation` for per-item quotations from participants.
- **Bidding Packages API**: Full CRUD endpoints at `/api/bidding-packages`.
  - Participants sub-API for managing invited suppliers.
  - Winner selection endpoint `/api/bidding-packages/{id}/select-winner`.
- **Bidding UI Components**: `bidding-form.tsx`, `bidding-participants-section.tsx`, `bidding-quotation-dialog.tsx`, `bidding-workflow-step-actions.tsx`.
- **PurchaseRequest FK Relations**: Refactored from string columns to FK relations:
  - `requesterId` → FK to User
  - `departmentId` → FK to Department
  - `statusId` → FK to RequestStatus
  - `sourceId` → FK to MaterialOrigin
  - `fundingSourceId` → FK to FundingSource
- **PurchaseRequestItem Model**: Items with FK relations to Material, MaterialUnit, Supplier.
- **Purchase Requests API**: Full CRUD endpoints at `/api/purchase-requests`.
- **MaterialRequestItem Model**: Items list with FK relations to Material, MaterialUnit.
- **Material Picker Dialog**: UI component for selecting materials in request form.

### Changed
- **MaterialRequest Schema**: Refactored from string columns to FK relations:
  - `requesterId` → FK to User (người yêu cầu)
  - `departmentId` → FK to Department
  - `priorityId` → FK to RequestPriority
  - `statusId` → FK to RequestStatus
  - `approverId` → FK to User (người duyệt)
- **MaterialRequest API**: Updated filters to use FK IDs (`departmentId`, `priorityId`, `statusId`) instead of string values.
- **MaterialRequest Items**: Cascade delete on request deletion.

### Planned
- Inbound Logistics API completion.
- Outbound Logistics API implementation.
- Server-side reporting engine.

## [1.2.0] - 2026-02-01

### Added
- **Suppliers Management Module**: Full CRUD with FK relations to master data (Country, Type, PaymentTerm, Currency).
- **SupplierContact Model**: Nested contacts management with cascade delete.
- **Suppliers API**: GET/POST `/api/suppliers`, GET/PUT/DELETE `/api/suppliers/[id]`.
- **Transactional Updates**: PUT supplier uses database transaction to atomically replace contacts.

### Changed
- **Supplier Schema**: Refactored from string columns (`country`, `type`, `paymentTerm`, `currency`) to FK relations (`countryId`, `typeId`, `paymentTermId`, `currencyId`).
- **Documentation**: Updated all docs to reflect Suppliers module completion.

## [1.1.0] - 2026-02-01

### Added
- **Warehouse Locations Module**: Full CRUD with FK relations to master data (Area, Type, Status).
- **Zod Validation Schemas**: `src/lib/validations/` directory with validation for warehouse-location and inbound.
- **Warehouse Locations API**: GET/POST `/api/warehouse-locations`, GET/PUT/DELETE `/api/warehouse-locations/[id]`.
- **Country Master Data**: Added Country table for material origin tracking.

### Changed
- **WarehouseLocation Schema**: Refactored from string columns (`area`, `type`, `status`) to FK relations (`areaId`, `typeId`, `statusId`).
- **Master Data Count**: Updated from 24 to 25 tables (added Country).

### Fixed
- Minor calendar and client component fixes.

## [1.0.0] - 2026-02-01

### Added
- **Materials Management**: Full CRUD, search, filtering, and master data integration.
- **Material Requests**: Request creation and approval workflow.
- **User Management**: Users, Roles, Permissions (RBAC) with normalized database schema.
- **Documentation**: Comprehensive documentation suite including PDR, Architecture, and Guides.
- **UI Prototypes**: Inbound, Outbound, Stock Take, and Dashboard (Mock data).

### Changed
- **Database Schema**: Refactored `User`, `Role`, and `Material` tables to use Foreign Key relations instead of loose string columns.
- **Permissions**: Migrated from JSON-based permissions to normalized `RoleFeatureAction` many-to-many relationship.
- **Project Structure**: Established `src/app` router structure with distinct feature modules.

### Fixed
- N/A (Initial release versioning).
