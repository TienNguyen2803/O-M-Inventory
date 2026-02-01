# Phase 3: Cleanup & Testing

## Context
After migration, we must clean up the technical debt (mock data) and verify the system works end-to-end.

## Objectives
- Remove mock Inbound data.
- Verify Stock Updates work as expected.

## Requirements
- No references to `inboundReceipts` from `src/lib/data.ts`.
- System passes functional tests.

## Files to Modify
- `src/lib/data.ts`

## Implementation Steps
1.  **Cleanup**:
    - Remove `inboundReceipts` export from `src/lib/data.ts`.
    - Check for any other file importing it.
2.  **Testing**:
    - Run through the "Test Cases" defined in the Plan.
    - Check Database entries using `prisma studio` or `psql` (if available) or just logs.

## Todo List
- [ ] Remove `inboundReceipts` from `src/lib/data.ts`
- [ ] Manual verification of features.
