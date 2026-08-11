# My iKame R0 Prototype

React + TypeScript + Vite prototype based on `My-iKame-Product-Spec-v0.2.md` and ikame Core DS 1.1.

## Run

```bash
npm install --cache /tmp/myikame-npm-cache
npm run dev -- --host 127.0.0.1
```

## Verify

```bash
npm run typecheck
npm run build
npm run visual:check
```

`visual:check` starts its own local Vite server, validates the main interactions and writes screenshots to `../deployments/visual-check/`.

## Routes

- `/` — iKamer Home
- `/manager` — Manager Overview
- `/manager/team` — My Team
- `/news` and `/news/:postId`
- `/events` and `/events/:eventId`
- `/search`

## Prototype controls

- Switch between iKamer and Manager from the desktop sidebar.
- Use the moon/sun icon for Light/Dark theme.
- Open the bell for grouped notifications.
- Acknowledge the mandatory Security article.
- Register or cancel the AI Product Workshop event.

All data is fictional mock data. State resets on page refresh.

