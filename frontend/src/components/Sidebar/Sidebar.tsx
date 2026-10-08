import {
  ChartNoAxesColumnIncreasing,
  Heart,
  Home,
  ReceiptText,
  UserRound,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

import "./Sidebar.css";

const categories = [
  { name: "전체", value: null },
  { name: "뷰티", value: "BEAUTY" },
  { name: "패션", value: "FASHION" },
  { name: "라이프스타일", value: "LIFESTYLE" },
  { name: "기타", value: "OTHER" },
];

function Sidebar() {
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const selectedCategory = searchParams.get("category");

  return (
    <aside className="sidebar">
      <div className="sidebar-profile">
        <div className="sidebar-profile-image">
          <span className="sidebar-profile-ribbon">🎀</span>
        </div>

        <strong className="sidebar-profile-name">Dearly, Me</strong>
        <span className="sidebar-profile-description">나의 위시리스트</span>
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
