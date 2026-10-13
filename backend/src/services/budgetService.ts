
import pool from "../config/db";

export async function getBudgetByMonth(
  userId: number,
  month: string,
) {
  const [rows] = await pool.query(
    `SELECT budget_id, user_id, budget_month, limit_amount
     FROM budgets
     WHERE user_id = ? AND budget_month = ?
     LIMIT 1`,
    [userId, month],
  );

  return (rows as any[])[0] ?? null;
}

export async function saveBudget(
  userId: number,
  month: string,
  amount: number,
) {
  const existingBudget = await getBudgetByMonth(userId, month);

  if (existingBudget) {
    await pool.query(
      `UPDATE budgets
       SET limit_amount = ?
       WHERE budget_id = ? AND user_id = ?`,
      [amount, existingBudget.budget_id, userId],
    );
  } else {
    await pool.query(
      `INSERT INTO budgets
       (user_id, budget_month, limit_amount)
       VALUES (?, ?, ?)`,
      [userId, month, amount],
    );
  }

  return getBudgetByMonth(userId, month);
}
