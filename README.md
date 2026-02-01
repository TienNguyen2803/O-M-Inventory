# PowerTrack Logistics - O&M Inventory Management System

> **Status:** Active Development (Hybrid State)
> **Version:** 1.2.0

A comprehensive inventory management system for Power Plant Operation & Maintenance (O&M), built with the modern Next.js 14 stack.

## 🚀 Tech Stack

- **Frontend**: Next.js 15.5 (App Router), React 19, TypeScript, Tailwind CSS
- **UI Library**: Shadcn/ui (Radix Primitives)
- **Backend**: Next.js API Routes (Serverless)
- **Database**: PostgreSQL (via Docker)
- **ORM**: Prisma 7
- **Validation**: Zod + React Hook Form

## 📚 Documentation

We maintain detailed documentation in the `docs/` directory:

- **[Project Overview & PDR](./docs/project-overview-pdr.md)**: Vision, core modules, and requirements.
- **[Codebase Summary](./docs/codebase-summary.md)**: Detailed breakdown of the project structure and current "Hybrid" state (Real vs Mock).
- **[System Architecture](./docs/system-architecture.md)**: Technical design, data flow, and API endpoints.
- **[Code Standards](./docs/code-standards.md)**: Development guidelines and patterns.
- **[Roadmap](./docs/project-roadmap.md)**: Development phases and feature status.
- **[Database Schema](./docs/database-schema.md)**: Entity-Relationship details (Master Data + Business Tables).

## 🛠️ Quick Start

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

## 🧩 Module Status

The application is currently in a **Hybrid State**:

| Module | Status | Description |
|--------|--------|-------------|
| **Materials** | ✅ Live | Connected to DB. Full CRUD. |
| **Requests** | ✅ Live | Connected to DB. Approval workflow. |
| **Users/Roles**| ✅ Live | RBAC System fully functional. |
| **Warehouse Locations** | ✅ Live | Full CRUD with FK relations. |
| **Suppliers** | ✅ Live | Full CRUD with contacts management. FK relations. |
| **Inbound** | 🚧 Prototype | UI + partial API. Mock data. |
| **Outbound** | 🚧 Prototype | UI only. Mock data. |
| **Reports** | ⚠️ Hybrid | UI exists, calculations are client-side. |

## 📂 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/                # Backend API Routes (Real)
│   ├── materials/          # Materials Module (Real)
│   ├── material-requests/  # Request Module (Real)
│   ├── warehouses/         # Warehouse Locations (Real)
│   ├── suppliers/          # Suppliers Module (Real)
│   ├── inbound/            # Inbound Module (Prototype)
│   └── ...
├── components/             # Shadcn UI & Shared Components
├── lib/
│   ├── prisma.ts           # DB Client
│   ├── validations/        # Zod validation schemas
│   └── data.ts             # ⚠️ Legacy/Mock Data (to be deprecated)
└── ...
```

## 🤝 Contributing

Please read [Code Standards](./docs/code-standards.md) before contributing.
- Use **kebab-case** for filenames.
- Prefer **Server Components** where possible.
- Update documentation when modifying features.
