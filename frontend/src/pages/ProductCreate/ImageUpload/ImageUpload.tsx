import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { ImagePlus, Plus, X } from "lucide-react";

import "./ImageUpload.css";

type ImageUploadProps = {
  images: File[];
  onImagesChange: (images: File[]) => void;
};

function ImageUpload({ images, onImagesChange }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  useEffect(() => {
    const urls = images.map((file) => URL.createObjectURL(file));

    setPreviewUrls(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [images]);

  const openFilePicker = () => {
    if (images.length >= 5) {
      alert("이미지는 최대 5장까지 등록할 수 있어요.");
      return;
    }

    fileInputRef.current?.click();
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);

    if (files.length === 0) {
      return;
    }

    const remainingCount = 5 - images.length;

    if (remainingCount <= 0) {
      alert("이미지는 최대 5장까지 등록할 수 있어요.");
      event.target.value = "";
      return;
    }

    const validFiles = files.filter((file) => file.type.startsWith("image/"));

    if (validFiles.length !== files.length) {
      alert("이미지 파일만 등록할 수 있어요.");
    }

    if (validFiles.length > remainingCount) {
      alert("이미지는 최대 5장까지 등록할 수 있어요.");
    }

    const selectedFiles = validFiles.slice(0, remainingCount);

    onImagesChange([...images, ...selectedFiles]);

    event.target.value = "";
  };

  const handleRemoveImage = (index: number) => {
    onImagesChange(images.filter((_, imageIndex) => imageIndex !== index));
  };

  return (
    <section className="product-image">
      <h2>상품 이미지</h2>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleImageChange}
        style={{ display: "none" }}
      />

      <div className="main-image-wrapper">
        <button
          type="button"
          className="image-upload"
          onClick={openFilePicker}
          aria-label={
            images.length > 0 ? "상품 이미지 추가" : "대표 상품 이미지 추가"
          }
        >
          {images.length > 0 && previewUrls[0] ? (
            <img
              src={previewUrls[0]}
              alt="대표 상품 이미지"
              className="uploaded-main-image"
            />
          ) : (
            <>
              <Plus size={38} strokeWidth={1.3} />
              <strong>이미지 추가</strong>
              <span>(최대 5장)</span>
            </>
          )}
        </button>

        {images.length > 0 && (
          <button
            type="button"
            className="main-image-delete"
            onClick={() => handleRemoveImage(0)}
            aria-label="대표 이미지 삭제"
          >
            <X size={16} strokeWidth={1.8} />
          </button>
        )}
      </div>

      <div className="image-preview-list">
        {Array.from({ length: 4 }, (_, index) => {
          const imageUrl = previewUrls[index + 1];

          return imageUrl ? (
            <div className="image-preview uploaded-preview" key={index}>
              <img
                src={imageUrl}
                alt={`상품 이미지 ${index + 2}`}
                className="uploaded-thumbnail"
              />

              <button
                type="button"
                className="thumbnail-delete"
                onClick={() => handleRemoveImage(index + 1)}
                aria-label={`상품 이미지 ${index + 2} 삭제`}
              >
                <X size={12} strokeWidth={1.8} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="image-preview"
              key={index}
              onClick={openFilePicker}
              aria-label={`상품 이미지 ${index + 2} 추가`}
            >
              <ImagePlus size={19} strokeWidth={1.4} />
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default ImageUpload;
