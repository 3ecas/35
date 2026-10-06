/* Stamps a build id onto every local css/js URL in a build's index.html —
   www/index.html for the apps, and both pages of the website (site/ and
   site/play/) when given that folder instead: node tools/stamp.js site

   Two things make a rebuilt Capacitor app keep showing the previous version,
   and one stamp defeats both:

   - WKWebView caches by URL, and installing over an app does not clear its
     data container, so the webview happily re-serves the stylesheet it read
     last time. A new query string is a new URL, so there is nothing to hit.
   - Xcode treats App/public as a folder reference and skips re-copying it
     when it looks unchanged (the symptom is a "Build succeeded" that takes
     half a second). Rewriting index.html every build gives it something it
     cannot skip.

   Only built copies are touched; the source files stay clean, so running the
   game straight from the checkout is unaffected. The GitHub Pages deploy
   (.github/workflows/static.yml) publishes a stamped build too, for the same
   reason: a browser holding one script from the last deploy must not pair
   it with a fresh copy of another. */

const fs = require('fs');
const path = require('path');

const out = path.join(__dirname, '..', process.argv[2] || 'www');
const stamp = Date.now().toString(36);

// every index.html in the build, at the root and one folder down
const pages = [path.join(out, 'index.html')];
fs.readdirSync(out, { withFileTypes: true }).forEach((entry) => {
    const page = path.join(out, entry.name, 'index.html');
    if (entry.isDirectory() && fs.existsSync(page)) pages.push(page);
});

pages.forEach((file) => {
    const html = fs.readFileSync(file, 'utf8');
    const stamped = html.replace(
        /(\s(?:src|href)=")((?:[\w-]+\/)*(?:css|js)\/[^"?]+?|[\w-]+\.(?:css|js))(?:\?[^"]*)?(")/g,
        (_match, before, url, after) => `${before}${url}?v=${stamp}${after}`
    );
    const count = (stamped.match(/\?v=/g) || []).length;
    fs.writeFileSync(file, stamped);
    console.log(`stamped ${count} asset urls in ${path.relative(path.join(__dirname, '..'), file)} with ?v=${stamp}`);
});
