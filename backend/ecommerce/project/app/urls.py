from django.urls import path
from app import views

urlpatterns = [
    path('', views.getRoutes),
    path('products/', views.getProducts),
    path('products/<str:pk>/', views.getProduct),

    path('users/login/', views.MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('users/register/', views.registerUser, name='registeruser'),

    path('activate/<uidb64>/<token>/', views.ActivateAccountView.as_view(), name='activate'),
    path('orders/add/', views.addOrderItems, name='orders-add'),
    path('orders/', views.getOrders, name='orders'),
    path('orders/myorders/', views.getMyOrders, name='myorders'), 
    path('orders/<str:pk>/', views.getOrderById, name='user-order'),

    # product CRUD
    path('products/create/', views.createProduct, name='product-create'),
    path('products/seed/', views.seedProducts, name='product-seed'),
    path("products/update/<str:pk>/", views.updateProduct, name="product-update"),
    path("products/delete/<str:pk>/", views.deleteProduct, name="product-delete"),
    path('products/upload/', views.uploadImage, name="image-upload"),

    # Removed duplicate route for product create

    # user management
    path('users/getallusers/', views.getUsers, name='users'),
    path('users/update/<str:pk>/', views.updateUser, name='updateUser'),
    path('users/delete/<str:pk>/', views.deleteUser, name='deleteUser'),
    path('users/<str:pk>/', views.getUserById, name='getUserById'),
    path('users/profile/', views.getUserProfile, name="getUserProfile"),
    path('users/profile/update/', views.updateUserProfile, name="updateUserProfile"),
]
