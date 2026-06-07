"""Local-only dev server for the stats API handler. Not deployed (lives outside api/).

Usage:  .venv/bin/python dev_api.py     # serves api/stats.py handler on :8000
The deployed app uses Vercel's own runtime for api/*.py; this is only for `astro dev`.
"""
import sys
from http.server import HTTPServer

sys.path.insert(0, "api")
from stats import handler  # noqa: E402

if __name__ == "__main__":
    print("Dev stats API on http://localhost:8000")
    HTTPServer(("127.0.0.1", 8000), handler).serve_forever()
