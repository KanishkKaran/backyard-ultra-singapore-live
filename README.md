# Backyard Ultra Singapore Live

Live race coverage for Beach Backyard Ultra Singapore, including Team Singapore and Open Category pages, spreadsheet-driven standings, an “Overheard on the Yard” ticker, and a pace-based estimated course tracker.

## Pages

- `/` — Team Singapore live coverage
- `/open` — Open Category coverage
- `/embed/map` — Standalone pace-based map for embedding in Squarespace
- `/api/live` — Published Google Sheets data feed
- `/api/health` — Render health check

## Local development

Requirements:

- Node.js 24 (see `.node-version`)
- npm

```bash
npm ci
npm run dev
```

Create a production build and run it locally:

```bash
npm run build
npm start
```

The server uses Render’s `PORT` environment variable automatically.

## Deploy to Render

This repository includes `render.yaml`. In Render, create a new Blueprint from this repository, or create a Node Web Service with:

- Region: Singapore
- Build command: `npm ci && npm run build`
- Start command: `npm start`
- Health check: `/api/health`

Render will deploy the `main` branch and redeploy automatically after future pushes.

## Live data

Race data is read from the published Google Sheets feed configured in `app/api/live/route.ts`. The website polls the API regularly, while estimated map positions animate locally from each athlete’s most recent lap time. The pace-based positions are estimates, not GPS locations.

## Squarespace map embed

Once the Render service is public, embed the isolated map route in a Squarespace Code Block:

```html
<iframe
  src="https://YOUR-SERVICE.onrender.com/embed/map"
  title="Backyard Ultra Singapore pace-based tracker"
  style="display:block;width:100%;height:700px;border:0"
  loading="lazy"
></iframe>
```

Replace `YOUR-SERVICE` with the hostname assigned by Render.

## Content and imagery

Athlete portraits and event branding in `public/` are supplied for this race website. Confirm reuse rights before copying them into another project or publication.
