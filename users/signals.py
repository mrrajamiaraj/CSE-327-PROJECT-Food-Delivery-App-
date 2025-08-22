# users/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model

User = get_user_model()

@receiver(post_save, sender=User)
def on_user_created(sender, instance, created, **kwargs):
    if not created:
        return
    try:
        from .services import EmailSender
        if instance.email:
            EmailSender().send(
                instance.email,
                "Welcome!",
                f"Hi {getattr(instance, 'first_name', '') or 'there'}, welcome aboard!",
            )
    except Exception:
        pass
