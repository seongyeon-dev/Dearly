import type { Request, Response } from "express";

import {
  createPurchaseInDb,
  deletePurchaseInDb,
  getPurchaseByWishId,
  getPurchasesByUserId,
  updatePurchaseInDb,
  type CreatePurchaseInput,
  type UpdatePurchaseInput,
} from "../services/purchaseService";

function isValidPurchaseDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const parsedDate = new Date(`${value}T00:00:00Z`);

  return (
    !Number.isNaN(parsedDate.getTime()) &&
    parsedDate.toISOString().slice(0, 10) === value
  );
}

function isValidPurchaseInput(body: unknown): body is UpdatePurchaseInput {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return false;
  }

  const data = body as Record<string, unknown>;

  return (
    Number.isSafeInteger(data.amount) &&
    (data.amount as number) >= 0 &&
    typeof data.purchased_at === "string" &&
    isValidPurchaseDate(data.purchased_at) &&
    (data.store == null ||
      (typeof data.store === "string" && data.store.length <= 150)) &&
    (data.memo == null || typeof data.memo === "string")
  );
}

export async function getPurchases(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.session.userId;

    if (userId === undefined) {
      res.status(401).json({
        message: "로그인이 필요합니다.",
      });
      return;
    }

    const purchases = await getPurchasesByUserId(userId);

    res.status(200).json(purchases);
  } catch (error) {
    console.error("구매 기록 목록 조회 실패:", error);

    res.status(500).json({
      message: "구매 기록 목록을 불러오지 못했습니다.",
    });
  }
}

export async function createPurchase(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const userId = req.session.userId;

    if (userId === undefined) {
      res.status(401).json({
        message: "로그인이 필요합니다.",
      });
      return;
    }

    const body: unknown = req.body;

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      res.status(400).json({
        message: "구매 정보를 입력해주세요.",
      });
      return;
    }

    const input = body as Record<string, unknown>;
    const wishId = input.wish_id;

    if (
      !Number.isSafeInteger(wishId) ||
      (wishId as number) <= 0 ||
      !isValidPurchaseInput(input)
    ) {
      res.status(400).json({
        message: "구매 정보를 올바르게 입력해주세요.",
      });
      return;
    }

    const parsedWishId = wishId as number;

    const existingPurchase = await getPurchaseByWishId(userId, parsedWishId);

    if (existingPurchase) {
      res.status(409).json({
        message: "이미 구매 기록이 등록된 상품입니다.",
      });
      return;
    }

    const data: CreatePurchaseInput = {
      wish_id: parsedWishId,
      amount: input.amount as number,
      purchased_at: input.purchased_at as string,
      store:
        typeof input.store === "string" ? input.store.trim() || null : null,
      memo: typeof input.memo === "string" ? input.memo.trim() || null : null,
    };

    const purchaseId = await createPurchaseInDb(userId, data);

    if (purchaseId === null) {
      res.status(404).json({
        message: "상품을 찾을 수 없습니다.",
      });
      return;
    }

    res.status(201).json({
      purchase_id: purchaseId,
      ...data,
    });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "ER_DUP_ENTRY"
    ) {
      res.status(409).json({
        message: "이미 구매 기록이 등록된 상품입니다.",
      });
      return;
    }

    console.error("구매 기록 등록 실패:", error);

    res.status(500).json({
      message: "구매 기록 등록 중 오류가 발생했습니다.",
    });
  }
}

export async function getPurchaseDetail(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const userId = req.session.userId;

    if (userId === undefined) {
      res.status(401).json({
        message: "로그인이 필요합니다.",
      });
      return;
    }

    const wishId = Number(req.params.wishId);

    if (!Number.isSafeInteger(wishId) || wishId <= 0) {
      res.status(400).json({
        message: "올바른 상품 ID를 입력해주세요.",
      });
      return;
    }

    const purchase = await getPurchaseByWishId(userId, wishId);

    if (!purchase) {
      res.status(404).json({
        message: "구매 기록을 찾을 수 없습니다.",
      });
      return;
    }

    res.status(200).json(purchase);
  } catch (error) {
    console.error("구매 기록 조회 실패:", error);

    res.status(500).json({
      message: "구매 기록 조회 중 오류가 발생했습니다.",
    });
  }
}

export async function updatePurchase(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const userId = req.session.userId;

    if (userId === undefined) {
      res.status(401).json({
        message: "로그인이 필요합니다.",
      });
      return;
    }

    const wishId = Number(req.params.wishId);
    const body: unknown = req.body;

    if (!Number.isSafeInteger(wishId) || wishId <= 0) {
      res.status(400).json({
        message: "올바른 상품 ID를 입력해주세요.",
      });
      return;
    }

    if (!isValidPurchaseInput(body)) {
      res.status(400).json({
        message: "수정할 구매 정보를 올바르게 입력해주세요.",
      });
      return;
    }

    const data: UpdatePurchaseInput = {
      amount: body.amount,
      purchased_at: body.purchased_at,
      store: body.store?.trim() || null,
      memo: body.memo?.trim() || null,
    };

    const updated = await updatePurchaseInDb(userId, wishId, data);

    if (!updated) {
      res.status(404).json({
        message: "수정할 구매 기록을 찾을 수 없습니다.",
      });
      return;
    }

    const updatedPurchase = await getPurchaseByWishId(userId, wishId);

    if (!updatedPurchase) {
      res.status(404).json({
        message: "구매 기록을 찾을 수 없습니다.",
      });
      return;
    }

    res.status(200).json(updatedPurchase);
  } catch (error) {
    console.error("구매 기록 수정 실패:", error);

    res.status(500).json({
      message: "구매 기록 수정 중 오류가 발생했습니다.",
    });
  }
}

export async function deletePurchase(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const userId = req.session.userId;

    if (userId === undefined) {
      res.status(401).json({
        message: "로그인이 필요합니다.",
      });
      return;
    }

    const wishId = Number(req.params.wishId);

    if (!Number.isSafeInteger(wishId) || wishId <= 0) {
      res.status(400).json({
        message: "올바른 상품 ID를 입력해주세요.",
      });
      return;
    }

    const deleted = await deletePurchaseInDb(userId, wishId);

    if (!deleted) {
      res.status(404).json({
        message: "삭제할 구매 기록을 찾을 수 없습니다.",
      });
      return;
    }

    res.status(200).json({
      message: "구매 기록이 삭제되었습니다.",
    });
  } catch (error) {
    console.error("구매 기록 삭제 실패:", error);

    res.status(500).json({
      message: "구매 기록 삭제 중 오류가 발생했습니다.",
    });
  }
}
