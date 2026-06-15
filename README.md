# Rasses Location Website

A Next.js App Router website for Rasses Location with Firebase authentication, localized UI, a map-based activities page, and a protected manuals/admin area.

## Getting Started

### Install dependencies

```bash
npm install
```

### Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build and Production

```bash
npm run build
npm run start
```

### Linting

```bash
npm run lint
```

## Project Structure

```txt
rasses-location/
├── src/
│   ├── app/
│   │   ├── layout.js              # Root layout, locale loading, Header/Footer
│   │   ├── page.js                # Home page with Firebase house gallery
│   │   ├── auth/                  # Auth page for email/password sign-in
│   │   ├── activities/            # Auth-protected Google Maps page
│   │   ├── manuals/               # Auth-protected PDF manual browser
│   │   ├── admin/                 # Protected admin dashboard area
│   │   └── api/                   # Route handlers for flowers and pages
│   ├── component/                 # Shared components and CSS modules
│   ├── hooks/                     # Client hook for auth requirement
│   └── lib/firebase/              # Firebase config + initialization
├── messages/                      # Localization JSON files
├── public/                        # Static assets and image library
├── package.json                   # Dependencies and scripts
└── README.md                      # This file
```

## Key Features

- Next.js App Router with `next-intl` localization and locale cookie support
- Firebase Authentication for sign-in and protected routes
- Home page loads house images from `Firebase Storage` and decorative flowers from `/api/flowers`
- Activities page uses Google Maps with Places Autocomplete and an interactive marker search box
- Manuals page filters PDF files by locale and allows search on manual titles
- Admin dashboard at `/admin` and admin pages list at `/admin/pages`
- Responsive layouts with component-scoped CSS Modules

## Routes

- `/` - Home page with dynamic image grid and flower overlays
- `/auth` - Email/password Firebase login page
- `/activities` - Protected activities map page
- `/manuals` - Protected manuals browser with locale-based filtering
- `/admin` - Protected admin dashboard with Firebase storage stats
- `/admin/pages` - Protected admin pages list fetched from `/api/pages`
- `/api/flowers` - Returns local `public/marguerite` image URLs
- `/api/pages` - Returns page metadata used by the admin pages list

## Authentication

- `src/hooks/useRequireAuth.js` redirects unauthenticated users to `/auth`
- `/activities`, `/manuals`, `/admin`, and `/admin/pages` require a signed-in Firebase user
- `/auth` supports sign-in and sign-out with email/password

## Firebase

Firebase is configured in `src/lib/firebase/config.js`.

Required environment variables:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`

## Google Maps

The activities page uses `@vis.gl/react-google-maps` with the Places library.

Required environment variable:

- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

## Localization

- The app supports English and French via `next-intl`
- The current locale is stored in a cookie named `site_lang`
- The header language selector reloads the page after selection
- The manuals page filters PDF files by language suffixes like `_EN.pdf` or `-FR.pdf`
- Manual titles are formatted by removing the extension and language suffix

## How Manuals Work

- The manuals page loads files from Firebase Storage `manuals/`
- It filters names by the active locale: `EN` or `FR`
- It also supports client-side search by manual title

## Admin Area

- `/admin` shows statistics for manuals and house images
- `/admin/pages` loads page metadata from `/api/pages`
- Both pages require Firebase authentication

## Local Assets

- Decorative marguerite assets are stored under `public/marguerite`
- `/api/flowers` exposes those assets as JSON image URLs

## Dependencies

Key dependencies in `package.json`:

- `next` ^15.0.0
- `react` 19.2.4
- `react-dom` 19.2.4
- `next-intl` ^4.13.0
- `firebase` ^12.13.0
- `@vis.gl/react-google-maps` ^1.8.3

## Notes

- The app uses CSS Modules for component styling
- `src/app/layout.js` loads the locale from cookies and provides translations
- Protected routes use client-side auth state and redirect if the user is not signed in
- The home page asset library is loaded from Firebase storage at path `house`
