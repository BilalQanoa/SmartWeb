import json

from .llm_client import complete_json, LLMError
from .prompts import REVIEW_SYSTEM_PROMPT
from .rules import analyze
from .snapshot import build_snapshot


def run_review(profile, use_ai: bool = True) -> dict:
    snapshot = build_snapshot(profile)
    gap_report = analyze(snapshot)

    result = {
        "completeness": gap_report,
        "ai_review": None,
        "ai_available": False,
    }

    if use_ai:
        user_content = (
            "PORTFOLIO SNAPSHOT (the user's actual data):\n"
            + json.dumps(snapshot, indent=2, default=str)
            + "\n\nGAP ANALYSIS (authoritative):\n"
            + json.dumps(gap_report, indent=2)
            + "\n\nWrite the review report now."
        )
        try:
            result["ai_review"] = complete_json(REVIEW_SYSTEM_PROMPT, user_content)
            result["ai_available"] = True
        except LLMError as e:
            result["ai_error"] = str(e)

    return result