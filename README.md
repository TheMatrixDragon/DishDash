# DishDash

SnapCook • Planner • Scanner • Community — a React (Vite) prototype for turning pantry text or photos into recipe ideas, planning meals, tracking a pantry, and sharing with a community.

## Features

* **SnapCook (Create)**:

  * Upload a food photo (mocked) or paste pantry text
  * Quick AI-like suggestions (local mock logic)
  * Filters: diets, allergens, nutrition goals, budget
* **Planner**:

  * Generate a 3-day plan from suggested recipes
* **Scanner**:

  * Enter a UPC/EAN → mock product info + expiry → auto-add to pantry
* **Pantry**:

  * Track items with expiry; persists via `localStorage`
* **Community**:

  * Follow creators, simple DMs (local), create Groups, share recipes
* **Themes**:

  * Warm / Olive / Dark presets
* **Bottom Nav** with hash-based routing: Home, Create, Scanner, Planner, Community, Pantry, Retail, Clipper

> Notes:
>
> * All “AI” is mocked locally for demo purposes.
> * Images are Unsplash URLs.
> * Persistence uses `localStorage` on the browser.

## Tech Stack

* **React 18** + **Vite**
* **lucide-react** (icons)
* **framer-motion** (light animations)
* No CSS framework required (utility classes embedded)

## Project Structure

```
.
├─ index.html
├─ package.json
└─ src/
   ├─ main.jsx         # App bootstrap
   └─ App.jsx          # Your full DishDash app UI/logic
```

## Getting Started

### Run locally (Codex or your machine)

```bash
# install deps
npm install

# start dev server
npm run dev
```

Open the printed URL (usually [http://localhost:5173](http://localhost:5173)) to view the app.

### If your Codex environment shows no files

Make sure you created all files in GitHub:

* `package.json`
* `index.html`
* `src/main.jsx`
* `src/App.jsx`

Then refresh Codex. If needed, run:

```bash
npm install
npm run dev
```

## Scripts

* `npm run dev` — start Vite dev server
* `npm run build` — production build
* `npm run preview` — preview the production build

## Environment & Data

* **Local storage keys**:

  * `dd_theme`, `dd_page`, `dd_pantry`, `dd_follow`, `dd_msgs`, `dd_groups`, `dd_shared`
* **Mock data**:

  * `BANK` recipes, `BARCODE_DB` UPC lookup
* **Routing**:

  * Hash-based (`#home`, `#create`, etc.), so it works on static hosting

## Troubleshooting

* **Blank screen / errors about imports**

  * Ensure you used the provided Vite setup (`package.json`, `index.html`, `src/main.jsx`, `src/App.jsx`)
  * There are no `@/components` imports in this version; UI shims are in `App.jsx`.
* **Codex can’t see repo**

  * Make at least one commit in GitHub (e.g., add `README.md`)
  * Ensure Codex is authorized for your GitHub repo and refresh
* **Port already in use**

  * Stop other dev servers or set a different port with `vite --port 5174`

## Deploy (optional)

* **Vercel**: Import the repo → Framework: **Vite** → build command `vite build` → output `dist/`.
* **GitHub Pages**: Use a GH Action for Vite or `vite build` then publish `dist/`.

## Roadmap Ideas

* Real OCR / image recognition for SnapCook
* Auth + cloud DB (profiles, chats, groups)
* Real barcode scanning (camera + nutrition APIs)
* Recipe importers (actual URL parsing)
* Push notifications and reminders

No—**README is documentation** (Markdown). It explains how to run and use the app. Keep all **code** in your `src/*.jsx`, `index.html`, and `package.json` files.
