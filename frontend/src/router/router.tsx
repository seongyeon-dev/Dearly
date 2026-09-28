import { Routes, Route } from "react-router-dom";
import WishlistPage from "../pages/wishlist/WishlistPage";

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<WishlistPage />} />
      <Route path="/wishlist" element={<WishlistPage />} />
    </Routes>
  );
}

export default AppRouter;