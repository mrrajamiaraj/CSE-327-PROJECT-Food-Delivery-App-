from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction

from .models import (
    Restaurant, Category, MenuItem,
    Cart, CartItem, Order, OrderItem
)
from .serializers import (
    RestaurantSerializer, CategorySerializer, MenuItemSerializer,
    CartSerializer, CartItemSerializer, OrderSerializer
)

class RestaurantViewSet(viewsets.ModelViewSet):
    queryset = Restaurant.objects.all()
    serializer_class = RestaurantSerializer

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    def get_queryset(self):
        qs = super().get_queryset()
        restaurant_id = self.request.query_params.get('restaurant')
        return qs.filter(restaurant_id=restaurant_id) if restaurant_id else qs

class MenuItemViewSet(viewsets.ModelViewSet):
    queryset = MenuItem.objects.filter(is_available=True)
    serializer_class = MenuItemSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        r = self.request.query_params.get('restaurant')
        c = self.request.query_params.get('category')
        if r:
            qs = qs.filter(restaurant_id=r)
        if c:
            qs = qs.filter(category_id=c)
        return qs

class CartViewSet(viewsets.ModelViewSet):
    queryset = Cart.objects.all()
    serializer_class = CartSerializer

    @action(detail=True, methods=['post'])
    def add_item(self, request, pk=None):
        cart = self.get_object()
        serializer = CartItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        item = serializer.validated_data['item']
        qty = serializer.validated_data.get('quantity', 1)
        cart_item, created = CartItem.objects.get_or_create(cart=cart, item=item)
        cart_item.quantity = cart_item.quantity + qty if not created else qty
        cart_item.save()
        return Response(CartSerializer(cart).data)

    @action(detail=True, methods=['post'])
    def update_item(self, request, pk=None):
        cart = self.get_object()
        item_id = request.data.get('item_id')
        qty = int(request.data.get('quantity', 1))
        try:
            ci = CartItem.objects.get(cart=cart, item_id=item_id)
            if qty <= 0:
                ci.delete()
            else:
                ci.quantity = qty
                ci.save()
        except CartItem.DoesNotExist:
            return Response({'detail': 'Item not in cart'}, status=status.HTTP_404_NOT_FOUND)
        return Response(CartSerializer(cart).data)

    @action(detail=True, methods=['post'])
    def clear(self, request, pk=None):
        cart = self.get_object()
        cart.items.all().delete()
        return Response(CartSerializer(cart).data)

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all().order_by('-created_at')
    serializer_class = OrderSerializer

    @transaction.atomic
    @action(detail=False, methods=['post'])
    def place(self, request):
        cart_id = request.data.get('cart_id')
        restaurant_id = request.data.get('restaurant_id')
        if not cart_id or not restaurant_id:
            return Response({'detail': 'cart_id and restaurant_id are required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            cart = Cart.objects.select_related().prefetch_related('items__item').get(pk=cart_id)
        except Cart.DoesNotExist:
            return Response({'detail': 'Cart not found'}, status=status.HTTP_404_NOT_FOUND)
        if not cart.items.exists():
            return Response({'detail': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)
        order = Order.objects.create(restaurant_id=restaurant_id, cart=cart)
        total = 0.0
        for ci in cart.items.select_related('item'):
            OrderItem.objects.create(order=order, item=ci.item, quantity=ci.quantity, unit_price=ci.item.price)
            total += ci.quantity * float(ci.item.price)
        order.total = total
        order.save()
        cart.items.all().delete()
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)
