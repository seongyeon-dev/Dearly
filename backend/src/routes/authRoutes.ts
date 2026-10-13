import { Router } from "express";
import {
  signup,
  login,
  logout,
  getCurrentUser,
  updateCurrentUser,
} from "../controllers/authController";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", getCurrentUser);
router.patch("/me", updateCurrentUser);

export default router;
