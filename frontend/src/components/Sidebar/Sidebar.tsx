import { NavLink } from "react-router-dom";
import {
  House,
  Heart,
  ReceiptText,
  ChartNoAxesColumnIncreasing,
  UserRound,
} from "lucide-react";

import "./Sidebar.css";

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-profile">
        <div className="profile-image">
          <span>🎀</span>
        </div>

        <strong className="profile-name">Dearly, Me</strong>
        <span className="profile-description">나의 위시리스트</span>
      </div>

      <nav className="sidebar-menu">
        <NavLink to="/" className="sidebar-link">
          <House size={16} strokeWidth={1.5} />
          <span>홈</span>
        </NavLink>

        <NavLink to="/wishlist" className="sidebar-link">
          <Heart size={16} strokeWidth={1.5} />
          <span>위시리스트</span>
        </NavLink>

        <NavLink to="/purchases" className="sidebar-link">
          <ReceiptText size={16} strokeWidth={1.5} />
          <span>소비 기록</span>
        </NavLink>

        <NavLink to="/statistics" className="sidebar-link">
          <ChartNoAxesColumnIncreasing size={16} strokeWidth={1.5} />
          <span>소비 통계</span>
        </NavLink>

        <NavLink to="/profile" className="sidebar-link">
          <UserRound size={16} strokeWidth={1.5} />
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