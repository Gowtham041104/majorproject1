import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import { Container } from "react-bootstrap";
import Home from "./components/Home";
import Footer from "./components/Footer";
import SignupScreen from "./components/screen/SignupScreen";
import LoginScreen from "./components/screen/LoginScreen";
import ProductDetails from "./components/screen/ProductDetails";
import CartScreen from "./components/screen/CartScreen";
import ShippingScreen from "./components/screen/ShippingScreen";
import PlaceOrderScreen from "./components/screen/PlaceOrderScreen";
import PaymentScreen from "./components/screen/PaymentScreen";
import OrderScreen from "./components/screen/OrderScreen";
import ProductListScreen from "./components/screen/ProductListScreen";
import ProductEditScreen from "./components/screen/ProductEditScreen";
import OrderListScreen from "./components/screen/OrderListScreen";
import UserListScreen from "./components/screen/UserListScreen";
import UserEditScreen from "./components/screen/UserEditScreen";
import ProfileScreen from "./components/screen/ProfileScreen";

export default function App() {
  return (
    <>
      <BrowserRouter>
        <Header />
        <main>
          <Container>
            <Routes>
              <Route path="/" element={<Home />} />
            </Routes>
            <Routes>
              <Route path="/product/:id" element={<ProductDetails />} />
            </Routes>
            <Routes>
              <Route path="/signup" element={<SignupScreen />} />
            </Routes>
            <Routes>
              <Route path="/login" element={<LoginScreen />} />
            </Routes>
            <Routes>
              <Route path="/cart/:id?" element={<CartScreen />} />
            </Routes>
            <Routes>
              <Route path="/checkout" element={<ShippingScreen />} />
            </Routes>
            <Routes>
              <Route path="/placeorder" element={<PlaceOrderScreen />} />
            </Routes>
            <Routes>
              <Route path="/payment" element={<PaymentScreen />} />
            </Routes>
            <Routes>
              <Route path="/order/:id" element={<OrderScreen />} />
            </Routes>
            <Routes>
              <Route path="/admin/productList" element={<ProductListScreen />} />
            </Routes>
            <Routes>
              <Route path="/admin/product/:id/edit" element={<ProductEditScreen />} />
            </Routes>
            <Routes>
              <Route path="/admin/orderlist" element={<OrderListScreen />} />
            </Routes>
            <Routes>
              <Route path="/admin/userlist" element={<UserListScreen />} />
            </Routes>
            <Routes>
              <Route path="/admin/user/:id/edit" element={<UserEditScreen />} />
            </Routes>
            <Routes>
              <Route path="/profile" element={<ProfileScreen />} />
            </Routes>
          </Container>
        </main>
        <Footer/>
      </BrowserRouter>
    </>
  );
}
