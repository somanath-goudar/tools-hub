"""Statistics cluster compute endpoint (Vercel Python serverless function).

Handles the hypothesis tests that share a "list of numeric groups" input shape:
  ttest_ind | ttest_paired | anova | mannwhitney

No external API calls. Pure scipy/numpy. Nothing is stored.
"""
from http.server import BaseHTTPRequestHandler
import json
import numpy as np
from scipy import stats


def _fmt(x, nd=4):
    return round(float(x), nd)


def _p_val(p):
    # Human-readable p for the results table (avoid showing a rounded 0).
    p = float(p)
    return "< 0.0001" if p < 0.0001 else round(p, 4)


def _p_str(p):
    # APA: report p < .001, else p = .NNN (no leading zero)
    if p < 0.001:
        return "p < .001"
    return f"p = {('%.3f' % p).lstrip('0')}"


def ttest_ind(groups):
    a, b = np.array(groups[0], float), np.array(groups[1], float)
    t, p = stats.ttest_ind(a, b, equal_var=False)  # Welch
    # Welch-Satterthwaite df
    v1, v2, n1, n2 = a.var(ddof=1), b.var(ddof=1), len(a), len(b)
    df = (v1 / n1 + v2 / n2) ** 2 / (
        (v1 / n1) ** 2 / (n1 - 1) + (v2 / n2) ** 2 / (n2 - 1)
    )
    pooled = np.sqrt(((n1 - 1) * v1 + (n2 - 1) * v2) / (n1 + n2 - 2))
    d = (a.mean() - b.mean()) / pooled if pooled else 0.0
    sig = bool(p < 0.05)
    return {
        "title": "Independent two-sample t-test (Welch)",
        "significant": sig,
        "verdict": (
            f"The two group means differ significantly (mean {a.mean():.2f} vs {b.mean():.2f}). "
            if sig
            else f"No significant difference between the group means ({a.mean():.2f} vs {b.mean():.2f}). "
        )
        + f"Effect size (Cohen's d) is {abs(d):.2f} ({_effect_d(abs(d))}).",
        "rows": [
            ["Group 1 mean (n)", f"{a.mean():.3f} (n={n1})"],
            ["Group 2 mean (n)", f"{b.mean():.3f} (n={n2})"],
            ["t statistic", _fmt(t)],
            ["degrees of freedom", _fmt(df, 2)],
            ["p-value", _p_val(p)],
            ["Cohen's d", _fmt(d, 3)],
        ],
        "apa": f"t({df:.1f}) = {t:.2f}, {_p_str(p)}, d = {d:.2f}",
    }


def ttest_paired(groups):
    a, b = np.array(groups[0], float), np.array(groups[1], float)
    if len(a) != len(b):
        raise ValueError("Paired t-test needs two equal-length columns.")
    t, p = stats.ttest_rel(a, b)
    diff = a - b
    df = len(a) - 1
    d = diff.mean() / diff.std(ddof=1) if diff.std(ddof=1) else 0.0
    sig = bool(p < 0.05)
    return {
        "title": "Paired-samples t-test",
        "significant": sig,
        "verdict": (
            f"There is a significant difference between the two conditions (mean change {diff.mean():.2f}). "
            if sig
            else f"No significant difference between the two conditions (mean change {diff.mean():.2f}). "
        )
        + f"Effect size (Cohen's d) is {abs(d):.2f} ({_effect_d(abs(d))}).",
        "rows": [
            ["Mean of differences", _fmt(diff.mean(), 3)],
            ["t statistic", _fmt(t)],
            ["degrees of freedom", df],
            ["p-value", _p_val(p)],
            ["Cohen's d", _fmt(d, 3)],
        ],
        "apa": f"t({df}) = {t:.2f}, {_p_str(p)}, d = {d:.2f}",
    }


def anova(groups):
    arrs = [np.array(g, float) for g in groups]
    f, p = stats.f_oneway(*arrs)
    grand = np.concatenate(arrs).mean()
    ss_between = sum(len(g) * (g.mean() - grand) ** 2 for g in arrs)
    ss_total = sum(((g - grand) ** 2).sum() for g in arrs)
    eta2 = ss_between / ss_total if ss_total else 0.0
    k = len(arrs)
    n = sum(len(g) for g in arrs)
    df1, df2 = k - 1, n - k
    sig = bool(p < 0.05)
    return {
        "title": f"One-way ANOVA ({k} groups)",
        "significant": sig,
        "verdict": (
            "At least one group mean differs significantly from the others. "
            if sig
            else "No significant difference between the group means. "
        )
        + f"η² = {eta2:.2f} ({_effect_eta(eta2)} effect).",
        "rows": [
            ["F statistic", _fmt(f)],
            ["df (between, within)", f"{df1}, {df2}"],
            ["p-value", _p_val(p)],
            ["eta-squared (η²)", _fmt(eta2, 3)],
            ["group means", ", ".join(f"{g.mean():.2f}" for g in arrs)],
        ],
        "apa": f"F({df1}, {df2}) = {f:.2f}, {_p_str(p)}, η² = {eta2:.2f}",
    }


def mannwhitney(groups):
    a, b = np.array(groups[0], float), np.array(groups[1], float)
    u, p = stats.mannwhitneyu(a, b, alternative="two-sided")
    n1, n2 = len(a), len(b)
    # normal approximation z
    mu = n1 * n2 / 2
    sigma = np.sqrt(n1 * n2 * (n1 + n2 + 1) / 12)
    z = (u - mu) / sigma if sigma else 0.0
    r = 1 - (2 * u) / (n1 * n2)  # rank-biserial
    sig = bool(p < 0.05)
    return {
        "title": "Mann-Whitney U test",
        "significant": sig,
        "verdict": (
            "The two distributions differ significantly — one group reliably scores higher. "
            if sig
            else "No significant difference between the two distributions. "
        )
        + f"Rank-biserial r = {r:.2f}.",
        "rows": [
            ["U statistic", _fmt(u, 2)],
            ["z (approx.)", _fmt(z, 3)],
            ["p-value", _p_val(p)],
            ["rank-biserial r", _fmt(r, 3)],
            ["medians", f"{np.median(a):.2f} vs {np.median(b):.2f}"],
        ],
        "apa": f"U = {u:.0f}, z = {z:.2f}, {_p_str(p)}, r = {r:.2f}",
    }


def _effect_d(d):
    return "small" if d < 0.5 else "medium" if d < 0.8 else "large"


def _effect_eta(e):
    return "small" if e < 0.06 else "medium" if e < 0.14 else "large"


TESTS = {
    "ttest_ind": ttest_ind,
    "ttest_paired": ttest_paired,
    "anova": anova,
    "mannwhitney": mannwhitney,
}


def compute(payload):
    test = payload.get("test")
    groups = payload.get("groups")
    if test not in TESTS:
        raise ValueError(f"Unknown test: {test}")
    if not groups or len(groups) < 2:
        raise ValueError("Need at least two groups of numbers.")
    if any(len(g) < 2 for g in groups):
        raise ValueError("Each group needs at least 2 numbers.")
    return TESTS[test](groups)


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
