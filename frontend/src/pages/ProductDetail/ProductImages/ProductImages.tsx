import { useEffect, useState } from "react";

import "./ProductImages.css";

type ProductImagesProps = {
  productId: number;
};

function loadProductImages(productId: number): Promise<File[]> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("dearly-images", 1);

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains("products")) {
        database.createObjectStore("products");
      }
    };

    request.onerror = () => {
      reject(new Error("이미지를 불러올 수 없습니다."));
    };

    request.onsuccess = () => {
      const database = request.result;

      const transaction = database.transaction("products", "readonly");

      const store = transaction.objectStore("products");
      const getRequest = store.get(productId);

      getRequest.onsuccess = () => {
        const result: unknown = getRequest.result;

        if (Array.isArray(result)) {
          resolve(result.filter((file): file is File => file instanceof File));
        } else {
          resolve([]);
        }
      };

      getRequest.onerror = () => {
        reject(new Error("상품 이미지를 읽을 수 없습니다."));
      };

      transaction.oncomplete = () => {
        database.close();
      };

      transaction.onerror = () => {
        database.close();
        reject(new Error("이미지 조회에 실패했습니다."));
      };
    };
  });
}

function ProductImages({ productId }: ProductImagesProps) {
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let urls: string[] = [];

    const loadImages = async () => {
      try {
        const files = await loadProductImages(productId);

        if (cancelled) {
          return;
        }

        urls = files.map((file) => URL.createObjectURL(file));
        setImageUrls(urls);
        setSelectedIndex(0);
      } catch (error) {
        console.error("상품 이미지 조회 실패:", error);

        if (!cancelled) {
          setImageUrls([]);
        }
      }
    };

    void loadImages();

    return () => {
      cancelled = true;
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [productId]);

  const selectedImage = imageUrls[selectedIndex];

  return (
    <section className="detail-images">
      <div className="detail-main-image">
        {selectedImage ? (
          <img
            src={selectedImage}
            alt={`상품 이미지 ${selectedIndex + 1}`}
            className="detail-uploaded-image"
          />
        ) : (
          <span>상품 이미지</span>
        )}
      </div>

      <div className="detail-thumbnails">
        {imageUrls.length > 0
          ? imageUrls.map((imageUrl, index) => (
              <button
                type="button"
                className={`detail-thumbnail ${
                  selectedIndex === index ? "active" : ""
                }`}
                key={index}
                onClick={() => setSelectedIndex(index)}
                aria-label={`상품 이미지 ${index + 1} 보기`}
              >
                <img
                  src={imageUrl}
                  alt={`상품 썸네일 ${index + 1}`}
                  className="detail-thumbnail-image"
                />
              </button>
            ))
          : [1, 2, 3].map((number) => (
              <button
                type="button"
                className="detail-thumbnail"
                key={number}
                disabled
              >
                이미지
              </button>
            ))}
      </div>
    </section>
  );
}

export default ProductImages;
