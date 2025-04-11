from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Category, FoodItem, Cart, CartItem, Order, OrderItem, Invoice
from .serializers import (
    CategorySerializer, FoodItemSerializer, CartSerializer, CartItemSerializer,
    OrderSerializer, OrderItemSerializer, InvoiceSerializer
)
from decimal import Decimal

# Create your views here.

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class FoodItemViewSet(viewsets.ModelViewSet):
    queryset = FoodItem.objects.all()
    serializer_class = FoodItemSerializer

    def get_queryset(self):
        queryset = FoodItem.objects.all()
        category_id = self.request.query_params.get('category')
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        return queryset

class CartViewSet(viewsets.ModelViewSet):
    queryset = Cart.objects.all()
    serializer_class = CartSerializer

    def get_queryset(self):
        user_id = self.request.query_params.get('user_id')
        if user_id:
            return Cart.objects.filter(user_id=user_id)
        return Cart.objects.all()

    @action(detail=True, methods=['post'])
    def add_item(self, request, pk=None):
        cart = self.get_object()
        food_item_id = request.data.get('food_item_id')
        quantity = int(request.data.get('quantity', 1))
        
        if not food_item_id:
            return Response({"error": "food_item_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            food_item = FoodItem.objects.get(id=food_item_id)
        except FoodItem.DoesNotExist:
            return Response({"error": "Food item not found"}, status=status.HTTP_404_NOT_FOUND)
        
        # Check if item already in cart
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            food_item=food_item,
            defaults={'quantity': quantity}
        )
        
        if not created:
            cart_item.quantity += quantity
            cart_item.save()
        
        serializer = CartSerializer(cart)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def remove_item(self, request, pk=None):
        cart = self.get_object()
        cart_item_id = request.data.get('cart_item_id')
        
        if not cart_item_id:
            return Response({"error": "cart_item_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            cart_item = CartItem.objects.get(id=cart_item_id, cart=cart)
            cart_item.delete()
            serializer = CartSerializer(cart)
            return Response(serializer.data)
        except CartItem.DoesNotExist:
            return Response({"error": "Cart item not found"}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'])
    def update_item_quantity(self, request, pk=None):
        cart = self.get_object()
        cart_item_id = request.data.get('cart_item_id')
        quantity = request.data.get('quantity')
        
        if not cart_item_id or not quantity:
            return Response({"error": "cart_item_id and quantity are required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            quantity = int(quantity)
            if quantity <= 0:
                return Response({"error": "Quantity must be greater than 0"}, status=status.HTTP_400_BAD_REQUEST)
        except ValueError:
            return Response({"error": "Quantity must be a number"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            cart_item = CartItem.objects.get(id=cart_item_id, cart=cart)
            cart_item.quantity = quantity
            cart_item.save()
            serializer = CartSerializer(cart)
            return Response(serializer.data)
        except CartItem.DoesNotExist:
            return Response({"error": "Cart item not found"}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'])
    def checkout(self, request, pk=None):
        cart = self.get_object()
        user_id = cart.user_id
        
        if not cart.cart_items.exists():
            return Response({"error": "Cart is empty"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Get financial details from request or calculate
        subtotal = cart.total_price()
        tax = Decimal(request.data.get('tax', 0))
        delivery_fee = Decimal(request.data.get('delivery_fee', 0))
        total_amount = request.data.get('total_amount')
        
        # Calculate total amount if not provided
        if not total_amount:
            total_amount = subtotal + tax + delivery_fee
        else:
            total_amount = Decimal(total_amount)
        
        # Get customer information
        customer_name = request.data.get('customer_name')
        delivery_address = request.data.get('delivery_address')
        phone_number = request.data.get('phone_number')
        
        # Get pickup information
        pickup_time = request.data.get('pickup_time')
        
        # Get payment information
        payment_method = request.data.get('payment_method')
        payment_id = request.data.get('payment_id')
        payment_status = request.data.get('payment_status', 'SUCCESS')
        
        # Create order with all available information
        order = Order.objects.create(
            user_id=user_id,
            subtotal=subtotal,
            tax=tax,
            delivery_fee=delivery_fee,
            total_amount=total_amount,
            customer_name=customer_name,
            delivery_address=delivery_address,
            phone_number=phone_number,
            pickup_time=pickup_time,
            payment_method=payment_method,
            payment_id=payment_id,
            payment_status=payment_status,
            status='pending'
        )
        
        # Create order items
        for cart_item in cart.cart_items.all():
            OrderItem.objects.create(
                order=order,
                food_item=cart_item.food_item,
                quantity=cart_item.quantity,
                price=cart_item.food_item.price
            )
        
        # Create invoice
        invoice = Invoice.objects.create(order=order)
        
        # Clear cart
        cart.cart_items.all().delete()
        
        return Response({
            "message": "Order placed successfully",
            "order_id": order.order_id,
            "invoice_id": invoice.invoice_number
        })

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer

    def get_queryset(self):
        user_id = self.request.query_params.get('user_id')
        if user_id:
            return Order.objects.filter(user_id=user_id).order_by('-created_at')
        return Order.objects.all().order_by('-created_at')

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        order = self.get_object()
        status_value = request.data.get('status')
        
        if not status_value:
            return Response({"error": "Status is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        if status_value not in dict(Order.STATUS_CHOICES):
            return Response({"error": f"Invalid status. Must be one of {dict(Order.STATUS_CHOICES).keys()}"}, status=status.HTTP_400_BAD_REQUEST)
        
        order.status = status_value
        order.save()
        serializer = OrderSerializer(order)
        return Response(serializer.data)

class InvoiceViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer

    def get_queryset(self):
        user_id = self.request.query_params.get('user_id')
        if user_id:
            return Invoice.objects.filter(order__user_id=user_id).order_by('-invoice_date')
        return Invoice.objects.all().order_by('-invoice_date')

    @action(detail=False, methods=['get'])
    def get_by_order(self, request):
        order_id = request.query_params.get('order_id')
        if not order_id:
            return Response({"error": "order_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        invoice = get_object_or_404(Invoice, order__order_id=order_id)
        serializer = InvoiceSerializer(invoice)
        return Response(serializer.data)
