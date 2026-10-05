import { Route, Routes } from "react-router-dom";

import Home from "../pages/Home/Home";
import ProductCreate from "../pages/ProductCreate/ProductCreate";
import ProductDetail from "../pages/ProductDetail/ProductDetail";
import Wishlist from "../pages/Wishlist/Wishlist";

function Router() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/wishlist" element={<Wishlist />} />
      <Route path="/wishlist/new" element={<ProductCreate />} />
      <Route path="/wishlist/:wishId" element={<ProductDetail />} />
    </Routes>
  );
}

export default Router;