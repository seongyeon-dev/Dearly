import { useNavigate } from "react-router-dom";

import "./ProductForm.css";

function ProductForm() {
  const navigate = useNavigate();

  return (
    <section className="product-form">
      <div className="form-field">
        <label>
          상품명 <span>*</span>
        </label>

        <input type="text" placeholder="상품명을 입력하세요." />
      </div>

      <div className="form-field">
        <label>
          카테고리 <span>*</span>
        </label>

        <select defaultValue="BEAUTY">
          <option value="BEAUTY">뷰티</option>
          <option value="FASHION">패션</option>
          <option value="LIFESTYLE">라이프스타일</option>
          <option value="OTHER">기타</option>
        </select>
      </div>

      <div className="form-row">
        <div className="form-field">
          <label>
            예상 가격 <span>*</span>
          </label>

          <div className="price-input">
            <input type="number" placeholder="금액을 입력하세요." />

            <span>원</span>
          </div>
        </div>

        <div className="form-field">
          <label>
            상태 <span>*</span>
          </label>

          <select defaultValue="WANT">
            <option value="WANT">사고 싶어요</option>
            <option value="CONSIDERING">고민 중</option>
            <option value="BOUGHT">샀어요</option>
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-field">
          <label>구매 예정일</label>

          <div className="date-input">
            <input type="date" />
          </div>
        </div>

        <div className="form-field">
          <label>구매 링크 (선택)</label>

          <input type="url" placeholder="https://" />
        </div>
      </div>

      <div className="form-field">
        <label>메모 (선택)</label>

        <div className="memo-input">
          <textarea
            maxLength={300}
            placeholder="상품에 대한 메모를 입력하세요."
          />

          <span className="memo-count">0/300</span>
        </div>
      </div>

      <div className="form-buttons">
        <button
          type="button"
          className="cancel-button"
          onClick={() => navigate("/wishlist")}
        >
          취소
        </button>

        <button type="button" className="submit-button">
          상품 추가하기
        </button>
      </div>
    </section>
  );
}

export default ProductForm;
