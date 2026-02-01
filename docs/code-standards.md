# Code Standards & Guidelines

**Stack:** Next.js 14, TypeScript, Prisma, Tailwind CSS, Shadcn UI.

## 1. Directory Structure & Naming

### Files
- **Components**: `kebab-case.tsx` (e.g., `material-form.tsx`).
- **Pages**: `page.tsx`.
- **Layouts**: `layout.tsx`.
- **Utilities**: `kebab-case.ts`.

### Components
- **Location**:
    - Global reusable: `src/components/ui/` (Shadcn), `src/components/shared/`.
    - Feature-specific: `src/app/(feature)/_components/`.
- **Naming**: PascalCase function names (e.g., `export function MaterialList()`).

## 2. React / Next.js Patterns

### Server vs. Client Components
- **Default**: Use Server Components (`RSC`) for data fetching and layout structure.
- **Client**: Add `"use client"` only when:
    - Using hooks (`useState`, `useEffect`, `useForm`).
    - Handling event listeners (`onClick`, `onChange`).
    - Using browser-only APIs.

### Data Fetching
- **Server Side**: Direct Prisma calls in Server Actions or API Routes.
- **Client Side**: Fetch from internal API (`/api/...`) using `useEffect` or `swr` (preferred).
    - *Avoid*: Direct database calls from Client Components (impossible/insecure).

## 3. Form Handling
- **Library**: `react-hook-form`.
- **Validation**: `zod`.
- **Pattern**:
    1. Define Zod schema in a separate variable or file.
    2. Infer TypeScript type from Zod schema (`z.infer<typeof Schema>`).
    3. Use `Form`, `FormControl`, `FormField` from Shadcn UI.

```typescript
// Example
const formSchema = z.object({
  name: z.string().min(2),
  count: z.coerce.number().min(0),
});

export function MyForm() {
  const form = useForm<z.infer<typeof formSchema>>({...});
  // ...
}
```

## 4. Validation Schemas (API)

For API route validation, use Zod schemas in `src/lib/validations/`:

```typescript
// src/lib/validations/warehouse-location.ts
import { z } from "zod";

export const warehouseLocationSchema = z.object({
  code: z.string().min(1, "Code is required"),
  name: z.string().min(1, "Name is required"),
  areaId: z.string().uuid("Invalid area ID"),
  typeId: z.string().uuid("Invalid type ID"),
  statusId: z.string().uuid("Invalid status ID"),
  barcode: z.string().optional(),
  maxWeight: z.number().optional(),
  dimensions: z.string().optional(),
});

export type WarehouseLocationInput = z.infer<typeof warehouseLocationSchema>;
```

**Validation Pattern for API Routes:**

```typescript
// In API route
import { warehouseLocationSchema } from "@/lib/validations/warehouse-location";

export async function POST(request: Request) {
  const body = await request.json();
  const result = warehouseLocationSchema.safeParse(body);

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
- **Imports**: Import primitives from `@/components/ui/...`.
- **Customization**: Use `cn()` utility to merge Tailwind classes.
- **Icons**: Use `lucide-react`.

## 6. Database & Prisma
- **Schema**: Keep `schema.prisma` as the source of truth.
- **Migrations**: Always run `npx prisma db push` (dev) or `migrate` (prod) after schema changes.
- **Clients**: Use the global singleton from `src/lib/prisma.ts` to prevent connection exhaustion.

## 7. API Routes
- **Path**: `src/app/api/[resource]/route.ts`.
- **Methods**: Export named functions: `GET`, `POST`, `PUT`, `DELETE`.
- **Response**: Use `NextResponse.json(...)`.
- **Error Handling**: Wrap logic in `try/catch` and return appropriate HTTP status codes (400, 404, 500).

## 8. Mock vs. Real Data (Hybrid State)
- **Strict Separation**:
    - If a module is **Real**: Do NOT import from `src/lib/data.ts`. Fetch from API.
    - If a module is **Mock**: You may use `src/lib/data.ts` temporarily.
- **Transition**: When upgrading a module, strictly delete the mock data reference and switch to the API hook.
