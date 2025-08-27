import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
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

import { useSelector } from "react-redux";

const RequireAuth = ({ children }) => {
  const { userInfo } = useSelector((s) => s.userLogin || {});
  const location = useLocation();
  if (!userInfo) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }
  return children;
};

const AdminOnly = ({ children }) => {
  const { userInfo } = useSelector((s) => s.userLogin || {});
  if (!userInfo || !userInfo.isAdmin) return <Navigate to="/login" replace />;
  return children;
};

export default function App() {
  return (
    <>
      <BrowserRouter>
        <Header />
        <main>
          <Container>
            <Routes>
              {/* Public */}
              <Route path="/" element={<LoginScreen />} />
              <Route path="/login" element={<LoginScreen />} />
              <Route path="/signup" element={<SignupScreen />} />

              {/* Protected */}
              <Route path="/home" element={<RequireAuth><Home /></RequireAuth>} />
              <Route path="/product/:id" element={<RequireAuth><ProductDetails /></RequireAuth>} />
              <Route path="/cart/:id?" element={<RequireAuth><CartScreen /></RequireAuth>} />
              <Route path="/checkout" element={<RequireAuth><ShippingScreen /></RequireAuth>} />
              <Route path="/payment" element={<RequireAuth><PaymentScreen /></RequireAuth>} />
              <Route path="/placeorder" element={<RequireAuth><PlaceOrderScreen /></RequireAuth>} />
              <Route path="/order/:id" element={<RequireAuth><OrderScreen /></RequireAuth>} />
              <Route path="/profile" element={<RequireAuth><ProfileScreen /></RequireAuth>} />

              {/* Admin */}
              <Route path="/admin/productList" element={<AdminOnly><ProductListScreen /></AdminOnly>} />
              <Route path="/admin/product/:id/edit" element={<AdminOnly><ProductEditScreen /></AdminOnly>} />
              <Route path="/admin/orderlist" element={<AdminOnly><OrderListScreen /></AdminOnly>} />
              <Route path="/admin/userlist" element={<AdminOnly><UserListScreen /></AdminOnly>} />
              <Route path="/admin/user/:id/edit" element={<AdminOnly><UserEditScreen /></AdminOnly>} />
            </Routes>
          </Container>
        </main>
        <Footer/>
      </BrowserRouter>
    </>
  );
}
