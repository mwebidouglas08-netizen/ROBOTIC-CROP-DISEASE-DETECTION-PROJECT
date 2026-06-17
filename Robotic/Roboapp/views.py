from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_protect


# Create your views here.
def index(request):
    return render(request, 'index.html')


def analytics(request):
    if not request.user.is_authenticated:
        return redirect('login')
    return render(request, 'dashboard/analytics.html')


def dashboard(request):
    if not request.user.is_authenticated:
        return redirect('login')
    return render(request, 'dashboard/dashboard.html')


def diseasedetection(request):
    if not request.user.is_authenticated:
        return redirect('login')
    return render(request, 'dashboard/diseasedetection.html')


def farmsimulation(request):
    if not request.user.is_authenticated:
        return redirect('login')
    return render(request, 'dashboard/farmsimulation.html')


def profile(request):
    if not request.user.is_authenticated:
        return redirect('login')
    return render(request, 'dashboard/profile.html')


def reports(request):
    if not request.user.is_authenticated:
        return redirect('login')
    return render(request, 'dashboard/reports.html')


def settings(request):
    if not request.user.is_authenticated:
        return redirect('login')
    return render(request, 'dashboard/settings.html')


def treatmenthistory(request):
    if not request.user.is_authenticated:
        return redirect('login')
    return render(request, 'dashboard/treatmenthistory.html')


def forgot_password(request):
    return render(request, 'auth/forgot-password.html')


@require_http_methods(["GET", "POST"])
@csrf_protect
def login_user(request):
    if request.user.is_authenticated:
        return redirect('dashboard')

    if request.method == "POST":
        username = request.POST.get('username', '').strip()
        password = request.POST.get('password', '')

        if not username or not password:
            messages.error(request, "Please enter your username and password")
            return render(request, 'auth/login.html')

        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            messages.success(request, "You are now logged in!")
            return redirect('dashboard')
        else:
            messages.error(request, "Invalid login credentials")

    return render(request, 'auth/login.html')


@require_http_methods(["GET", "POST"])
@csrf_protect
def register(request):
    """Show the registration form and handle registration"""
    if request.user.is_authenticated:
        return redirect('dashboard')

    if request.method == 'POST':
        username = request.POST.get('username', '').strip()
        password = request.POST.get('password', '')
        confirm_password = request.POST.get('confirm_password', '')

        if not all([username, password, confirm_password]):
            messages.error(request, "Please fill in all fields")
            return render(request, 'auth/register.html')

        if len(username) < 3:
            messages.error(request, "Username must be at least 3 characters long")
            return render(request, 'auth/register.html')

        if len(password) < 8:
            messages.error(request, "Password must be at least 8 characters long")
            return render(request, 'auth/register.html')

        if password != confirm_password:
            messages.error(request, "Passwords do not match")
            return render(request, 'auth/register.html')

        if User.objects.filter(username=username).exists():
            messages.error(request, "Username already exists")
            return render(request, 'auth/register.html')

        try:
            user = User.objects.create_user(username=username, password=password)
            user.save()
            messages.success(request, "Account created successfully! Please log in.")
            return redirect('login')
        except Exception as e:
            messages.error(request, f"Error creating account: {str(e)}")
            return render(request, 'auth/register.html')

    return render(request, 'auth/register.html')


@require_http_methods(["POST"])
@csrf_protect
def logout_user(request):
    logout(request)
    messages.success(request, "You have been logged out.")
    return redirect('login')
