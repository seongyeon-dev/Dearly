import bcrypt from "bcrypt";
import pool from "../config/db";
import type { RowDataPacket, ResultSetHeader } from "mysql2";

interface UserRow extends RowDataPacket {
  user_id: number;
  email: string;
  nickname: string;
  password_hash: string;
}

export async function loginUser(email: string, password: string) {
  const [rows] = await pool.query<UserRow[]>(
    `SELECT user_id, email, nickname, password_hash
     FROM users
     WHERE email = ? AND deleted_at IS NULL
     LIMIT 1`,
    [email],
  );

  const user = rows[0];

  if (!user) {
    return null;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);

  if (!isPasswordValid) {
    return null;
  }

  return {
    user_id: user.user_id,
    email: user.email,
    nickname: user.nickname,
  };
}

export async function signupUser(
  email: string,
  password: string,
  nickname: string,
) {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedNickname = nickname.trim();

  const [existingUsers] = await pool.query<UserRow[]>(
    `SELECT user_id
     FROM users
     WHERE email = ?
     LIMIT 1`,
    [normalizedEmail],
  );

  if (existingUsers.length > 0) {
    return {
      success: false as const,
      message: "이미 가입된 이메일입니다.",
    };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  try {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO users (email, password_hash, nickname)
       VALUES (?, ?, ?)`,
      [normalizedEmail, passwordHash, normalizedNickname],
    );

    return {
      success: true as const,
      user: {
        user_id: result.insertId,
        email: normalizedEmail,
        nickname: normalizedNickname,
      },
    };
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "ER_DUP_ENTRY"
    ) {
      return {
        success: false as const,
        message: "이미 가입된 이메일입니다.",
      };
    }

    throw error;
  }
}

export async function updateUserNickname(userId: number, nickname: string) {
  const normalizedNickname = nickname.trim();

  const [result] = await pool.query<ResultSetHeader>(
    `UPDATE users
     SET nickname = ?
     WHERE user_id = ?
       AND deleted_at IS NULL`,
    [normalizedNickname, userId],
  );

  if (result.affectedRows === 0) {
    return null;
  }

  const [rows] = await pool.query<UserRow[]>(
    `SELECT user_id, email, nickname
     FROM users
     WHERE user_id = ?
       AND deleted_at IS NULL
     LIMIT 1`,
    [userId],
  );

  const user = rows[0];

  if (!user) {
    return null;
  }

  return {
    user_id: user.user_id,
    email: user.email,
    nickname: user.nickname,
  };
}
