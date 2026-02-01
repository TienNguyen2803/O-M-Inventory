# Code Review: Outbound Management Implementation

**Date:** 2026-02-01
**Reviewer:** code-reviewer
**Scope:** API Routes, Frontend Components, Validation

## Code Review Summary

### Scope
- Files reviewed: 8 files
- Lines analyzed: ~1,100
- Focus: Critical issues - security, error handling, consistency

### Overall Assessment

Implementation follows existing patterns (consistent with inbound module). Uses Prisma ORM (no SQL injection risk), Zod validation, proper error handling. TypeScript compiles without errors. A few medium-priority issues identified.

---

## Critical Issues

**None found.**

---

## High Priority Findings

### 1. Race Condition in Receipt Code Generation
**File:** `src/app/api/outbound/route.ts` (lines 104-109)

```typescript
const count = await prisma.outboundReceipt.count({
  where: { receiptCode: { startsWith: `PXK-${year}${month}` } },
});
receiptCode = `PXK-${year}${month}-${String(count + 1).padStart(3, "0")}`;
```

**Problem:** Concurrent requests can generate duplicate codes.

**Fix:** Use database sequence or `$transaction` with atomic increment.

---

### 2. No Negative Stock Validation on Issue
**File:** `src/app/api/outbound/[id]/issue/route.ts` (lines 60-68)

Stock is decremented without checking if sufficient quantity exists.

```typescript
// 2a. Decrement Material Stock
await tx.material.update({
  where: { id: item.materialId },
  data: { stock: { decrement: item.issuedQuantity } },
});
```

**Problem:** Stock can go negative if issued quantity > available stock.

**Fix:** Add stock check before decrement:
```typescript
const material = await tx.material.findUnique({ where: { id: item.materialId } });
if (material.stock < item.issuedQuantity) {
  throw new Error(`Insufficient stock for ${material.name}`);
}
```

---

## Medium Priority Improvements

### 3. Missing Authorization
**File:** `src/app/api/outbound/route.ts` (lines 112-119)

Uses first user as default `createdBy`:
```typescript
const defaultUser = await prisma.user.findFirst();
```

**Note:** Comment acknowledges this is placeholder. Should integrate with auth when available.

---

### 4. Duplicated Code in Issue Endpoints
**Files:**
- `src/app/api/outbound/[id]/route.ts` (PUT with isIssuing)
- `src/app/api/outbound/[id]/issue/route.ts`

Both handle stock decrement logic with similar code. Consider extracting to shared service.

---

### 5. Missing Error Handling for API Fetch in Form
**File:** `src/app/outbound/_components/outbound-form.tsx` (lines 119-129)

```typescript
}).catch(console.error);
```

Silent failure - user not notified if lookup data fails to load.

---

## Low Priority Suggestions

### 6. Filter Button is Non-functional
**File:** `src/app/outbound/_components/outbound-client.tsx` (line 310-313)

```tsx
<Button variant="outline">
  <Filter className="mr-2 h-4 w-4" />
  Lọc
</Button>
```

Button has no onClick handler. Filters already work via onChange - button may be redundant.

---

## Positive Observations

1. **Consistent Patterns** - Follows inbound module structure exactly
2. **Proper Validation** - Zod schema with meaningful error messages
3. **Transaction Safety** - Stock updates wrapped in `$transaction`
4. **Workflow Guards** - Cannot modify/delete issued receipts
5. **TypeScript** - Compiles clean, proper typing throughout
6. **UI/UX** - Stepper, form validation, proper disabled states in view mode

---

## Recommended Actions

1. **[HIGH]** Add stock availability check before decrementing in issue flow
2. **[HIGH]** Fix race condition in receipt code generation with atomic operation
3. **[MEDIUM]** Add user feedback when lookup API calls fail in form
4. **[LOW]** Remove or implement Filter button functionality

---

## Metrics

| Metric | Value |
|--------|-------|
| TypeScript Errors | 0 |
| Linting Issues | N/A (focused review) |
| Security Issues | 0 critical, 0 high |
| Code Consistency | High (matches inbound patterns) |

---

## Unresolved Questions

1. Is authentication planned? Current placeholder approach acceptable for MVP?
2. Should stock validation be enforced at DB level (CHECK constraint) or app level?
