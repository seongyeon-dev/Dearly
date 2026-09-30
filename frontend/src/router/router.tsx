import { Routes, Route } from "react-router-dom";
import WishlistPage from "../pages/wishlist/WishlistPage";
import WishDetailPage from "../pages/wish-detail/WishDetailPage";

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<WishlistPage />} />
      <Route path="/wishlist" element={<WishlistPage />} />
      <Route path="/wishlist/:id" element={<WishDetailPage />} />
    </Routes>
  );
}

export default AppRouter;