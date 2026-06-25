from django.urls import path
from . import views

app_name = 'dashboard'

urlpatterns = [
    path('home/', views.dashboard_view, name='main_dashboard'),
]