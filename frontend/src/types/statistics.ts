export type CategorySpendingData = {
  name: string;
  amount: number;
  percentage: number;
  className: string;
};

export type MonthlySpendingData = {
  month: number;
  amount: number;
  categories: CategorySpendingData[];
};