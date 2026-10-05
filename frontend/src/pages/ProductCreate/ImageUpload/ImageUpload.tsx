import { ImagePlus, Plus } from "lucide-react";

import "./ImageUpload.css";

function ImageUpload() {
  return (
    <section className="product-image">
      <h2>상품 이미지</h2>

      <button type="button" className="image-upload">
        <Plus size={38} strokeWidth={1.3} />

        <strong>이미지 추가</strong>

        <span>(최대 5장)</span>
      </button>

      <div className="image-preview-list">
        {[1, 2, 3, 4].map((imageNumber) => (
          <button
            type="button"
            className="image-preview"
            key={imageNumber}
            aria-label={`상품 이미지 ${imageNumber} 추가`}
          >
            <ImagePlus size={19} strokeWidth={1.4} />
          </button>
        ))}
      </div>
    </section>
  );
}

export default ImageUpload;
