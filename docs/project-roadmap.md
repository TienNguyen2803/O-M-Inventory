# Project Roadmap

**Status:** Active Development
**Current Phase:** Phase 2 - Core Workflows
**Last Updated:** 2026-02-01

## 📌 Phase 1: Foundation (Completed)
- [x] **Project Setup**: Next.js 14, TypeScript, Tailwind, Shadcn UI.
- [x] **Database Design**: PostgreSQL schema with 25 Master Data tables.
- [x] **Authentication**: Basic email login (v1).
- [x] **User Management**: Users, Roles, Permissions (RBAC) with API.

## 📌 Phase 2: Core Inventory Management (Current)
- [x] **Materials Module**:
    - [x] CRUD Operations.
    - [x] Filtering & Search.
    - [x] Master Data Integration.
- [x] **Material Requests**:
    - [x] Request Creation.
    - [x] Approval Workflow.
    - [x] Status Tracking.
- [x] **Warehouse Locations**:
    - [x] CRUD Operations with FK relations.
    - [x] Zod validation schema.
    - [x] Master Data Integration (Area, Type, Status).
- [x] **Suppliers Management**:
    - [x] CRUD Operations with FK relations.
    - [x] Contacts management (nested create/update/delete).
    - [x] Master Data Integration (Country, Type, PaymentTerm, Currency).
- [ ] **Inbound Logistics (Goods Receipt)**:
    - [x] UI Prototypes (Mock Data).
    - [ ] **Backend API**: Implement `/api/inbound`.
    - [ ] **Database Integration**: Connect `InboundReceipt` model.
    - [ ] **Inventory Update**: Logic to increase stock on receipt.
- [ ] **Outbound Logistics (Goods Issue)**:
    - [x] UI Prototypes (Mock Data).
    - [ ] **Backend API**: Implement `/api/outbound`.
    - [ ] **Database Integration**: Connect `OutboundVoucher` model.
    - [ ] **Inventory Update**: Logic to decrease stock on issue.

## 📌 Phase 3: Advanced Operations (Planned)
- [ ] **Stock Take (Physical Inventory)**:
    - [x] UI Prototypes.
    - [ ] API & Reconciliation Logic.
- [ ] **Reporting Engine**:
    - [x] Client-side Charts (Mock).
    - [ ] Server-side Aggregation (Prisma `groupBy`).
    - [ ] Export to Excel/PDF.
- [ ] **Dashboard**:
    - [ ] Real-time widgets connected to live data.

## 📌 Phase 4: Optimization & Production Ready (Future)
- [ ] **Auth Hardening**: Integrate NextAuth.js or Clerk.
- [ ] **Performance**: Redis caching for Master Data.
- [ ] **CI/CD**: Automated testing pipeline.
- [ ] **Mobile Support**: Responsive design optimization for tablets/phones.

## 🚦 Feature Status Matrix

| Module | UI Status | Backend Status | Priority |
|--------|-----------|----------------|----------|
| Materials | ✅ Ready | ✅ Ready | - |
| Users/Roles | ✅ Ready | ✅ Ready | - |
| Requests | ✅ Ready | ✅ Ready | - |
| Warehouse Locations | ✅ Ready | ✅ Ready | - |
| Suppliers | ✅ Ready | ✅ Ready | - |
| Inbound | 🚧 Prototype | ⚠️ Partial | High |
| Outbound | 🚧 Prototype | ❌ Missing | High |
| Reports | ⚠️ Hybrid | ❌ Mock Data | Medium |
| Dashboard | 🚧 Prototype | ❌ Mock Data | Medium |
