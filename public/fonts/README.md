# Fonts

The brand typeface is **TASA Orbiter** (Regular / SemiBold / Bold / ExtraBold),
with **Inter** as the fallback. Inter is loaded automatically via
`next/font/google`, so the app works out of the box.

## Adding TASA Orbiter

TASA Orbiter font files are **not** committed to this repo (licensing). To enable
the brand font:

1. Drop the font files into this folder, e.g.:
   - `TASAOrbiter-Regular.woff2`
   - `TASAOrbiter-SemiBold.woff2`
   - `TASAOrbiter-Bold.woff2`
   - `TASAOrbiter-ExtraBold.woff2`

2. In `src/app/layout.tsx`, add a `next/font/local` declaration and expose it as
   a CSS variable, for example:

   ```ts
   import localFont from "next/font/local";

   const tasaOrbiter = localFont({
     variable: "--font-tasa",
     src: [
       { path: "../../public/fonts/TASAOrbiter-Regular.woff2", weight: "400", style: "normal" },
       { path: "../../public/fonts/TASAOrbiter-SemiBold.woff2", weight: "600", style: "normal" },
       { path: "../../public/fonts/TASAOrbiter-Bold.woff2", weight: "700", style: "normal" },
       { path: "../../public/fonts/TASAOrbiter-ExtraBold.woff2", weight: "800", style: "normal" },
     ],
   });
   ```

   Add `tasaOrbiter.variable` to the `<html>` className alongside `inter.variable`.

3. In `src/app/globals.css`, put the brand font first in the `--font-sans` stack:

   ```css
   --font-sans: var(--font-tasa), var(--font-inter), "Inter", system-ui, sans-serif;
   ```

That's the only change needed — every component already uses `font-sans`.
