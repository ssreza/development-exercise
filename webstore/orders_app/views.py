from django.shortcuts import render
from .serializers import OrderSerializer ,UserSerializer ,ItemSerializer,OrderItemSerializer    # add this
from .models import Orders, Users, Items, OrderItems # add this
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from datetime import datetime, date, time
class OrderView(viewsets.ModelViewSet):       # add this
  queryset = Orders.objects.all()
  serializer_class = OrderSerializer 
  
 
class UserView(viewsets.ModelViewSet):       # add this
  queryset = Users.objects.all()
  serializer_class = UserSerializer         # add this

class ItemView(viewsets.ModelViewSet):       # add this
  queryset = Items.objects.all()
  serializer_class = ItemSerializer     # add this

class OrderItemView(viewsets.ModelViewSet):       # add this
  queryset = OrderItems.objects.all()
  serializer_class = OrderItemSerializer 


class MultiUpdateView(viewsets.ModelViewSet):       # add this
  queryset = Orders.objects.all()
  serializer_class = OrderSerializer 
  
  @action(methods=['patch'], detail=False)
  def multi_update(self, request, *args, **kwargs):
      queryset = Orders.objects.all()
      # queryset.update(created_at=datetime.now())
      # serializer = self.get_serializer(instance=queryset, many=True)
      return Response(serializer.data) 