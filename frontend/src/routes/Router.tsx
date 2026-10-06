import { Route, Routes } from "react-router-dom";

import Layout from "../components/Layout/Layout";
import Home from "../pages/Home/Home";
import ProductCreate from "../pages/ProductCreate/ProductCreate";
import ProductDetail from "../pages/ProductDetail/ProductDetail";
import Profile from "../pages/Profile/Profile";
import PurchaseHistory from "../pages/PurchaseHistory/PurchaseHistory";
import Signup from "../pages/Signup/Signup";
import Login from "../pages/Login/Login";
import Statistics from "../pages/Statistics/Statistics";
import Wishlist from "../pages/Wishlist/Wishlist";

function Router() {
  return (
    <Routes>
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />

      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/wishlist/new" element={<ProductCreate />} />
        <Route path="/wishlist/:wishId" element={<ProductDetail />} />
        <Route path="/purchases" element={<PurchaseHistory />} />
        <Route path="/statistics" element={<Statistics />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
    </Routes>
  );
}

export default Router;
