from django.contrib import admin

from django.contrib import admin
from .models import Restaurant, Category, MenuItem, Cart, CartItem, Order, OrderItem
admin.site.register(Restaurant)
admin.site.register(Category)
admin.site.register(MenuItem)
admin.site.register(Cart)
admin.site.register(CartItem)
admin.site.register(Order)
admin.site.register(OrderItem)

