# Code Standards & Guidelines

**Stack:** Next.js 15.5, TypeScript, Prisma 7, Tailwind CSS, Shadcn UI.

## 1. Directory Structure & Naming

### Files
- **Components**: `kebab-case.tsx` (e.g., `material-form.tsx`)
- **Pages**: `page.tsx`
- **Layouts**: `layout.tsx`
- **Utilities**: `kebab-case.ts`

### Components
- **Location**:
    - Global reusable: `src/components/ui/` (Shadcn), `src/components/shared/`
    - Feature-specific: `src/app/(feature)/_components/`
- **Naming**: PascalCase function names (e.g., `export function MaterialList()`)

## 2. React / Next.js Patterns

### Server vs. Client Components
- **Default**: Use Server Components (`RSC`) for data fetching and layout structure
- **Client**: Add `"use client"` only when:
    - Using hooks (`useState`, `useEffect`, `useForm`)
    - Handling event listeners (`onClick`, `onChange`)
    - Using browser-only APIs

### Data Fetching
- **Server Side**: Direct Prisma calls in Server Actions or API Routes
- **Client Side**: Fetch from internal API (`/api/...`) using `useEffect` or `swr`
    - *Avoid*: Direct database calls from Client Components

## 3. Form Handling
- **Library**: `react-hook-form`
- **Validation**: `zod`
- **Pattern**:
    1. Define Zod schema in a separate variable or file
    2. Infer TypeScript type from Zod schema (`z.infer<typeof Schema>`)
    3. Use `Form`, `FormControl`, `FormField` from Shadcn UI

```typescript
const formSchema = z.object({
  name: z.string().min(2),
  count: z.coerce.number().min(0),
});

export function MyForm() {
  const form = useForm<z.infer<typeof formSchema>>({...});
}
```

## 4. Validation Schemas (API)

Zod schemas in `src/lib/validations/`:

| File | Entity |
|------|--------|
| `warehouse-location.ts` | WarehouseLocation CRUD |
| `inbound.ts` | InboundReceipt validation |
| `outbound.ts` | OutboundReceipt validation |
| `stocktake.ts` | Stocktake, Assignment, Result |
| `lifecycle.ts` | MaterialEvent, Installation |

**Validation Pattern for API Routes:**

```typescript
import { stocktakeSchema } from "@/lib/validations/stocktake";

export async function POST(request: Request) {
  const body = await request.json();
  const result = stocktakeSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.flatten() },
      { status: 400 }
    );
  }
  // Use result.data (typed and validated)
}
```

## 5. UI/UX Guidelines (Shadcn)
- **Imports**: Import primitives from `@/components/ui/...`
- **Customization**: Use `cn()` utility to merge Tailwind classes
- **Icons**: Use `lucide-react`

## 6. Database & Prisma
- **Schema**: Keep `schema.prisma` as the source of truth
- **Migrations**: Run `npx prisma db push` (dev) or `migrate` (prod) after changes
- **Clients**: Use global singleton from `src/lib/db.ts`

## 7. API Routes
- **Path**: `src/app/api/[resource]/route.ts`
- **Methods**: Export named functions: `GET`, `POST`, `PUT`, `DELETE`
- **Response**: Use `NextResponse.json(...)`
- **Error Handling**: Wrap in `try/catch`, return appropriate HTTP status (400, 404, 500)

## 8. Transactional Patterns

For multi-record operations, use Prisma transactions:

```typescript
await prisma.$transaction(async (tx) => {
  await tx.stocktakeResult.deleteMany({ where: { stocktakeId: id } });
  await tx.stocktakeResult.createMany({
    data: results.map((r) => ({ ...r, stocktakeId: id })),
  });
  return tx.stocktake.update({ where: { id }, data: { ...parentData } });
});
```

## 9. Auto-Generated Codes

Use pattern `PREFIX-YYYY-XXX`:

| Entity | Pattern | Example |
|--------|---------|---------|
| Bidding Package | `TB-YYYY-XX` | TB-2026-01 |
| Purchase Request | `PR-YYYY-XXX` | PR-2026-001 |
| Material Request | `MR-YYYY-XXX` | MR-2026-001 |
| Inbound Receipt | `NK-YYYY-XXX` | NK-2026-001 |
| Outbound Receipt | `XK-YYYY-XXX` | XK-2026-001 |
| Stocktake | `KK-YYYY-XXX` | KK-2026-001 |

**Implementation:**

```typescript
const year = new Date().getFullYear();
const count = await prisma.stocktake.count({
  where: { takeCode: { startsWith: `KK-${year}` } },
});
const takeCode = `KK-${year}-${String(count + 1).padStart(3, "0")}`;
```

## 10. FK Relations Pattern

All business entities use FK relations to master data:

```typescript
// Model definition (Prisma)
model Stocktake {
  statusId    String
  status      StocktakeStatus @relation(fields: [statusId], references: [id])
  areaId      String
  area        StocktakeArea   @relation(fields: [areaId], references: [id])
}

// API response includes nested objects
const data = await prisma.stocktake.findMany({
  include: { status: true, area: true, createdBy: { select: { id: true, name: true } } }
});
```

## 11. Lifecycle Tracking Pattern

Material lifecycle events are created automatically by business operations:

```typescript
// After inbound receipt completion
await prisma.materialEvent.create({
  data: {
    materialId,
    eventType: "INBOUND",
    eventDate: new Date(),
    actorId: userId,
    actorName: userName,
    referenceType: "InboundReceipt",
    referenceId: receiptId,
    referenceCode: receiptCode,
    description: `Received ${quantity} units`,
  },
});
```
