"""Writing cluster compute endpoint (Vercel Python serverless function).

Handles tools that share a single free-text input shape. First test:
  readability  -> Flesch, Flesch-Kincaid, Gunning Fog, SMOG, Coleman-Liau, ARI + a
                  plain-English consensus reading level.

Syllables come from pyphen (pure Python, ships its hyphenation dictionaries as
package data — no runtime download, unlike nltk/cmudict). No external API calls.
Nothing is stored.
"""
from http.server import BaseHTTPRequestHandler
import json
import re
import math
import pyphen

_DIC = pyphen.Pyphen(lang="en_US")

_WORD_RE = re.compile(r"[A-Za-z][A-Za-z'']*")
_SENT_RE = re.compile(r"[.!?]+(?:\s|$)")
_VOWEL_RE = re.compile(r"[aeiouy]+")


def _syllables(word):
    w = re.sub(r"[^a-z]", "", word.lower())
    if not w:
        return 0
    p = _DIC.inserted(w).count("-") + 1
    if p > 1:
        return p
    # pyphen could not split a (likely unknown) word — fall back to vowel groups
    v = len(_VOWEL_RE.findall(w))
    if w.endswith("e"):
        v = max(1, v - 1)
    return max(1, v)


def _ease_band(score):
    # Flesch Reading Ease → (label, audience)
    bands = [
        (90, "Very easy", "5th-grade level — very easy to read"),
        (80, "Easy", "6th-grade level — easy to read"),
        (70, "Fairly easy", "7th-grade level — fairly easy"),
        (60, "Standard", "8th–9th grade — plain English, understood by most readers"),
        (50, "Fairly difficult", "10th–12th grade — fairly difficult"),
        (30, "Difficult", "College level — difficult"),
        (0, "Very difficult", "College graduate level — very hard to read"),
    ]
    for floor, label, desc in bands:
        if score >= floor:
            return label, desc
    return "Very difficult", "College graduate level — very hard to read"


def _grade_word(g):
    g = max(0, round(g))
    if g <= 0:
        return "Kindergarten"
    if g <= 5:
        return f"Grade {g} (elementary)"
    if g <= 8:
        return f"Grade {g} (middle school)"
    if g <= 12:
        return f"Grade {g} (high school)"
    if g <= 16:
        return f"Grade {g} (college)"
    return "Graduate level"


def readability(text):
    text = (text or "").strip()
    words = _WORD_RE.findall(text)
    n_words = len(words)
    if n_words < 10:
        raise ValueError("Please paste at least 10 words for a reliable readability score.")

    syll_per_word = [_syllables(w) for w in words]
    n_syll = sum(syll_per_word)
    n_poly = sum(1 for s in syll_per_word if s >= 3)  # complex / polysyllabic words
    n_chars = sum(len(re.sub(r"[^A-Za-z]", "", w)) for w in words)
    # sentences: count terminators, but never fewer than 1
    n_sent = max(1, len(_SENT_RE.findall(text)) or text.count(".") or 1)

    wps = n_words / n_sent           # words per sentence
    spw = n_syll / n_words           # syllables per word
    cpw = n_chars / n_words          # letters per word

    flesch = 206.835 - 1.015 * wps - 84.6 * spw
    fk = 0.39 * wps + 11.8 * spw - 15.59
    fog = 0.4 * (wps + 100 * (n_poly / n_words))
    smog = 1.0430 * math.sqrt(n_poly * (30 / n_sent)) + 3.1291
    L = cpw * 100                    # letters per 100 words
    S = (n_sent / n_words) * 100     # sentences per 100 words
    coleman = 0.0588 * L - 0.296 * S - 15.8
    ari = 4.71 * cpw + 0.5 * wps - 21.43

    flesch = max(0.0, min(100.0, flesch))
    grade_scores = [fk, fog, smog, coleman, ari]
    consensus = sum(max(0.0, g) for g in grade_scores) / len(grade_scores)

    ease_label, ease_desc = _ease_band(flesch)
    read_min = n_words / 230.0       # avg adult silent reading ~230 wpm
    read_secs = max(1, round(read_min * 60))
    rt = f"{read_secs} sec" if read_secs < 60 else f"{read_min:.1f} min"

    return {
        "title": "Readability results",
        "headline": {
            "value": _grade_word(consensus),
            "label": "Estimated reading level (consensus)",
            "sub": ease_desc,
        },
        "ease": round(flesch, 1),
        "easeLabel": ease_label,
        "verdict": (
            f"Your text scores {flesch:.1f} on the Flesch Reading Ease scale ({ease_label.lower()}), "
            f"which puts it at a {_grade_word(consensus).split(' (')[0].lower()} reading level. "
            f"It averages {wps:.1f} words per sentence and {spw:.2f} syllables per word, "
            f"with {n_poly} complex word{'s' if n_poly != 1 else ''}."
        ),
        "rows": [
            ["Flesch Reading Ease", f"{flesch:.1f} ({ease_label})"],
            ["Flesch-Kincaid Grade", round(max(0.0, fk), 1)],
            ["Gunning Fog Index", round(max(0.0, fog), 1)],
            ["SMOG Index", round(max(0.0, smog), 1)],
            ["Coleman-Liau Index", round(max(0.0, coleman), 1)],
            ["Automated Readability Index", round(max(0.0, ari), 1)],
            ["Words", n_words],
            ["Sentences", n_sent],
            ["Complex words (3+ syllables)", n_poly],
            ["Avg words / sentence", round(wps, 1)],
            ["Avg syllables / word", round(spw, 2)],
            ["Reading time", rt],
        ],
    }


TESTS = {
    "readability": lambda p: readability(p.get("text", "")),
}


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
