import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import PrivateRoute from "./PrivateRoute";

import Home from "../pages/Home";
import Menu from "../pages/Menu";
import Orders from "../pages/Orders";
import OrderTracker from "../pages/OrderTracker";
import ProductDetails from "../pages/ProductDetails";
import Bag from "../pages/Bag";
import Checkout from "../pages/Checkout";
import Login from "../pages/Login";
import Registration from "../pages/Registration";
import TermsCondition from "../pages/TermsCondition";
import PrivacyPolicy from "../pages/PrivacyPolicy";
import ForgotPassword from "../pages/ForgotPassword";
import UserProfile from "../pages/UserProfile";
import ActivityHistoryDetails from "../components/UserProfile/ActivityHistoryDetails";
import Settings from "../pages/Settings";
import { createWebhook } from "../api/paymongo_webhook";

const Routers = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" />} />
      <Route path="/home" element={<Home />} />
      <Route path="/menu" element={<Menu />} />
      <Route path="/orders" element={<Orders />} />
      <Route path="/orders/:orderId" element={<OrderTracker />} />
      <Route path="/productDetails/:id" element={<ProductDetails />} />
      <Route path="/bag" element={<Bag />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registration" element={<Registration />} />
      <Route path="/termsCondition" element={<TermsCondition />} />
      <Route path="/privacyPolicy" element={<PrivacyPolicy />} />
      <Route path="/forgotPassword" element={<ForgotPassword />} />
      <Route path="/userProfile" element={<UserProfile />} />
      <Route
        path="/activityHistoryDetails/:orderId"
        element={<ActivityHistoryDetails />}
      />
      <Route path="/settings" element={<Settings />} />
      <Route path="/webhook" element={<createWebhook />} />
    </Routes>
  );
};

export default Routers;
