import { useEffect, useState } from "react";
import axios from "axios";

import {
  ChartNoAxesColumnIncreasing,
  Heart,
  Home,
  ReceiptText,
  UserRound,
} from "lucide-react";

import { NavLink, useLocation } from "react-router-dom";

import "./Sidebar.css";

type ProfileData = {
  nickname: string;
  introduction: string;
};

type CurrentUser = {
  user_id: number;
  email: string;
  nickname: string;
};

const PROFILE_STORAGE_KEY = "dearly-profile";

const API_BASE_URL = import.meta.env.PROD
  ? ""
  : (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(
      /\/$/,
      "",
    );

const categories = [
  { name: "전체", value: null },
  { name: "뷰티", value: "BEAUTY" },
  { name: "패션", value: "FASHION" },
  { name: "라이프스타일", value: "LIFESTYLE" },
  { name: "기타", value: "OTHER" },
];

function getSavedProfile(userId: number): ProfileData {
  const defaultProfile: ProfileData = {
    nickname: "Dearly, Me",
    introduction: "나의 위시리스트",
  };

  try {
    const saved = localStorage.getItem(`${PROFILE_STORAGE_KEY}-${userId}`);

    if (!saved) {
      return defaultProfile;
    }

    const parsed: unknown = JSON.parse(saved);

    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !("nickname" in parsed) ||
      !("introduction" in parsed) ||
      typeof parsed.nickname !== "string" ||
      typeof parsed.introduction !== "string"
    ) {
      return defaultProfile;
    }

    return {
      nickname: parsed.nickname,
      introduction: parsed.introduction,
    };
  } catch {
    return defaultProfile;
  }
}

function getSavedProfileImage(userId: number): Promise<Blob | null> {
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

    request.onerror = () => {
      reject(new Error("이미지 저장소를 열 수 없습니다."));
    };

    request.onsuccess = () => {
      const database = request.result;

      const transaction = database.transaction("profiles", "readonly");

      const imageRequest = transaction
        .objectStore("profiles")
        .get(`my-profile-${userId}`);

      imageRequest.onsuccess = () => {
        const result: unknown = imageRequest.result;

        resolve(result instanceof Blob ? result : null);
      };

      imageRequest.onerror = () => {
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
    };
  });
}

function Sidebar() {
  const location = useLocation();

  const [user, setUser] = useState<CurrentUser | null>(null);

  const [profile, setProfile] = useState<ProfileData>({
    nickname: "Dearly, Me",
    introduction: "나의 위시리스트",
  });

  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const fetchCurrentUser = async () => {
      try {
        const response = await axios.get<{
          user: CurrentUser;
        }>(`${API_BASE_URL}/api/auth/me`, {
          withCredentials: true,
        });

        if (active) {
          setUser(response.data.user);
        }
      } catch (error) {
        if (active) {
          setUser(null);
        }

        console.error("사용자 정보 조회 실패:", error);
      }
    };

    void fetchCurrentUser();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!user) {
      setProfile({
        nickname: "Dearly, Me",
        introduction: "나의 위시리스트",
      });

      return;
    }

    const updateProfile = () => {
      setProfile(getSavedProfile(user.user_id));
    };

    updateProfile();

    window.addEventListener("dearly-profile-updated", updateProfile);

    window.addEventListener("storage", updateProfile);

    return () => {
      window.removeEventListener("dearly-profile-updated", updateProfile);

      window.removeEventListener("storage", updateProfile);
    };
  }, [user]);

  useEffect(() => {
    if (!user) {
      setProfileImage(null);
      return;
    }

    let active = true;
    let currentImageUrl: string | null = null;

    const updateProfileImage = async () => {
      try {
        const savedImage = await getSavedProfileImage(user.user_id);

        if (!active) {
          return;
        }

        const nextImageUrl = savedImage
          ? URL.createObjectURL(savedImage)
          : null;

        if (currentImageUrl) {
          URL.revokeObjectURL(currentImageUrl);
        }

        currentImageUrl = nextImageUrl;
        setProfileImage(nextImageUrl);
      } catch (error) {
        console.error("사이드바 프로필 이미지 오류:", error);
      }
    };

    void updateProfileImage();

    window.addEventListener("dearly-profile-image-updated", updateProfileImage);

    return () => {
      active = false;

      window.removeEventListener(
        "dearly-profile-image-updated",
        updateProfileImage,
      );

      if (currentImageUrl) {
        URL.revokeObjectURL(currentImageUrl);
      }
    };
  }, [user]);

  const searchParams = new URLSearchParams(location.search);

  const selectedCategory = searchParams.get("category");

  return (
    <aside className="sidebar">
      <div className="sidebar-profile">
        <div className="sidebar-profile-image">
          {profileImage ? (
            <img
              src={profileImage}
              alt="프로필 이미지"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "50%",
              }}
            />
          ) : (
            <span className="sidebar-profile-ribbon">🎀</span>
          )}
        </div>

        <strong className="sidebar-profile-name">
          {user ? user.nickname : profile.nickname}
        </strong>

        <span className="sidebar-profile-description">
          {profile.introduction}
        </span>
      </div>

      <nav className="sidebar-menu">
        <NavLink to="/" className="sidebar-link" end>
          <Home className="menu-icon" size={16} />
          <span>홈</span>
        </NavLink>

        <NavLink to="/wishlist" className="sidebar-link">
          <Heart className="menu-icon" size={16} />
          <span>위시리스트</span>
        </NavLink>

        <NavLink to="/purchases" className="sidebar-link">
          <ReceiptText className="menu-icon" size={16} />
          <span>소비 기록</span>
        </NavLink>

        <NavLink to="/statistics" className="sidebar-link">
          <ChartNoAxesColumnIncreasing className="menu-icon" size={16} />
          <span>소비 통계</span>
        </NavLink>

        <NavLink to="/profile" className="sidebar-link">
          <UserRound className="menu-icon" size={16} />
          <span>프로필 수정</span>
        </NavLink>
      </nav>

      <div className="sidebar-divider" />

      <div className="sidebar-category">
        <h3>카테고리</h3>

        {categories.map((category) => {
          const path = category.value
            ? `/wishlist?category=${category.value}`
            : "/wishlist";

          const isActive =
            location.pathname === "/wishlist" &&
            selectedCategory === category.value;

          return (
            <NavLink
              key={category.name}
              to={path}
              className={() =>
                `sidebar-category-link ${isActive ? "active" : ""}`
              }
            >
              {category.name}
            </NavLink>
          );
        })}
      </div>
    </aside>
  );
}

export default Sidebar;
