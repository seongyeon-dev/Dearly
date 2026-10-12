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
  const highestAmount = Math.max(
    ...monthlySpending.map((item) => item.amount),
    0,
  );

  const step =
    highestAmount > 0
      ? Math.pow(10, Math.floor(Math.log10(highestAmount / 3)))
      : 10000;

  const maxAmount =
    highestAmount > 0
      ? Math.ceil(highestAmount / (step * 3)) * step * 3
      : 30000;

  const formatAxisAmount = (amount: number): string => {
    if (amount === 0) {
      return "0원";
    }

    if (amount >= 10000) {
      return `${Number((amount / 10000).toFixed(2))}만`;
    }

    return amount.toLocaleString("ko-KR");
  };

  const axisLabels = [maxAmount, (maxAmount * 2) / 3, maxAmount / 3, 0];

  return (
    <section className="monthly-statistics">
      <h2>월별 소비 금액</h2>

      <div className="monthly-chart">
        <div className="chart-y-axis">
          {axisLabels.map((amount) => (
            <span key={amount}>{formatAxisAmount(amount)}</span>
          ))}
        </div>

        <div className="chart-area">
          <div className="chart-grid-line chart-grid-line-first" />
          <div className="chart-grid-line chart-grid-line-second" />
          <div className="chart-grid-line chart-grid-line-third" />
          <div className="chart-grid-line chart-grid-line-fourth" />

          <div className="chart-bars">
            {monthlySpending.map((item) => {
              const barHeight =
                maxAmount > 0
                  ? Math.min(100, (item.amount / maxAmount) * 100)
                  : 0;

              return (
                <div className="chart-column" key={item.month}>
                  <div className="chart-bar-wrapper">
                    {selectedMonth === item.month && (
                      <div className="chart-tooltip">
                        <span>{item.month}월</span>
                        <strong>{item.amount.toLocaleString("ko-KR")}원</strong>
                      </div>
                    )}

                    <button
                      type="button"
                      className={`chart-bar ${
                        selectedMonth === item.month ? "active" : ""
                      }`}
                      style={{
                        height: `${barHeight}%`,
                      }}
                      onClick={() => onMonthChange(item.month)}
                      aria-label={`${item.month}월 소비 금액 ${item.amount.toLocaleString("ko-KR")}원`}
                    />
                  </div>

                  <span className="chart-month">{item.month}월</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default MonthlyChart;
