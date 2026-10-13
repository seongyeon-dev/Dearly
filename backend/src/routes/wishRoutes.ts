import { Router } from "express";
import {
  getWishList,
  getWishDetail,
  createWish,
  updateWish,
  deleteWish,
} from "../controllers/wishController";

const router = Router();

router.get("/", getWishList);
router.get("/:id", getWishDetail);
router.post("/", createWish);
router.patch("/:id", updateWish);
router.delete("/:id", deleteWish);

export default router;
