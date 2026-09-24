"""A static server for the game, with caching switched off.

Safari on a phone will hold onto a cached config.js across a reload, which
during testing looks exactly like a change that did not work. no-store is
what makes a reload on the phone mean what it says.
"""
import functools
import http.server
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 4173


class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        super().end_headers()

    def log_message(self, fmt, *args):
        sys.stderr.write("%s %s\n" % (self.address_string(), fmt % args))


handler = functools.partial(Handler, directory=ROOT)
server = http.server.ThreadingHTTPServer(("0.0.0.0", PORT), handler)
print("serving %s on http://0.0.0.0:%d/" % (ROOT, PORT), flush=True)
server.serve_forever()
