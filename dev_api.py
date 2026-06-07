"""Local-only dev server for the Python API handlers. Not deployed (lives outside api/).

Usage:  .venv/bin/python dev_api.py        # serves api/<group>.py on :8000
Routes POST /api/<group> -> the matching module's compute(); mirrors the Vercel handlers.
"""
import sys
import json
import importlib
from http.server import BaseHTTPRequestHandler, HTTPServer

sys.path.insert(0, "api")


class Router(BaseHTTPRequestHandler):
    def _send(self, code, body):
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(json.dumps(body).encode())

    def do_OPTIONS(self):
        self._send(204, {})

    def do_POST(self):
        parts = [p for p in self.path.split("?")[0].split("/") if p]
        group = parts[1] if len(parts) >= 2 and parts[0] == "api" else parts[-1]
        try:
            mod = importlib.import_module(group)
            importlib.reload(mod)  # pick up edits without restarting
            length = int(self.headers.get("Content-Length", 0))
            payload = json.loads(self.rfile.read(length) or b"{}")
            self._send(200, mod.compute(payload))
        except ValueError as e:
            self._send(400, {"error": str(e)})
        except Exception as e:  # noqa: BLE001
            self._send(500, {"error": f"dev router: {e}"})


if __name__ == "__main__":
    print("Dev API on http://localhost:8000 (POST /api/<group>)")
    HTTPServer(("127.0.0.1", 8000), Router).serve_forever()
