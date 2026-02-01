# Design Guidelines

**System:** PowerTrack Logistics (O-M-Inventory)
**Framework:** Shadcn UI + Tailwind CSS

## 1. Visual Identity

### Color Palette

| Role | Color | Hex | Usage |
|------|-------|-----|-------|
| **Primary** | Professional Blue | `#2E9AFE` | Main buttons, active states, headers. Evokes trust and stability. |
| **Secondary** | Light Blue | `#E0F2F7` | Backgrounds, sidebar highlights. Creates a clean, professional backdrop. |
| **Accent** | Orange | `#FFB347` | Call-to-action, warnings, key interactive elements. |
| **Destructive** | Red | `#ef4444` | Delete actions, error states. |
| **Text** | Slate | `#0f172a` | Primary text color. |
| **Muted** | Slate Gray | `#64748b` | Secondary text, placeholders. |

### Typography

- **Font Family**: `Inter` (Sans-serif). Modern, legible, and standard for dashboard interfaces.
- **Weights**:
    - Regular (400): Body text.
    - Medium (500): Labels, table headers.
    - Semibold (600): Section headers, button text.
    - Bold (700): Page titles.

## 2. Component Usage (Shadcn UI)

### Buttons
- **Primary**: `default` variant. Used for "Submit", "Save", "Create".
- **Secondary**: `outline` or `secondary` variant. Used for "Cancel", "Back".
- **Destructive**: `destructive` variant. Used for "Delete", "Reject".
- **Ghost**: `ghost` variant. Used for icons in tables or navigation.

### Cards
- Used to group related content (e.g., "Material Details", "Stock Level").
- **Header**: Clear title + optional description.
- **Content**: Padding `p-6`.
- **Footer**: Actions (if applicable).

### Forms
- **Layout**: Vertical stack for mobile, Grid for desktop.
- **Labels**: Always visible above inputs.
- **Validation**: Inline error messages in red below the input.
- **Required**: Marked with `*` or implied by context (validate on submit).

### Data Tables (TanStack Table)
- **Header**: Sticky top.
- **Rows**: Hover effect for readability.
- **Pagination**: Bottom right.
- **Filtering**: Toolbar above the table.
- **Actions**: Row actions menu (3 dots) at the end of the row.

## 3. Layout Patterns

### Dashboard Layout
- **Sidebar**: Fixed left navigation. Dark or Light tailored to brand. Collapsible on mobile.
- **Header**: Global search, Notifications, User Profile.
- **Main Content**: Scrollable area with padding.

### Page Structure
1.  **Page Header**: Breadcrumbs + Title + Primary Action (top right).
2.  **Filters/Search**: If applicable (List views).
3.  **Content**: Table or Grid of Cards.
4.  **Feedback**: Toasts for success/error messages (Top right).

## 4. Iconography
- **Library**: `lucide-react`.
- **Style**: Stroke width 2px, consistent size (usually `w-4 h-4` or `w-5 h-5`).
- **Meaning**:
    - `Plus`: Add/Create.
    - `Trash2`: Delete.
    - `Pencil`: Modify.
    - `Eye`: View details.
    - `ArrowRight`: Navigation.
