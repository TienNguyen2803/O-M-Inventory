# Project Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Inbound stock increase logic on receipt
- Server-side reporting engine with Prisma `groupBy`
- Lifecycle tracking API integration

---

## [1.4.0] - 2026-02-01

### Added
- **Stocktake Management Module**: Full physical inventory counting implementation:
  - `Stocktake` model with FK relations to StocktakeStatus, StocktakeArea, User
  - `StocktakeAssignment` for location-based counting assignments
  - `StocktakeResult` for counting results with variance tracking
  - CRUD API endpoints at `/api/stocktake`
  - Workflow endpoints: `/start`, `/reconcile`, `/complete`
  - Assignment management: GET/POST/PUT/DELETE
  - Results management: GET/POST/PUT with bulk update support
  - Zod validation schemas in `src/lib/validations/stocktake.ts`
  - Auto-generated codes: `KK-YYYY-XXX`
  - 10 seed records for testing
- **Lifecycle Tracking Plan**: Added lifecycle management plan for material tracing

### Changed
- **Outbound Module**: Improved form component structure and organization
- **Documentation**: Updated system-architecture.md, trimmed from 866 to 334 lines

---

## [1.3.1] - 2026-02-01

### Added
- **Outbound Management Module**: Full goods issue workflow:
  - `OutboundReceipt` model with FK relations
  - `OutboundReceiptItem` with FK to Material, Unit, Location
  - CRUD API at `/api/outbound`
  - Approve/Issue endpoints with stock decrement logic
  - 12 seed records

### Changed
- **Inbound FK Refactoring**: Migrated from string columns to FK relations
- **Master Data Count**: Updated to 24 tables (added StocktakeStatus, StocktakeArea)

---

## [1.3.0] - 2026-02-01

### Added
- **Bidding Management Module**: Full bidding package workflow:
  - `BiddingPackage` with FK to BiddingMethod, BiddingStatus, User, Supplier
  - `BiddingPurchaseRequest` N:M junction
  - `BiddingScopeItem`, `BiddingParticipant`, `BidQuotation`
  - Full CRUD API with participants and winner selection
  - UI: form, participants, quotation dialog, stepper, scope items editor
- **PurchaseRequest FK Relations**: Refactored to use FK
- **Inbound API**: CRUD at `/api/inbound`

### Changed
- **MaterialRequest Schema**: Refactored to FK relations
- **MaterialRequest API**: Updated filters to use FK IDs

---

## [1.2.0] - 2026-02-01

### Added
- **Suppliers Management**: Full CRUD with FK relations and contacts
- **Transactional Updates**: PUT supplier uses transaction

### Changed
- **Supplier Schema**: Refactored from string columns to FK

---

## [1.1.0] - 2026-02-01

### Added
- **Warehouse Locations Module**: Full CRUD with FK relations
- **Zod Validation**: `src/lib/validations/` directory
- **Country Master Data**: Added for origin tracking

### Changed
- **WarehouseLocation Schema**: Refactored to FK relations

---

## [1.0.0] - 2026-02-01

### Added
- **Materials Management**: Full CRUD with master data
- **Material Requests**: Request creation and approval
- **User Management**: Users, Roles, Permissions (RBAC)
- **Documentation**: PDR, Architecture, Guides
- **UI Prototypes**: Inbound, Outbound, Stock Take, Dashboard

### Changed
- **Database Schema**: Refactored to FK relations
- **Permissions**: Migrated to normalized `RoleFeatureAction`
