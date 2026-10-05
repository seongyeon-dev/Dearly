import { Route, Routes } from "react-router-dom";

import Home from "../pages/Home/Home";
import ProductCreate from "../pages/ProductCreate/ProductCreate";
import Wishlist from "../pages/Wishlist/Wishlist";

function Router() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/wishlist" element={<Wishlist />} />
      <Route path="/wishlist/new" element={<ProductCreate />} />
    </Routes>
  );
}

export default Router;