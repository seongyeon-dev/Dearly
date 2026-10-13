import pool from "../config/db";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

export interface WishImage extends RowDataPacket {
  image_id: number;
  wish_id: number;
  image_url: string;
  sort_order: number;
  created_at: Date;
}

export const getWishImages = async (wishId: number): Promise<WishImage[]> => {
  const [rows] = await pool.query<WishImage[]>(
    `SELECT image_id, wish_id, image_url, sort_order, created_at
     FROM wish_images
     WHERE wish_id = ?
     ORDER BY sort_order ASC, image_id ASC`,
    [wishId],
  );

  return rows;
};

export const createWishImage = async (
  wishId: number,
  imageUrl: string,
  sortOrder: number,
): Promise<number> => {
  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO wish_images (wish_id, image_url, sort_order)
     VALUES (?, ?, ?)`,
    [wishId, imageUrl, sortOrder],
  );

  return result.insertId;
};

export const deleteWishImage = async (
  imageId: number,
  wishId: number,
): Promise<boolean> => {
  const [result] = await pool.execute<ResultSetHeader>(
    `DELETE FROM wish_images
     WHERE image_id = ? AND wish_id = ?`,
    [imageId, wishId],
  );

  return result.affectedRows > 0;
};
