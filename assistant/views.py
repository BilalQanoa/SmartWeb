from django.shortcuts import render

# Create your views here.
from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect, render

from accounts.models import User
from portfolios.models import  Profile
from .models import AssistantReport
from .review import run_review

DIAL_CIRCUMFERENCE = 314.16   # 2πr with r=50, for the SVG dial

SECTION_LABELS = {
    "biography": "Biography",
    "publications": "Publications",
    "teaching": "Teaching",
    "education": "Education",
    "research_interests": "Research interests",
    "contact": "Contact & identifiers",
    "profile_basics": "Profile basics",
    "cv": "CV upload",
}

def get_profile(request):
    user = User.objects.get(id=request.session["user_id"])
    try:
        return Profile.objects.get(user=user)
    except Profile.DoesNotExist:
        return None

def get_current_user(request):
    user = User.objects.get(id=request.session['user_id'])
    print(user)
    return user

def review_page(request):

    profile = get_profile(request)
    if profile is None:
        return redirect("dashboard:edit_profile")  # or your onboarding route

    user = get_current_user(request)
    if request.method == "POST":
        result = run_review(profile)
        AssistantReport.objects.create(
            user=user,
            completeness_score=result["completeness"]["completeness_score"],
            payload=result,
        )
        return redirect("assistant:review")   # Post/Redirect/Get

    report = AssistantReport.objects.filter(user=user).first()
    ctx = {"profile": profile, "report": report}

    if report:
        comp = report.payload["completeness"]
        score = comp["completeness_score"]

        sections = []
        for key, label in SECTION_LABELS.items():
            scored = [f for f in comp["findings"] if f["section"] == key and f["max_points"] > 0]
            if scored:
                pts = round(sum(f["points"] for f in scored), 1)
                mx = round(sum(f["max_points"] for f in scored), 1)
                sections.append({"label": label, "points": pts, "max": mx,
                                 "pct": round(100 * pts / mx)})

        for f in comp["findings"]:
            f["label"] = SECTION_LABELS.get(f["section"], f["section"])

        ctx.update({
            "score": score,
            "grade": comp["grade"],
            "dash_offset": round(DIAL_CIRCUMFERENCE * (1 - score / 100), 1),
            "sections": sections,
            "findings": comp["findings"],
            "ai": report.payload.get("ai_review"),
            "ai_error": report.payload.get("ai_error"),
        })

    return render(request, "assistant/review.html", ctx)