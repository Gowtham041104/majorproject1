from django.shortcuts import render
# from django.http import JsonResponse
from .products import products
from .models import Product,Order,OrderItem,ShippingAddress
from rest_framework.response import Response
from rest_framework.decorators import api_view,permission_classes
from .serializer import ProductSerializer,UserSerializerWithToken,OrderSerializer,UserSerializer
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer # type: ignore
from rest_framework_simplejwt.views import TokenObtainPairView # type: ignore
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password

# for email purpose and cerifying the email
from django.template.loader import render_to_string
from django.utils.http import urlsafe_base64_decode,urlsafe_base64_encode
from django.utils.encoding import force_bytes,force_text,DjangoUnicodeDecodeError
from django.core.mail import EmailMessage
from django.conf import settings
from django.views.generic import View
from .utils import TokenGenerator,generate_token

from rest_framework.permissions import IsAuthenticated,IsAdminUser

from rest_framework import status

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
    return Response(products)

@api_view(['GET'])
def getProduct(request, pk):
    product = next((item for item in products if item['_id'] == pk), None)
    if product:
        return Response(product)
    return Response({'detail': 'Product not found'}, status=404)


# JWT LOGIN VIEW
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        serializer = UserSerializerWithToken(self.user).data
        for k, v in serializer.items():
            data[k] = v
        return data

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


# USER REGISTRATION
@api_view(['POST'])
def registerUser(request):
    data = request.data
    try:
        # Validate required fields
        required_fields = ['fname', 'name', 'email', 'password']
        if not all(field in data and data[field] for field in required_fields):
            return Response({"details": "All fields are required."}, status=status.HTTP_400_BAD_REQUEST)

        # Check if user already exists
        if User.objects.filter(email=data['email']).exists():
            return Response({"details": "User with this email already exists."}, status=status.HTTP_400_BAD_REQUEST)

        # Validate password
        try:
            validate_password(data['password'])
        except DjangoValidationError as e:
            return Response({"details": e.messages}, status=status.HTTP_400_BAD_REQUEST)

        # Create a new user with is_active=False
        user = User.objects.create(
            first_name=data['fname'],
            last_name=data['name'],
            username=data['email'],
            email=data['email'],
            password=make_password(data['password']),
            is_active=False
        )

        # Prepare email contents
        email_subject = "Activate Your Account"
        message = render_to_string("activate.html", {
            'user': user,
            'domain': '127.0.0.1:8000',
            'uid': urlsafe_base64_encode(force_bytes(user.pk)),
            'token': generate_token.make_token(user)
        })

        # Send the email
        email_message = EmailMessage(
            email_subject,
            message,
            settings.EMAIL_HOST_USER,
            [data['email']]
        )
        email_message.send()

        return Response({"details": "Activate your account by clicking the link sent to your email."}, status=status.HTTP_201_CREATED)

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
@api_view(['POST']) 
@permission_classes([IsAuthenticated])
def addOrderItems(request):
    user = request.user
    data = request.data
    orderItems = data.get('orderItems', [])

    if not orderItems or len(orderItems) == 0:
        return Response({'details': "No Order Items"}, status=status.HTTP_400_BAD_REQUEST)

    # 1. Create Order
    order = Order.objects.create(
        user=user,
        paymentMethod='Cash on Delivery',  # you can get from data if needed
        taxPrice=data.get('taxPrice', 0),
        shippingPrice=data.get('shippingPrice', 0),
        totalPrice=data.get('totalPrice', 0)
    )

    # 2. Shipping Address 
    shipping_data = data.get('shippingAddress', {})
    shipping = ShippingAddress.objects.create(
        order=order,
        address=shipping_data.get('address', ''),
        city=shipping_data.get('city', ''),
        postalCode=shipping_data.get('postalCode', ''),
        country=shipping_data.get('country', '')
    )

    # 3. Create order items and set order-orderitem relationship
    for i in orderItems:
        product_id = i.get('product')
        if not product_id:
            order.delete()  # cleanup order if invalid
            return Response({'detail': 'Product ID missing in order item'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            product = Product.objects.get(_id=product_id)
        except Product.DoesNotExist:
            order.delete()  # cleanup order if invalid
            return Response({'detail': f'Product with id {product_id} does not exist'}, status=status.HTTP_400_BAD_REQUEST)

        qty = i.get('qty', 0)
        if qty <= 0:
            order.delete()
            return Response({'detail': 'Quantity must be greater than zero'}, status=status.HTTP_400_BAD_REQUEST)

        # Create OrderItem
        item = OrderItem.objects.create(
            product=product,
            order=order,
            name=product.name,
            qty=qty,
            price=i.get('price', 0),
            image=product.image.url if product.image else ''
        )

        # Update stock
        product.countInStock -= qty
        if product.countInStock < 0:
            order.delete()
            return Response({'detail': f'Not enough stock for product {product.name}'}, status=status.HTTP_400_BAD_REQUEST)
        product.save()

    serializer = OrderSerializer(order, many=False)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getMyOrders(request):
    user=request.user
    orders=user.order_set.all()
    serializer=OrderSerializer(orders,many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def getOrders(request):
    orders=Order.objects.all()
    serializer=OrderSerializer(orders,many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getOrderById(request,pk):
    user=request.user

    try:
        order=Order.objects.get(_id=pk)
        if user.is_staff or order.user==user:
            serializer=OrderSerializer(order,many=False)
            return Response(serializer.data)
        else:
            return Response({'details':"Not authorized to view this order"},status=status.HTTP_400_BAD_REQUEST)
    except:
        return Response({
            'details':'Order does not exist'
        }, status=status.HTTP_400_BAD_REQUEST)


# admin views
@api_view(['POST'])
@permission_classes([IsAdminUser])
def createProduct(request):
    user=request.user

    product=Product.objects.create(
        user=user,
        name='Sample Name',
        price=0,
        brand='Sample Brand',
        countInStock=0,
        category='Sample Category',
        description=''
    )
    serializer=ProductSerializer(product,many=False)
    return Response(serializer.data)

@api_view(['PUT'])
@permission_classes([IsAdminUser])
def updateProduct(request,pk):
    data=request.data
    product=Product.objects.get(_id=pk)
    product.name=data['name']
    product.price=data['price']
    product.brand=data['brand']
    product.countInStock=data['countInStock']
    product.category=data['category']
    product.description=data['description']
    product.save()
    serializer=ProductSerializer(product,many=False)
    return Response(serializer.data)

@api_view(['POST'])
def uploadImage(request):
    data=request.data
    product_id=data['product_id']
    product=Product.objects.get(_id=product_id)
    product.image=request.FILES.get('image')
    product.save()
    return Response('Image was Uploaded')


@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def deleteProduct(request,pk):
    product=Product.objects.get(_id=pk)
    product.delete()
    return Response('Product Deleted....')


@api_view(['GET'])
@permission_classes([IsAdminUser])
def getUsers(request):
    users=User.objects.all()
    serializer=UserSerializer(users,many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getUserById(request, pk):
    user=User.objects.get(id=pk)
    serializer=UserSerializer(user,many=False)
    return Response(serializer.data)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getUserProfile(request):
    user=request.user
    serializer=UserSerializer(user,many=False)
    return Response(serializer.data)



@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def updateUserProfile(request):
    user=request.user
    serializer=UserSerializerWithToken(user,many=False)
    data=request.data
    user.first_name=data['fname']
    user.last_name=data['lname']
    if data['password']!='':
        user.password=make_password(data['password'])
    user.save()
    return Response(serializer.data)



@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def deleteUser(request, pk):
    user=User.objects.get(id=pk)
    user.delete()
    return Response("User is Deleted...")


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def updateUser(request,pk):
    user=User.objects.get(id=pk)
    data=request.data

    user.first_name=data['name']
    user.email=data['email']
    user.is_staff=data['isAdmin']
    user.save()
    serializer=UserSerializer(user,many=False)
    return Response(serializer.data)
    