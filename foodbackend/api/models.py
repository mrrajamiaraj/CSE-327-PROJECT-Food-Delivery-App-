from django.db import models

class Restaurant(models.Model):
    # A restaurant
    name = models.CharField(max_length=120)
    address = models.CharField(max_length=255, blank=True)
    image_url = models.URLField(blank=True)
