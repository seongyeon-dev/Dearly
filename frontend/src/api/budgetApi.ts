import axios from "axios";

const API_URL = "http://localhost:3000/api/budgets";

export interface BudgetResponse {
  budget_id: number;
  user_id: number;
  budget_month: string;
  limit_amount: number;
}

export interface SaveBudgetRequest {
  month: string;
  amount: number;
}

export async function fetchBudget(
  month: string,
): Promise<BudgetResponse | null> {
  const response = await axios.get<BudgetResponse | null>(API_URL, {
    params: { month },
  });

  return response.data;
}

export async function saveBudget(
  data: SaveBudgetRequest,
): Promise<BudgetResponse> {
  const response = await axios.put<BudgetResponse>(API_URL, data);

  return response.data;
}
