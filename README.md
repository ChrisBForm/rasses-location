# Rasses Location Website

A modern Next.js-based website for Rasses Location using the App Router architecture.

## Getting Started

### Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

The page auto-updates as you edit files.

## Project Structure

```txt
rasses-location/
├── src/
│   ├── app/
│   │   ├── layout.js              # Root layout with shared Header/Footer
│   │   ├── page.js                # Home page blueprint
│   │   ├── globals.css            # Global styles
│   │   └── [feature folders]      # Additional routes like /activities, /auth, /manuals
│   ├── component/
│   │   ├── header.js              # Header with language selector and navigation
│   │   ├── footer.js              # Site footer
│   │   └── [component styles]
│   └── lib/
│       └── firebase/
│           └── config.js          # Firebase configuration
├── public/                        # Static assets, icons, PDFs, images
├── eslint.config.mjs              # ESLint configuration
├── jsconfig.json                  # JavaScript configuration
├── next.config.mjs                # Next.js configuration
├── package.json                   # Dependencies and scripts
└── README.md                      # This file
```

## Key Features

- **Header Component** - Displays site branding, language selector, and navigation
- **Footer Component** - Shows company info, useful links, contact details, and admin login
- **Home Page** - Dynamic gallery layout with house placeholder images
- **Activities Page** - Interactive location map with a right-side search sidebar and content panel below
- **Firebase Auth Page** - Email/password sign-in at `/auth`
- **Decorative Elements** - Randomized marguerite flower overlays
- **Responsive Design** - Mobile-optimized layouts with CSS Grid
- **Static Assets** - SVG icons and image placeholders in public folder

## Component Details

### Header (`src/component/header.js`)

- Logo placeholder square (52px)
- Site name/branding text
- Language selector with globe icon
- Activities navigation link

### Footer (`src/component/footer.js`)

- Logo placeholder square (76px)
- Company info, useful links, and address sections
- Admin login button and `/auth` navigation

### Home Page (`src/app/page.js`)

- Dynamic gallery of house placeholder images
- Randomized decorative flowers
- Sticky action button for navigation
- Responsive grid layout

### Auth Page (`src/app/auth/page.js`)

- Firebase email/password login form
- Sign-in state display and sign-out support
- Styled in the same visual style as the main page

## Firebase

The auth page uses Firebase Authentication, and the Firebase configuration lives in `src/lib/firebase/config.js`.

Required environment variables:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`

## Google Maps

The activities page uses the Google Maps JavaScript API with Places Autocomplete.

Required environment variable:

- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

## Styling

The project uses **CSS Modules** for component-scoped styling:

- `*.module.css` files are locally scoped to their components
- Global styles in `globals.css`
- Color scheme: Green header/footer (#98A869), light background (#EFF1EC)

## Fonts

Optimized with [next/font](https://nextjs.org/docs/app/building-your-application/optimizing/fonts):

- Geist (sans-serif)
- Geist Mono (monospace)

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js Learn](https://nextjs.org/learn)
- [Next.js GitHub](https://github.com/vercel/next.js)

## Deployment

Deploy on [Vercel](https://vercel.com) (recommended for Next.js):

```bash
npm install -g vercel
vercel
```

Or see the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for other options.

## Localization / Language Selector

- The header includes a globe icon language selector. Click it to choose a language (e.g., English or Français).
- The selected language is stored in `localStorage` under the key `site_lang` and the page will automatically reload after selection so localized content and filters update.
- To add localized assets (manuals, PDFs), include the language code at the end of the filename before the extension. Examples:
  - `user-guide_EN.pdf`
  - `safety-manual_FR.pdf`
- The Manuals page (`/manuals`) filters the list of PDFs to only show files whose filename ends with the selected language code (matching `_EN.pdf`, `-FR.pdf`, etc.). The displayed title strips the language code and file extension (so `user-guide_EN.pdf` becomes `User Guide`).

## Testing the Language Flow

1. Start the dev server:

```bash
npm run dev
```

2. Open the site in your browser and click the globe in the header to change language.
3. The site will reload and the Manuals page will show only PDFs for the chosen language. If you add new localized PDFs, upload them to the `manuals` folder in Firebase Storage.

