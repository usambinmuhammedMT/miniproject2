from rest_framework import serializers
from .models import Category, FoodItem, Cart, CartItem, Order, OrderItem, Invoice

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class FoodItemSerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source='category.name')

    class Meta:
        model = FoodItem
        fields = ['id', 'name', 'description', 'price', 'image', 'category', 'category_name', 'is_available', 'created_at', 'updated_at']

class CartItemSerializer(serializers.ModelSerializer):
    food_item = FoodItemSerializer(read_only=True)
    food_item_id = serializers.PrimaryKeyRelatedField(
        queryset=FoodItem.objects.all(), 
        source='food_item', 
        write_only=True
    )
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = ['id', 'food_item', 'food_item_id', 'quantity', 'subtotal']

    def get_subtotal(self, obj):
        return obj.subtotal()

class CartSerializer(serializers.ModelSerializer):
    cart_items = CartItemSerializer(many=True, read_only=True)
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ['id', 'user_id', 'cart_items', 'total_price', 'created_at', 'updated_at']

    def get_total_price(self, obj):
        return obj.total_price()

class OrderItemSerializer(serializers.ModelSerializer):
    food_name = serializers.ReadOnlyField(source='food_item.name')
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = ['id', 'food_item', 'food_name', 'quantity', 'price', 'subtotal']

    def get_subtotal(self, obj):
        return obj.subtotal()

class OrderSerializer(serializers.ModelSerializer):
    order_items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'order_id', 'user_id', 'status', 
            'subtotal', 'tax', 'delivery_fee', 'total_amount',
            'customer_name', 'delivery_address', 'phone_number',
            'pickup_time', 'payment_method', 'payment_id', 'payment_status',
            'order_items', 'created_at', 'updated_at'
        ]

class InvoiceSerializer(serializers.ModelSerializer):
    order = OrderSerializer(read_only=True)

    class Meta:
        model = Invoice
        fields = ['id', 'invoice_number', 'invoice_date', 'order'] 