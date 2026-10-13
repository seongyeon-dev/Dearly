import type { Request, Response } from "express";
import {
  getWishes,
  getWishById,
  createWishInDb,
  updateWishInDb,
  deleteWishInDb,
  type CreateWishInput,
  type UpdateWishInput,
} from "../services/wishService";

const categories = ["BEAUTY", "FASHION", "LIFESTYLE", "OTHER"] as const;

const statuses = ["WANT", "CONSIDERING", "BOUGHT"] as const;

const allowedUpdateFields = [
  "name",
  "category",
  "expected_price",
  "planned_date",
  "purchase_link",
  "memo",
  "status",
];

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00Z`);

  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}

function isValidPurchaseLink(value: string): boolean {
  try {
    const url = new URL(value);

    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
}

export async function getWishList(req: Request, res: Response) {
  try {
    const userId = 1;

    const wishes = await getWishes(userId);

    res.status(200).json(wishes);
  } catch (error) {
    console.error("위시리스트 조회 실패:", error);

    res.status(500).json({
      message: "위시리스트 조회 중 오류가 발생했습니다.",
    });
  }
}

export async function getWishDetail(req: Request, res: Response) {
  try {
    const userId = 1;
    const wishId = Number(req.params.id);

    if (!Number.isSafeInteger(wishId) || wishId <= 0) {
      res.status(400).json({
        message: "올바른 상품 ID를 입력해주세요.",
      });
      return;
    }

    const wish = await getWishById(userId, wishId);

    if (!wish) {
      res.status(404).json({
        message: "상품을 찾을 수 없습니다.",
      });
      return;
    }

    res.status(200).json(wish);
  } catch (error) {
    console.error("상품 상세 조회 실패:", error);

    res.status(500).json({
      message: "상품 상세 조회 중 오류가 발생했습니다.",
    });
  }
}

export async function createWish(req: Request, res: Response) {
  try {
    const userId = 1;
    const body = req.body as Partial<CreateWishInput> | null;

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      res.status(400).json({
        message: "상품 정보를 입력해주세요.",
      });
      return;
    }

    if (
      typeof body.name !== "string" ||
      !body.name.trim() ||
      body.name.trim().length > 150 ||
      !categories.some((item) => item === body.category) ||
      !statuses.some((item) => item === body.status) ||
      typeof body.expected_price !== "number" ||
      !Number.isSafeInteger(body.expected_price) ||
      body.expected_price <= 0 ||
      (body.planned_date != null &&
        (typeof body.planned_date !== "string" ||
          !isValidDate(body.planned_date))) ||
      (body.purchase_link != null && typeof body.purchase_link !== "string") ||
      (body.memo != null &&
        (typeof body.memo !== "string" || body.memo.length > 300))
    ) {
      res.status(400).json({
        message: "상품 정보를 확인해주세요.",
      });
      return;
    }

    if (body.purchase_link && !isValidPurchaseLink(body.purchase_link)) {
      res.status(400).json({
        message: "올바른 구매 링크를 입력해주세요.",
      });
      return;
    }

    const data: CreateWishInput = {
      name: body.name.trim(),
      category: body.category!,
      status: body.status!,
      expected_price: body.expected_price,
      planned_date: body.planned_date || null,
      purchase_link: body.purchase_link?.trim() || null,
      memo: body.memo?.trim() || null,
    };

    const wishId = await createWishInDb(userId, data);

    res.status(201).json({
      wish_id: wishId,
      ...data,
    });
  } catch (error) {
    console.error("상품 등록 실패:", error);

    res.status(500).json({
      message: "상품 등록 중 오류가 발생했습니다.",
    });
  }
}

export async function updateWish(req: Request, res: Response) {
  try {
    const userId = 1;
    const wishId = Number(req.params.id);

    if (!Number.isSafeInteger(wishId) || wishId <= 0) {
      res.status(400).json({
        message: "올바른 상품 ID를 입력해주세요.",
      });
      return;
    }

    const body = req.body as Partial<UpdateWishInput> | null;

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      res.status(400).json({
        message: "수정할 상품 정보를 입력해주세요.",
      });
      return;
    }

    const keys = Object.keys(body);

    if (
      keys.length === 0 ||
      keys.some((key) => !allowedUpdateFields.includes(key))
    ) {
      res.status(400).json({
        message: "수정 가능한 항목을 확인해주세요.",
      });
      return;
    }

    if (
      (body.name !== undefined &&
        (typeof body.name !== "string" ||
          !body.name.trim() ||
          body.name.trim().length > 150)) ||
      (body.category !== undefined &&
        !categories.some((item) => item === body.category)) ||
      (body.expected_price !== undefined &&
        (typeof body.expected_price !== "number" ||
          !Number.isSafeInteger(body.expected_price) ||
          body.expected_price <= 0)) ||
      (body.planned_date !== undefined &&
        body.planned_date !== null &&
        (typeof body.planned_date !== "string" ||
          !isValidDate(body.planned_date))) ||
      (body.purchase_link !== undefined &&
        body.purchase_link !== null &&
        typeof body.purchase_link !== "string") ||
      (body.memo !== undefined &&
        body.memo !== null &&
        (typeof body.memo !== "string" || body.memo.length > 300)) ||
      (body.status !== undefined &&
        !statuses.some((item) => item === body.status))
    ) {
      res.status(400).json({
        message: "수정할 상품 정보를 확인해주세요.",
      });
      return;
    }

    if (body.purchase_link && !isValidPurchaseLink(body.purchase_link)) {
      res.status(400).json({
        message: "올바른 구매 링크를 입력해주세요.",
      });
      return;
    }

    const data: UpdateWishInput = {};

    if (body.name !== undefined) {
      data.name = body.name.trim();
    }

    if (body.category !== undefined) {
      data.category = body.category;
    }

    if (body.expected_price !== undefined) {
      data.expected_price = body.expected_price;
    }

    if (body.planned_date !== undefined) {
      data.planned_date = body.planned_date || null;
    }

    if (body.purchase_link !== undefined) {
      data.purchase_link = body.purchase_link?.trim() || null;
    }

    if (body.memo !== undefined) {
      data.memo = body.memo?.trim() || null;
    }

    if (body.status !== undefined) {
      data.status = body.status;
    }

    const updatedWish = await updateWishInDb(userId, wishId, data);

    if (!updatedWish) {
      res.status(404).json({
        message: "상품을 찾을 수 없습니다.",
      });
      return;
    }

    res.status(200).json(updatedWish);
  } catch (error) {
    console.error("상품 수정 실패:", error);

    res.status(500).json({
      message: "상품 수정 중 오류가 발생했습니다.",
    });
  }
}

export async function deleteWish(req: Request, res: Response) {
  try {
    const userId = 1;
    const wishId = Number(req.params.id);

    if (!Number.isSafeInteger(wishId) || wishId <= 0) {
      res.status(400).json({
        message: "올바른 상품 ID를 입력해주세요.",
      });
      return;
    }

    const deleted = await deleteWishInDb(userId, wishId);

    if (!deleted) {
      res.status(404).json({
        message: "상품을 찾을 수 없습니다.",
      });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error("상품 삭제 실패:", error);

    res.status(500).json({
      message: "상품 삭제 중 오류가 발생했습니다.",
    });
  }
}
