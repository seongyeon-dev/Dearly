import pool from "../config/db";
import type { RowDataPacket, ResultSetHeader } from "mysql2";

type WishCategory = "BEAUTY" | "FASHION" | "LIFESTYLE" | "OTHER";

type WishStatus = "WANT" | "CONSIDERING" | "BOUGHT";

interface WishRow extends RowDataPacket {
  wish_id: number;
  user_id: number;
  name: string;
  category: WishCategory;
  status: WishStatus;
  expected_price: number;
  is_favorite: number;
  planned_date: string | null;
  purchase_link: string | null;
  memo: string | null;
}

export interface CreateWishInput {
  name: string;
  category: WishCategory;
  status: WishStatus;
  expected_price: number;
  planned_date: string | null;
  purchase_link: string | null;
  memo: string | null;
}

export interface UpdateWishInput {
  name?: string;
  category?: WishCategory;
  expected_price?: number;
  planned_date?: string | null;
  purchase_link?: string | null;
  memo?: string | null;
  status?: WishStatus;
  is_favorite?: boolean;
}

export async function getWishes(userId: number): Promise<WishRow[]> {
  const [rows] = await pool.query<WishRow[]>(
    `SELECT *
     FROM wishes
     WHERE user_id = ?
     ORDER BY created_at DESC, wish_id DESC`,
    [userId],
  );

  return rows;
}

export async function getWishById(
  userId: number,
  wishId: number,
): Promise<WishRow | null> {
  const [rows] = await pool.execute<WishRow[]>(
    `SELECT *
     FROM wishes
     WHERE user_id = ? AND wish_id = ?`,
    [userId, wishId],
  );

  return rows[0] ?? null;
}

export async function createWishInDb(
  userId: number,
  data: CreateWishInput,
): Promise<number> {
  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO wishes (
      user_id,
      name,
      category,
      status,
      expected_price,
      planned_date,
      purchase_link,
      memo
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      data.name,
      data.category,
      data.status,
      data.expected_price,
      data.planned_date,
      data.purchase_link,
      data.memo,
    ],
  );

  return result.insertId;
}

export async function updateWishInDb(
  userId: number,
  wishId: number,
  data: UpdateWishInput,
): Promise<WishRow | null> {
  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  if (data.name !== undefined) {
    fields.push("name = ?");
    values.push(data.name);
  }

  if (data.category !== undefined) {
    fields.push("category = ?");
    values.push(data.category);
  }

  if (data.expected_price !== undefined) {
    fields.push("expected_price = ?");
    values.push(data.expected_price);
  }

  if (data.planned_date !== undefined) {
    fields.push("planned_date = ?");
    values.push(data.planned_date);
  }

  if (data.purchase_link !== undefined) {
    fields.push("purchase_link = ?");
    values.push(data.purchase_link);
  }

  if (data.memo !== undefined) {
    fields.push("memo = ?");
    values.push(data.memo);
  }

  if (data.status !== undefined) {
    fields.push("status = ?");
    values.push(data.status);
  }

  if (data.is_favorite !== undefined) {
    fields.push("is_favorite = ?");
    values.push(data.is_favorite ? 1 : 0);
  }

  if (fields.length === 0) {
    return getWishById(userId, wishId);
  }

  values.push(userId, wishId);

  const [result] = await pool.execute<ResultSetHeader>(
    `UPDATE wishes
     SET ${fields.join(", ")}
     WHERE user_id = ? AND wish_id = ?`,
    values,
  );

  if (result.affectedRows === 0) {
    return null;
  }

  return getWishById(userId, wishId);
}

export async function deleteWishInDb(
  userId: number,
  wishId: number,
): Promise<boolean> {
  const [result] = await pool.execute<ResultSetHeader>(
    `DELETE FROM wishes
     WHERE user_id = ? AND wish_id = ?`,
    [userId, wishId],
  );

  return result.affectedRows > 0;
}
