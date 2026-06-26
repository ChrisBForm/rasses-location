# Rasses Location Website

A Next.js App Router website for Rasses Location with Firebase authentication, localized UI, a map-based activities page, and a protected manuals/admin area.

## Getting Started

### Install dependencies

```bash
npm install
```

### Environment

Copy the `.env.example` file, rename the copy to `.env.local`, and fill in your own Firebase and Google Maps values before starting the app.

```bash
cp .env.example .env.local
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
│   │   ├── layout.js                  # Root layout, locale loading, Header/Footer
│   │   ├── page.js                    # Home page with Firebase house gallery
│   │   ├── auth/                      # Auth page for email/password sign-in
│   │   ├── activities/                # Auth-protected Google Maps page
│   │   ├── manuals/                   # Auth-protected PDF manual browser
│   │   ├── admin/                     # Protected admin dashboard area
│   │   │   └── language/             # Admin page to manage translation files
│   │   └── api/
│   │       ├── flowers/               # Returns decorative flower image URLs
│   │       ├── pages/                 # Returns page metadata for admin list
│   │       ├── locales/               # Returns supported locales from Firebase config
│   │       └── admin/
│   │           └── languages/         # GET/PUT language JSON files in Firebase
│   │               └── config/        # PUT to update config.json (locales + names)
│   ├── component/                     # Shared components and CSS modules
│   ├── hooks/                         # Client hook for auth requirement
│   └── lib/firebase/                  # Firebase config + initialization
├── public/                            # Static assets and image library
├── package.json                       # Dependencies and scripts
└── README.md                          # This file
```

## Key Features

- Next.js App Router with `next-intl` localization and locale cookie support
- Firebase Authentication for sign-in and protected routes
- Home page loads house images from Firebase Storage and decorative flowers from `/api/flowers`
- Activities page uses Google Maps with Places Autocomplete and an interactive marker search box
- Manuals page filters PDF files by locale and allows search on manual titles
- Admin dashboard at `/admin` with storage statistics
- Admin language manager at `/admin/language` for editing and adding translation files
- Supported locales and their display names are stored in Firebase, with no hardcoded language list
- Responsive layouts with component-scoped CSS Modules

## Routes

- `/` — Home page with dynamic image grid and flower overlays
- `/auth` — Email/password Firebase login page
- `/activities` — Protected activities map page
- `/manuals` — Protected manuals browser with locale-based filtering
- `/admin` — Protected admin dashboard with Firebase storage stats
- `/admin/language` — Protected admin page to manage translation JSON files
- `/api/flowers` — Returns local `public/marguerite` image URLs
- `/api/pages` — Returns page metadata used by the admin pages list
- `/api/locales` — Returns supported locales and display names from Firebase config
- `/api/admin/languages` — GET all language files, PUT to update a language file
- `/api/admin/languages/config` — PUT to update `config.json` (locales list and display names)

## Authentication

- `src/hooks/useRequireAuth.js` redirects unauthenticated users to `/auth`
- `/activities`, `/manuals`, `/admin`, and `/admin/language` require a signed-in Firebase user
- Admin API routes additionally require the `admin` custom claim on the Firebase token
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
- `FIREBASE_SERVICE_ACCOUNT_KEY` — JSON key for Firebase Admin SDK (server-side only)
- `FIREBASE_MESSAGES_URL` — Base URL for the Firebase Storage `languages/` folder

## Google Maps

The activities page uses `@vis.gl/react-google-maps` with the Places library.

Required environment variable:

- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

## Localization

- Supported locales and their display names are stored in `languages/config.json` in Firebase Storage
- The current locale is stored in a cookie named `site_lang`
- The header language selector reads available locales dynamically from `/api/locales`
- The header reloads the page after a language selection to apply the new locale
- Translation files are stored in Firebase Storage under `languages/<locale>.json`
- The manuals page filters PDF files by language suffixes like `_EN.pdf` or `-FR.pdf`
- Manual titles are formatted by removing the extension and language suffix

## Firebase Storage Structure

```txt
languages/
├── config.json       # { "supportedLocales": ["en", "fr"], "localeNames": { "en": "English", "fr": "Français" } }
├── en.json           # English translations
├── fr.json           # French translations
└── <locale>.json     # Any additional languages added via the admin panel
manuals/              # PDF manuals filtered by locale suffix
house/                # House images shown on the home page
```

## How Manuals Work

- The manuals page loads files from Firebase Storage `manuals/`
- It filters names by the active locale: `EN` or `FR`
- It also supports client-side search by manual title

## Admin Area

- `/admin` shows statistics for manuals and house images
- `/admin/language` allows admins to edit translation JSON files directly and add new languages
- Adding a new language copies the English file as a base and updates `config.json` automatically
- All admin API routes are protected and require a valid Firebase token with the `admin` claim

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
- `firebase-admin` — used server-side for storage writes and token verification
- `@vis.gl/react-google-maps` ^1.8.3

## Notes

- The app uses CSS Modules for component styling
- `src/app/layout.js` loads the locale from cookies and fetches the matching translation file from Firebase Storage
- Translation files are fetched with a 1-hour revalidation cache; saving via the admin panel triggers an immediate cache bust via `revalidatePath`
- Protected routes use client-side auth state and redirect if the user is not signed in
- The home page asset library is loaded from Firebase Storage at path `house/`