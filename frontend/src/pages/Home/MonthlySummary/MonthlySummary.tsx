import { useNavigate } from "react-router-dom";
import { ShoppingBag, CreditCard, CircleDollarSign } from "lucide-react";

import "./MonthlySummary.css";

function MonthlySummary() {
  const navigate = useNavigate();

  return (
    <div className="monthly-card">
      <div className="monthly-header">
        <div>
          <h2>10월의 소비</h2>
          <p>2026.10.01 - 2026.10.31</p>
        </div>

        <button
          type="button"
          className="monthly-more-button"
          onClick={() => navigate("/statistics")}
        >
          전체보기 ›
        </button>
      </div>

      <div className="monthly-stats">
        <div className="stat-item">
          <div className="stat-icon">
            <ShoppingBag size={24} strokeWidth={1.6} />
          </div>

          <div className="stat-text">
            <span>총 예산</span>
            <strong>500,000원</strong>
          </div>
        </div>

        <div className="stat-item">
          <div className="stat-icon">
            <CreditCard size={24} strokeWidth={1.6} />
          </div>

          <div className="stat-text">
            <span>사용 금액</span>
            <strong>327,000원</strong>
            <small>65% 사용</small>
          </div>
        </div>

        <div className="stat-item remaining">
          <div className="stat-icon">
            <CircleDollarSign size={24} strokeWidth={1.6} />
          </div>

          <div className="stat-text">
            <span>남은 예산</span>
            <strong>173,000원</strong>
            <small>35% 남음</small>
          </div>
        </div>
      </div>

      <div className="budget-progress">
        <div className="progress-row">
          <div className="progress-bar">
            <div className="progress-value"></div>
          </div>

          <strong>65%</strong>
        </div>

        <p>327,000원 / 500,000원</p>
      </div>
    </div>
  );
}

export default MonthlySummary;
