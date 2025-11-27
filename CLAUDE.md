# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GetPrepGhana is a web application that helps users find PrEP (Pre-Exposure Prophylaxis) facilities across Ghana's 16 regions. The app features:
- Interactive SVG map of Ghana with clickable regions
- Facility search by region with real-time availability status
- SQLite database for facility and drug stock management
- Admin interface for database seeding

## Development Commands

```bash
# Install dependencies
bun install

# Development server with hot reload
bun dev

# Production server
bun start

# Build for production (builds HTML and seeds database)
bun run build.ts && bun run src/db/seed.ts

# Custom build options (see build.ts --help for full list)
bun run build.ts --outdir=dist --minify --sourcemap=linked
```

## Architecture

### Server (src/index.tsx)
Uses `Bun.serve()` with file-based routing:
- `/*` - SPA fallback serving `index.html`
- `/api/facilities` - GET endpoint for fetching facilities by region
- `/api/admin/seed` - POST endpoint to trigger database seeding
- Client-side routing in `App.tsx` handles `/admin` route

### Database (src/db/)
SQLite database (`prepghana.sqlite`) with three tables:
- `facilities` - Health facilities with location data (lat/lng)
- `contact_people` - Key contacts at each facility
- `drug_stocks` - PrEP availability status (available/low/out)

Key files:
- `src/db/index.ts` - Database connection using `bun:sqlite`
- `src/db/setup.ts` - Creates tables (imported by seed.ts)
- `src/db/seed.ts` - Seeds 18 facilities across 16 regions

### Frontend
React 19 app with Tailwind CSS using shadcn/ui components:
- Entry point: `src/index.html` imports `src/frontend.tsx`
- Main app: `src/App.tsx` handles tab navigation (home/about/centers)
- `InteractiveMap.tsx` - Fetches and processes Ghana SVG, handles region clicks
- `RegionModal.tsx` - Displays facilities for selected region with:
  - Animated zoom to region on map
  - Lat/lng to SVG coordinate projection
  - Facility list and detail views
- `AdminPage.tsx` - Admin interface for database management

Region IDs match the database exactly (e.g., "GREATER_ACCRA", "ASHANTI", "BONO_EAST").

### Build System
Custom build script (`build.ts`) using Bun's bundler:
- Scans `src/**/*.html` as entrypoints
- Uses `bun-plugin-tailwind` for CSS processing
- Outputs to `dist/` with minification and source maps
- Build + seed runs on production deployment

## Key Implementation Details

### Map Interaction
The SVG map (`src/public/images/gh.svg`) has numbered paths that map to region IDs:
```typescript
// From InteractiveMap.tsx
const regionMap = {
  1: { id: "AHAFO", name: "Ahafo" },
  3: { id: "ASHANTI", name: "Ashanti" },
  8: { id: "GREATER_ACCRA", name: "Greater Accra" },
  // ... etc
}
```

Region clicks trigger modal with:
1. Animated zoom to region bounding box
2. API call to `/api/facilities?region={REGION_ID}`
3. Lat/lng coordinates projected onto SVG for facility markers

### Ghana Geographic Bounds
Coordinates for lat/lng to SVG projection (RegionModal.tsx):
```typescript
const GHANA_BOUNDS = {
  minLat: 4.738, maxLat: 11.175,
  minLng: -3.260, maxLng: 1.200
}
```

### API Response Structure
Facilities endpoint returns joined data:
```typescript
{
  id, name, region_id, latitude, longitude,
  address, phone,
  contact_name, contact_phone,  // from contact_people
  drug_status                   // from drug_stocks
}
```

## Bun-Specific Patterns

Default to Bun instead of Node.js:
- Use `bun <file>` instead of `node <file>` or `ts-node <file>`
- Use `bun test` instead of `jest` or `vitest`
- Use `bun run <script>` instead of `npm run <script>`
- Bun automatically loads .env, so don't use dotenv

### Bun APIs
- `Bun.serve()` for server with routes (don't use `express`)
- `bun:sqlite` for SQLite (don't use `better-sqlite3`)
- `Bun.file` preferred over `node:fs` readFile/writeFile
- HTML imports with `Bun.serve()` (don't use `vite`)

### Development Server
HTML files can import .tsx/.jsx/.js files directly:
```html
<script type="module" src="./frontend.tsx"></script>
```

Bun's bundler transpiles and bundles automatically with HMR when using `--hot` flag.

## Common Tasks

### Adding a New Region Facility
1. Add facility data to `src/db/seed.ts` facilitiesData array
2. Run `bun run src/db/seed.ts` to re-seed database
3. Verify region_id matches the InteractiveMap regionMap

### Updating Map SVG
If `src/public/images/gh.svg` is replaced:
1. Ensure paths have `id="1"`, `id="3"`, etc. matching regionMap
2. Run coordinate projection verification for facility markers
3. Test region bounding box zoom animations

### Database Schema Changes
1. Modify `src/db/setup.ts` table definitions
2. Delete `prepghana.sqlite` file
3. Run `bun run src/db/seed.ts` to recreate and populate
