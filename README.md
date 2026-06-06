# Etecé Studio (Next.js)

React + Next.js App Router port of the Etecé Studio landing experience.

## Scripts

- `npm install` — install dependencies
- `npm run dev` — development server (http://localhost:3000)
- `npm run build` — production build
- `npm start` — run production server

## Structure

- `src/app/` — App Router entry (`layout.tsx`, `page.tsx`, `globals.css`)
- `src/components/` — UI (locked systems, hero, sections)
- `src/lib/animations/` — preloader, nav, logo, GSAP hero timelines, sequence runner
- `public/assets/` — static SVGs and optional `BlockXX/heroNN.*` frames

## Do not use Live Server on the project root

The root `index.html` only redirects to the Next dev server. The old static site lives in `legacy/static-site/` (reference only).

**Always run:** `npm run dev` → **http://localhost:3000**

## Contact form setup

To enable the contact form, create a `.env.local` file with:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

Then restart the dev server:

```
npm run dev
```

To create the Supabase contact table, open **Supabase SQL Editor** and run:

`src/lib/supabase/contact-submissions.sql`
