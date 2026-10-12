import { useEffect, useRef, useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import "./MonthSelector.css";

type MonthSelectorProps = {
  value: string;
  onChange: (value: string) => void;
};

function MonthSelector({ value, onChange }: MonthSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewYear, setViewYear] = useState(() => Number(value.split("-")[0]));

  const containerRef = useRef<HTMLDivElement>(null);

  const [selectedYear, selectedMonth] = value.split("-").map(Number);

  useEffect(() => {
    if (isOpen) {
      setViewYear(selectedYear);
    }
  }, [isOpen, selectedYear]);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const handleMonthSelect = (month: number) => {
    const formattedMonth = String(month).padStart(2, "0");

    onChange(`${viewYear}-${formattedMonth}`);
    setIsOpen(false);
  };

  return (
    <div className="month-selector" ref={containerRef}>
      <button
        type="button"
        className={`month-selector-trigger ${isOpen ? "active" : ""}`}
        onClick={() => setIsOpen((previous) => !previous)}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        <CalendarDays size={17} strokeWidth={1.8} />

        <span>
          {selectedYear}년 {selectedMonth}월
        </span>

        <ChevronDown
          size={16}
          strokeWidth={1.8}
          className={
            isOpen ? "month-selector-chevron open" : "month-selector-chevron"
          }
        />
      </button>

      {isOpen && (
        <div
          className="month-selector-popup"
          role="dialog"
          aria-label="연도와 월 선택"
        >
          <div className="month-selector-header">
            <button
              type="button"
              className="month-selector-arrow"
              onClick={() => setViewYear((previous) => previous - 1)}
              aria-label="이전 연도"
            >
              <ChevronLeft size={19} />
            </button>

            <strong>{viewYear}년</strong>

            <button
              type="button"
              className="month-selector-arrow"
              onClick={() => setViewYear((previous) => previous + 1)}
              aria-label="다음 연도"
            >
              <ChevronRight size={19} />
            </button>
          </div>

          <div className="month-selector-grid">
            {Array.from({ length: 12 }, (_, index) => {
              const month = index + 1;

              const isSelected =
                selectedYear === viewYear && selectedMonth === month;

              return (
                <button
                  key={month}
                  type="button"
                  className={`month-selector-month ${isSelected ? "selected" : ""}`}
                  onClick={() => handleMonthSelect(month)}
                  aria-pressed={isSelected}
                >
                  {month}월
                </button>
              );
            })}
          </div>

          <div className="month-selector-footer">
            <button
              type="button"
              className="month-selector-today"
              onClick={() => {
                const today = new Date();
                const year = today.getFullYear();
                const month = String(today.getMonth() + 1).padStart(2, "0");

                onChange(`${year}-${month}`);
                setIsOpen(false);
              }}
            >
              이번 달로 이동
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MonthSelector;
