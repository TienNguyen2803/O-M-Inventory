# PowerTrack Logistics - O&M Inventory Management System

> **Status:** Active Development
> **Version:** 1.4.0

A comprehensive inventory management system for Power Plant Operation & Maintenance (O&M), built with modern Next.js stack.

## Tech Stack

- **Frontend**: Next.js 15.5 (App Router), React 19, TypeScript, Tailwind CSS
- **UI Library**: shadcn/ui (Radix Primitives), recharts, lucide-react
- **Backend**: Next.js API Routes (Serverless)
- **Database**: PostgreSQL (via Docker)
- **ORM**: Prisma 7 with PrismaPg adapter
- **Validation**: Zod + React Hook Form
- **AI**: Firebase Genkit with Gemini 2.5 Flash

## Documentation

We maintain detailed documentation in the `docs/` directory:

- **[Project Overview & PDR](./docs/project-overview-pdr.md)**: Vision, core modules, requirements
- **[Codebase Summary](./docs/codebase-summary.md)**: Project structure and module status
- **[System Architecture](./docs/system-architecture.md)**: Technical design, data flow, API endpoints
- **[Code Standards](./docs/code-standards.md)**: Development guidelines and patterns
- **[Roadmap](./docs/project-roadmap.md)**: Development phases and feature status
- **[Database Schema](./docs/database-schema.md)**: Entity-Relationship details

## Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Start PostgreSQL Database
docker-compose up -d

# 3. Sync Database Schema
npx prisma db push

# 4. Seed Master Data
npx prisma db seed

# 5. Start Development Server
npm run dev
```

App runs at: [http://localhost:9002](http://localhost:9002)

## Module Status

| Module | Status | Description |
|--------|--------|-------------|
| **Materials** | Live | Full CRUD, search, filtering, master data integration |
| **Material Requests** | Live | Request creation, approval workflow, status tracking |
| **Purchase Requests** | Live | Procurement workflow with items and approvals |
| **Bidding Management** | Live | Full bidding workflow: invite, receive, evaluate, select winner |
| **Users/Roles** | Live | RBAC system with feature-action permissions |
| **Warehouse Locations** | Live | Full CRUD with FK relations to master data |
| **Suppliers** | Live | Full CRUD with contacts management |
| **Inbound** | Live | Goods receipt with FK relations |
| **Outbound** | Live | Goods issue with approve/issue workflow, stock decrement |
| **Stocktake** | Live | Physical inventory counting with assignments and reconciliation |
| **Reports** | Hybrid | UI exists, calculations are client-side |
| **Dashboard** | Hybrid | Charts with partial live data |

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/                # Backend API Routes (19 endpoint groups, 44+ routes)
│   ├── materials/          # Materials Module
│   ├── material-requests/  # Material Request Module
│   ├── purchase-requests/  # Purchase Request Module
│   ├── biddings/           # Bidding Management Module
│   ├── inbound/            # Inbound Logistics Module
│   ├── outbound/           # Outbound Logistics Module
│   ├── stock-take/         # Stocktake Module
│   ├── warehouses/         # Warehouse Locations Module
│   ├── suppliers/          # Suppliers Module
│   ├── users/              # User Management
│   ├── roles/              # Role Management
│   └── ...
├── components/
│   ├── ui/                 # 35+ shadcn/ui components
│   ├── layout/             # AppLayout, AppHeader, SidebarNav
│   └── shared/             # Shared components
├── lib/
│   ├── db.ts               # Prisma client singleton
│   ├── types.ts            # TypeScript interfaces
│   ├── validations/        # Zod validation schemas
│   └── master-data-tables.ts # 24 master data table mappings
├── hooks/                  # Custom React hooks
└── contexts/               # Auth context
```

## Contributing

Please read [Code Standards](./docs/code-standards.md) before contributing.
- Use **kebab-case** for filenames
- Prefer **Server Components** where possible
- Update documentation when modifying features
