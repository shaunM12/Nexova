# Nexova memory bank

## Purpose
Phased Nexova build context. Hot path stays short; cold path is product context (read when told / when shipping the public site).

## Read policy
- **Hot path:** this README; `architecture.md` for public vs backoffice boundaries; `techContext.md` for stack/routes/run.
- **Cold path:** `historical-reference/product-context.md` for public site product truth.
- **Router only:** `historical-reference/00-index.md` for glossary / open decisions.
- Never bulk-load the historical folder.

## Continuity
1. `00-index.md`
2. `architecture.md` (surface boundaries)
3. `product-context.md` (public product truth)
4. Changelog inside `product-context.md`

## Layout
```text
memory-bank/
  README.md
  architecture.md
  techContext.md
  historical-reference/
    00-index.md
    product-context.md
```

## Surfaces at a glance
- **Public website** — active (`/`, `/application`)
- **Backoffice** — planned (`/backoffice/…`)
