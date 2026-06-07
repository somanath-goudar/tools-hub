"""Developer cluster compute endpoint (Vercel Python serverless function).

Tests that share a "pattern + flags + test string" input shape, run against
Python's own `re` engine (the moat: Python regex flavor — named groups
`(?P<name>...)`, `\\1` backrefs, re.VERBOSE, etc. — differs from JavaScript):
  match    -> all non-overlapping matches with capture groups + offsets
  replace  -> re.sub result and replacement count

Pure standard library — no external deps, no API calls, nothing stored.
"""
from http.server import BaseHTTPRequestHandler
import json
import re

# Allow-listed flags the UI can request → re constant.
_FLAGS = {
    "IGNORECASE": re.IGNORECASE,
    "MULTILINE": re.MULTILINE,
    "DOTALL": re.DOTALL,
    "VERBOSE": re.VERBOSE,
    "ASCII": re.ASCII,
}

MAX_TEXT = 100_000   # guard against pathological inputs / runaway backtracking
MAX_MATCHES = 1000   # cap rows returned to the client


def _compile(pattern, flags):
    if pattern is None or pattern == "":
        raise ValueError("Enter a regular expression pattern.")
    bits = 0
    for f in flags or []:
        if f in _FLAGS:
            bits |= _FLAGS[f]
    try:
        return re.compile(pattern, bits)
    except re.error as e:
        raise ValueError(f"Invalid regex: {e}")


def _check_text(text):
    text = text or ""
    if len(text) > MAX_TEXT:
        raise ValueError(f"Test string is too long (max {MAX_TEXT:,} characters).")
    return text


def match(payload):
    text = _check_text(payload.get("text", ""))
    rx = _compile(payload.get("pattern"), payload.get("flags"))

    matches = []
    truncated = False
    for i, m in enumerate(rx.finditer(text)):
        if i >= MAX_MATCHES:
            truncated = True
            break
        groups = []
        named = m.groupdict()
        name_by_index = {v: k for k, v in rx.groupindex.items()}
        for gi in range(1, (rx.groups or 0) + 1):
            groups.append({
                "name": name_by_index.get(gi, str(gi)),
                "value": m.group(gi),  # may be None if optional group didn't participate
            })
        matches.append({
            "text": m.group(0),
            "start": m.start(),
            "end": m.end(),
            "groups": groups,
        })

    n = len(matches)
    verdict = (
        f"Found {n} match{'es' if n != 1 else ''}"
        + (f" (showing first {MAX_MATCHES})" if truncated else "")
        + (f" — {rx.groups} capture group{'s' if rx.groups != 1 else ''} per match." if rx.groups else ".")
    ) if n else "No matches. The pattern did not match anywhere in the test string."

    return {
        "mode": "match",
        "title": "Match results",
        "count": n,
        "truncated": truncated,
        "verdict": verdict,
        "text": text,        # echoed back so the client can highlight by offset
        "matches": matches,
        "numGroups": rx.groups or 0,
    }


def replace(payload):
    text = _check_text(payload.get("text", ""))
    rx = _compile(payload.get("pattern"), payload.get("flags"))
    repl = payload.get("replacement", "")
    try:
        result, n = rx.subn(repl, text)
    except re.error as e:
        raise ValueError(f"Invalid replacement: {e}")
    return {
        "mode": "replace",
        "title": "Replace results",
        "count": n,
        "verdict": (
            f"Made {n} replacement{'s' if n != 1 else ''}."
            if n else "No matches to replace — the output is unchanged."
        ),
        "result": result,
    }


TESTS = {"match": match, "replace": replace}


def compute(payload):
    test = payload.get("test")
    if test not in TESTS:
        raise ValueError(f"Unknown test: {test}")
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
