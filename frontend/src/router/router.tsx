import { Routes, Route } from "react-router-dom";
import WishlistPage from "../pages/wishlist/WishlistPage";
import WishDetailPage from "../pages/wish-detail/WishDetailPage";
import ReviewCreatePage from "../pages/review-create/ReviewCreatePage";
import ReviewsPage from "../pages/reviews/ReviewsPage";

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<WishlistPage />} />

      <Route path="/wishlist" element={<WishlistPage />} />

      <Route path="/wishlist/:id" element={<WishDetailPage />} />

      <Route path="/wishlist/:id/review" element={<ReviewCreatePage />} />

      <Route path="/reviews" element={<ReviewsPage />} />
    </Routes>
  );
}

export default AppRouter;
