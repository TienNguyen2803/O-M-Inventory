# Project Roadmap

**Status:** Active Development
**Current Phase:** Phase 2 - Core Workflows (Complete)
**Last Updated:** 2026-02-01

## Phase 1: Foundation (Completed)
- [x] **Project Setup**: Next.js 15, TypeScript, Tailwind, Shadcn UI
- [x] **Database Design**: PostgreSQL schema with 28 Master Data tables
- [x] **Authentication**: Basic email login (v1)
- [x] **User Management**: Users, Roles, Permissions (RBAC) with API

## Phase 2: Core Inventory Management (Complete)
- [x] **Materials Module**: CRUD, filtering, search, master data integration
- [x] **Material Requests**: Request creation, approval workflow, status tracking
- [x] **Warehouse Locations**: CRUD with FK relations, Zod validation
- [x] **Suppliers Management**: CRUD with contacts, transactional updates
- [x] **Purchase Requests**: CRUD with items, FK relations
- [x] **Bidding Management**: Full workflow with participants, quotations, winner selection
- [x] **Inbound Logistics**: Full CRUD with FK relations, KCS inspection
- [x] **Outbound Logistics**: Full CRUD with approve/issue workflow, stock decrement
- [x] **Stocktake Management**:
    - [x] Full CRUD API at `/api/stocktake`
    - [x] Location assignments and assignee tracking
    - [x] Counting results with variance calculation
    - [x] Workflow: Draft -> In Progress -> Reconciling -> Completed
    - [x] Zod validation schemas
- [x] **Lifecycle Tracking**:
    - [x] MaterialEvent model for lifecycle logging
    - [x] Installation tracking with location info
    - [x] API endpoints: `/api/materials/{id}/lifecycle`, `/api/installations`
    - [x] Timeline UI visualization
- [x] **Item History**:
    - [x] MaterialTransaction model for grouped history
    - [x] API endpoints: `/api/materials/{id}/history`, `/api/materials/{id}/transactions/{txId}`
    - [x] Frontend page with statistics, grouped timeline, expandable events
- [ ] **Inbound Stock Update**: Logic to increase stock on receipt (pending)

## Phase 3: Advanced Operations (In Progress)
- [ ] **Reporting Engine**:
    - [x] Client-side Charts (Mock)
    - [ ] Server-side Aggregation (Prisma `groupBy`)
    - [ ] Export to Excel/PDF
- [ ] **Dashboard**:
    - [x] UI with KPIs and charts
    - [ ] Real-time widgets connected to live data
- [x] **Goods History**:
    - [x] Material movement history search
    - [x] Filter by date range, type, material

## Phase 4: Optimization & Production Ready (Future)
- [ ] **Auth Hardening**: Integrate NextAuth.js or Clerk
- [ ] **API Middleware**: Authentication checks on all routes
- [ ] **Performance**: Redis caching for Master Data
- [ ] **CI/CD**: Automated testing pipeline
- [ ] **Mobile Support**: Responsive design optimization

## Feature Status Matrix

| Module | UI | Backend | Priority |
|--------|-----|---------|----------|
| Materials | Ready | Ready | - |
| Users/Roles | Ready | Ready | - |
| Material Requests | Ready | Ready | - |
| Purchase Requests | Ready | Ready | - |
| Bidding Management | Ready | Ready | - |
| Warehouse Locations | Ready | Ready | - |
| Suppliers | Ready | Ready | - |
| Inbound | Ready | Ready | - |
| Outbound | Ready | Ready | - |
| Stocktake | Ready | Ready | - |
| Lifecycle | Ready | Ready | - |
| Item History | Ready | Ready | - |
| Goods History | Ready | Ready | - |
| Reports | Hybrid | Mock Data | Medium |
| Dashboard | Hybrid | Partial | Medium |
