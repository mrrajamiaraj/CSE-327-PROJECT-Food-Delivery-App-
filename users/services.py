
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from django.db import transaction


class EmailSender:
    def send(self, to, subject, body):
        from django.core.mail import send_mail
        send_mail(subject, body, None, [to], fail_silently=True)

class AuthService:
    def __init__(self, email_sender=None):
        self.email = email_sender or EmailSender()

    @transaction.atomic
    def register_user(self, request, name, email, password):
        user = User.objects.create_user(username=email.lower(), email=email.lower(), password=password)
        user.first_name = name
        user.save()
        
        user = authenticate(request, username=email, password=password)
        if user:
            login(request, user)
        self.email.send(email, "Welcome!", f"Hi {name}, thanks for joining!")
        return user

    def login_user(self, request, email, password, remember):
        user = authenticate(request, username=email.lower(), password=password)
        if not user:
            return None
        login(request, user)
        request.session.set_expiry(1209600 if remember else 0)
        return user
