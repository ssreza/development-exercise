from django.shortcuts import render
from .serializers import OrderSerializer ,UserSerializer ,ItemSerializer,OrderItemSerializer    # add this
from .models import Orders, Users, Items, OrderItems # add this
from rest_framework import viewsets

class OrderView(viewsets.ModelViewSet):       # add this
  queryset = Orders.objects.all()
  serializer_class = OrderSerializer         # add this
class UserView(viewsets.ModelViewSet):       # add this
  queryset = Users.objects.all()
  serializer_class = UserSerializer         # add this
class ItemView(viewsets.ModelViewSet):       # add this
  queryset = Items.objects.all()
  serializer_class = ItemSerializer         # add this
class OrderItemView(viewsets.ModelViewSet):       # add this
  queryset = OrderItems.objects.all()
  serializer_class = OrderItemSerializer         # add this
   