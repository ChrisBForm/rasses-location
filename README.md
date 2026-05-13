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
│   │   ├── layout.js              # Root layout (Header + Footer wrapper)
│   │   ├── page.js                # Home page
│   │   ├── page.module.css        # Home page styles
│   │   └── globals.css            # Global styles
│   └── component/
│       ├── header.js              # Header component
│       ├── header.module.css      # Header styles
│       ├── footer.js              # Footer component
│       └── footer.module.css      # Footer styles
├── lib/
│   └── firebase/
│       └── config.js              # Firebase configuration
├── public/
│   ├── marguerite/                # Decorative flower SVG assets
│   ├── house/                     # House placeholder images
│   ├── globe.svg                  # Language selector icon
│   ├── activities.svg             # Activities icon
│   ├── file.svg                   # File icon
│   └── [other SVGs]
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
- Admin login button

### Home Page (`src/app/page.js`)

- Dynamic gallery of house placeholder images
- Randomized decorative flowers
- Sticky "MANUALS" action button
- Responsive grid layout

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
