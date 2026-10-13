import {
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ChangeEvent,
  type Ref,
} from "react";
import { Plus, X } from "lucide-react";

import "./ProductImages.css";

export type ProductImagesHandle = {
  save: () => Promise<void>;
  cancel: () => void;
};

type ProductImagesProps = {
  productId: number;
  isEditing: boolean;
  ref?: Ref<ProductImagesHandle>;
};

function openImageDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("dearly-images", 2);

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains("products")) {
        database.createObjectStore("products");
      }

      if (!database.objectStoreNames.contains("profiles")) {
        database.createObjectStore("profiles");
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(
        request.error ?? new Error("이미지 데이터베이스를 열 수 없습니다."),
      );
    };

    request.onblocked = () => {
      console.error("이미지 데이터베이스 업그레이드가 차단되었습니다.");
    };
  });
}

async function loadProductImages(productId: number): Promise<Blob[]> {
  const database = await openImageDatabase();

  return new Promise((resolve, reject) => {
    let transaction: IDBTransaction;

    try {
      transaction = database.transaction("products", "readonly");
    } catch (error) {
      database.close();
      reject(error);
      return;
    }

    const store = transaction.objectStore("products");
    const request = store.get(productId);

    let images: Blob[] = [];

    request.onsuccess = () => {
      const result: unknown = request.result;

      if (Array.isArray(result)) {
        images = result.filter((file): file is Blob => file instanceof Blob);
      }
    };

    transaction.oncomplete = () => {
      database.close();
      resolve(images);
    };

    transaction.onerror = () => {
      database.close();
      reject(
        transaction.error ?? new Error("상품 이미지 조회에 실패했습니다."),
      );
    };

    transaction.onabort = () => {
      database.close();
      reject(new Error("상품 이미지 조회가 취소되었습니다."));
    };
  });
}

async function saveProductImages(
  productId: number,
  images: Blob[],
): Promise<void> {
  const database = await openImageDatabase();

  return new Promise((resolve, reject) => {
    let transaction: IDBTransaction;

    try {
      transaction = database.transaction("products", "readwrite");

      const store = transaction.objectStore("products");

      if (images.length > 0) {
        store.put(images, productId);
      } else {
        store.delete(productId);
      }
    } catch (error) {
      database.close();
      reject(error);
      return;
    }

    transaction.oncomplete = () => {
      database.close();
      resolve();
    };

    transaction.onerror = () => {
      database.close();
      reject(
        transaction.error ?? new Error("상품 이미지 저장에 실패했습니다."),
      );
    };

    transaction.onabort = () => {
      database.close();
      reject(new Error("상품 이미지 저장이 취소되었습니다."));
    };
  });
}

function ProductImages({ productId, isEditing, ref }: ProductImagesProps) {
  const [savedImages, setSavedImages] = useState<Blob[]>([]);
  const [editingImages, setEditingImages] = useState<Blob[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const editingImagesRef = useRef<Blob[]>([]);
  const savedImagesRef = useRef<Blob[]>([]);
  const wasEditingRef = useRef(isEditing);
  const loadedProductIdRef = useRef<number | null>(null);

  const currentImages = isEditing ? editingImages : savedImages;

  useEffect(() => {
    editingImagesRef.current = editingImages;
  }, [editingImages]);

  useEffect(() => {
    savedImagesRef.current = savedImages;
  }, [savedImages]);

  useEffect(() => {
    let cancelled = false;

    const loadImages = async () => {
      loadedProductIdRef.current = null;
      setIsLoading(true);
      setSavedImages([]);
      setEditingImages([]);
      savedImagesRef.current = [];
      editingImagesRef.current = [];
      setSelectedIndex(0);

      try {
        const files = await loadProductImages(productId);

        if (cancelled) return;

        const loadedImages = [...files];

        savedImagesRef.current = loadedImages;
        editingImagesRef.current = [...loadedImages];

        setSavedImages(loadedImages);
        setEditingImages([...loadedImages]);
        setSelectedIndex(0);

        loadedProductIdRef.current = productId;
      } catch (error) {
        if (cancelled) return;

        console.error("상품 이미지 조회 실패:", error);
        loadedProductIdRef.current = null;
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadImages();

    return () => {
      cancelled = true;
    };
  }, [productId]);

  useEffect(() => {
    if (isEditing && !wasEditingRef.current) {
      const initialImages = [...savedImagesRef.current];

      editingImagesRef.current = initialImages;
      setEditingImages(initialImages);
      setSelectedIndex(0);
    }

    if (!isEditing && wasEditingRef.current) {
      const originalImages = [...savedImagesRef.current];

      editingImagesRef.current = originalImages;
      setEditingImages(originalImages);
      setSelectedIndex(0);
    }

    wasEditingRef.current = isEditing;
  }, [isEditing]);

  useEffect(() => {
    const urls = currentImages.map((file) => URL.createObjectURL(file));

    setImageUrls(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [currentImages]);

  useEffect(() => {
    if (selectedIndex >= currentImages.length) {
      setSelectedIndex(0);
    }
  }, [currentImages.length, selectedIndex]);

  const handleAddImages = (event: ChangeEvent<HTMLInputElement>) => {
    if (!isEditing || isLoading) {
      event.target.value = "";
      return;
    }

    const files = Array.from(event.target.files ?? []);

    if (files.length === 0) return;

    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length !== files.length) {
      alert("이미지 파일만 업로드할 수 있습니다.");
    }

    const remaining = 5 - editingImagesRef.current.length;

    if (imageFiles.length > remaining) {
      alert("상품 이미지는 최대 5장까지 등록할 수 있습니다.");
    }

    if (remaining > 0) {
      const updatedImages = [
        ...editingImagesRef.current,
        ...imageFiles.slice(0, remaining),
      ];

      editingImagesRef.current = updatedImages;
      setEditingImages(updatedImages);
    }

    event.target.value = "";
  };

  const handleRemoveImage = (index: number) => {
    if (!isEditing || isLoading) return;

    const updatedImages = editingImagesRef.current.filter(
      (_, imageIndex) => imageIndex !== index,
    );

    editingImagesRef.current = updatedImages;
    setEditingImages(updatedImages);
    setSelectedIndex(0);
  };

  const handleSaveImages = async () => {
    if (isLoading || loadedProductIdRef.current !== productId) {
      throw new Error("상품 이미지 로딩이 완료되지 않았습니다.");
    }

    const imagesToSave = [...editingImagesRef.current];

    await saveProductImages(productId, imagesToSave);

    savedImagesRef.current = imagesToSave;
    editingImagesRef.current = [...imagesToSave];

    setSavedImages(imagesToSave);
    setEditingImages([...imagesToSave]);
    setSelectedIndex(0);
  };

  const handleCancelEdit = () => {
    const originalImages = [...savedImagesRef.current];

    editingImagesRef.current = originalImages;
    setEditingImages(originalImages);
    setSelectedIndex(0);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  useImperativeHandle(ref, () => ({
    save: handleSaveImages,
    cancel: handleCancelEdit,
  }));

  const selectedImage = imageUrls[selectedIndex];

  return (
    <section className="detail-images">
      <div className="detail-main-image">
        {selectedImage && (
          <img
            src={selectedImage}
            alt={`상품 이미지 ${selectedIndex + 1}`}
            className="detail-uploaded-image"
          />
        )}

        {isEditing && selectedImage && !isLoading && (
          <button
            type="button"
            className="detail-main-image-remove"
            onClick={() => handleRemoveImage(selectedIndex)}
            aria-label="현재 상품 이미지 삭제"
          >
            <X size={17} />
          </button>
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

            {isEditing && !isLoading && (
              <button
                type="button"
                className="detail-thumbnail-remove"
                onClick={() => handleRemoveImage(index)}
                aria-label={`상품 이미지 ${index + 1} 삭제`}
              >
                <X size={13} />
              </button>
            )}
          </div>
        ))}

        {isEditing && !isLoading && editingImages.length < 5 && (
          <button
            type="button"
            className="detail-thumbnail detail-thumbnail-add"
            onClick={() => fileInputRef.current?.click()}
            aria-label="상품 이미지 추가"
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
