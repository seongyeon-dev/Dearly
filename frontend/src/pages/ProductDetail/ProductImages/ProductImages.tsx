import {
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ChangeEvent,
  type Ref,
} from "react";
import { Plus, X } from "lucide-react";

import {
  fetchWishImages,
  uploadWishImage,
  deleteWishImage,
  getWishImageUrl,
  type WishImageResponse,
} from "../../../api/wishImageApi";

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

type ProductImage = {
  key: string;
  imageId: number | null;
  url: string;
  file: File | null;
};

const MAX_IMAGES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const toProductImages = (images: WishImageResponse[]): ProductImage[] => {
  return images.map((image) => ({
    key: `saved-${image.image_id}`,
    imageId: image.image_id,
    url: getWishImageUrl(image.image_url),
    file: null,
  }));
};

function ProductImages({ productId, isEditing, ref }: ProductImagesProps) {
  const [savedImages, setSavedImages] = useState<ProductImage[]>([]);
  const [editingImages, setEditingImages] = useState<ProductImage[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const savedImagesRef = useRef<ProductImage[]>([]);
  const editingImagesRef = useRef<ProductImage[]>([]);
  const wasEditingRef = useRef(isEditing);
  const loadedProductIdRef = useRef<number | null>(null);
  const savingRef = useRef(false);
  const temporaryUrlsRef = useRef<Set<string>>(new Set());

  const currentImages = isEditing ? editingImages : savedImages;

  const setSavedImageList = (images: ProductImage[]) => {
    savedImagesRef.current = images;
    setSavedImages(images);
  };

  const setEditingImageList = (images: ProductImage[]) => {
    editingImagesRef.current = images;
    setEditingImages(images);
  };

  const releaseTemporaryUrl = (image: ProductImage) => {
    if (image.file && temporaryUrlsRef.current.has(image.url)) {
      URL.revokeObjectURL(image.url);
      temporaryUrlsRef.current.delete(image.url);
    }
  };

  const releaseTemporaryImages = (images: ProductImage[]) => {
    images.forEach(releaseTemporaryUrl);
  };

  useEffect(() => {
    let cancelled = false;

    const loadImages = async () => {
      loadedProductIdRef.current = null;
      setIsLoading(true);
      setSavedImageList([]);
      setEditingImageList([]);
      setSelectedIndex(0);

      try {
        const images = await fetchWishImages(productId);

        if (cancelled) return;

        const loadedImages = toProductImages(images);

        setSavedImageList(loadedImages);
        setEditingImageList([...loadedImages]);
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
      releaseTemporaryImages(editingImagesRef.current);

      setEditingImageList([...savedImagesRef.current]);
      setSelectedIndex(0);
    }

    if (!isEditing && wasEditingRef.current) {
      releaseTemporaryImages(editingImagesRef.current);

      setEditingImageList([...savedImagesRef.current]);
      setSelectedIndex(0);
    }

    wasEditingRef.current = isEditing;
  }, [isEditing]);

  useEffect(() => {
    if (selectedIndex >= currentImages.length) {
      setSelectedIndex(0);
    }
  }, [currentImages.length, selectedIndex]);

  useEffect(() => {
    return () => {
      temporaryUrlsRef.current.forEach((url) => {
        URL.revokeObjectURL(url);
      });

      temporaryUrlsRef.current.clear();
    };
  }, []);

  const handleAddImages = (event: ChangeEvent<HTMLInputElement>) => {
    if (!isEditing || isLoading || isSaving) {
      event.target.value = "";
      return;
    }

    const files = Array.from(event.target.files ?? []);

    if (files.length === 0) return;

    const validFiles = files.filter(
      (file) => ALLOWED_TYPES.includes(file.type) && file.size <= MAX_FILE_SIZE,
    );

    if (validFiles.length !== files.length) {
      alert(
        "JPG, PNG, WEBP, GIF 이미지만 등록할 수 있으며 파일당 최대 5MB입니다.",
      );
    }

    const remaining = MAX_IMAGES - editingImagesRef.current.length;

    if (validFiles.length > remaining) {
      alert("상품 이미지는 최대 5장까지 등록할 수 있습니다.");
    }

    if (remaining > 0) {
      const newImages = validFiles
        .slice(0, remaining)
        .map((file): ProductImage => {
          const url = URL.createObjectURL(file);

          temporaryUrlsRef.current.add(url);

          return {
            key: crypto.randomUUID(),
            imageId: null,
            url,
            file,
          };
        });

      setEditingImageList([...editingImagesRef.current, ...newImages]);
    }

    event.target.value = "";
  };

  const handleRemoveImage = (index: number) => {
    if (!isEditing || isLoading || isSaving) {
      return;
    }

    const targetImage = editingImagesRef.current[index];

    if (!targetImage) return;

    releaseTemporaryUrl(targetImage);

    const updatedImages = editingImagesRef.current.filter(
      (_, imageIndex) => imageIndex !== index,
    );

    setEditingImageList(updatedImages);
    setSelectedIndex(0);
  };

  const handleSaveImages = async () => {
    if (isLoading || loadedProductIdRef.current !== productId) {
      throw new Error("상품 이미지 로딩이 완료되지 않았습니다.");
    }

    if (savingRef.current) {
      throw new Error("상품 이미지를 저장하는 중입니다.");
    }

    savingRef.current = true;
    setIsSaving(true);

    const imagesToSave = [...editingImagesRef.current];

    try {
      const existingImages = await fetchWishImages(productId);

      const retainedIds = new Set(
        imagesToSave
          .map((image) => image.imageId)
          .filter((id): id is number => id !== null),
      );

      const imagesToDelete = existingImages.filter(
        (image) => !retainedIds.has(image.image_id),
      );

      for (const image of imagesToDelete) {
        await deleteWishImage(productId, image.image_id);
      }

      const remainingImages = await fetchWishImages(productId);

      const usedOrders = new Set(
        remainingImages.map((image) => image.sort_order),
      );

      const newImages = imagesToSave.filter((image) => image.file !== null);

      for (const image of newImages) {
        if (!image.file) continue;

        const availableOrder = Array.from(
          { length: MAX_IMAGES },
          (_, index) => index + 1,
        ).find((order) => !usedOrders.has(order));

        if (availableOrder === undefined) {
          throw new Error("상품 이미지는 최대 5장까지 등록할 수 있습니다.");
        }

        await uploadWishImage(productId, image.file, availableOrder);

        usedOrders.add(availableOrder);
      }

      const updatedImages = await fetchWishImages(productId);

      releaseTemporaryImages(imagesToSave);

      const saved = toProductImages(updatedImages);

      setSavedImageList(saved);
      setEditingImageList([...saved]);
      setSelectedIndex(0);
    } catch (error) {
      try {
        const latestImages = await fetchWishImages(productId);

        const saved = toProductImages(latestImages);

        setSavedImageList(saved);
      } catch (refreshError) {
        console.error("상품 이미지 재조회 실패:", refreshError);
      }

      console.error("상품 이미지 저장 실패:", error);

      throw error;
    } finally {
      savingRef.current = false;
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (savingRef.current) return;

    releaseTemporaryImages(editingImagesRef.current);

    setEditingImageList([...savedImagesRef.current]);
    setSelectedIndex(0);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  useImperativeHandle(ref, () => ({
    save: handleSaveImages,
    cancel: handleCancelEdit,
  }));

  const selectedImage = currentImages[selectedIndex];

  return (
    <section className="detail-images">
      <div className="detail-main-image">
        {selectedImage && (
          <img
            src={selectedImage.url}
            alt={`상품 이미지 ${selectedIndex + 1}`}
            className="detail-uploaded-image"
          />
        )}

        {isEditing && selectedImage && !isLoading && !isSaving && (
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
        {currentImages.map((image, index) => (
          <div className="detail-thumbnail-wrapper" key={image.key}>
            <button
              type="button"
              className={`detail-thumbnail ${
                selectedIndex === index ? "active" : ""
              }`}
              onClick={() => setSelectedIndex(index)}
              aria-label={`상품 이미지 ${index + 1} 보기`}
            >
              <img
                src={image.url}
                alt={`상품 썸네일 ${index + 1}`}
                className="detail-thumbnail-image"
              />
            </button>

            {isEditing && !isLoading && !isSaving && (
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

        {isEditing &&
          !isLoading &&
          !isSaving &&
          editingImages.length < MAX_IMAGES && (
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
          currentImages.length === 0 &&
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
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        hidden
        onChange={handleAddImages}
      />
    </section>
  );
}

export default ProductImages;
