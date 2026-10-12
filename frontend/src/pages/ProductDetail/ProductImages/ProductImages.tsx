import { useEffect, useRef, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

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
    };
  });
}

function saveProductImages(productId: number, images: File[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("dearly-images", 1);

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains("products")) {
        database.createObjectStore("products");
      }
    };

    request.onerror = () => {
      reject(new Error("이미지 저장소를 열 수 없습니다."));
    };

    request.onsuccess = () => {
      const database = request.result;
      const transaction = database.transaction("products", "readwrite");
      const store = transaction.objectStore("products");

      if (images.length > 0) {
        store.put(images, productId);
      } else {
        store.delete(productId);
      }

      transaction.oncomplete = () => {
        database.close();
        resolve();
      };

      transaction.onerror = () => {
        database.close();
        reject(new Error("이미지 저장에 실패했습니다."));
      };
    };
  });
}

function ProductImages({ productId }: ProductImagesProps) {
  const [savedImages, setSavedImages] = useState<File[]>([]);
  const [editingImages, setEditingImages] = useState<File[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentImages = isEditing ? editingImages : savedImages;

  useEffect(() => {
    let cancelled = false;

    const loadImages = async () => {
      try {
        const files = await loadProductImages(productId);

        if (cancelled) {
          return;
        }

        setSavedImages(files);
        setEditingImages(files);
        setSelectedIndex(0);
        setIsEditing(false);
      } catch (error) {
        console.error("상품 이미지 조회 실패:", error);

        if (!cancelled) {
          setSavedImages([]);
          setEditingImages([]);
        }
      }
    };

    void loadImages();

    return () => {
      cancelled = true;
    };
  }, [productId]);

  useEffect(() => {
    const urls = currentImages.map((file) => URL.createObjectURL(file));

    setImageUrls(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [currentImages]);

  const handleStartEdit = () => {
    setEditingImages([...savedImages]);
    setSelectedIndex(0);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditingImages([...savedImages]);
    setSelectedIndex(0);
    setIsEditing(false);
  };

  const handleAddImages = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);

    if (files.length === 0) {
      return;
    }

    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length !== files.length) {
      alert("이미지 파일만 업로드할 수 있습니다.");
    }

    const remaining = 5 - editingImages.length;

    if (imageFiles.length > remaining) {
      alert("상품 이미지는 최대 5장까지 등록할 수 있습니다.");
    }

    if (remaining > 0) {
      setEditingImages((previous) => [
        ...previous,
        ...imageFiles.slice(0, remaining),
      ]);
    }

    event.target.value = "";
  };

  const handleRemoveImage = (index: number) => {
    const updatedImages = editingImages.filter(
      (_, imageIndex) => imageIndex !== index,
    );

    setEditingImages(updatedImages);
    setSelectedIndex(0);
  };

  const handleSaveImages = async () => {
    if (isSaving) {
      return;
    }

    setIsSaving(true);

    try {
      await saveProductImages(productId, editingImages);

      setSavedImages([...editingImages]);
      setSelectedIndex(0);
      setIsEditing(false);

      alert("상품 이미지가 수정되었습니다.");
    } catch (error) {
      console.error("상품 이미지 저장 실패:", error);
      alert("이미지 저장에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setIsSaving(false);
    }
  };

  const selectedImage = imageUrls[selectedIndex];

  return (
    <section className="detail-images">
      <div className="detail-image-header">
        <span>상품 이미지</span>

        {isEditing ? (
          <div className="detail-image-actions">
            <button
              type="button"
              className="detail-image-cancel"
              onClick={handleCancelEdit}
              disabled={isSaving}
            >
              취소
            </button>

            <button
              type="button"
              className="detail-image-save"
              onClick={handleSaveImages}
              disabled={isSaving}
            >
              {isSaving ? "저장 중..." : "저장"}
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="detail-image-edit"
            onClick={handleStartEdit}
          >
            이미지 수정
          </button>
        )}
      </div>

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
        {imageUrls.map((imageUrl, index) => (
          <div className="detail-thumbnail-wrapper" key={index}>
            <button
              type="button"
              className={`detail-thumbnail ${
                selectedIndex === index ? "active" : ""
              }`}
              onClick={() => setSelectedIndex(index)}
              aria-label={`상품 이미지 ${index + 1} 보기`}
            >
              <img
                src={imageUrl}
                alt={`상품 썸네일 ${index + 1}`}
                className="detail-thumbnail-image"
              />
            </button>

            {isEditing && (
              <button
                type="button"
                className="detail-thumbnail-remove"
                onClick={() => handleRemoveImage(index)}
                aria-label={`상품 이미지 ${index + 1} 삭제`}
                disabled={isSaving}
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
        ))}

        {isEditing && editingImages.length < 5 && (
          <button
            type="button"
            className="detail-thumbnail detail-thumbnail-add"
            onClick={() => fileInputRef.current?.click()}
            disabled={isSaving}
          >
            <Plus size={20} />
            <span>추가</span>
          </button>
        )}

        {!isEditing &&
          imageUrls.length === 0 &&
          [1, 2, 3].map((number) => (
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

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={handleAddImages}
      />
    </section>
  );
}

export default ProductImages;
