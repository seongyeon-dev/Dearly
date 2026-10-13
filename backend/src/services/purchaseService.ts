import pool from "../config/db";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

interface PurchaseRow extends RowDataPacket {
  purchase_id: number;
  wish_id: number;
  amount: number;
  purchased_at: string;
  store: string | null;
  memo: string | null;
}

export interface CreatePurchaseInput {
  wish_id: number;
  amount: number;
  purchased_at: string;
  store: string | null;
  memo: string | null;
}

export interface UpdatePurchaseInput {
  amount: number;
  purchased_at: string;
  store: string | null;
  memo: string | null;
}

export async function getPurchasesByUserId(
  userId: number,
): Promise<PurchaseRow[]> {
  const [rows] = await pool.execute<PurchaseRow[]>(
    `SELECT
      p.purchase_id,
      p.wish_id,
      p.amount,
      DATE_FORMAT(p.purchased_at, '%Y-%m-%d') AS purchased_at,
      p.store,
      p.memo
    FROM purchases p
    INNER JOIN wishes w ON p.wish_id = w.wish_id
    WHERE w.user_id = ?
      AND w.status = 'BOUGHT'
    ORDER BY p.purchased_at DESC, p.purchase_id DESC`,
    [userId],
  );

  return rows;
}

export async function getPurchaseByWishId(
  userId: number,
  wishId: number,
): Promise<PurchaseRow | null> {
  const [rows] = await pool.execute<PurchaseRow[]>(
    `SELECT
      p.purchase_id,
      p.wish_id,
      p.amount,
      DATE_FORMAT(p.purchased_at, '%Y-%m-%d') AS purchased_at,
      p.store,
      p.memo
    FROM purchases p
    INNER JOIN wishes w ON p.wish_id = w.wish_id
    WHERE w.user_id = ? AND p.wish_id = ?`,
    [userId, wishId],
  );

  return rows[0] ?? null;
}

export async function createPurchaseInDb(
  userId: number,
  data: CreatePurchaseInput,
): Promise<number | null> {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [wishes] = await connection.execute<RowDataPacket[]>(
      `SELECT wish_id
       FROM wishes
       WHERE wish_id = ? AND user_id = ?
       FOR UPDATE`,
      [data.wish_id, userId],
    );

    if (wishes.length === 0) {
      await connection.rollback();
      return null;
    }

    const [result] = await connection.execute<ResultSetHeader>(
      `INSERT INTO purchases (
        wish_id,
        amount,
        purchased_at,
        store,
        memo
      )
      VALUES (?, ?, ?, ?, ?)`,
      [data.wish_id, data.amount, data.purchased_at, data.store, data.memo],
    );

    await connection.execute<ResultSetHeader>(
      `UPDATE wishes
       SET status = 'BOUGHT'
       WHERE wish_id = ? AND user_id = ?`,
      [data.wish_id, userId],
    );

    await connection.commit();

    return result.insertId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function updatePurchaseInDb(
  userId: number,
  wishId: number,
  data: UpdatePurchaseInput,
): Promise<boolean> {
  const [result] = await pool.execute<ResultSetHeader>(
    `UPDATE purchases p
     INNER JOIN wishes w ON p.wish_id = w.wish_id
     SET
       p.amount = ?,
       p.purchased_at = ?,
       p.store = ?,
       p.memo = ?
     WHERE p.wish_id = ? AND w.user_id = ?`,
    [data.amount, data.purchased_at, data.store, data.memo, wishId, userId],
  );

  return result.affectedRows > 0;
}

export async function deletePurchaseInDb(
  userId: number,
  wishId: number,
): Promise<boolean> {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [wishes] = await connection.execute<RowDataPacket[]>(
      `SELECT wish_id
       FROM wishes
       WHERE wish_id = ? AND user_id = ?
       FOR UPDATE`,
      [wishId, userId],
    );

    if (wishes.length === 0) {
      await connection.rollback();
      return false;
    }

    const [result] = await connection.execute<ResultSetHeader>(
      `DELETE FROM purchases
       WHERE wish_id = ?`,
      [wishId],
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      return false;
    }

    await connection.execute<ResultSetHeader>(
      `UPDATE wishes
       SET status = 'WANT'
       WHERE wish_id = ? AND user_id = ?`,
      [wishId, userId],
    );

    await connection.commit();

    return true;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
