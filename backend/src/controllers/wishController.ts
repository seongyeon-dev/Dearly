import { Request, Response } from "express";
import {
  getWishes,
  getWishById,
  createWishInDb,
  updateWishInDb,
  deleteWishInDb,
  type CreateWishInput,
  type UpdateWishInput,
} from "../services/wishService";

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
    const body = req.body as Partial<CreateWishInput>;

    const categories = ["BEAUTY", "FASHION", "LIFESTYLE", "OTHER"];
    const statuses = ["WANT", "CONSIDERING", "BOUGHT"];

    if (
      typeof body.name !== "string" ||
      !body.name.trim() ||
      !categories.includes(body.category ?? "") ||
      !statuses.includes(body.status ?? "") ||
      typeof body.expected_price !== "number" ||
      !Number.isSafeInteger(body.expected_price) ||
      body.expected_price <= 0 ||
      (body.planned_date != null &&
        (typeof body.planned_date !== "string" ||
          !/^\d{4}-\d{2}-\d{2}$/.test(body.planned_date))) ||
      (body.purchase_link != null && typeof body.purchase_link !== "string") ||
      (body.memo != null &&
        (typeof body.memo !== "string" || body.memo.length > 300))
    ) {
      res.status(400).json({
        message: "상품 정보를 확인해주세요.",
      });
      return;
    }

    if (body.purchase_link) {
      try {
        const url = new URL(body.purchase_link);

        if (!["http:", "https:"].includes(url.protocol)) {
          throw new Error("Invalid URL");
        }
      } catch {
        res.status(400).json({
          message: "올바른 구매 링크를 입력해주세요.",
        });
        return;
      }
    }

    const data: CreateWishInput = {
      name: body.name.trim(),
      category: body.category!,
      status: body.status!,
      expected_price: body.expected_price,
      planned_date: body.planned_date || null,
      purchase_link: body.purchase_link || null,
      memo: body.memo || null,
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

    const allowedFields = [
      "expected_price",
      "planned_date",
      "purchase_link",
      "memo",
      "status",
    ];

    const keys = Object.keys(body);

    if (keys.length === 0 || keys.some((key) => !allowedFields.includes(key))) {
      res.status(400).json({
        message: "수정 가능한 항목을 확인해주세요.",
      });
      return;
    }

    const statuses = ["WANT", "CONSIDERING", "BOUGHT"];

    if (
      (body.expected_price !== undefined &&
        (typeof body.expected_price !== "number" ||
          !Number.isSafeInteger(body.expected_price) ||
          body.expected_price <= 0)) ||
      (body.planned_date !== undefined &&
        body.planned_date !== null &&
        (typeof body.planned_date !== "string" ||
          !/^\d{4}-\d{2}-\d{2}$/.test(body.planned_date))) ||
      (body.purchase_link !== undefined &&
        body.purchase_link !== null &&
        typeof body.purchase_link !== "string") ||
      (body.memo !== undefined &&
        body.memo !== null &&
        (typeof body.memo !== "string" || body.memo.length > 300)) ||
      (body.status !== undefined && !statuses.includes(body.status))
    ) {
      res.status(400).json({
        message: "수정할 상품 정보를 확인해주세요.",
      });
      return;
    }

    if (body.purchase_link) {
      try {
        const url = new URL(body.purchase_link);

        if (!["http:", "https:"].includes(url.protocol)) {
          throw new Error("Invalid URL");
        }
      } catch {
        res.status(400).json({
          message: "올바른 구매 링크를 입력해주세요.",
        });
        return;
      }
    }

    const updatedWish = await updateWishInDb(userId, wishId, body);

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
