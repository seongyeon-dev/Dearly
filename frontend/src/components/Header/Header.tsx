import { useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";

import "./Header.css";

function Header() {
  const navigate = useNavigate();

  return (
    <header className="header">
      <div className="header-logo">Dearly</div>

      <div className="header-right">
        <span className="header-text">Wishlist & Budget</span>

        <button
          type="button"
          className="header-login-button"
          onClick={() => navigate("/login")}
        >
          <LogIn size={17} strokeWidth={1.8} />
          로그인
        </button>
      </div>
    </header>
  );
}

export default Header;
