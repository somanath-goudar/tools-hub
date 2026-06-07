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


def describe(groups):
    x = np.array(groups[0], float)
    n = len(x)
    mean = x.mean()
    median = np.median(x)
    total = x.sum()

    vals, counts = np.unique(x, return_counts=True)
    maxc = int(counts.max())
    if maxc == 1:
        mode_str = "no mode (all values unique)"
    else:
        modes = vals[counts == maxc]
        mode_str = ", ".join(f"{m:g}" for m in modes) + f" (×{maxc})"

    sd_s = x.std(ddof=1) if n > 1 else 0.0
    var_s = x.var(ddof=1) if n > 1 else 0.0
    sd_p = x.std(ddof=0)
    var_p = x.var(ddof=0)
    q1, q3 = np.percentile(x, [25, 75])
    iqr = q3 - q1
    rng = x.max() - x.min()
    sem = sd_s / np.sqrt(n) if n > 0 else 0.0
    cv = (sd_s / mean * 100) if mean else 0.0
    skew = stats.skew(x)
    kurt = stats.kurtosis(x)  # Fisher (excess) kurtosis

    return {
        "title": "Descriptive statistics",
        "verdict": (
            f"n = {n}: mean = {mean:.4g}, median = {median:.4g}, "
            f"sample SD = {sd_s:.4g}, range = {rng:.4g}."
        ),
        "rows": [
            ["Count (n)", n],
            ["Sum", _fmt(total, 4)],
            ["Mean (average)", _fmt(mean, 4)],
            ["Median", _fmt(median, 4)],
            ["Mode", mode_str],
            ["Minimum", _fmt(x.min(), 4)],
            ["Maximum", _fmt(x.max(), 4)],
            ["Range", _fmt(rng, 4)],
            ["Sample standard deviation (s)", _fmt(sd_s, 4)],
            ["Population standard deviation (σ)", _fmt(sd_p, 4)],
            ["Sample variance (s²)", _fmt(var_s, 4)],
            ["Population variance (σ²)", _fmt(var_p, 4)],
            ["1st quartile (Q1, 25%)", _fmt(q1, 4)],
            ["3rd quartile (Q3, 75%)", _fmt(q3, 4)],
            ["Interquartile range (IQR)", _fmt(iqr, 4)],
            ["Standard error of mean (SEM)", _fmt(sem, 4)],
            ["Coefficient of variation (CV)", f"{cv:.2f}%"],
            ["Skewness", _fmt(skew, 4)],
            ["Kurtosis (excess)", _fmt(kurt, 4)],
        ],
    }


def _effect_d(d):
    return "small" if d < 0.5 else "medium" if d < 0.8 else "large"


def _effect_eta(e):
    return "small" if e < 0.06 else "medium" if e < 0.14 else "large"


def confint(groups):
    x = np.array(groups[0], float)
    n = len(x)
    mean = x.mean()
    sd = x.std(ddof=1)
    sem = sd / np.sqrt(n)
    df = n - 1

    rows = [
        ["Count (n)", n],
        ["Mean", _fmt(mean, 4)],
        ["Sample standard deviation (s)", _fmt(sd, 4)],
        ["Standard error of mean (SEM)", _fmt(sem, 4)],
        ["Degrees of freedom (df)", df],
    ]
    moe95 = t95 = ci95 = None
    for level in (90, 95, 99):
        alpha = 1 - level / 100
        tcrit = float(stats.t.ppf(1 - alpha / 2, df))
        moe = tcrit * sem
        lo, hi = mean - moe, mean + moe
        rows.append([f"{level}% confidence interval", f"[{lo:.4g}, {hi:.4g}]"])
        if level == 95:
            moe95, t95, ci95 = moe, tcrit, (lo, hi)
    rows.append(["Margin of error (95%)", _fmt(moe95, 4)])
    rows.append(["t critical (95%)", _fmt(t95, 4)])

    return {
        "title": "Confidence interval (t-based)",
        "verdict": (
            f"We are 95% confident the true population mean lies between "
            f"{ci95[0]:.4g} and {ci95[1]:.4g} (sample mean {mean:.4g} ± {moe95:.4g}). "
            f"Based on n = {n}, using the t-distribution with {df} degrees of freedom."
        ),
        "rows": rows,
    }


TESTS = {
    "ttest_ind": ttest_ind,
    "ttest_paired": ttest_paired,
    "anova": anova,
    "mannwhitney": mannwhitney,
    "describe": describe,
    "confint": confint,
}

# Tests that operate on a single data set rather than two-or-more groups.
SINGLE_GROUP = {"describe", "confint"}


def compute(payload):
    test = payload.get("test")
    groups = payload.get("groups")
    if test not in TESTS:
        raise ValueError(f"Unknown test: {test}")
    if not groups:
        raise ValueError("Provide your data.")
    if any(len(g) < 2 for g in groups):
        raise ValueError("Each data set needs at least 2 numbers.")
    if test not in SINGLE_GROUP and len(groups) < 2:
        raise ValueError("Need at least two groups of numbers.")
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
