# RakiaHub — Project Reference

Mobile-first PWA for rating rakija (Bulgarian fruit brandy). Inspired by Untappd.
Stack: Next.js 14 App Router · Supabase (Postgres + Auth + Realtime + Storage) · Tailwind CSS · TypeScript.

---

## Session Status (last updated: April 2026)

### ✅ Completed features
- Authentication (email + password, username, middleware)
- Feed (pull-to-refresh, reactions, delete with confirm, auto-refresh on new rating)
- Discover (text search + **fruit chips, sort, verified filter** — M2 done)
- Rakija detail page (Server Component)
- Rating flow (FAB → bottom sheet → score → optional details form)
- Profile (stats, rating history with delete confirm, settings, avatar upload)
- **Публичен профил `/u/[username]`** — Server Component, public ratings, stats (M3 done)
- **Значки (Badges)** — computed client-side in `src/lib/badges.ts`, shown on profile + public profile (M4 done)
- Friends (list, requests, search, real-time badge)
- Invite link system
- Admin panel (rakija CRUD, users, promotions queue)
- PWA (manifest, service worker, offline page)
- Toast notifications
- **UI/UX редизайн "Modern Craft"** — бели карти, Playfair Display serif, SVG fruit icons, нов score badge, NazdraveButton с pop анимация, нов AppHeader, BottomNav pill indicator, Login hero екран

### 🔴 Pending — next session pick-up point

**Immediate: rakija seed data**
- User is manually collecting Bulgarian commercial rakiyas
- Template: `scripts/rakija-seed.csv` (fill in, then run script)
- Script: `npx tsx scripts/csv-to-sql.ts > seed.sql` → paste into Supabase SQL Editor
- CSV columns: `name, producer, fruit, region, country, abv, vintage_year, description, is_verified`
- fruit values: `plum | grape | apricot | pear | fig | quince | mixed | other`
- Once seed data is imported, the app becomes usable for real users

**Feature backlog (priority order):**

| # | Feature | Size | Status |
|---|---|---|---|
| M5 | Детайлни статистики | M | pending |
| S2 | Wishlist "Искам да пробвам" | S | pending |
| S1 | Share ракия/оценка | S | pending |
| M1 | Коментари на оценки | M | pending |
| M7 | "Подобни ракии" препоръки | M | pending |
| L1 | Venue Check-in + Местен Feed | L | pending |
| L2 | Регионална карта | L | pending |
| L3 | Годишен преглед (Wrapped) | L | pending |

**Known issues / tech debt:**
- Feed currently shows all users' ratings, not filtered to friends only (intentional for now, revisit when user base grows)
- Badges are computed client-side from fetched ratings — no DB table, no triggers needed. This is fine up to ~500 ratings per user.

---

## Brand & Design Tokens

| Token | Hex | Usage |
|---|---|---|
| `oak` | `#2C1810` | Primary text |
| `walnut` | `#6B4423` | Buttons, active states |
| `accent` | `#C8956D` | Secondary text, borders |
| `cream` | `#EDD9C0` | Backgrounds, chips |
| `background` | `#FBF5EC` | Page background |
| `gold` | `#C8882A` | Scores, ratings |
| `verified` | `#3D7A3D` | Verified badge |
| `muted` | `#8A7968` | Tertiary text, placeholders |

Design style: **Modern Craft** — бели карти (`#FFFFFF`) с фин shadow върху топъл кремав фон. Glassmorphism само за sticky header-и (`.glass-panel`).
CSS classes: `.card`, `.card-xl`, `.glass-panel`, `.input`, `.btn-primary`, `.label`, `.text-gradient`, `.animate-slide-up`, `.animate-fade-in`, `.animate-nazdrave`, `.stagger-1/2/3/4`.

**Important mobile gotcha:** `background-attachment: fixed` is disabled on iOS/Android. The body background uses `scroll` instead, with stronger opacity values to compensate.

**Fonts:** Playfair Display (serif) за заглавия/имена на напитки — `font-serif` Tailwind клас. Зарежда се чрез `<link>` в `layout.tsx` (не в globals.css — `postcss-import` не поддържа remote URLs). Inter за body текст.

**Hydration gotcha:** Не използвай `{condition && <element>}` в компоненти, чиято `condition` зависи от `usePathname()` или друг routing hook — може да предизвика SSR/client mismatch. Ползвай `opacity` или `visibility` вместо conditional render за такива случаи.

---

## Current Features

### Authentication
- Email + password login/register via Supabase Auth
- Username required on register (lowercase, alphanumeric + `_`, min 3 chars)
- Middleware protects all routes except `/login`, `/register`, `/invite/*`, `/u/*`
- Session managed via `@supabase/ssr` cookies

### Feed (`/feed`)
- Shows latest 50 public ratings (all users — not filtered to friends, intentional for now)
- Pull-to-refresh: touch listeners scoped to `containerRef.current` (not `document`) — critical to avoid conflicts with the fixed bottom sheet
- Skeleton loading (4 cards)
- **Наздраве** reaction button with optimistic toggle and real count
- Delete own rating: trash icon → inline "Изтрий? Да / Не" confirm, then optimistic removal + `DELETE /api/ratings`
- Auto-refreshes on `window` event `"rating-saved"` (dispatched by RatingBottomSheet after save)

### Discover (`/discover`)
- Sticky glassmorphism header with: search bar, fruit chip row (horizontal scroll), sort dropdown, verified toggle
- Fruit chips: Всички / Слива / Грозде / Кайсия / Круша / Смокиня / Дюля / Смесена
- Sort: Най-оценявани (default) / Най-висок рейтинг / А-Я
- Verified toggle: green pill, filters `is_verified = true`
- "Изчисти" link appears when any non-default filter is active
- `filtersRef` pattern: ref holds current filter values so `load()` doesn't need them as deps and avoids stale closures
- Results limited to 40, skeleton list on load

### Rakija Detail (`/rakija/[id]`)
- Server Component (no "use client")
- Global rating badge (average + count) or "Бъди първия!" empty state
- Details: fruit type (BG name), region, country, ABV, vintage year, description
- **Оцени тази ракия** button — `RateButton` opens bottom sheet pre-filled with this rakija
- Back button (`router.back()`)

### Rating Flow
1. **RatingFAB** — bottle icon bottom-right, opens `RatingBottomSheet`
2. **Step 1 – Search**: search existing rakiyas, or toggle "Лична" to create personal entry (name + producer + fruit)
3. **Step 2 – Score**: slider 1–10 (step 0.5), label text ("Много лоша" → "Перфектна")
4. **Quick save** → `POST /api/ratings` → dispatches `"rating-saved"` event → closes sheet
5. **Add details** → navigates to `/rate/[id]/details`
6. **Details form**: aroma/taste/finish/color tags (multi-select chips), per-section notes, venue name, general notes, private toggle
- Body scroll lock (`document.body.style.overflow = "hidden"`) while sheet is open — prevents feed cards from scrolling under the slider
- If user already rated a rakija, POST will UPDATE the existing rating instead of inserting a new one (upsert logic in API route)

### Profile (`/profile`)
- Stats row: total ratings, unique napitki, average score
- **Значки**: badges computed from rating history, rendered as pills with emoji — appears only when at least one badge is earned
- **Public profile link**: `rakiq.app/u/<username>` — links to `/u/[username]`
- **История** tab: list of own ratings, delete with inline confirm, links to rakija detail
- **Настройки** tab: display name, username (uniqueness checked client-side), avatar upload to Supabase Storage `avatars` bucket
- Sign out
- Admin panel link (visible only if `is_admin = true`)

### Public Profile (`/u/[username]`)
- Server Component, accessible without login (public route)
- Shows: avatar, display name / username, member since date
- Stats: total public ratings, unique napitki, average score
- Earned badges (same computation as private profile)
- List of public (non-private) ratings with link to each rakija detail
- 404 via `notFound()` if username doesn't exist

### Badges (`src/lib/badges.ts`)
- Computed client-side with `computeBadges(ratings: RatingForBadges[])`
- No DB table — computed on the fly
- 7 badges:
  - 🥃 Новак — 1+ rating
  - 🔥 Запален — 10+ ratings
  - ⭐ Сомелиер — 50+ ratings
  - 🏆 Майстор — 100+ ratings
  - 🌿 Изследовател — 4+ different fruit types
  - 💎 Перфекционист — 3+ ratings with score ≥ 9.5
  - 📝 Разказвач — 5+ ratings with notes field filled

### Friends (`/friends`)
- **Списък** tab: accepted friends, remove button, generate 7-day invite link (copy to clipboard)
- **Заявки** tab: incoming pending requests with accept/decline; badge on nav tab with real-time count via Supabase Realtime (channel `nav-friendships`)
- **Търсене** tab: search by username, send friend request (button disabled if already sent or friends)

### Invite System (`/invite/[token]`)
- Public page — handles: loading, invalid, expired, used, self-invite, unauthenticated, accepted
- Generates friend request from token creator to accepting user
- 7-day expiry

### Admin Panel (`/admin/*`)
- Protected by `is_admin` profile flag (checked in middleware)
- **Ракии** (`/admin/rakija`): table of commercial rakiyas, search, add/edit/delete, verified toggle
- **Потребители** (`/admin/users`): user list, toggle admin role
- **Промоции** (`/admin/promotions`): personal rakiyas suggested for commercial promotion; filter by status; approve (sets `type=commercial`, `is_verified=true`) or reject

### PWA
- `manifest.json`: name "RakiaHub", start `/feed`, standalone display, theme `#7A5230`
- Service worker v2: caches static assets, offline fallback at `/offline`
- Icons: 192px, 512px, 512px maskable

### Notifications (Toast)
- Global `ToastContext` — `show(message, type)` hook available anywhere
- Types: `success` (default), `error`, `info`
- Auto-dismiss after 2.5s, positioned above bottom nav

---

## Data Model (key tables)

| Table | Key Fields |
|---|---|
| `profiles` | `id`, `username`, `display_name`, `avatar_url`, `is_admin`, `created_at` |
| `rakija` | `id`, `name`, `producer`, `fruit`, `type` (commercial/personal/homemade), `region`, `country`, `abv`, `vintage_year`, `description`, `is_verified`, `global_rating`, `rating_count`, `added_by` |
| `ratings` | `id`, `user_id`, `rakija_id`, `score`, `aroma/taste/finish/color_tags`, `*_note`, `venue_name`, `venue_place_id`, `notes`, `is_private`, `created_at` |
| `friendships` | `id`, `requester_id`, `addressee_id`, `status` (pending/accepted/declined) |
| `reactions` | `id`, `rating_id`, `user_id` |
| `invite_links` | `id`, `created_by`, `token`, `used_by`, `expires_at` |
| `personal_entries` | `rakija_id`, `owner_id` |
| `promotion_suggestions` | `id`, `rakija_id`, `status`, `match_count` |

Fruit types: `plum | grape | apricot | pear | fig | quince | mixed | other`
Rating tags — Aroma (9), Taste (8), Finish (7), Color (5)

---

## API Routes

| Method | Route | Description |
|---|---|---|
| POST | `/api/ratings` | Create/update rating; upsert logic: finds existing `(user_id, rakija_id)` → UPDATE, else INSERT |
| DELETE | `/api/ratings` | Delete own rating (checks `user_id` ownership) |
| POST | `/api/friends` | Actions: `send / accept / decline / remove` |
| POST | `/api/invite` | Generate invite token (7-day expiry) |
| GET | `/api/invite` | Validate token |
| POST | `/api/promotions` | Admin: approve or reject promotion suggestion |

---

## Key Patterns & Conventions

- **Client components** for all interactive pages (feed, profile, friends, discover)
- **Server components** for static pages (rakija/[id], u/[username])
- **Optimistic UI** for deletions: remove from local state immediately, API call in background
- **Custom events** for cross-component communication: `window.dispatchEvent(new Event("rating-saved"))` → feed reloads
- **Supabase Realtime** for friend request badge count only (channel `nav-friendships`)
- **Body scroll lock** (`document.body.style.overflow = "hidden"`) when bottom sheet is open
- **Pull-to-refresh** listeners scoped to `containerRef.current` (never `document`) — avoids triggering when dragging the rating slider inside the fixed overlay
- **filtersRef pattern**: when a `load()` function needs filter state but can't list them as deps (stale closure), keep a ref synced to current values and read from the ref inside `load()`
- **Hooks before early returns**: all `useState`, `useEffect`, `useMemo` etc. must be called before any conditional `return` — violation causes "Rendered more hooks than during the previous render"
- Word choice: "напитка / напитки" (not "ракия / ракии") in user-facing UI strings

---

## File Structure

```
src/
├── app/
│   ├── (auth)/login/         # Login page
│   ├── (auth)/register/      # Register page
│   ├── (main)/
│   │   ├── layout.tsx        # AppHeader + BottomNav + RatingFAB + ToastProvider
│   │   ├── feed/page.tsx     # Feed with pull-to-refresh
│   │   ├── discover/page.tsx # Search + fruit/sort/verified filters
│   │   ├── friends/page.tsx  # Friends management
│   │   └── profile/page.tsx  # Profile + badges + history + settings
│   ├── u/[username]/page.tsx # Public profile (Server Component, no auth required)
│   ├── admin/
│   │   ├── dashboard/        # Admin nav
│   │   ├── rakija/           # Rakija CRUD
│   │   ├── users/            # User management
│   │   └── promotions/       # Promotion queue
│   ├── api/
│   │   ├── ratings/route.ts  # POST (upsert) + DELETE
│   │   ├── friends/route.ts  # Friend actions
│   │   ├── invite/route.ts   # Invite tokens
│   │   └── promotions/route.ts # Admin approve/reject
│   ├── invite/[token]/       # Invite acceptance page
│   ├── rakija/[id]/          # Rakija detail (Server Component)
│   ├── rate/[id]/details/    # Rating details form
│   └── offline/              # PWA offline fallback
├── components/
│   ├── layout/               # AppHeader, BottomNav, RatingFAB
│   ├── feed/                 # RatingCard, NazdraveButton
│   ├── rakija/               # RakijaCard, RateButton, BackButton
│   ├── rating/               # RatingBottomSheet, RatingSlider
│   ├── admin/                # RakijaForm
│   └── ui/                   # FruitIcon
├── lib/
│   ├── queries/              # feed.ts, rakija.ts, friends.ts
│   ├── supabase/             # client.ts, server.ts
│   ├── badges.ts             # Badge definitions + computeBadges()
│   └── promotionCheck.ts
├── context/
│   └── ToastContext.tsx
├── types/
│   ├── app.ts                # All TypeScript types + tag constants
│   └── global.d.ts           # declare module "*.css" (fixes VS Code import warning)
scripts/
├── rakija-seed.csv           # Fill this in with Bulgarian rakiya data
└── csv-to-sql.ts             # npx tsx scripts/csv-to-sql.ts > seed.sql
public/
├── manifest.json
├── sw.js
└── icons/                    # PWA icons
```

---

## Seed Data Workflow (when user returns)

1. Open `scripts/rakija-seed.csv` in Excel / Google Sheets
2. Add rows — one rakiya per row
3. Run: `npx tsx scripts/csv-to-sql.ts > seed.sql`
4. If there are validation errors they print to stderr; fix and re-run
5. Open Supabase → SQL Editor → paste `seed.sql` → Run
6. Check `/discover` to confirm entries appear

CSV column reference:
- `fruit`: `plum` `grape` `apricot` `pear` `fig` `quince` `mixed` `other`
- `country`: leave blank → inserts `Bulgaria`
- `abv`: decimal, e.g. `40` or `43.5`
- `is_verified`: `true` / `false` (blank → `false`)
- Wrap values with commas in double quotes: `"Иванов, Петров ООД"`

---

## Killer Features (priority recommendation for future)

1. **Venue Check-in + Местен Feed** (L1) — ракията е социален ритуал, почти винаги пита се на маса. Обвързването на оценка с конкретна механа е уникално за BG. Строг cultural fit.
2. **Wishlist "Искам да пробвам"** (S2) — затваря discovery loop-а. Нужна е само нова `wishlists` таблица и бутон на detail страницата.
3. **Детайлни статистики** (M5) — charts по плод, score distribution, timeline. recharts е вече популярна в Next.js проекти.
