import { Camera } from "lucide-react";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import axios from "axios";

import "./ProfileImage.css";

const DB_NAME = "dearly-images";
const STORE_NAME = "profiles";

const API_BASE_URL = import.meta.env.PROD
  ? ""
  : (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(
      /\/$/,
      "",
    );

interface CurrentUser {
  user_id: number;
  email: string;
  nickname: string;
}

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

async function getSavedProfileImage(userId: number): Promise<Blob | null> {
  const database = await openImageDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readonly");

    const request = transaction
      .objectStore(STORE_NAME)
      .get(`my-profile-${userId}`);

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

    transaction.onabort = () => {
      database.close();
    };
  });
}

async function saveProfileImage(userId: number, file: File): Promise<void> {
  const database = await openImageDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");

    transaction.objectStore(STORE_NAME).put(file, `my-profile-${userId}`);

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
  const [userId, setUserId] = useState<number | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const imageUrlRef = useRef<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadUserAndImage = async () => {
      try {
        const response = await axios.get<{
          user: CurrentUser;
        }>(`${API_BASE_URL}/api/auth/me`, {
          withCredentials: true,
        });

        if (!active) {
          return;
        }

        const currentUserId = response.data.user.user_id;

        setUserId(currentUserId);

        const savedImage = await getSavedProfileImage(currentUserId);

        if (!active) {
          return;
        }

        if (savedImage) {
          const imageUrl = URL.createObjectURL(savedImage);

          imageUrlRef.current = imageUrl;
          setProfileImage(imageUrl);
        }
      } catch (error) {
        console.error("프로필 이미지 불러오기 실패:", error);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void loadUserAndImage();

    return () => {
      active = false;

      if (imageUrlRef.current) {
        URL.revokeObjectURL(imageUrlRef.current);
        imageUrlRef.current = null;
      }
    };
  }, []);

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file || isSaving || userId === null) {
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
      await saveProfileImage(userId, file);

      const imageUrl = URL.createObjectURL(file);

      if (imageUrlRef.current) {
        URL.revokeObjectURL(imageUrlRef.current);
      }

      imageUrlRef.current = imageUrl;
      setProfileImage(imageUrl);

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
            disabled={isSaving || isLoading || userId === null}
          />
        </label>
      </div>
    </div>
  );
}

export default ProfileImage;
