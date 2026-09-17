# Nexova

Public website for Nexova — human resources consulting and talent acquisition (Valencia · Miami).

Built with **Next.js** and **React**. A **backoffice** surface is planned under `/backoffice` (not built yet).

## Run locally

```bash
npm install
npm run dev
```

That one command:
1. Starts Next.js on port **3456**
2. Opens the site in **Firefox** when ready

See what’s running (and reserved future ports):

```bash
npm run ports
```

- Public landing: `http://127.0.0.1:3456/`
- Talent form: `http://127.0.0.1:3456/application`
- Future backoffice (same app): `http://127.0.0.1:3456/backoffice`
- Reserved API: `4000` · reserved workers: `4001` (`config/ports.json`)

Optional: `npm run open` reopens Firefox. `npm run dev:server` starts the server only.

> **Ports panel:** Cursor auto-fills this on remote/Codespaces projects. On a local Mac repo it often stays blank. Use `npm run ports` to pick among services as you add APIs/backoffice processes.

Production preview:

```bash
npm run build
npm start
```

## Stack (public v1)

- Next.js App Router + React
- TypeScript
- Tailwind CSS
- Client-side talent form validation (no backend yet)

## Architecture

| Surface | Path | Status |
|---|---|---|
| Public website | `app/(public)` | Active |
| Backoffice | `app/(backoffice)/backoffice` | Planned |

Details: `memory-bank/architecture.md`

## Project docs

- Architecture: `memory-bank/architecture.md`
- Tech context: `memory-bank/techContext.md`
- Product context: `memory-bank/historical-reference/product-context.md`
