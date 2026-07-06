import os
import sys
import time
import django
import requests

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'project.settings')
django.setup()

from django.test import Client
from accounts.models import User
from portfolios.models import Profile


def test_font_url(name, url):
    print(f"=== {name} font URL ===")
    start = time.time()
    try:
        r = requests.get(url, timeout=15)
        elapsed = time.time() - start
        print('status', r.status_code, 'elapsed', round(elapsed, 3), 'size', len(r.content))
        print(r.text[:300].replace('\n', '\\n'))
    except Exception as e:
        elapsed = time.time() - start
        print('ERROR', type(e).__name__, e, 'elapsed', round(elapsed, 3))
    print()


def test_preview(theme_slug):
    print(f"=== preview {theme_slug} ===")
    user, created = User.objects.get_or_create(
        email=f'test_{theme_slug}@example.com',
        defaults={'first_name': 'Test', 'last_name': 'User', 'password': 'testpass123'}
    )
    if created:
        print('created user', user.email)
    profile, created = Profile.objects.get_or_create(
        user=user,
        defaults={'full_name': 'Test User', 'slug': f'test-user-{theme_slug}-{int(time.time())}', 'onboarding_completed': False}
    )
    if not created:
        profile.onboarding_completed = False
        profile.slug = f'test-user-{theme_slug}-{int(time.time())}'
        profile.save()

    from django.db import connection
    connection.queries_log.clear() if hasattr(connection, 'queries_log') else None
    from django.db import reset_queries
    reset_queries()

    client = Client()
    session = client.session
    session['user_id'] = user.id
    session.save()

    start = time.time()
    response = client.get(f'/portfolios/preview/{theme_slug}/')
    elapsed = time.time() - start
    print('status', response.status_code, 'elapsed', round(elapsed, 3))
    print('first 200 chars:', response.content.decode('utf-8', errors='ignore')[:200].replace('\n','\\n'))
    print('headers:')
    for header, value in response.items():
        if header in ['Content-Length', 'Vary', 'X-Content-Type-Options', 'Referrer-Policy', 'Cross-Origin-Opener-Policy', 'X-Frame-Options', 'Content-Security-Policy']:
            print(' ', header, value)
    print('query count', len(connection.queries))
    for i, q in enumerate(connection.queries[:10], 1):
        print(' ', i, q['sql'])
    print()


if __name__ == '__main__':
    test_font_url('academic', 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600;700&display=swap')
    test_font_url('modern', 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500&display=swap')
    test_preview('academic-dark')
    test_preview('modern-dark')
    test_preview('modern-light')
