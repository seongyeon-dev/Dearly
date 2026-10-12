import { Camera } from "lucide-react";
import { useEffect, useState, type ChangeEvent } from "react";

import "./ProfileImage.css";

const DB_NAME = "dearly-images";
const STORE_NAME = "profiles";
const PROFILE_IMAGE_KEY = "my-profile";

function openImageDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 2);

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains("products")) {
        database.createObjectStore("products");
      }

      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(new Error("이미지 저장소를 열 수 없습니다."));
    };
  });
}

async function getSavedProfileImage(): Promise<Blob | null> {
  const database = await openImageDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readonly");

    const request = transaction.objectStore(STORE_NAME).get(PROFILE_IMAGE_KEY);

    request.onsuccess = () => {
      const result: unknown = request.result;

      resolve(result instanceof Blob ? result : null);
    };

    request.onerror = () => {
      reject(new Error("프로필 이미지를 불러오지 못했습니다."));
    };

    transaction.oncomplete = () => {
      database.close();
    };

    transaction.onerror = () => {
      database.close();
    };
  });
}

async function saveProfileImage(file: File): Promise<void> {
  const database = await openImageDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");

    transaction.objectStore(STORE_NAME).put(file, PROFILE_IMAGE_KEY);

    transaction.oncomplete = () => {
      database.close();
      resolve();
    };

    transaction.onerror = () => {
      database.close();
      reject(new Error("프로필 이미지 저장에 실패했습니다."));
    };

    transaction.onabort = () => {
      database.close();
      reject(new Error("프로필 이미지 저장이 취소되었습니다."));
    };
  });
}

function ProfileImage() {
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let active = true;
    let imageUrl: string | null = null;

    const loadImage = async () => {
      try {
        const savedImage = await getSavedProfileImage();

        if (!active || !savedImage) {
          return;
        }

        imageUrl = URL.createObjectURL(savedImage);
        setProfileImage(imageUrl);
      } catch (error) {
        console.error("프로필 이미지 불러오기 실패:", error);
      }
    };

    void loadImage();

    return () => {
      active = false;

      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, []);

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file || isSaving) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 업로드할 수 있습니다.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("5MB 이하의 이미지를 선택해 주세요.");
      event.target.value = "";
      return;
    }

    setIsSaving(true);

    try {
      await saveProfileImage(file);

      const imageUrl = URL.createObjectURL(file);

      setProfileImage((previousImage) => {
        if (previousImage) {
          URL.revokeObjectURL(previousImage);
        }

        return imageUrl;
      });

      window.dispatchEvent(new Event("dearly-profile-image-updated"));
    } catch (error) {
      console.error("프로필 이미지 저장 실패:", error);
      alert("프로필 이미지 저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
      event.target.value = "";
    }
  };

  return (
    <div className="profile-edit-image-section">
      <div className="profile-edit-image-wrapper">
        {profileImage ? (
          <img
            src={profileImage}
            alt="프로필 이미지"
            className="profile-edit-image"
          />
        ) : (
          <div className="profile-edit-image-placeholder">🎀</div>
        )}

        <label htmlFor="profile-image" className="profile-edit-image-button">
          <Camera size={18} />

          <input
            id="profile-image"
            type="file"
            accept="image/*"
            className="profile-edit-image-input"
            onChange={handleImageChange}
            disabled={isSaving}
          />
        </label>
      </div>
    </div>
  );
}

export default ProfileImage;
