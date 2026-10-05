import { Routes, Route } from "react-router-dom";

import Home from "../pages/Home/Home";
import Wishlist from "../pages/Wishlist/Wishlist";

function Router() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/wishlist" element={<Wishlist />} />
    </Routes>
  );
}

export default Router;