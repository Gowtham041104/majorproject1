from django.shortcuts import render
from .products import products
from .models import Product, Order, OrderItem, ShippingAddress
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from .serializer import ProductSerializer, UserSerializerWithToken, OrderSerializer, UserSerializer
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from django.template.loader import render_to_string
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import EmailMessage
from django.views.generic import View
from .utils import TokenGenerator, generate_token
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework import status
from rest_framework.views import APIView
from django.db import transaction

# Custom JWT view
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        serializer = UserSerializerWithToken(self.user).data
        for k, v in serializer.items():
            data[k] = v
        return data

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

# ROUTES
@api_view(['GET'])
def getRoutes(request):
    return Response([
        {"products": 'http://127.0.0.1:8000/api/products/'},
        {"product": 'http://127.0.0.1:8000/api/products/<id>/'},
        {"login": 'http://127.0.0.1:8000/api/users/login/'},
        {"signup": 'http://127.0.0.1:8000/api/users/register/'},
        {"activate": 'http://127.0.0.1:8000/api/users/activate/<uidb64>/<token>/'}
    ])

# PRODUCT ENDPOINTS
@api_view(['GET'])
def getProducts(request):
    qs = Product.objects.all()
    serializer = ProductSerializer(qs, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def getProduct(request, pk):
    try:
        product = Product.objects.get(_id=pk)
    except Product.DoesNotExist:
        return Response({'detail': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
    serializer = ProductSerializer(product, many=False)
    return Response(serializer.data)

# USER REGISTRATION
@api_view(['POST'])
def registerUser(request):
    data = request.data
    try:
        required_fields = ['fname', 'lname', 'email', 'password']
        if not all(field in data and data[field] for field in required_fields):
            return Response({"details": "All fields are required."}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email=data['email']).exists():
            return Response({"details": "User with this email already exists."}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create(
            first_name=data['fname'],
            last_name=data['lname'],
            username=data['email'],
            email=data['email'],
            password=make_password(data['password']),
            is_active=True  # Change to False if activation required
        )

        email_subject = "Activate Your Account"
        message = render_to_string(
            "activate.html",
            {
                'user': user,
                'domain': '127.0.0.1:8000',
                'uid': urlsafe_base64_encode(force_bytes(user.pk)),
                'token': generate_token.make_token(user),
            }
        )

        # Uncomment to send actual email
        # email_message = EmailMessage(email_subject, message, settings.EMAIL_HOST_USER, [data['email']])
        # email_message.send()

        return Response({
            "details": "User registered successfully. Please check your email to activate your account.",
            "activation_preview": message
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({"details": f"Signup failed: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

# ACCOUNT ACTIVATION
class ActivateAccountView(View):
    def get(self, request, uidb64, token):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None

        if user is not None and generate_token.check_token(user, token):
            user.is_active = True
            user.save()
            return render(request, "activatesuccess.html")
        else:
            return render(request, "activatefail.html")

# ORDERS
@api_view(['POST']) 
@permission_classes([IsAuthenticated])
def addOrderItems(request):
    user = request.user
    data = request.data

    # Basic payload presence checks
    if not isinstance(data, dict):
        return Response({'details': 'Invalid payload'}, status=status.HTTP_400_BAD_REQUEST)

    order_items = data.get('orderItems')
    if not isinstance(order_items, list) or len(order_items) == 0:
        return Response({'details': 'No order items provided'}, status=status.HTTP_400_BAD_REQUEST)

    shipping_data = data.get('shippingAddress') or {}
    required_shipping_fields = ['address', 'city', 'postalCode', 'country']
    missing_shipping = [f for f in required_shipping_fields if not shipping_data.get(f)]
    if missing_shipping:
        return Response({'details': f"Missing shipping fields: {', '.join(missing_shipping)}"}, status=status.HTTP_400_BAD_REQUEST)

    # Numeric fields
    try:
        tax_price = float(data.get('taxPrice', 0))
        shipping_price = float(data.get('shippingPrice', 0))
        total_price = float(data.get('totalPrice', 0))
    except (TypeError, ValueError):
        return Response({'details': 'Invalid numeric fields for prices'}, status=status.HTTP_400_BAD_REQUEST)

    # Validate each order item before creating anything
    product_id_to_qty = {}
    validated_items = []
    for raw_item in order_items:
        if not isinstance(raw_item, dict):
            return Response({'details': 'Invalid order item format'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            product_id = raw_item['product']
            qty = int(raw_item.get('qty', 0))
            price = float(raw_item.get('price', 0))
        except (KeyError, TypeError, ValueError):
            return Response({'details': 'Each item must include valid product, qty, price'}, status=status.HTTP_400_BAD_REQUEST)
        if qty <= 0:
            return Response({'details': 'Item quantity must be greater than 0'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            product = Product.objects.get(_id=product_id)
        except Product.DoesNotExist:
            return Response({'details': f'Product {product_id} not found'}, status=status.HTTP_400_BAD_REQUEST)
        validated_items.append({'product': product, 'qty': qty, 'price': price})
        product_id_to_qty[product._id] = product_id_to_qty.get(product._id, 0) + qty

    # Check stock availability for all products first
    for validated in validated_items:
        product = validated['product']
        requested_qty = product_id_to_qty.get(product._id, 0)
        if requested_qty > product.countInStock:
            return Response({'details': f"Insufficient stock for {product.name}. Available: {product.countInStock}, requested: {requested_qty}"}, status=status.HTTP_400_BAD_REQUEST)

    # Create everything atomically
    with transaction.atomic():
        order = Order.objects.create(
            user=user,
            paymentMethod='Cash on Delivery',
            taxPrice=tax_price,
            shippingPrice=shipping_price,
            totalPrice=total_price,
        )

        ShippingAddress.objects.create(
            order=order,
            address=shipping_data['address'],
            city=shipping_data['city'],
            postalCode=shipping_data['postalCode'],
            country=shipping_data['country'],
        )

        for validated in validated_items:
            product = validated['product']
            qty = validated['qty']
            price = validated['price']
            image_value = ''
            try:
                if product.image and hasattr(product.image, 'url'):
                    image_value = product.image.url
            except Exception:
                image_value = ''

            OrderItem.objects.create(
                product=product,
                order=order,
                name=product.name,
                qty=qty,
                price=price,
                image=image_value,
            )

            product.countInStock -= qty
            product.save()

    serializer = OrderSerializer(order, many=False)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getMyOrders(request):
    user = request.user
    orders = user.order_set.all()
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def getOrders(request):
    orders = Order.objects.all()
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getOrderById(request, pk):
    user = request.user
    try:
        order = Order.objects.get(_id=pk)
        if user.is_staff or order.user == user:
            serializer = OrderSerializer(order, many=False)
            return Response(serializer.data)
        else:
            return Response({'details': "Not authorized to view this order"}, status=status.HTTP_400_BAD_REQUEST)
    except Order.DoesNotExist:
        return Response({'details': 'Order does not exist'}, status=status.HTTP_400_BAD_REQUEST)

# ADMIN PRODUCT VIEWS
@api_view(['POST'])
@permission_classes([IsAdminUser])
def createProduct(request):
    user = request.user
    product = Product.objects.create(
        user=user,
        name='Sample Name',
        price=0,
        brand='Sample Brand',
        countInStock=0,
        category='Sample Category',
        description=''
    )
    serializer = ProductSerializer(product, many=False)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAdminUser])
def seedProducts(request):
    """Seed DB with products from app.products (admin-only)."""
    created_count = 0
    updated_count = 0
    for p in products:
        obj, created = Product.objects.update_or_create(
            _id=p['_id'],
            defaults=dict(
                name=p['name'],
                price=p['price'],
                brand=p['brand'],
                countInStock=p['countInStock'],
                category=p['category'],
                description=p.get('description', ''),
            )
        )
        if created:
            created_count += 1
        else:
            updated_count += 1
    return Response({
        'details': 'Seed complete',
        'created': created_count,
        'updated': updated_count,
    })

@api_view(['PUT'])
@permission_classes([IsAdminUser])
def updateProduct(request, pk):
    data = request.data
    product = Product.objects.get(_id=pk)
    product.name = data['name']
    product.price = data['price']
    product.brand = data['brand']
    product.countInStock = data['countInStock']
    product.category = data['category']
    product.description = data['description']
    product.save()
    serializer = ProductSerializer(product, many=False)
    return Response(serializer.data)

@api_view(['POST'])
def uploadImage(request):
    data = request.data
    product_id = data['product_id']
    product = Product.objects.get(_id=product_id)
    product.image = request.FILES.get('image')
    product.save()
    return Response('Image was Uploaded')

@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def deleteProduct(request, pk):
    product = Product.objects.get(_id=pk)
    product.delete()
    return Response('Product Deleted....')

# USER VIEWS
@api_view(['GET'])
@permission_classes([IsAdminUser])
def getUsers(request):
    users = User.objects.all()
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getUserById(request, pk):
    user = User.objects.get(id=pk)
    serializer = UserSerializer(user, many=False)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getUserProfile(request):
    user = request.user
    serializer = UserSerializer(user, many=False)
    return Response(serializer.data)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def updateUserProfile(request):
    user = request.user
    data = request.data
    user.first_name = data['fname']
    user.last_name = data['lname']
    if data.get('password'):
        user.password = make_password(data['password'])
    user.save()
    serializer = UserSerializerWithToken(user, many=False)
    return Response(serializer.data)

@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def deleteUser(request, pk):
    user = User.objects.get(id=pk)
    user.delete()
    return Response("User is Deleted...")

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def updateUser(request, pk):
    user = User.objects.get(id=pk)
    data = request.data
    user.first_name = data['name']
    user.email = data['email']
    user.is_staff = data['isAdmin']
    user.save()
    serializer = UserSerializer(user, many=False)
    return Response(serializer.data)
