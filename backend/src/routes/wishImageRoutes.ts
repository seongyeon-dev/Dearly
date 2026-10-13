import { Router } from "express";
import upload from "../middlewares/upload";

import {
  getWishImagesController,
  createWishImageController,
  deleteWishImageController,
} from "../controllers/wishImageController";

const router = Router();

router.get("/:wishId/images", getWishImagesController);

router.post(
  "/:wishId/images",
  upload.single("image"),
  createWishImageController,
);

router.delete("/:wishId/images/:imageId", deleteWishImageController);

export default router;
