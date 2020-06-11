from django.contrib import admin

# Register your models here.
from .models import Orders, Users, Items, OrderItems # add this

class OrderAdmin(admin.ModelAdmin):  # add this
    list_display = ('user',) # add this
class UserAdmin(admin.ModelAdmin):  # add this
    list_display = ('name',)
class ItemAdmin(admin.ModelAdmin):  # add this
    list_display = ('name',)
class OrderItemAdmin(admin.ModelAdmin):  # add this
    list_display = ('order','item')
    # Register your models here.
admin.site.register(Orders, OrderAdmin) # 
admin.site.register(Users, UserAdmin) # 
admin.site.register(Items, ItemAdmin) # 
admin.site.register(OrderItems, OrderItemAdmin) # 
