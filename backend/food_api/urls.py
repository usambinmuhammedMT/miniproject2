from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CategoryViewSet, FoodItemViewSet, CartViewSet, 
    OrderViewSet, InvoiceViewSet
)

router = DefaultRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'food-items', FoodItemViewSet)
router.register(r'carts', CartViewSet)
router.register(r'orders', OrderViewSet)
router.register(r'invoices', InvoiceViewSet)

urlpatterns = [
    path('', include(router.urls)),
] 