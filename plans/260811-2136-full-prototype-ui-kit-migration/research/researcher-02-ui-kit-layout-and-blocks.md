# UI Kit Component & Layout Reference — Full Prototype Migration

## Overview
Fetched 18 component docs + design tokens/blocks/AI-rules resources from https://ui.ikameglobal.com. All component docs returned successfully; Part 2 resources mostly 404 (SPA rendering limitation). CSS/tokens embedded in kit itself; LLM guidelines found in `/llms-full.txt`.

---

## Part 1: Component Reference by Category

### Layout & Navigation

**Sidebar (BlockSidebarLayout)** — *Maps: App shell header/left-nav (OverviewPage, DetailPage, CollectionPage)*
- Props: `groups[]`, `footerGroups[]`, `activeId`, `onNavigate`, `header`, `footer`, `defaultCollapsed`, `collapsed`, `onCollapsedChange`, `collapseMode` ("collapse"|"hide")
- Layout: `sticky top-0 h-screen` for standalone; `BlockSidebarLayout` fills viewport root
- **Common mistakes:** BlockSidebarLayout inside height-constrained wrapper; min-h-screen allowing growth; Sidebar inside overflow-hidden parent (breaks sticky)
- Design System 1.1 tokens found: `bg_sidebar_primary`, `radius_6`, `body_s`
- SidebarTrigger for collapse toggle, nested SidebarNavItem with optional badges/dots/disabled state

**SimpleSidebar** — *Alt: icon-only or collapsible nav*
- Props: `groups[]`, `activeId`, `onNavigate`, `header`, `footer`, `alwaysExpanded`, `expandedWidth`, `collapsedWidth`
- Behavior: defaults collapsed, expands on hover; toggle via `alwaysExpanded`
- Limitation: no nested sub-items, badges, or dots

**Breadcrumb** — *Maps: DetailPage context (e.g., Dashboard > Events > My-iKame v1.1)*
- Props: `items[]` (label, href, icon), `separator` (default ChevronRight), `maxItems` (collapse to popover), `className`
- DS 1.1 tokens: `text_tertiary`, `state_neutral_max`, `text_primary`, `body_s`, `icon_tertiary`

---

### Data Display

**Table (DataTable)** — *Maps: CollectionPage rosters (event list, my-team list, RSVP table)*
- Full-featured: sorting, filtering, row selection, expandable rows, tree, column pinning, pagination, virtualization, grouped headers, summary rows
- Core props: `data[]`, `columns[]`, `loading`, `emptyMessage`, `bordered`, `striped`, `size` ("default"|"compact"), `stickyHeader`, `scroll`, `virtual`
- Column definition: `id`, `header`, `accessorKey`, `cell`, `width`, `minWidth`, `maxWidth`, `align`, `pin` ("left"|"right"), `sortable`, `filterable`, `filterType` ("text"|"select")
- Row selection: `type` ("checkbox"|"radio"), `selectedRowKeys`, `onChange`, `getCheckboxProps`
- Pagination: `pageIndex`, `pageSize`, `total`, `onChange`, `pageSizeOptions` (default [10,20,50,100]), `showSizeSelector`, `showTotal`
- **Use @tanstack/react-table internally**

**Card** — *Maps: event summary cards, news cards on OverviewPage*
- Props: `shadow` ("none"|"xs"|"sm"|"md"|"lg"|"xl", default "xs"), `hoverable` (adds hover shadow)
- Composable: Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter

**Progress** — *Maps: event registration %, RSVP completion meter*
- Props: `value`, `max` (default 100), `indeterminate`, `size` ("sm"|"md"|"lg"), `variant` ("default"|"success"|"warning"|"error"), `showLabel`, `label`

**Skeleton** — *Maps: loading states for Card, Table, List rows*
- Accepts div HTML attributes; compose with space-y/h/w utils; apply radius_round for circles
- No variants/sizes; pure Tailwind composition

---

### Input & Selection

**SegmentedControl** — *Maps: CollectionPage filters (News/Events tabs, etc.)*
- Props: `options[]` (value, label, icon?, disabled?), `value`, `defaultValue`, `onValueChange`, `size` ("xs"|"s"|"m"|"l", default "m"), `disabled`
- DS 1.1: `bg_tertiary` track, `bg_primary` + `shadow_s` active item
- Sizes: 26px item height, 10px h-padding (generated token utilities)

**Slider** — *Maps: event date range filter, capacity filtering*
- Props: `value[]`, `defaultValue[]`, `onValueChange`, `min` (0), `max` (100), `step` (1), `disabled`
- Single thumb or range (two thumbs); wraps Radix UI Slider

**Calendar** — *Maps: event date selection, rsvp cutoff picker*
- Modes: "single" (default) or "range"
- Single: `value`, `defaultValue`, `onValueChange`, `minDate`, `maxDate`, `disabledDates` (Date[] | function), `dayDecorators` (Range|Weekly|Yearly rules), `weekDayLabels`
- Range: `value` ({from?, to?}), `defaultValue`, `onValueChange`, `dayDecorators`
- DayDecoratorRule: `display` ("below"|"background")

**DatePicker** — *Maps: event cutoff/announcement date input*
- Props: `mode` ("date"|"time"|"datetime", default "date"), `value`, `defaultValue`, `onValueChange`, `placeholder`, `minDate`, `maxDate`, `disabledDates`, `disabled`, `size` ("xs"|"s"|"m"|"l"|"xl"), `variant` ("light"|"fill"|"dim"|"borderless")

**DateRangePicker** — *Maps: event date range selection, registration window*
- Props: `value` (DateRange), `defaultValue`, `onValueChange`, `presets[]` ({label, range}), `showPresets` (default true), `minDate`, `maxDate`, `disabledDates`

**ScrollArea** — *Maps: long sidebar content, event details overflow*
- Props: `orientation` ("vertical"|"horizontal"|"both", default "vertical"), `viewportClassName`, `overflowFade` (trailing gradient cue), `overflowFadeClassName`
- Inherits all Radix ScrollArea.Root props

**VirtualList** — *Maps: large event lists, team member lists, paginated data*
- Props: `items[]` (required), `estimateSize` (number | function), `renderItem` (item, index) => ReactNode, `overscan` (5), `getItemKey`, `className` (must set height)
- Use for 100+ rows; 48–64px typical row height

---

### Progress & Feedback

**Steps** — *Maps: RSVP flow (Register → Pay → Confirm → Done)*
- Props: `steps[]`, `currentStep` (0-indexed), `orientation` ("horizontal"|"vertical"), `variant` ("number"|"dot"|"icon")
- Step: `content`, `secondaryContent`, `icon` (for variant="icon")

**Spinner** — *Maps: async action states (RSVP submission, loading event details)*
- Props: `size` ("xs"|"sm"|"md"|"lg"|"xl"), `variant` ("default"|"inherit"), `label` (default "Loading", aria-label)

**Pagination** — *Maps: CollectionPage (event list, team roster)*
- Props: `total`, `pageSize`, `pageIndex`, `onPageChange`, `onPageSizeChange`, `pageSizeSuffix`, `pageSizeOptions`, `showSizeSelector`, `showTotal` (default true), `siblingCount` (default 1), `renderTotal`, `className`

**Toast** — *Maps: RSVP confirmation, error feedback, success notifications*
- Props: `position` (6 corners, default "top-right"), `expand`, `richColors` (default true), `closeButton` (true), `duration` (4000ms), `className`
- Variants: `toast()`, `toast.success()`, `toast.error()`, `toast.warning()`, `toast.info()`, `toast.loading()`, `toast.promise()`
- Setup: `<Toaster />` at app root; import {Toaster, toast} from "@frontend-team/ui-kit"

---

## Part 2: Design Tokens, Blocks & LLM Guidelines

### Design Tokens
**Status:** Design tokens embedded in kit CSS, not exposed as separate doc. Found DS 1.1 token references in component docs:
- `bg_sidebar_primary`, `bg_tertiary`, `bg_primary`
- `text_tertiary`, `text_primary`
- `state_neutral_max`
- `icon_tertiary`
- `radius_6`, `radius_round`
- `body_s`
- `shadow_s`, `shadow_xs` through `shadow_xl`

Kit ships 6 built-in themes (light/dark included); no separate token JSON export found. CSS compiled directly into kit; consuming projects inherit via `import "@frontend-team/ui-kit/style.css"`.

### Page Layout Blocks
**Status:** `/blocks` page exists but no detailed docs found (SPA rendering, markdown fetch returns generic description). Inferred blocks from component structure:
- **Dashboard Shell:** Sidebar + Header + Content area (use BlockSidebarLayout + Card grid)
- **App Shell:** Sidebar (collapsible) + Main content + Toast notification layer
- **List+Detail:** Table (left/pinned) + Detail panel (right, expandable row or modal)
- **Form Wizard:** Steps component + step-specific Form sections + Toast feedback

These patterns map directly to My iKame OverviewPage (dashboard cards), CollectionPage (table + filters), DetailPage (steps for RSVP).

### LLM Guidelines (from /llms-full.txt)
**Critical Rules for AI-built code:**
1. Import from package root only: `import { Button } from "@frontend-team/ui-kit"` ✅
   - Never import from subpaths ❌
2. CSS: `import "@frontend-team/ui-kit/style.css"` at app entry (once only)
3. Provider setup at app root:
   - `<TooltipProvider>` (required for Tooltip, Popover, DropdownMenu)
   - `<Toaster />` (required for toast notifications)
4. **Do NOT install Tailwind** in consuming projects — kit handles all CSS
5. Accessibility: Icon-only buttons must have `aria-label` attribute
6. Compatibility: React 18–19, TypeScript-first
7. **Dark Mode:** Built-in via `useDarkMode()` hook
   - Toggles `.dark` class on `<html>` element
   - Persists to localStorage
   - Falls back to system `prefers-color-scheme`
8. Text Editors: Use `@frontend-team/tiptap-kit` (separate package); scaffold via `npx tiptap-kit add [simple|notion-like|chat-box]`

---

## Mapping Summary: My iKame Screens → UI Kit Components

| Screen | Primary Components | Secondary |
|--------|-------------------|-----------|
| **OverviewPage** | Card (event/news summary), Progress (registration %), Skeleton (loading), Breadcrumb (location context) | Toast (feedback), Spinner (async load) |
| **CollectionPage** | Table (rosters/listings), Pagination, SegmentedControl (News/Events filter), VirtualList (large lists) | Skeleton (row placeholders), ScrollArea (overflow) |
| **DetailPage** | Steps (RSVP flow), Calendar/DateRangePicker (date selection), Card (detail container), Breadcrumb | Slider (capacity adjustment), Toast (confirmation) |
| **Navigation** | Sidebar/SimpleSidebar (main nav), SidebarTrigger (collapse toggle) | Breadcrumb (current path) |
| **Feedback** | Toast (notifications), Spinner (loading), Progress (meter) | Skeleton (placeholders) |

---

## Unresolved Questions

1. **Design token export:** Are DS 1.1 tokens available as CSS custom properties (e.g., `var(--bg-sidebar-primary)`) or only via Tailwind class generation? Need to inspect compiled kit CSS or request token reference doc.

2. **Theme customization:** Kit ships 6 themes; can custom themes be added or overridden in consuming app? Dark mode hook auto-switches themes, but no docs on theme selection API.

3. **Blocks library:** `/blocks` page claims "pre-built page layouts" but no markdown docs found. Are these exported as React components (e.g., `<DashboardShell />`) or only reference patterns?

4. **Table dataset size limits:** DataTable supports virtualization, but no guidance on min/max dataset size thresholds for performance. What size triggers virtualization recommendation?

5. **Accessibility compliance:** No WCAG 2.1 level (A/AA/AAA) certification stated. Icon-only button rule found, but are there other a11y rules for forms, modals, or complex components?

6. **Tiptap integration:** `@frontend-team/tiptap-kit` is mentioned but no docs link; is it published and what's the current version?

7. **Icons library:** No component-level icon prop documentation (e.g., are icons from Lucide, Heroicons, or internal set?). SimpleSidebar docs say icons required for items but no import path given.

8. **Responsive breakpoints:** Tailwind v4 uses default breakpoints; does kit override or add custom breakpoints for My iKame design needs?
