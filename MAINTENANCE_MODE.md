# 🛠️ MAINTENANCE MODE ACTIVE

**ATTENTION AI AGENTS & MAINTAINERS:**

The application UI is currently in a "broken" state due to ongoing maintenance. To prevent users from seeing a broken interface, a **Maintenance Cover Page** has been deployed to the `index.html` file.

## Current State
- `public/index.html`: Contains the static maintenance cover HTML.
- `public/index.html.maintenance_backup`: Contains the **original** Vite entry point. **DO NOT OVERWRITE THIS.**
- All source code in `src/` and other directories is preserved.

## How to Restore
When the UI is ready to be re-enabled:
1. Copy the content of `public/index.html.maintenance_backup` back to `public/index.html`.
2. Delete this `MAINTENANCE_MODE.md` file.
3. Push the changes to GitHub.

**Note:** If you are working on the React app locally via `npm run dev`, you might need to restore `index.html` temporarily or adjust your dev server to see the actual app.
