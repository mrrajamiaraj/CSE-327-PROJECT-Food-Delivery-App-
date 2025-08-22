
from django.contrib.auth import authenticate, login, get_user_model
from django.db import transaction

User = get_user_model()


class EmailSender:
    def send(self, to, subject, body):
        from django.core.mail import send_mail
        send_mail(subject, body, None, [to], fail_silently=True)

class AuthService:
    def __init__(self, email_sender=None):
        self.email = email_sender or EmailSender()

    def login_user(self, request, email_or_username: str, password: str, remember: bool = False):
        username = (email_or_username or "").strip().lower()
        user = authenticate(request, username=username, password=password or "")
        if not user:
            return None
        login(request, user)
        request.session.set_expiry(1209600 if remember else 0)  # 14 days or session
        return user

    @transaction.atomic
    def register_user(self, request, *, name: str, email: str, username: str | None, password: str):
        uname = (username or email or "").strip().lower()
        mail = (email or "").strip().lower() or None
        user = User.objects.create_user(username=uname, email=mail, password=password)
        if name:
            user.first_name = name
            user.save(update_fields=["first_name"])
        login(request, user)  
        return user
