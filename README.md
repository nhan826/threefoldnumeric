# Numerica — Interactive Evaluation of ML Numeric Systems

A minimal scaffold for the Numerica app described by the product brief.

Goals
- Modular numeric simulation engine
- Next.js + Tailwind frontend
- Static JSON benchmark data
- Global numeric selector and sample visualizations

Quick start (PowerShell)

```powershell
cd "C:\Users\natha\OneDrive\Desktop\FloatPointAlt"
# install dependencies
npm install
# run dev server
npm run dev
```

Smoke test (quick verification)

Once the dev server is running (see the terminal for the exact Local URL and port), run a quick smoke test to verify the landing page and fundamentals page return HTTP 200.

```powershell
# If your dev server runs on a non-default port, set SMOKE_URL (e.g. http://localhost:3007)
# Default uses http://localhost:3000
npm run smoke

# or set the URL explicitly:
$env:SMOKE_URL = 'http://localhost:3007'; npm run smoke
```

The smoke script checks `/` and `/fundamentals` and exits with a non-zero code if any endpoint fails.

Notes
- This scaffold contains placeholder numeric simulation code in `/numeric` and sample static data in `/data`.
- The app is intentionally minimal and extensible — add D3/WebGL visualizations into the `components` folder.

Next steps
- Run `npm install` locally.
- Add WASM numeric engine and precomputed benchmark JSON files.
- Replace placeholder visuals with D3/WebGL implementations.
