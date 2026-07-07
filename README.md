# Mug Shelf

A personal index of favorite ceramic mugs, by [Jennifer Fang](https://x.com/jenfang). Inspired by [naturalselection.so](https://www.naturalselection.so/) and [curated.supply](https://curated.supply).

Plain static site: no framework, no build step. 36 mugs across 14 brands.

## Pages

- `index.html` — browsable index with search, collapsible brand filter, and sorting.
- `shelf.html` — drag-and-drop arranging on a Sætter 15 cup shelf, with PNG export. Arrangements persist in localStorage. Add `?debug` to the URL to see the compartment overlay.

## Run locally

```sh
node serve.mjs   # http://localhost:4173
```

Or open `index.html` directly in a browser.

## Deploy

Static — deploys as-is to any static host. On Vercel: framework preset "Other", no build command, output directory `.` (root).

## Structure

- `data.js` — the mug list (brand, name, image, product link, price). Edit to add/remove mugs.
- `images/` — original product photos as downloaded from each brand (source; not served).
- `cutouts/` — background-removed, tightly cropped PNGs actually shown on the page. The floating Sætter shelf is `cutouts/shelf/saetter-15.png` (kept at full 800×1200 so `shelf.js` compartment coordinates stay valid).
- `fonts/` — "Hand of Jen" handwriting font used site-wide.
- `tools/cutout.m` — macOS Vision background removal. Rebuild and run:

```sh
clang -fobjc-arc tools/cutout.m -o tools/cutout \
  -framework Foundation -framework Vision -framework CoreImage \
  -framework CoreVideo -framework CoreGraphics

# whole subject, auto-cropped to it:
./tools/cutout images/brand/new-mug.jpg cutouts/brand/new-mug.png
# already-transparent source, crop only:   --alpha-only
# isolate one item from a multi-item shot:  --crop x,y,w,h
# keep original canvas size (e.g. the shelf): --full
sips --resampleHeightWidthMax 900 cutouts/brand/new-mug.png
```

## Adding a mug

1. Save the product photo to `images/<brand>/<name>.jpg`
2. Run the cutout tool (above)
3. Add an entry to `data.js`
