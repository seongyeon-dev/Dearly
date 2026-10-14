import { useEffect, useState, type SyntheticEvent } from "react";
import axios from "axios";

import ProfileImage from "./ProfileImage/ProfileImage";

import "./Profile.css";

type ProfileData = {
  nickname: string;
  introduction: string;
};

type CurrentUser = {
  user_id: number;
  email: string;
  nickname: string;
};

const API_BASE_URL = import.meta.env.PROD
  ? ""
  : (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(
      /\/$/,
      "",
    );

const API_URL = `${API_BASE_URL}/api/auth`;

const defaultProfile: ProfileData = {
  nickname: "",
  introduction: "나의 취향을 기록하는 공간",
};

function getSavedProfile(userId: number): ProfileData {
  try {
    const saved = localStorage.getItem(`dearly-profile-${userId}`);

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

function Profile() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [nickname, setNickname] = useState("");
  const [introduction, setIntroduction] = useState(defaultProfile.introduction);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    const fetchProfile = async () => {
      try {
        const response = await axios.get<{ user: CurrentUser }>(
          `${API_URL}/me`,
          {
            withCredentials: true,
          },
        );

        if (!active) {
          return;
        }

        const currentUser = response.data.user;
        const savedProfile = getSavedProfile(currentUser.user_id);

        setUser(currentUser);
        setNickname(currentUser.nickname);
        setIntroduction(savedProfile.introduction);
      } catch (error) {
        console.error("프로필 조회 실패:", error);

        if (active) {
          setUser(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void fetchProfile();

    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user || saving) {
      return;
    }

    const trimmedNickname = nickname.trim();
    const trimmedIntroduction = introduction.trim();

    if (trimmedNickname.length < 2 || trimmedNickname.length > 10) {
      alert("닉네임은 2자 이상 10자 이하로 입력해주세요.");
      return;
    }

    setSaving(true);

    try {
      const response = await axios.patch<{ user: CurrentUser }>(
        `${API_URL}/me`,
        {
          nickname: trimmedNickname,
        },
        {
          withCredentials: true,
        },
      );

      const updatedUser = response.data.user;

      const updatedProfile: ProfileData = {
        nickname: updatedUser.nickname,
        introduction: trimmedIntroduction,
      };

      localStorage.setItem(
        `dearly-profile-${updatedUser.user_id}`,
        JSON.stringify(updatedProfile),
      );

      setUser(updatedUser);
      setNickname(updatedUser.nickname);
      setIntroduction(trimmedIntroduction);

      window.dispatchEvent(new Event("dearly-profile-updated"));

      alert("프로필이 수정되었습니다.");

      window.location.reload();
    } catch (error) {
      console.error("프로필 수정 실패:", error);

      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.message ?? "프로필 수정에 실패했습니다.");
      } else {
        alert("프로필 수정에 실패했습니다.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="profile">
      <div className="profile-container">
        <div className="profile-header">
          <h1>프로필 수정</h1>
          <p>닉네임과 프로필 사진을 수정할 수 있어요.</p>
        </div>

        <form className="profile-form" onSubmit={handleSubmit}>
          <ProfileImage />

          <div className="profile-field">
            <label htmlFor="nickname">닉네임</label>

            <input
              id="nickname"
              type="text"
              value={nickname}
              maxLength={10}
              disabled={loading || !user || saving}
              onChange={(event) => setNickname(event.target.value)}
            />
          </div>

          <div className="profile-field">
            <label htmlFor="introduction">소개</label>

            <div className="profile-introduction">
              <textarea
                id="introduction"
                value={introduction}
                maxLength={50}
                disabled={loading || !user || saving}
                onChange={(event) => setIntroduction(event.target.value)}
              />

              <span className="profile-character-count">
                {introduction.length}/50
              </span>
            </div>
          </div>

          <button
            type="submit"
            className="profile-submit-button"
            disabled={loading || !user || saving}
          >
            {saving ? "저장 중..." : "수정하기"}
          </button>
        </form>
      </div>
    </main>
  );
}

export default Profile;
