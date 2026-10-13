import type { Request, Response } from "express";
import { getBudgetByMonth, saveBudget } from "../services/budgetService";

export async function getBudget(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.session.userId;

    if (userId === undefined) {
      res.status(401).json({
        message: "로그인이 필요합니다.",
      });
      return;
    }

    const month = String(req.query.month ?? "");

    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
      res.status(400).json({
        message: "올바른 월을 입력해주세요.",
      });
      return;
    }

    const budget = await getBudgetByMonth(userId, month);

    res.status(200).json(budget);
  } catch (error) {
    console.error("예산 조회 실패:", error);

    res.status(500).json({
      message: "예산을 불러오지 못했습니다.",
    });
  }
}

export async function upsertBudget(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.session.userId;

    if (userId === undefined) {
      res.status(401).json({
        message: "로그인이 필요합니다.",
      });
      return;
    }

    const { month, amount } = req.body ?? {};

    if (typeof month !== "string" || !/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
      res.status(400).json({
        message: "올바른 월을 입력해주세요.",
      });
      return;
    }

    if (
      typeof amount !== "number" ||
      !Number.isSafeInteger(amount) ||
      amount < 0 ||
      amount > 2147483647
    ) {
      res.status(400).json({
        message: "예산은 0원 이상의 정수로 입력해주세요.",
      });
      return;
    }

    const budget = await saveBudget(userId, month, amount);

    res.status(200).json(budget);
  } catch (error) {
    console.error("예산 저장 실패:", error);

    res.status(500).json({
      message: "예산을 저장하지 못했습니다.",
    });
  }
}
