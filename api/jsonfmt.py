"""Developer cluster — JSON formatter / validator / minifier (Vercel serverless).

NOTE: this file is deliberately NOT named json.py — the dev router imports modules
by group name via importlib, and `import_module("json")` would shadow the stdlib
json module (and this file importing `json` would import itself). Group = "jsonfmt".

Moat over JS formatters: Python's `json` gives exact error line/column, and we also
accept Python dict/list literals (True/None/single quotes) via ast.literal_eval and
convert them to real JSON. Pure standard library. No API calls. Nothing stored.
"""
from http.server import BaseHTTPRequestHandler
import json
import ast


def _count(obj):
    """(keys, max_depth) for a parsed structure."""
    keys = 0
    if isinstance(obj, dict):
        keys += len(obj)
        depth = 1 + max((_count(v)[1] for v in obj.values()), default=0)
        keys += sum(_count(v)[0] for v in obj.values())
        return keys, depth
    if isinstance(obj, list):
        depth = 1 + max((_count(v)[1] for v in obj), default=0)
        keys += sum(_count(v)[0] for v in obj)
        return keys, depth
    return keys, 0


def format_json(p):
    text = p.get("text", "") or ""
    if not text.strip():
        raise ValueError("Paste some JSON to format.")

    minify = bool(p.get("minify"))
    sort = bool(p.get("sort"))
    indent_opt = p.get("indent", 2)

    source = "json"
    try:
        data = json.loads(text)
    except json.JSONDecodeError as je:
        # Fall back to a Python literal (single quotes, True/False/None, tuples).
        try:
            data = ast.literal_eval(text)
            source = "python"
        except Exception:  # noqa: BLE001 — report the original JSON error, it's more useful
            return {
                "valid": False,
                "title": "Invalid JSON",
                "verdict": f"Invalid JSON: {je.msg} at line {je.lineno}, column {je.colno}.",
                "errorLine": je.lineno,
                "errorCol": je.colno,
                "result": "",
            }

    try:
        if minify:
            result = json.dumps(data, separators=(",", ":"), ensure_ascii=False, sort_keys=sort)
        else:
            indent = "\t" if indent_opt == "tab" else int(indent_opt)
            result = json.dumps(data, indent=indent, ensure_ascii=False, sort_keys=sort)
    except (TypeError, ValueError) as e:
        return {
            "valid": False,
            "title": "Could not serialize",
            "verdict": f"Parsed the input but could not convert it to JSON: {e}.",
            "result": "",
        }

    keys, depth = _count(data)
    top = (
        f"object with {len(data)} key{'s' if len(data) != 1 else ''}" if isinstance(data, dict)
        else f"array of {len(data)} item{'s' if len(data) != 1 else ''}" if isinstance(data, list)
        else type(data).__name__
    )
    note = "Converted from a Python literal to JSON. " if source == "python" else ""
    verdict = (
        f"{note}Valid JSON — {top}, {keys} total keys, {depth} level{'s' if depth != 1 else ''} deep. "
        f"{'Minified' if minify else 'Formatted'} output is {len(result):,} characters."
    )

    return {
        "valid": True,
        "title": "Minified JSON" if minify else "Formatted JSON",
        "verdict": verdict,
        "result": result,
        "source": source,
        "rows": [
            ["Status", "Valid JSON" if source == "json" else "Valid (from Python literal)"],
            ["Top level", top],
            ["Total keys", f"{keys:,}"],
            ["Max depth", depth],
            ["Output size", f"{len(result):,} chars"],
        ],
    }


TESTS = {"format": format_json}


def compute(payload):
    test = payload.get("test")
    if test not in TESTS:
        raise ValueError(f"Unknown operation: {test}")
    return TESTS[test](payload)


class handler(BaseHTTPRequestHandler):
    def _send(self, code, body):
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.end_headers()
        self.wfile.write(json.dumps(body).encode())

    def do_OPTIONS(self):
        self._send(204, {})

    def do_POST(self):
        try:
            length = int(self.headers.get("Content-Length", 0))
            payload = json.loads(self.rfile.read(length) or b"{}")
            self._send(200, compute(payload))
        except ValueError as e:
            self._send(400, {"error": str(e)})
        except Exception as e:  # noqa: BLE001
            self._send(500, {"error": f"Computation failed: {e}"})
