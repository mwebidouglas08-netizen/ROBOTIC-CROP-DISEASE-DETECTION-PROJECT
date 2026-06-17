from django.contrib import admin
from django.urls import path
from Roboapp import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.index, name='index'),
    path('index/', views.index, name='index'),
    path('analytics/', views.analytics, name='analytics'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('diseasedetection/', views.diseasedetection, name='diseasedetection'),
    path('farmsimulation/', views.farmsimulation, name='farmsimulation'),
    path('profile/', views.profile, name='profile'),
    path('reports/', views.reports, name='reports'),
    path('settings/', views.settings, name='settings'),
    path('treatmenthistory/', views.treatmenthistory, name='treatmenthistory'),
    path('forgot-password/', views.forgot_password, name='forgot-password'),
    path('login/', views.login_user, name='login'),
    path('register/', views.register, name='register'),
    path('logout/', views.logout_user, name='logout'),
]
