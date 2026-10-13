import type { Request, Response } from "express";
import type { RowDataPacket } from "mysql2";
import pool from "../config/db";
import {
  loginUser,
  signupUser,
  updateUserNickname,
} from "../services/authService";

interface CurrentUserRow extends RowDataPacket {
  user_id: number;
  email: string;
  nickname: string;
}

export async function signup(req: Request, res: Response) {
  try {
    const { email, password, nickname } = req.body ?? {};

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      typeof nickname !== "string"
    ) {
      res.status(400).json({
        message: "모든 항목을 입력해주세요.",
      });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedNickname = nickname.trim();

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

    if (!emailPattern.test(normalizedEmail)) {
      res.status(400).json({
        message: "올바른 이메일 형식으로 입력해주세요.",
      });
      return;
    }

    if (!passwordPattern.test(password)) {
      res.status(400).json({
        message:
          "비밀번호는 영문, 숫자, 특수문자를 포함해 8자 이상이어야 합니다.",
      });
      return;
    }

    if (normalizedNickname.length < 2 || normalizedNickname.length > 10) {
      res.status(400).json({
        message: "닉네임은 2자 이상 10자 이하로 입력해주세요.",
      });
      return;
    }

    const result = await signupUser(
      normalizedEmail,
      password,
      normalizedNickname,
    );

    if (!result.success) {
      res.status(409).json({
        message: result.message,
      });
      return;
    }

    res.status(201).json({
      message: "회원가입이 완료되었습니다.",
      user: result.user,
    });
  } catch (error) {
    console.error("회원가입 오류:", error);

    res.status(500).json({
      message: "회원가입 처리 중 오류가 발생했습니다.",
    });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body ?? {};

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      res.status(400).json({
        message: "이메일과 비밀번호를 입력해주세요.",
      });
      return;
    }

    const user = await loginUser(email.trim().toLowerCase(), password);

    if (!user) {
      res.status(401).json({
        message: "이메일 또는 비밀번호가 올바르지 않습니다.",
      });
      return;
    }

    req.session.regenerate((error) => {
      if (error) {
        res.status(500).json({
          message: "로그인 처리 중 오류가 발생했습니다.",
        });
        return;
      }

      req.session.userId = user.user_id;

      req.session.save((saveError) => {
        if (saveError) {
          res.status(500).json({
            message: "로그인 상태를 저장하지 못했습니다.",
          });
          return;
        }

        res.status(200).json({ user });
      });
    });
  } catch (error) {
    console.error("로그인 오류:", error);

    res.status(500).json({
      message: "서버 오류가 발생했습니다.",
    });
  }
}

export async function getCurrentUser(
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

    const [rows] = await pool.execute<CurrentUserRow[]>(
      `SELECT user_id, email, nickname
       FROM users
       WHERE user_id = ? AND deleted_at IS NULL
       LIMIT 1`,
      [userId],
    );

    const user = rows[0];

    if (!user) {
      res.status(401).json({
        message: "사용자 정보를 찾을 수 없습니다.",
      });
      return;
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("로그인 사용자 조회 실패:", error);

    res.status(500).json({
      message: "사용자 정보를 불러오지 못했습니다.",
    });
  }
}

export async function updateCurrentUser(
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

    const { nickname } = req.body ?? {};

    if (typeof nickname !== "string") {
      res.status(400).json({
        message: "닉네임을 입력해주세요.",
      });
      return;
    }

    const normalizedNickname = nickname.trim();

    if (normalizedNickname.length < 2 || normalizedNickname.length > 10) {
      res.status(400).json({
        message: "닉네임은 2자 이상 10자 이하로 입력해주세요.",
      });
      return;
    }

    const user = await updateUserNickname(userId, normalizedNickname);

    if (!user) {
      res.status(404).json({
        message: "사용자 정보를 찾을 수 없습니다.",
      });
      return;
    }

    res.status(200).json({
      message: "프로필이 수정되었습니다.",
      user,
    });
  } catch (error) {
    console.error("프로필 수정 오류:", error);

    res.status(500).json({
      message: "프로필 수정 중 오류가 발생했습니다.",
    });
  }
}

export function logout(req: Request, res: Response) {
  req.session.destroy((error) => {
    if (error) {
      res.status(500).json({
        message: "로그아웃에 실패했습니다.",
      });
      return;
    }

    res.clearCookie("dearly.sid");

    res.status(200).json({
      message: "로그아웃되었습니다.",
    });
  });
}
