# Phase 2: Frontend Refactoring

## Context
Once the API is ready, we need to update the Frontend to use it instead of the mock data in `src/lib/data.ts`.

## Objectives
- Replace static data fetching with API calls.
- Update `InboundClient` to handle async operations, loading states, and error handling.
- Ensure the Form submits correctly to the API.

## Requirements
- `InboundClient` should use `fetch` or `SWR`/`React Query` (or simple `useEffect` fetch for now to match project style if any). *Observation*: Project uses `useState` + `useEffect` in some places, or Server Actions? The prompt implied `SWR/Fetch`. We'll use standard `fetch` in `useEffect` or `swr` if available in package.json.
- *Check*: Check `package.json` for `swr` or `tanstack/react-query`. If not, use `fetch` + `useEffect`.

## Files to Modify
- `src/app/inbound/page.tsx`
- `src/app/inbound/_components/inbound-client.tsx`
- `src/app/inbound/_components/inbound-form.tsx`

## Implementation Steps
1.  **Server Component Update**:
    - In `src/app/inbound/page.tsx`, fetching might not be needed if we move to client-side fetching for search/filter, OR we fetch initial data on server and pass to client.
    - *Decision*: Fetch initial data on server (GET /api/inbound?limit=10) to pass as initial state.
2.  **Client Logic Update**:
    - In `InboundClient`:
        - Replace `initialReceipts` prop usage with a state that can be refreshed.
        - Implement `fetchReceipts` function.
        - Update `handleAdd`, `handleEdit` to call API.
        - Update `handleDelete` to call API.
3.  **Form Integration**:
    - Update `InboundForm` to prepare the payload correctly (dates, numbers).
    - Handle validation errors from API.

## Todo List
- [ ] Check `package.json` for fetch libraries.
- [ ] Update `src/app/inbound/page.tsx`
- [ ] Refactor `InboundClient`
- [ ] Refactor `InboundForm`
