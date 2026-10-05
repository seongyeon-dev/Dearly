import "./ProductImages.css";

function ProductImages() {
  return (
    <section className="detail-images">
      <div className="detail-main-image">
        <span>상품 이미지</span>
      </div>

      <div className="detail-thumbnails">
        <button type="button" className="detail-thumbnail">
          이미지
        </button>

        <button type="button" className="detail-thumbnail">
          이미지
        </button>

        <button type="button" className="detail-thumbnail">
          이미지
        </button>
      </div>
    </section>
  );
}

export default ProductImages;
