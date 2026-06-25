// Generates out/index.html for the site root. The static export has no
// middleware, so this picks the locale on the client (Russian → /ru, otherwise
// the default /en) and redirects. Relative URLs keep it working under any base
// path (e.g. the GitHub Pages /react-stateful-hooks/ prefix).
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta http-equiv="refresh" content="0; url=./en/" />
    <link rel="canonical" href="./en/" />
    <title>react-stateful-hooks</title>
    <script>
      (function () {
        var lang = (navigator.language || 'en').toLowerCase();
        location.replace(lang.indexOf('ru') === 0 ? './ru/' : './en/');
      })();
    </script>
  </head>
  <body>
    Redirecting to <a href="./en/">the documentation</a>…
  </body>
</html>
`;

writeFileSync(join(process.cwd(), 'out', 'index.html'), html);
console.log('Wrote out/index.html locale redirect');
