import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

import ImageUpload from "./ImageUpload/ImageUpload";
import ProductForm from "./ProductForm/ProductForm";
import "./ProductCreate.css";

function ProductCreate() {
  const navigate = useNavigate();

  return (
    <main className="product-create">
      <div className="product-container">
        <button
          type="button"
          className="back-button"
          onClick={() => navigate("/wishlist")}
        >
          <ArrowLeft size={18} strokeWidth={1.7} />
          <span>위시리스트로 돌아가기</span>
        </button>

        <section className="product-header">
          <h1>상품 추가하기</h1>
          <p>사고 싶은 상품을 기록해보세요.</p>
        </section>

        <div className="product-content">
          <ImageUpload />
          <ProductForm />
        </div>
      </div>
    </main>
  );
}

export default ProductCreate;
