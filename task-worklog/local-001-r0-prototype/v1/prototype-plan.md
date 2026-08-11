# Prototype Plan

## Page / interface type

- Type: Three-tier SaaS shell with Overview, Collection, Detail, Data Grid and Drawer patterns.
- Reason: My iKame combines role-based navigation, active work surfaces and focal content while remaining calm and action-first.

## Core DS application

- Theme source: ikame Core DS 1.1.
- Theme files: `src/styles/core-ds-1.1.css`, `src/styles/app.css`.
- Tokens used: functional backgrounds, text, icon, border, status, button, radius, typography and shadow tokens.
- Visual hierarchy: sidebar `bg_sidebar_secondary`, work area `bg_secondary`, focal content `bg_primary`.
- CTA policy: one orange Primary CTA maximum per route.
- Component rules: neutral navigation/tabs, sunk filters, border/background cards, shadow only on notification drawer.
- Forbidden checks: no hardcoded feature colors, no orange navigation, no inline card shadow, no UI `body_m`.

## Prototype scope

### Routes added

- `/`, `/manager`, `/manager/team`
- `/news`, `/news/:postId`
- `/events`, `/events/:eventId`
- `/search`, `/not-found`

### Screens added

- iKamer Home and Manager Overview.
- My Team table.
- News collection and article detail.
- Event collection and detail.
- Search shell and notification drawer.

### Components added

- App shell, perspective switch, responsive navigation.
- Priority hero, active item, News/Event/Attention/Metric cards.
- Status pill, source line, filters, empty state and action receipt.

### Interactions

- Switch iKamer/Manager perspective.
- Switch Light/Dark theme.
- Open/read notification.
- Filter/search News and Events.
- Explicitly acknowledge mandatory article.
- Register/cancel Event.

### States

- Default, empty search/filter, mandatory pending/completed, RSVP open/going/full, notification read/unread and safe not-found.

## Mock data plan

- Data file: `src/data/mockData.ts`.
- Main entities: User, NewsPost, EventItem, AttentionItem, NotificationItem.
- Edge cases: mandatory unacknowledged post, full event, out-of-scope concept, required vs optional Manager attention.

