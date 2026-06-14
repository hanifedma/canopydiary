# CanopyDiary

A lightweight local-first diary web app with optional Google sign-in, dated notes, separate daily pictures, and a date-sorted gallery.

## What Is Included

- Static frontend that can be hosted on GitHub Pages.
- Opens directly into the diary and saves locally by default.
- Each diary entry has a title and body text.
- Optional Firebase Authentication with Google provider only for cloud sync.
- Firestore notes under `users/{uid}/notes/{yyyy-mm-dd}`.
- Firebase Storage pictures under `users/{uid}/images/{date}/...`.
- Gallery sorted by date; clicking a picture opens the note for that day.
- Picture delete control in the image dialog after opening a picture.
- Autosaves diary text after you pause writing, with no Save click required.
- Favicon, web app manifest, robots file, and social/SEO metadata.
- Firestore and Storage rules that require Google sign-in ownership.
- Local storage mode works even before real Firebase config is added.

## Local Use

Run a local static server from this folder:

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173`.

The app starts in local mode immediately. If Firebase is configured, the header shows a Google sign-in button for people who want cloud storage.

## Firebase Setup Notes

1. Create a Firebase project.
2. Enable Authentication, then enable only the Google sign-in provider.
3. Create Firestore and Firebase Storage.
4. Copy your web app config into `firebase-config.js`.
5. Deploy `firestore.rules` and `storage.rules`.
