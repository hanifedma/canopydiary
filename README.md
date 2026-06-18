# CanopyDiary

A lightweight local-first diary web app with optional Google sign-in through Supabase, dated notes, separate daily pictures, a date-sorted gallery, and manual PDF export.

## What Is Included

- Static frontend that can be hosted on GitHub Pages.
- Opens directly into the diary and saves locally by default.
- Each diary entry has a title and body text.
- Optional Supabase Auth with Google provider for cloud sync.
- Supabase Postgres notes in `diary_notes`.
- Supabase private Storage pictures in the `diary-images` bucket.
- Realtime cloud refreshes across signed-in devices.
- Gallery sorted by entry date; clicking a picture opens the note for that day.
- Manual PDF export for a selected date range, including notes and pictures.
- Picture delete control in the image dialog after opening a picture.
- Autosaves diary text after you pause writing, with no Save click required.
- Favicon, web app manifest, robots file, and social/SEO metadata.
- Local storage mode works even before Supabase config is added.

## Local Use

Run a local static server from this folder:

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173`.

The app starts in local mode immediately. If Supabase is configured, the account popup shows a Google sign-in button for cloud storage.

## Supabase Setup Notes

1. Create a Supabase project.
2. Open the Supabase SQL editor and run `supabase-schema.sql`.
3. In Supabase Auth, enable the Google provider only.
4. In Supabase Auth URL settings, add your deployed site URL, for example `https://hanifedma.com`.
5. Copy your Supabase Project URL and anon public key into `supabase-config.js`.
6. Commit and push the updated `supabase-config.js` only if you are comfortable publishing that anon key. Supabase anon keys are designed for browser apps, but your Row Level Security policies must stay enabled.

Keep `supabase-schema.sql` as the source of truth for the database tables, Storage bucket, Row Level Security policies, and realtime table setup.
