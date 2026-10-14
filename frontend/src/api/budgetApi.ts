import axios from "axios";

const API_BASE_URL = import.meta.env.PROD
  ? ""
  : import.meta.env.VITE_API_URL || "http://localhost:3000";

const API_URL = `${API_BASE_URL}/api/budgets`;

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
    withCredentials: true,
  });

  return response.data;
}

export async function saveBudget(
  data: SaveBudgetRequest,
): Promise<BudgetResponse> {
  const response = await axios.put<BudgetResponse>(API_URL, data, {
    withCredentials: true,
  });

  return response.data;
}
