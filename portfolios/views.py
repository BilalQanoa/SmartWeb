"""
portfolios/onboarding.py

Multi-step onboarding flow for newly registered users: collect profile info,
publications, and teaching load, then let them pick a starting template.
"""
import json
from pathlib import Path
from types import SimpleNamespace

from django.conf import settings
from django.db import OperationalError
from django.http import Http404
from django.shortcuts import render, redirect, get_object_or_404
from django.views.decorators.clickjacking import xframe_options_exempt

from accounts.models import User

from .models import Profile, Publication, Teaching, Theme
from .forms import ProfileForm, PublicationForm, TeachingForm

SECTIONS = [
    'Personal Info', 'Professional Bio', 'Research Interests',
    'Publications', 'Teaching Load', 'Contact Details',
]


def get_current_user(request):
    return User.objects.get(id=request.session['user_id'])


def get_profile(user):
    profile, _ = Profile.objects.get_or_create(
        user=user,
        defaults={'full_name': f"{user.first_name} {user.last_name}"}
    )
    return profile


def onboarding_one(request):
    return render(request, 'onboarding/onboarding1.html')


def onboarding_two(request):
    if 'user_id' not in request.session:
        return redirect('accounts:login')

    user = get_current_user(request)
    profile = get_profile(user)

    if request.method == 'POST':
        profile_form = ProfileForm(request.POST, request.FILES, instance=profile)
        publication_form = PublicationForm(request.POST)
        teaching_form = TeachingForm(request.POST)

        if profile_form.is_valid() and publication_form.is_valid() and teaching_form.is_valid():
            profile_form.save()

            publication = publication_form.save(commit=False)
            publication.profile = profile
            publication.save()

            teaching = teaching_form.save(commit=False)
            teaching.profile = profile
            teaching.save()

            # Save additional publications from dynamic rows
            pub_titles = request.POST.getlist('pub_title[]')
            pub_dates = request.POST.getlist('pub_date[]')
            pub_pdfs = request.POST.getlist('pub_pdf[]')
            pub_githubs = request.POST.getlist('pub_github[]')
            for idx, title in enumerate(pub_titles):
                if not title.strip():
                    continue
                extra_pub = Publication(
                    profile=profile,
                    title=title.strip(),
                    publication_date=pub_dates[idx] if idx < len(pub_dates) else None,
                    pdf_link=pub_pdfs[idx] if idx < len(pub_pdfs) else '',
                    github_link=pub_githubs[idx] if idx < len(pub_githubs) else '',
                )
                extra_pub.save()

            # Save additional courses from dynamic rows
            course_names = request.POST.getlist('course_name[]')
            course_semesters = request.POST.getlist('teachingscol[]')
            course_descs = request.POST.getlist('course_desc[]')
            course_links = request.POST.getlist('syllabus_link[]')
            for idx, name in enumerate(course_names):
                if not name.strip():
                    continue
                extra_teaching = Teaching(
                    profile=profile,
                    course_name=name.strip(),
                    teachingscol=course_semesters[idx] if idx < len(course_semesters) else '',
                    description=course_descs[idx] if idx < len(course_descs) else '',
                    syllabus_link=course_links[idx] if idx < len(course_links) else '',
                )
                extra_teaching.save()

            return redirect('portfolios:onboarding_three')
    else:
        profile_form = ProfileForm(instance=profile)
        publication_form = PublicationForm()
        teaching_form = TeachingForm()

    context = {
        'profile_form': profile_form,
        'publication_form': publication_form,
        'teaching_form': teaching_form,
        'sections': SECTIONS,
    }
    return render(request, 'onboarding/onboarding2.html', context)


def onboarding_three(request):
    if 'user_id' not in request.session:
        return redirect('accounts:login')

    user = get_current_user(request)
    profile = get_profile(user)

    if request.method == 'POST':
        selected_template = request.POST.get('selected_template', profile.selected_template or Profile.TEMPLATE_CLASSIC)
        valid_templates = {value for value, _ in Profile.TEMPLATE_CHOICES}
        if selected_template in valid_templates:
            profile.selected_template = selected_template
            profile.save()
        return redirect('dashboard:main_dashboard')

    context = {
        'selected_template': profile.selected_template or Profile.TEMPLATE_CLASSIC,
    }
    return render(request, 'onboarding/onboarding3.html', context)


def portfolio_detail(request, slug):
    profile = get_object_or_404(Profile, slug=slug, is_published=True)
    publications = Publication.objects.filter(profile=profile)
    return render(request, 'portfolios/portfolio_detail.html', {
        'profile': profile,
        'publications': publications,
    })


def resolve_preview_theme(theme_slug):
    slug_aliases = {
        'light-1': 'academic-light',
        'dark-1': 'modern-dark',
        'light-2': 'modern-light',
        'dark-2': 'academic-dark',
        'classic-scholar': 'academic-light',
        'modern-dark': 'modern-dark',
        'minimalist-lab': 'modern-light',
        'executive-academic': 'academic-dark',
    }
    resolved_slug = slug_aliases.get(theme_slug, theme_slug)

    try:
        db_theme = Theme.objects.filter(slug=resolved_slug, is_active=True).first()
    except OperationalError:
        db_theme = None

    if db_theme:
        return db_theme

    theme_dir = Path(settings.BASE_DIR) / 'templates' / 'themes' / resolved_slug
    if not theme_dir.exists():
        raise Http404('No Theme matches the given query.')

    metadata_path = theme_dir / 'theme.json'
    metadata = {}
    if metadata_path.exists():
        with metadata_path.open(encoding='utf-8') as fh:
            metadata = json.load(fh)

    return SimpleNamespace(
        slug=resolved_slug,
        name=metadata.get('name', resolved_slug.replace('-', ' ').title()),
        description=metadata.get('description', ''),
        template_path=f'themes/{resolved_slug}/index.html',
        preview_image=metadata.get('preview_image', ''),
        palette=metadata.get('palette', {}),
        is_active=True,
    )


@xframe_options_exempt
def portfolio_preview(request, theme_slug):
    if 'user_id' not in request.session:
        return redirect('accounts:login')

    user = get_current_user(request)
    profile = get_profile(user)
    theme = resolve_preview_theme(theme_slug)

    return render(request, theme.template_path, {
        'theme': theme,
        'profile': profile,
    })


