import {
  ChartNoAxesColumnIncreasing,
  Heart,
  Home,
  ReceiptText,
  UserRound,
} from "lucide-react";
import { NavLink } from "react-router-dom";

import "./Sidebar.css";

function Sidebar() {
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
        <NavLink to="/" className="sidebar-link">
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

        <button type="button">전체</button>
        <button type="button">뷰티</button>
        <button type="button">패션</button>
        <button type="button">라이프스타일</button>
        <button type="button">기타</button>
      </div>
    </aside>
  );
}

export default Sidebar;
