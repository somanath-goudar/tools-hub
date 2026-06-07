"""Finance cluster compute endpoint (Vercel Python serverless function).

Pure-Python loan amortization — no external packages, no API calls, nothing stored.
Handles: amortize  (monthly or biweekly, with optional extra payment).
"""
from http.server import BaseHTTPRequestHandler
import json


def _money(n):
    return "$" + format(round(n), ",d")


def _term_label(months):
    months = round(months)
    y, m = divmod(months, 12)
    parts = []
    if y:
        parts.append(f"{y} yr")
    if m or not y:
        parts.append(f"{m} mo")
    return " ".join(parts)


def _payment(principal, monthly_rate, n_months):
    """Standard fixed monthly payment."""
    if monthly_rate == 0:
        return principal / n_months
    f = (1 + monthly_rate) ** n_months
    return principal * monthly_rate * f / (f - 1)


def _run(principal, period_rate, payment, extra, max_periods):
    """Amortize forward; return (periods, total_interest, schedule rows)."""
    balance = principal
    total_interest = 0.0
    schedule = []
    period = 0
    while balance > 0.005 and period < max_periods:
        period += 1
        interest = balance * period_rate
        pay = payment + extra
        principal_paid = pay - interest
        if principal_paid >= balance:  # final payment
            principal_paid = balance
            pay = balance + interest
        balance -= principal_paid
        total_interest += interest
        schedule.append(
            {
                "period": period,
                "payment": round(pay),
                "principal": round(principal_paid),
                "interest": round(interest),
                "balance": round(max(balance, 0)),
            }
        )
    return period, total_interest, schedule


def amortize(p):
    principal = float(p["principal"])
    annual = float(p["rate"]) / 100.0
    years = float(p["years"])
    extra_monthly = float(p.get("extra", 0) or 0)
    frequency = p.get("frequency", "monthly")
    if principal <= 0 or years <= 0:
        raise ValueError("Enter a positive loan amount and term.")

    n_months = round(years * 12)
    m_rate = annual / 12
    monthly_payment = _payment(principal, m_rate, n_months)

    # baseline = standard monthly schedule, no extra
    base_periods, base_interest, _ = _run(principal, m_rate, monthly_payment, 0, n_months + 1)

    if frequency == "biweekly":
        ppy = 26
        period_rate = annual / 26
        payment = monthly_payment / 2
        extra_per_period = extra_monthly * 12 / 26
    else:
        ppy = 12
        period_rate = annual / 12
        payment = monthly_payment
        extra_per_period = extra_monthly

    periods, total_interest, schedule = _run(
        principal, period_rate, payment, extra_per_period, ppy * 60
    )
    total_paid = principal + total_interest
    payoff_months = periods / ppy * 12

    # savings vs the standard monthly, no-extra plan
    saved = None
    if frequency == "biweekly" or extra_monthly > 0:
        saved_interest = base_interest - total_interest
        saved_months = base_periods - payoff_months
        if saved_interest > 1 and saved_months > 0.5:
            saved = {"interest": round(saved_interest), "label": _term_label(saved_months)}

    # chart points (downsample to <= 60 points)
    pts = []
    step = max(1, len(schedule) // 60)
    cum = 0.0
    pts.append({"year": 0, "balance": round(principal), "cumInterest": 0})
    for i, row in enumerate(schedule):
        cum += row["interest"]
        if i % step == 0 or i == len(schedule) - 1:
            pts.append(
                {
                    "year": round((i + 1) / ppy, 2),
                    "balance": row["balance"],
                    "cumInterest": round(cum),
                }
            )

    if frequency == "biweekly":
        rows = [
            ["Biweekly payment", _money(payment + extra_per_period)],
            ["Equivalent monthly", _money(monthly_payment)],
            ["Payments per year", "26"],
        ]
    else:
        rows = [["Monthly payment", _money(monthly_payment + extra_per_period)]]
    rows += [
        ["Total interest", _money(total_interest)],
        ["Total paid", _money(total_paid)],
        ["Payoff time", _term_label(payoff_months)],
        ["Number of payments", str(periods)],
    ]

    verdict = (
        f"Your { 'biweekly' if frequency=='biweekly' else 'monthly' } payment is "
        f"{_money(payment + extra_per_period)}. You’ll pay {_money(total_interest)} in interest "
        f"over {_term_label(payoff_months)}, for a total of {_money(total_paid)}."
    )

    return {
        "title": "Amortization summary",
        "verdict": verdict,
        "rows": rows,
        "saved": saved,
        "chart": {"points": pts},
        "schedule": schedule,
    }


TESTS = {"amortize": amortize}


def compute(payload):
    test = payload.get("test")
    if test not in TESTS:
        raise ValueError(f"Unknown calculation: {test}")
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
