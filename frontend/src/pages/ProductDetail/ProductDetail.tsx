import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

import ProductImages from "./ProductImages/ProductImages";
import ProductInfo from "./ProductInfo/ProductInfo";
import "./ProductDetail.css";

function ProductDetail() {
  const navigate = useNavigate();

  return (
    <main className="product-detail">
      <div className="detail-container">
        <div className="detail-top">
          <button
            type="button"
            className="detail-back"
            onClick={() => navigate("/wishlist")}
          >
            <ArrowLeft size={18} strokeWidth={1.7} />
            <span>위시리스트로 돌아가기</span>
          </button>

          <div className="detail-actions">
            <button type="button" className="edit-button">
              수정
            </button>

            <button type="button" className="delete-button">
              삭제
            </button>
          </div>
        </div>

        <div className="detail-content">
          <ProductImages />
          <ProductInfo />
        </div>
      </div>
    </main>
  );
}

export default ProductDetail;
