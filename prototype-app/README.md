# My iKame R0 Prototype

React + TypeScript + Vite prototype based on `My-iKame-Product-Spec-v0.2.md` and ikame Core DS 1.1.

## Run

```bash
npm install --cache /tmp/myikame-npm-cache
npm run dev -- --host 127.0.0.1
```

No `.npmrc` or registry configuration required — all packages sourced from npm registry.

## Verify

```bash
npm run typecheck
npm run build
npm run visual:check
```

`visual:check` starts its own local Vite server, validates the main interactions and writes screenshots to `../deployments/visual-check/`.

## Routes

- `/home` — iKamer Home (priority + active items)
- `/manager/overview` — Manager Overview (attention queue)
- `/manager/team` — My Team (team-scoped ranking)
- `/news`, `/news/:postId` — Newsfeed with mandatory acknowledgement
- `/events`, `/events/:eventId` — Events with RSVP and .ics export
- `/knowledge`, `/knowledge/:documentId` — Knowledge shell (R2 placeholder)
- `/goals`, `/goals/:goalId` — Goals shell (R3 placeholder)
- `/search` — Global search
- `/notifications` — Notification center
- `/profile` — User profile
- `/forbidden` — Permission error

## Prototype controls

- Switch between iKamer and Manager from the desktop sidebar.
- Use the moon/sun icon for Light/Dark theme.
- Open the bell for grouped notifications.
- Acknowledge the mandatory Security article.
- Register or cancel the AI Product Workshop event.

All data is fictional mock data. State resets on page refresh.

