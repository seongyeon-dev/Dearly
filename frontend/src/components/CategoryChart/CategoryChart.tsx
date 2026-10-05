import "./CategoryChart.css";

function CategoryChart() {
  return (
    <div className="category-card">
      <h2>카테고리별 소비 비율</h2>

      <div className="category-content">
        <div className="donut-chart">
          <div className="donut-center"></div>
        </div>

        <div className="category-list">
          <div>
            <span className="category-dot beauty"></span>
            <span>뷰티</span>
            <strong>45%</strong>
          </div>

          <div>
            <span className="category-dot fashion"></span>
            <span>패션</span>
            <strong>25%</strong>
          </div>

          <div>
            <span className="category-dot lifestyle"></span>
            <span>라이프스타일</span>
            <strong>20%</strong>
          </div>

          <div>
            <span className="category-dot other"></span>
            <span>기타</span>
            <strong>10%</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CategoryChart;
