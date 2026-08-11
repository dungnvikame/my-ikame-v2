# Core DS 1.1 Application — My iKame R0

## Surface types

- Primary: three-tier SaaS experience — fixed navigation, work area, focal content.
- Secondary: overview page, collection page, article detail, event detail, notification drawer, empty/error states.

## Macro background tiers

- Sidebar: `bg_sidebar_secondary`.
- Work area: `bg_secondary`.
- Focal content: `bg_primary`.
- Micro hierarchy: `bg_tertiary` for filters, metadata and grouped controls.

## Focal content

- iKamer Home: priority item, then active items.
- Manager Overview: attention queue.
- News detail: article and explicit acknowledgement action.
- Event detail: event facts and RSVP state.

## Component inventory

- App shell, sidebar, header, bottom navigation.
- Perspective switcher.
- Priority hero, active item, news, event and insight cards.
- Neutral tabs, sunk filters/search, status badges.
- Drawer, detail page, empty state and action receipt.

## CTA policy

- Maximum one orange Primary CTA per screen.
- Supporting actions use Dim, Borderless or link treatment.
- Navigation, filters, selection, tabs and badges remain neutral.

## State strategy

- Navigation active: neutral soft background.
- Tabs active: text weight and neutral underline only.
- Hover/pressed: token-based neutral state overlay.
- Urgent/error states: semantic warning/error tokens.
- Completed/success states: semantic success tokens.

## Typography strategy

- Inter everywhere.
- `body_s` for UI labels, buttons, filters, cards and navigation.
- `body_m` only for article/event long-form content.
- Headline tokens for page and section hierarchy.

## Token plan

- Colors: functional tokens from `src/styles/core-ds-1.1.css` only.
- Radius: `radius_6` buttons/nav, `radius_8` compact cards/inputs, `radius_12` focal cards.
- Border: `border_primary` only where whitespace/background is insufficient.
- Shadow: drawer only; no inline card/table/header/sidebar shadow.

## Forbidden checks

- No direct brand palette use in feature CSS.
- No hardcoded visual colors.
- No multiple Primary buttons on a screen.
- No orange tabs/navigation/selection/badges.
- No shadow on inline surfaces.
- No `body_m` for UI controls.

