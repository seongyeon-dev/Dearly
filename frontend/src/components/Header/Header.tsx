import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn, LogOut, UserRound } from "lucide-react";
import axios from "axios";

import "./Header.css";

interface User {
  user_id: number;
  email: string;
  nickname: string;
}

const API_BASE_URL = import.meta.env.PROD
  ? ""
  : import.meta.env.VITE_API_URL || "http://localhost:3000";

function Header() {
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await axios.get<{ user: User }>(
          `${API_BASE_URL}/api/auth/me`,
          {
            withCredentials: true,
          },
        );

        setUser(response.data.user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    void fetchCurrentUser();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(
        `${API_BASE_URL}/api/auth/logout`,
        {},
        {
          withCredentials: true,
        },
      );

      setUser(null);
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("로그아웃 실패:", error);
      alert("로그아웃에 실패했습니다.");
    }
  };

  return (
    <header className="header">
      <div className="header-logo">Dearly</div>

      <div className="header-right">
        <span className="header-text">Wishlist & Budget</span>

        {!loading &&
          (user ? (
            <>
              <span className="header-user">
                <UserRound size={17} strokeWidth={1.8} />
                {user.nickname}님
              </span>

              <button
                type="button"
                className="header-login-button"
                onClick={handleLogout}
              >
                <LogOut size={17} strokeWidth={1.8} />
                로그아웃
              </button>
            </>
          ) : (
            <button
              type="button"
              className="header-login-button"
              onClick={() => navigate("/login")}
            >
              <LogIn size={17} strokeWidth={1.8} />
              로그인
            </button>
          ))}
      </div>
    </header>
  );
}

export default Header;
