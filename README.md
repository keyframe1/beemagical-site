# Bee Magical

The production website for the artist Bee Magical. Bright, fae-touched paintings
charted across a dark, starlit sky, with a flying bee that guides you through the
gallery. Built with Astro and TypeScript, static output, zero-config deploy on Vercel.

## Run locally

```bash
npm install
npm run dev
```

Then open the URL it prints (usually http://localhost:4321). Other scripts:

- `npm run build` builds the static site into `dist/`.
- `npm run preview` serves the built site locally.

## Add a painting

The gallery is a content collection, so adding art never touches component code:

1. Drop the image in `src/assets/art/` (a real photo, or an SVG placeholder).
2. Add a JSON entry in `src/content/art/`, for example `new-work.json`:

   ```json
   {
     "title": "New Work",
     "medium": "Acrylic on canvas",
     "dimensions": "16 x 20 in",
     "year": 2026,
     "price": "$700",
     "status": "available",
     "prints": true,
     "printsFrom": 45,
     "image": "../../assets/art/new-work.svg",
     "note": "One short, vivid line about the piece.",
     "x": 40,
     "y": 60,
     "links": ["luna-moth"]
   }
   ```

That is it. The work appears as a node in the constellation, joins the lines to the
slugs listed in `links`, and shows up in the lightbox. The image renders through
`astro:assets` with width, height, and alt text, so swapping the placeholder for a
real photo is just changing `image`.

Field notes:

- `status` is one of `available`, `sold`, or `prints-only`.
- `x` and `y` are the constellation position as a percent (0 to 100).
- `links` are the slugs (file names without `.json`) this work connects to.
- The featured work is set by `FEATURED_SLUG` in `src/lib/art.ts`.

## Contact form

The contact form posts to Formspree. Open `src/components/Contact.astro` and paste
your real form ID into the `FORMSPREE_ENDPOINT` constant at the top of the file.

## Deploy

Pushing to `main` auto-deploys on Vercel. Astro builds to static output with no extra
config. Connect the repo in Vercel once, and every push to `main` ships.

Before launch, also drop a real `public/og-image.jpg` (1200 x 630) for link previews.
See `public/og-image.README.txt`.

## Project shape

- `src/layouts/Base.astro` head, fonts, meta, global styles
- `src/styles/global.css` palette tokens, shared keyframes, reduced-motion path
- `src/components/` Nav, Loader, FaeBee, Starfield, Constellation, Lightbox, Featured, About, Contact, Footer, Hero
- `src/content/art/` the gallery, one JSON file per work
- `src/lib/art.ts` shared gallery ordering and the featured slug

The interactive pieces (Starfield, FaeBee, Constellation, Lightbox) are client-side
islands. Everything else is static HTML. Animation honors `prefers-reduced-motion`.
