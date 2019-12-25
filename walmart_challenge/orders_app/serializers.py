from rest_framework import serializers
from .models import Orders, Users, Items, OrderItems # add this

class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Orders
        fields = '__all__'
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = Users
        fields = '__all__'
class ItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Items
        fields = '__all__'
class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItems
        fields = ('order', 'item')