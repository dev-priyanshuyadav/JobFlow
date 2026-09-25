# JobFlow

JobFlow is a full-stack job application tracker built with React, TypeScript, Vite, Express, and a file-backed server database.

## Run locally

Install dependencies:

```bash
npm install
```

Start the frontend and API together:

```bash
npm run dev:full
```

Open `http://localhost:5173`.

The API runs on `http://localhost:3001`. During development, Vite proxies `/api` requests to the API server.

## Demo account

- Email: `demo@jobflow.app`
- Password: `demo1234`

The “View Demo” and “Continue with Demo” actions use the same server-backed session.

## Production

Build the frontend and start the server:

```bash
npm run build
npm run server
```

The Express server serves the generated frontend from `dist` and exposes the API under `/api`.

## Deploy to Netlify

This repository includes `netlify.toml` and a Netlify Function at `netlify/functions/api.js`.

1. Push the project to GitHub.
2. In Netlify, choose **Add new site** > **Import an existing project**.
3. Select the repository and keep the detected settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions`
4. Deploy the site.

The Netlify redirects send `/api/*` requests to the Express function and route React pages back to `index.html`.

For a real multi-user production deployment, replace the JSON file store in `server/data` with a hosted database such as Supabase, Neon/Postgres, or MongoDB. Netlify Functions use ephemeral server storage, so the included JSON store is suitable for local development and a demo deployment only.

## Backend features

- Cookie-based sessions
- Signup and password login using scrypt password hashing
- Demo account flow
- Application create and update endpoints
- Notification read-state persistence
- JSON persistence in `server/data/jobflow.json`

The JSON database is generated on first server start and intentionally ignored by Git so local user data is not committed.

## Validation

```bash
npm run lint
npm run build
```
