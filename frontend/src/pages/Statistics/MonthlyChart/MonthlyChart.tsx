import "./MonthlyChart.css";

type MonthlySpending = {
  month: number;
  amount: number;
};

type MonthlyChartProps = {
  monthlySpending: MonthlySpending[];
  selectedMonth: number;
  onMonthChange: (month: number) => void;
};

function MonthlyChart({
  monthlySpending,
  selectedMonth,
  onMonthChange,
}: MonthlyChartProps) {
  const maxAmount = 350000;

  return (
    <section className="monthly-statistics">
      <h2>월별 소비 금액</h2>

      <div className="monthly-chart">
        <div className="chart-y-axis">
          <span>30만</span>
          <span>20만</span>
          <span>10만</span>
          <span>0원</span>
        </div>

        <div className="chart-area">
          <div className="chart-grid-line chart-grid-line-first" />
          <div className="chart-grid-line chart-grid-line-second" />
          <div className="chart-grid-line chart-grid-line-third" />
          <div className="chart-grid-line chart-grid-line-fourth" />

          <div className="chart-bars">
            {monthlySpending.map((item) => (
              <div className="chart-column" key={item.month}>
                <div className="chart-bar-wrapper">
                  {selectedMonth === item.month && (
                    <div className="chart-tooltip">
                      <span>{item.month}월</span>
                      <strong>{item.amount.toLocaleString()}원</strong>
                    </div>
                  )}

                  <button
                    type="button"
                    className={`chart-bar ${
                      selectedMonth === item.month ? "active" : ""
                    }`}
                    style={{
                      height: `${(item.amount / maxAmount) * 100}%`,
                    }}
                    onClick={() => onMonthChange(item.month)}
                    aria-label={`${item.month}월 소비 금액 ${item.amount.toLocaleString()}원`}
                  />
                </div>

                <span className="chart-month">{item.month}월</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default MonthlyChart;
