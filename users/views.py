# users/views.py
from django.contrib.auth import authenticate, login, logout, get_user_model
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.shortcuts import render, redirect

User = get_user_model()

def splash(request):
    return render(request, "splash_screens/splash.html")

def onboarding(request):
    return render(request, "splash_screens/onboarding.html")

def login_view(request):
    if request.method == "POST":
        raw_user = request.POST.get("username") or request.POST.get("email") or ""
        password = request.POST.get("password") or ""
        remember = bool(request.POST.get("remember"))
        username = raw_user.strip().lower()
        user = authenticate(request, username=username, password=password)
        if user:
            login(request, user)
            request.session.set_expiry(1209600 if remember else 0)
            return redirect("location")  # <-- go to location first
        messages.error(request, "Invalid email/username or password.")
    return render(request, "login.html")

def signup_view(request):
    if request.method == "POST":
        name      = (request.POST.get("name") or "").strip()
        email     = (request.POST.get("email") or "").strip().lower()
        username  = (request.POST.get("username") or email).strip().lower()
        pw1       = request.POST.get("password1") or request.POST.get("password") or ""
        pw2       = request.POST.get("password2") or pw1
        if not username or not pw1:
            messages.error(request, "Email/username and password are required.")
        elif pw1 != pw2:
            messages.error(request, "Passwords do not match.")
        elif User.objects.filter(username=username).exists():
            messages.error(request, "This email/username is already taken.")
        else:
            user = User.objects.create_user(username=username, email=email or None, password=pw1)
            if name:
                user.first_name = name
                user.save()
            login(request, user)
            return redirect("location")  
    return render(request, "signup.html")

@login_required
def location_access(request):
    return render(request, "location.html")

def logout_view(request):
    logout(request)
    return redirect("login")

@login_required
def dashboard(request):
    return render(request, "dashboard.html", {"user": request.user})

