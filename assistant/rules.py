from dataclasses import dataclass
from datetime import date

@dataclass
class Finding:
    section: str      # "biography", "publications", ...
    status: str       # "ok" | "weak" | "missing" | "inconsistent"
    points: float     # earned
    max_points: float # possible
    message: str      # human-readable, also shown to the AI later


# Section weights — must sum to 100
WEIGHTS = {
    "biography": 15,
    "education": 15,
    "publications": 20,
    "teaching": 15,
    "research_interests": 10,
    "contact": 10,
    "profile_basics": 10,
    "cv": 5,
}

def check_biography(snapshot) -> list[Finding]:
    w = WEIGHTS["biography"]
    words = snapshot["profile"]["bio_word_count"]

    if words == 0:
        return [Finding("biography", "missing", 0, w,
                "No biography. A 100-200 word bio is the most-read section of a portfolio.")]
    if words < 50:
        return [Finding("biography", "weak", w * 0.5, w,
                f"Biography is only {words} words. Aim for 100-200 words.")]
    return [Finding("biography", "ok", w, w, f"Biography present ({words} words).")]

def check_publications(snapshot) -> list[Finding]:
    w = WEIGHTS["publications"]
    pubs = snapshot["publications"]
    findings = []

    if not pubs:
        return [Finding("publications", "missing", 0, w,
                "No publications listed. Even preprints strengthen a profile.")]

    # 60% for having any, 40% scaled by metadata completeness
    have_year = sum(1 for p in pubs if p["year"] is not None)
    quality = have_year / len(pubs)
    points = round(w * (0.6 + 0.4 * quality), 1)
    status = "ok" if quality == 1 else "weak"
    findings.append(Finding("publications", status, points, w,
        f"{len(pubs)} publication(s), {have_year} with a year set."))

    # Consistency checks: max_points=0 → they inform, they don't score
    for p in pubs:
        if p["year"] and p["year"] > date.today().year:
            findings.append(Finding("publications", "inconsistent", 0, 0,
                f"'{p['title'][:60]}' has a future year ({p['year']})."))

    return findings

def analyze(snapshot) -> dict:
    findings = [
        *check_biography(snapshot),
        *check_publications(snapshot),
        # add your remaining checks here as you write them
    ]
    score = min(100, round(sum(f.points for f in findings)))

    if score >= 90:   grade = "Excellent"
    elif score >= 75: grade = "Strong"
    elif score >= 55: grade = "Developing"
    elif score >= 35: grade = "Basic"
    else:             grade = "Incomplete"

    return {
        "completeness_score": score,
        "grade": grade,
        "findings": [vars(f) for f in findings],
    }