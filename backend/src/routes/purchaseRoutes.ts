import { Router } from "express";

import {
  createPurchase,
  getPurchases,
  getPurchaseDetail,
  updatePurchase,
  deletePurchase,
} from "../controllers/purchaseController";

const router = Router();

router.get("/", getPurchases);
router.post("/", createPurchase);
router.get("/wish/:wishId", getPurchaseDetail);
router.patch("/wish/:wishId", updatePurchase);
router.delete("/wish/:wishId", deletePurchase);

export default router;
