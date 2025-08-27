from rest_framework import serializers
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Order, OrderItem, ShippingAddress,Product

class ProductSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = '__all__'

    def get_image(self, obj):
        # Prefer uploaded image URL if present
        try:
            if obj.image and hasattr(obj.image, 'url'):
                return obj.image.url
        except Exception:
            pass

        # Fallback to static mapping used previously in frontend
        try:
            from .products import products
            for p in products:
                if str(p.get('_id')) == str(getattr(obj, '_id', '')):
                    return p.get('image', '')
        except Exception:
            pass
        return ''

# Base User Serializer
class UserSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField(read_only=True)
    _id = serializers.SerializerMethodField(read_only=True)
    isAdmin = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = User
        fields = ['id', '_id', 'username', 'email', 'name', 'isAdmin']

    def get_name(self, obj):
        return obj.first_name if obj.first_name else obj.username

    def get__id(self, obj):
        return obj.id

    def get_isAdmin(self, obj):
        return obj.is_staff


# Extended User Serializer with Token
class UserSerializerWithToken(UserSerializer):
    token = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = User
        fields = ['id', '_id', 'username', 'email', 'name', 'isAdmin', 'token']

    def get_token(self, obj):
        token = RefreshToken.for_user(obj)
        return str(token.access_token)
class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = '__all__'

class ShippingAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShippingAddress
        fields = '__all__'

class OrderSerializer(serializers.ModelSerializer):
    orderItems = serializers.SerializerMethodField(read_only=True)
    shippingAddress = serializers.SerializerMethodField(read_only=True)
    user = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Order
        fields = '__all__'

    def get_orderItems(self, obj):
        items = obj.orderitem_set.all()
        return OrderItemSerializer(items, many=True).data

    def get_shippingAddress(self, obj):
        try:
            address = obj.shippingaddress
            return ShippingAddressSerializer(address).data
        except ShippingAddress.DoesNotExist:
            return None

    def get_user(self, obj):
        return UserSerializer(obj.user, many=False).data
    

class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    image = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = '__all__'

    def get_image(self, obj):
        # Use stored image if present (already a URL or path)
        if getattr(obj, 'image', ''):
            return obj.image
        # Fallback to product's resolved image
        try:
            return ProductSerializer(obj.product).data.get('image', '')
        except Exception:
            return ''