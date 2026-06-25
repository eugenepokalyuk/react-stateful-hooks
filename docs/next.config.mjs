import nextra from 'nextra';

// On GitHub Pages the site is served from /<repo>/, so the deploy workflow sets
// BASE_PATH=/react-stateful-hooks. Local builds default to no base path so the
// static export can be previewed with a plain static server.
const basePath = process.env.BASE_PATH || '';

const withNextra = nextra({
  defaultShowCopyCode: true,
  // We deploy as a static export to GitHub Pages, so there is no middleware to
  // detect the locale. This prefixes every internal link with its locale.
  unstable_shouldAddLocaleToLinks: true,
});

export default withNextra({
  output: 'export',
  basePath,
  // Emit every route as <route>/index.html so clean directory URLs (and the
  // root redirect to ./en/) resolve correctly on GitHub Pages.
  trailingSlash: true,
  images: { unoptimized: true },
  // Read by the Nextra plugin to set up locales, then stripped before reaching
  // Next.js (the App Router does not use the `i18n` key itself).
  i18n: {
    locales: ['en', 'ru'],
    defaultLocale: 'en',
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  // Dev convenience only: `next dev` redirects the root to the default locale.
  // Ignored by `output: export` — the static build ships out/index.html (which
  // also detects the browser language) instead.
  async redirects() {
    return [{ source: '/', destination: '/en', permanent: false }];
  },
});
