/* Stamps a build id onto every local css/js URL in www/index.html.

   Two things make a rebuilt Capacitor app keep showing the previous version,
   and one stamp defeats both:

   - WKWebView caches by URL, and installing over an app does not clear its
     data container, so the webview happily re-serves the stylesheet it read
     last time. A new query string is a new URL, so there is nothing to hit.
   - Xcode treats App/public as a folder reference and skips re-copying it
     when it looks unchanged (the symptom is a "Build succeeded" that takes
     half a second). Rewriting index.html every build gives it something it
     cannot skip.

   Only the built copy under www/ is touched; the source index.html stays
   clean, so running the game straight from the checkout is unaffected. The
   GitHub Pages deploy (.github/workflows/static.yml) publishes www/ too, for
   the same reason: a browser holding one script from the last deploy must
   not pair it with a fresh copy of another. */

const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'www', 'index.html');
const stamp = Date.now().toString(36);

const html = fs.readFileSync(file, 'utf8');
const stamped = html.replace(
    /(\s(?:src|href)=")((?:css|js)\/[^"?]+?)(?:\?[^"]*)?(")/g,
    (_match, before, url, after) => `${before}${url}?v=${stamp}${after}`
);

const count = (stamped.match(/\?v=/g) || []).length;
fs.writeFileSync(file, stamped);
console.log(`stamped ${count} asset urls in www/index.html with ?v=${stamp}`);
