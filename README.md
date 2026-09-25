# JobFlow

JobFlow is a focused, full-stack workspace for managing a modern job search. Track applications, organize follow-ups, prepare for interviews, manage resume versions, and understand your search momentum from one calm dashboard.

> A polished React and Express portfolio project with server-backed authentication, application workflows, analytics, and Netlify deployment support.

## Live Demo

Visit the deployed application: [demo-jobflow.netlify.app](https://demo-jobflow.netlify.app/)

## Product Highlights

- Dashboard with application metrics, activity charts, funnel progress, and upcoming actions
- Application table and Kanban views with search, filtering, sorting, export, and CRUD workflows
- Application detail pages with status updates, notes, timelines, and next-action completion
- Calendar view for interviews, deadlines, and follow-ups
- Analytics workspace with activity, sources, status distribution, and time-range controls
- Resume library with create, rename, download, and delete actions
- Editable profile and persisted notification preferences
- Demo mode plus email/password authentication
- Light and dark themes with responsive layouts for desktop and mobile

## Tech Stack

| Layer             | Technology                                                 |
| ----------------- | ---------------------------------------------------------- |
| Frontend          | React 19, TypeScript, React Router, Recharts, Lucide React |
| Build             | Vite, Tailwind CSS v4                                      |
| Backend           | Node.js, Express 5, serverless-http                        |
| Authentication    | HttpOnly cookie sessions, Node `scrypt` password hashing   |
| Local persistence | JSON data store in `server/data`                           |
| Deployment        | Netlify static hosting and Netlify Functions               |

## Getting Started

### Requirements

- Node.js 22 or newer
- npm

### Install

```bash
npm install
```

### Start the full-stack app

```bash
npm run dev:full
```

Open [http://localhost:5173](http://localhost:5173). The Vite development server proxies `/api` requests to the Express API on port `3001`.

### Demo account

```text
Email:    demo@jobflow.app
Password: demo1234
```

You can also select **View Demo** or **Continue with Demo** from the authentication screens.

## Available Scripts

```bash
npm run dev       # Start the Vite frontend
npm run server    # Start the Express API on port 3001
npm run dev:full  # Start frontend and API together
npm run build     # Type-check and create a production build
npm run lint      # Run ESLint
npm run preview   # Preview the production frontend locally
```

## API Overview

The backend exposes the following authenticated workflows:

- `POST /api/auth/demo` - Start a demo session
- `POST /api/auth/signup` - Create an account
- `POST /api/auth/login` - Sign in
- `POST /api/auth/logout` - End a session
- `GET /api/session` - Load the current user workspace
- `POST /api/applications` - Create an application
- `PATCH /api/applications/:id` - Update an application
- `DELETE /api/applications/:id` - Delete an application
- `PATCH /api/profile` - Update profile information
- `GET|POST|PATCH|DELETE /api/resumes` - Manage resume records
- `PATCH /api/preferences` - Update notification and theme preferences
- `DELETE /api/account` - Delete the current account

## Netlify Deployment

The repository includes [netlify.toml](netlify.toml) and an Express adapter at [netlify/functions/api.js](netlify/functions/api.js).

### Netlify UI

1. Push the repository to GitHub.
2. In Netlify, choose **Add new site** and **Import an existing project**.
3. Select the repository.
4. Use these settings:

```text
Build command:      npm run build
Publish directory:  dist
Functions directory: netlify/functions
```

5. Deploy the site.

The included redirects route `/api/*` to the serverless API and route client-side React paths to `index.html`.

### Netlify CLI

```bash
npx netlify login
npx netlify deploy --prod
```

## Persistence Note

Local development uses `server/data/jobflow.json`, which is intentionally ignored by Git. Netlify Functions run in an ephemeral environment, so the JSON store is appropriate for local development and demo deployments but not durable multi-user production data.

For a production SaaS deployment, replace the file store with a hosted database such as Supabase, Neon/Postgres, or MongoDB, and store session state in a durable session or token system.

## Validation

```bash
npm run lint
npm run build
node --check server/index.js
node --check netlify/functions/api.js
```

## Repository

GitHub: [dev-priyanshuyadav/JobFlow](https://github.com/dev-priyanshuyadav/JobFlow)
