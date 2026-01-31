# PowerTrack Logistics - O&M Inventory Management System

> Hệ thống quản lý vật tư, kho bãi cho nhà máy điện

## Tech Stack

- **Frontend**: Next.js 15.5, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma 7 ORM
- **Database**: PostgreSQL (Docker)
- **UI Components**: Radix UI + shadcn/ui

## Quick Start

```bash
# Install dependencies
npm install

# Start PostgreSQL (Docker)
docker-compose up -d

# Sync database schema
npx prisma db push

# Seed master data
npx prisma db seed

# Start development server
npm run dev
```

App runs at: http://localhost:9002

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── materials/          # Quản lý vật tư
│   ├── suppliers/          # Quản lý nhà cung cấp
│   ├── warehouses/         # Quản lý kho
│   ├── material-requests/  # Yêu cầu vật tư
│   ├── purchase-requests/  # Yêu cầu mua sắm
│   ├── biddings/           # Đấu thầu
│   ├── inbound/            # Nhập kho
│   ├── outbound/           # Xuất kho
│   ├── stock-take/         # Kiểm kê
│   ├── reports/            # Báo cáo
│   ├── users/              # Quản lý người dùng
│   ├── roles/              # Quản lý vai trò
│   ├── settings/           # Cài đặt
│   └── api/                # API Routes
├── components/             # Reusable UI components
├── hooks/                  # Custom React hooks
└── lib/                    # Utilities & database client
prisma/
├── schema.prisma           # Database schema (24 master data + business tables)
└── seed.ts                 # Seed data for master tables
```

## NPM Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server (port 9002) |
| `npm run build` | Build for production |
| `npm run db:push` | Sync Prisma schema to DB |
| `npm run db:seed` | Seed master data |
| `npm run db:studio` | Open Prisma Studio |

## Documentation

- [System Architecture](./docs/system-architecture.md) - Includes API endpoints & hooks
- [Database Schema](./docs/database-schema.md) - 24 master data + business tables
