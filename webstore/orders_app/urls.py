from django.urls import path
from . import views
from rest_framework import routers                    # add this
from django.urls import path, include


router = routers.DefaultRouter()                      # add this
router.register(r'orders', views.OrderView, 'orders')
router.register(r'users', views.UserView, 'users')
router.register(r'items', views.ItemView, 'items')
router.register(r'order_items', views.OrderItemView, 'order_items')
urlpatterns = [
     path('api/', include(router.urls))   
]