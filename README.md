# Finance Tracker

GitHub-ready static PWA package.

## Files

- `index.html` — app entry
- `app.js` — app logic
- `styles.css` — app styling
- `manifest.json` — PWA app name, icon, and install settings
- `sw.js` — service worker for offline cache and GitHub Pages compatibility
- `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` — home screen icons

## Deploy to GitHub Pages

1. Upload all files in this folder to the repository root.
2. Go to **Settings → Pages**.
3. Select **Deploy from a branch**.
4. Choose `main` and `/root`.
5. Wait for GitHub Pages to finish publishing.

## iPhone home screen

Open the GitHub Pages URL in Safari, then use **Share → Add to Home Screen**.  
The installed app should display as **Finance Tracker** with the included custom icon.

## Iteration rules

- Keep the files in the repository root.
- Do not upload the ZIP itself.
- Commit all changed files after each iteration.
- For PWA cache issues, delete and re-add the iPhone home screen app after deployment.
