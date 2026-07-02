import bcrypt
from django.test import TestCase
from django.urls import reverse

from accounts.models import User
from portfolios.models import Profile


class SettingsViewTests(TestCase):
    def test_settings_page_updates_profile_and_password(self):
        user = User.objects.create(
            first_name="Old",
            last_name="Name",
            email="old@example.com",
            password="old-hash",
        )
        profile = Profile.objects.create(
            user=user,
            full_name="Old Name",
            academic_title="Assistant",
            institution="Old University",
            field_of_study="Physics",
            slug="old-name-settings-test",
        )

        session = self.client.session
        session['user_id'] = user.id
        session.save()

        response = self.client.post(reverse('dashboard:setting_dashboard'), {
            'first_name': 'New',
            'last_name': 'Name',
            'full_name': 'New Name',
            'academic_title': 'Associate Professor',
            'institution': 'New University',
            'field_of_study': 'Computer Science',
            'email': 'new@example.com',
            'new_password': 'NewPass123',
            'confirm_password': 'NewPass123',
        })

        self.assertEqual(response.status_code, 302)
        user.refresh_from_db()
        profile.refresh_from_db()

        self.assertEqual(user.first_name, 'New')
        self.assertEqual(user.last_name, 'Name')
        self.assertEqual(user.email, 'new@example.com')
        self.assertTrue(bcrypt.checkpw(b'NewPass123', user.password.encode()))
        self.assertEqual(profile.full_name, 'New Name')
        self.assertEqual(profile.academic_title, 'Associate Professor')
        self.assertEqual(profile.institution, 'New University')
        self.assertEqual(profile.field_of_study, 'Computer Science')
