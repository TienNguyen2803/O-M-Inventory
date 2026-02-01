# Deployment Guide

**Application:** PowerTrack Logistics (O-M-Inventory)
**Stack:** Next.js (Node.js), PostgreSQL, Docker.

## 1. Environment Requirements

### Production Server
- **OS**: Linux (Ubuntu 22.04 LTS recommended)
- **Runtime**: Node.js 18.17+
- **Containerization**: Docker & Docker Compose
- **Database**: PostgreSQL 15+ (Managed or Containerized)
- **RAM**: Minimum 2GB (4GB recommended for build process)

### Environment Variables
Create a `.env.production` file based on `.env.example`:

```bash
# Database (Connection Pooling is recommended for Serverless/Next.js)
DATABASE_URL="postgresql://user:password@host:5432/dbname?schema=public&pgbouncer=true"
DIRECT_URL="postgresql://user:password@host:5432/dbname?schema=public"

# Authentication (If NextAuth/Clerk is added)
NEXTAUTH_SECRET="your-generated-secret"
NEXTAUTH_URL="https://your-domain.com"

# App Config
NEXT_PUBLIC_APP_URL="https://your-domain.com"
```

## 2. Deployment Strategies

### Option A: Docker Compose (Self-Hosted)
Best for on-premise or simple VPS deployment.

1.  **Build the Image**:
    ```bash
    docker build -t om-inventory .
    ```

2.  **Run with Compose**:
    Use the provided `docker-compose.yml` (ensure it is configured for production, not just dev).
    ```bash
    docker-compose -f docker-compose.prod.yml up -d
    ```
    *(Note: You may need to create a `docker-compose.prod.yml` that removes volume bindings for code and sets NODE_ENV=production)*

### Option B: Vercel (Managed)
Best for scalability and ease of use.

1.  **Push code** to GitHub/GitLab.
2.  **Import Project** in Vercel.
3.  **Configure Environment Variables** in Vercel Dashboard.
4.  **Database**: Use a managed Postgres (e.g., Vercel Postgres, Neon, Supabase, or RDS).
    - Update `DATABASE_URL` in Vercel env vars.
5.  **Build Command**: `npx prisma generate && next build`
    - *Crucial*: Prisma client must be generated before build.

### Option C: Traditional Node.js (VPS/PM2)

1.  **Clone Repo** to server.
2.  **Install Dependencies**:
    ```bash
    npm ci --production
    ```
3.  **Generate Prisma Client**:
    ```bash
    npx prisma generate
    ```
4.  **Build**:
    ```bash
    npm run build
    ```
5.  **Run with PM2**:
    ```bash
    pm2 start npm --name "om-inventory" -- start
    ```

## 3. Database Management

### Migrations
In production, **do not** use `db push`. Use Migrations.

1.  **Create Migration** (Locally):
    ```bash
    npx prisma migrate dev --name init_deployment
    ```
2.  **Apply Migration** (Production):
    ```bash
    npx prisma migrate deploy
    ```

### Seeding
To initialize Master Data in production:
```bash
npx tsx prisma/seed.ts
```

## 4. Monitoring & Maintenance

- **Logs**:
    - Vercel: Built-in runtime logs.
    - Docker: `docker logs -f <container_id>`.
    - PM2: `pm2 logs`.
- **Backups**:
    - Schedule daily `pg_dump` backups of the PostgreSQL database.
- **Updates**:
    1.  Pull new code.
    2.  Install deps.
    3.  Run migrations (`npx prisma migrate deploy`).
    4.  Rebuild & Restart.

## 5. Troubleshooting Common Issues

- **Prisma Client Not Found**: Ensure `npx prisma generate` is run during the build phase.
- **Connection Limit Exceeded**: Next.js Serverless functions can exhaust DB connections. Use a connection pooler (PgBouncer or Supabase/Neon pooling).
- **Build Fails on Type Errors**: Run `npm run lint` and fix TypeScript errors before deploying.
