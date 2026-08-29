# [Grandpa's Name] — Digital Tribute & Memorial Site
### Full Architecture Spec — for building with Antigravity, hosting on Vercel

---

## 1. What kind of site this is

This is a **digital memorial / tribute site** — the same category as commercial products like
Farewelling, Keeper Memorials, and Online-Tribute — but self-built and extended with features those
platforms don't normally do well: an **interactive family tree** that relatives can add themselves to,
a **standalone life timeline**, and a **live event/logistics hub** (countdown, order of service) for
the wake and burial.

Think of it as four things stitched together:
1. A **public tribute site** (biography, gallery, timeline, memory wall)
2. A **genealogy tool** (crowd-sourced family tree, rendered as a tree diagram)
3. A **lightweight event site** (countdown, schedule/order of events, maybe RSVP + directions)
4. A **customizable look** — the family can change the site's color palette without touching code

...all sitting behind **one simple admin dashboard** that your non-technical uncles/aunts can log into
without calling you.

---

## 2. Recommended tech stack

Chosen for: (a) fast to build with an AI coding agent, (b) deploys cleanly to Vercel, (c) gives you
a real admin dashboard without needing a separate CMS product to learn.

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 14+ (App Router, TypeScript)** | Vercel's native framework — zero-config deploy, great for mixing static tribute pages with dynamic admin pages |
| Styling / animation | **Tailwind CSS + Framer Motion** | Framer Motion is the standard way to do parallax/scroll-linked animation in React; Tailwind keeps styling fast for an AI agent to generate consistently |
| Database + Auth + File storage | **Supabase** (hosted Postgres) | One service gives you: a real relational DB (needed for the family tree graph), row-level security, built-in auth (for admin + family-editor logins), and object storage for photos — all with a free tier, all reachable from Vercel |
| Family tree rendering | **`family-chart`** or **`react-d3-tree`** (npm packages) | Purpose-built libraries for rendering genealogical trees from parent/child/spouse data — far less work than hand-rolling tree layout math |
| Image handling | Supabase Storage + `next/image` | Automatic resizing/optimization for all the photo galleries |
| Forms (memory wall, tree submissions, RSVP) | Native React forms + Supabase insert, with a `status` field (`pending`/`approved`) | Lets you moderate what goes public before it's visible |
| Theming | **CSS custom properties** (CSS variables) driven by a `site_settings` row | Lets the admin change the whole site's color palette from a form, without redeploying code |
| Deployment | **Vercel** | As you already planned — connects directly to your GitHub repo, auto-deploys on push |

**Confirmed decisions so far:**
- Family tree: **public-submit with moderation** (anyone can add themselves/a relative; you approve before it's visible).
- Memory wall: **one unified feature** — tributes/condolences and personal stories about him live in the same place, not split into two separate sections.
- Timeline: **its own page** in the nav, not folded into Biography.
- Color palette: **admin-customizable**, not hardcoded.

---

## 3. Site map (public-facing)

```
/                     → Landing / Hero (parallax intro, name, dates, portrait)
/biography            → Life story, written biography
/timeline             → Life timeline — key milestones and moments (own page)
/gallery              → Photo (and video) gallery, organized by era or album
/memory-wall          → Public memory wall — tributes, condolences, and personal stories, submit + view
/family-tree          → Interactive tree visualization + "add yourself/a relative" form
/service              → Countdown timer + order of events for wake keep & burial day
/rsvp  (optional)     → RSVP / attendance form, if you want headcounts
/donate (optional)    → Optional — link out or embed a donation page if the family wants one
```

Admin-only routes (not in the public nav):
```
/admin                → Dashboard home (login-gated)
/admin/biography       → Edit bio sections
/admin/timeline         → Add/edit/reorder timeline milestones
/admin/gallery         → Upload/delete/reorder photos, organize into albums
/admin/memory-wall      → Approve/reject/edit submitted memory wall posts
/admin/family-tree      → Approve/reject submitted family members, manually edit relationships
/admin/service          → Edit order-of-events list, set burial/wake date+time for the countdown
/admin/appearance       → Choose the site's color palette/theme
/admin/users            → (you only) manage which family members have admin/editor logins
```

---

## 4. Design direction: parallax + tabs

- **Hero section**: full-bleed portrait photo with a slow parallax scroll (photo moves slower than
  the page scroll), name + dates fading/sliding in. Framer Motion's `useScroll` + `useTransform`
  hooks are the standard way to do this in Next.js.
- **Section transitions**: as the user scrolls from Hero → Biography → Gallery → Memory Wall, each
  section can fade/slide in (`whileInView` in Framer Motion) rather than everything loading flat —
  this is what gives the "beautifully designed" feel rather than a static page.
- **Tabs**: use tabs (not separate full page loads) for things like switching between photo albums
  in the gallery, or switching between "Wake Keep" and "Burial Day" schedules on the `/service` page —
  keeps the parallax page feeling continuous rather than resetting on every click.
- **Tone**: warm, dignified, generous whitespace. The default palette can lean on soft creams, deep
  greens/navys, and serif headline type (as the commercial memorial sites do) — but since color is
  admin-customizable (see Section 9), treat this as the *starting* palette, not a hardcoded one.
- Read the `frontend-design` skill/notes before generating any UI in Antigravity — for consistent,
  non-templated-looking styling rather than default Tailwind component looks.

---

## 5. Data model (Supabase / Postgres)

```
family_members
  id (uuid, pk)
  full_name
  relationship_to_grandpa (text, e.g. "Grandson", "Daughter-in-law")
  parent_id (uuid, nullable, fk -> family_members.id)   -- for tree structure
  spouse_id (uuid, nullable, fk -> family_members.id)
  photo_url (nullable)
  bio_note (text, nullable, short)
  submitted_by_email (text, nullable)
  status (enum: pending | approved | rejected)
  created_at

memory_wall_posts
  id (uuid, pk)
  author_name
  author_relationship (nullable)
  title (nullable)          -- optional, lets a longer story have a headline; condolence-style
                              -- posts can just skip it
  message (text)
  photo_url (nullable)
  status (enum: pending | approved | rejected)
  created_at

gallery_photos
  id (uuid, pk)
  album_name (text)     -- e.g. "Childhood", "Wedding", "Later Years"
  image_url
  caption (nullable)
  sort_order (int)

biography_sections
  id (uuid, pk)
  section_key (text)     -- e.g. "intro", "early-life", "career", "family"
  heading
  body (rich text / markdown)
  sort_order

timeline_events
  id (uuid, pk)
  year
  title
  description (nullable)
  photo_url (nullable)
  sort_order

service_events            -- the "order of events" for the day
  id (uuid, pk)
  event_day (enum: wake_keep | burial)
  time
  title              -- e.g. "Arrival & Seating", "Tributes", "Committal", "Reception"
  description (nullable)
  sort_order

site_settings
  id (uuid, pk)
  burial_datetime         -- powers the countdown
  wake_keep_datetime
  venue_name
  venue_address
  livestream_url (nullable)
  primary_color            -- hex, e.g. "#2F4538" — drives the theme (see Section 9)
  secondary_color (nullable)
  accent_color (nullable)

admin_users
  id (uuid, pk, matches Supabase auth.users.id)
  full_name
  role (enum: super_admin | editor)
```

`parent_id` / `spouse_id` as self-referencing foreign keys is what lets the tree-rendering library
walk the graph and lay it out visually — this is the key structural decision, so it's worth getting
right before building the UI on top of it.

---

## 6. Family tree feature — how it actually works

1. **Public "Add yourself / a relative" form** on `/family-tree`: name, relationship, whose child/spouse
   they are (a searchable dropdown of existing approved members), optional photo, optional short note,
   their email (so you can follow up if something looks wrong).
2. Submission goes into `family_members` with `status = pending` — **not visible on the public tree yet**.
3. You (or a family admin) approve it from `/admin/family-tree`. On approval, it becomes part of the
   rendered tree.
4. The public `/family-tree` page fetches all `approved` rows, builds a nested tree structure in
   JavaScript from the flat `parent_id`/`spouse_id` data, and passes it to `family-chart` (or
   `react-d3-tree`) to render as an actual branching tree diagram — pannable/zoomable, tap a node to
   see that person's photo + short bio.
5. Edge case to plan for up front: **what root does the tree hang from?** Simplest approach — grandpa
   is the fixed root node, everyone else attaches as a descendant, spouse, or ancestor relative to him.
   This avoids ambiguity about "whose tree is this."

---

## 7. Timeline page

- Separate from Biography and from the family tree — purely a chronological visual of milestones:
  birth, marriage, children, career highlights, retirement, whatever the family wants included.
- Pulled from `timeline_events`, ordered by `sort_order` (usually chronological by year).
- Visually this works well as a vertical line down the page with alternating left/right cards (year,
  title, short description, optional photo) revealed with a scroll-triggered fade/slide — consistent
  with the parallax feel of the rest of the site, distinct from the family tree's branching-graph look.

---

## 8. Memory wall — tributes and personal stories, unified

One page, one table (`memory_wall_posts`), one moderation queue — instead of splitting "short
condolence messages" and "personal stories about him" into two separate features:

1. Anyone visiting `/memory-wall` can submit a post: their name, relationship (optional), an optional
   title (people writing a real story like "the time he taught me to drive" will want a headline;
   people just leaving a short condolence can skip it), the message itself, and an optional photo.
2. Submission goes in as `status = pending` — not public yet.
3. You/admins approve or reject from `/admin/memory-wall`.
4. Approved posts render publicly, newest first (or you could let admins pin a few favorites to the
   top — optional, not required for v1).
5. No length limit enforced in the data model — a two-line condolence and a five-paragraph story both
   fit the same shape, so people can write as much or as little as feels right.

---

## 9. Customizable color palette

Goal: a family member can change the site's whole look (e.g. from deep green to soft navy) from the
admin dashboard, without anyone touching code or redeploying.

**How it works technically:**
- `site_settings` stores `primary_color`, `secondary_color`, `accent_color` as hex values.
- The root layout (`app/layout.tsx`) fetches `site_settings` server-side on each request and injects
  those values as CSS custom properties on the root element, e.g.:
  `<html style={{ '--color-primary': settings.primary_color, ... }}>`
- Tailwind config references those CSS variables (`colors.primary = 'var(--color-primary)'`) instead
  of hardcoded hex values, so every component using `bg-primary` / `text-primary` etc. automatically
  reflects whatever's stored in the database.
- `/admin/appearance` is just a form with **3 color pickers** (primary/secondary/accent) and a live
  preview pane — no CSS knowledge needed. Optionally, offer a handful of curated preset palettes as
  one-click buttons ("Sage & Cream," "Navy & Gold," etc.) in addition to the raw pickers, so it's hard
  to accidentally pick a combination that looks bad.
- Keep this to a small, curated set of variables (a handful of colors) rather than exposing fonts,
  spacing, etc. — enough to make the site feel personalized without opening up a full design tool.

---

## 10. Admin dashboard — built for non-technical relatives

Design goal: your aunts/uncles should be able to do everything with **buttons and forms, never code
or markdown syntax.**

- **Login**: Supabase Auth, email + password (or magic link — even easier, no password to forget).
  You create their accounts from `/admin/users` and just send them the login link.
- **Roles**: `super_admin` (you) can manage users and everything else; `editor` (family members) can
  upload photos, write/approve memory wall posts, edit the schedule — but not delete the whole site or
  manage other admins.
- **Uploading photos**: a simple drag-and-drop or "choose file" button per album — no need to touch
  file names or folders; the backend handles storage paths.
- **Editing the biography/timeline**: a basic rich-text box (bold/italic/paragraphs only — skip
  anything that looks like a code editor) per section, with a live preview alongside it.
- **Approving memory wall posts/tree members**: a simple queue — "Approve" / "Reject" buttons on each
  pending submission, nothing more complex.
- **Editing the schedule/countdown**: a form with fields like "Event name," "Time," and a date/time
  picker for the burial/wake datetime that drives the homepage countdown.
- **Appearance**: the 3-color-picker panel described in Section 9.

Because this is one dashboard, one login system, and mostly single-purpose forms, it should stay
approachable — the risk to avoid is over-engineering it into something that looks like a developer
tool.

---

## 11. Countdown + order of events page

- **Countdown**: client-side component reading `site_settings.burial_datetime` (and/or
  `wake_keep_datetime`), rendering a live days/hours/minutes/seconds countdown. After the date passes,
  swap the countdown for a "Thank you for celebrating [name]'s life with us" message rather than
  showing a negative countdown.
- **Order of events**: pull from `service_events`, grouped and tabbed by `wake_keep` vs `burial`,
  sorted by `sort_order`/`time`. Render as a simple vertical timeline/agenda list (time on the left,
  event name + description on the right) — this is the "order of events for that day" page you
  described.
- Optionally add venue name/address with an embedded map, and a livestream link field if the service
  will be streamed for family abroad.

---

## 12. Build phases (a sensible order to hand to Antigravity)

1. **Scaffold**: Next.js + Tailwind + Supabase project wired up, deployed to Vercel from an empty repo
   first (so the pipeline works before there's real content).
2. **Static content pages**: Hero, Biography, Timeline, Gallery, Service/Countdown — all reading from
   Supabase but with no auth yet (just get the public site looking right).
3. **Memory wall**: public submit form + moderation queue.
4. **Family tree**: data model + submission form + tree rendering (the most complex piece — build
   last among the public features so the rest of the stack is proven first).
5. **Theming**: CSS-variable palette wired up, with a couple of preset palettes to test it against.
6. **Admin dashboard + auth**: once all the content types exist, wrap them in the moderation/editing
   UI and lock it behind login.
7. **Polish pass**: parallax/scroll animation, responsive/mobile check, final content load.

---

## 13. Notes for Antigravity

- Give it this document as the build brief, plus the actual biography text/photos/documents once
  you have them attached, rather than "figure it out" — the agent will do much better with the
  concrete schema and page list above than with a one-line prompt.
- Ask it to set up Supabase and Vercel project linkage early and verify a real deploy before writing
  every feature, so you catch environment/config issues while the codebase is still small.
- Explicitly tell it your target style ("dignified, warm, parallax scroll, tabs for schedule/gallery")
  since without that it will likely default to a generic dashboard-style layout.
