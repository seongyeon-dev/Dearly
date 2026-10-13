import { Router } from "express";
import { getBudget, upsertBudget } from "../controllers/budgetController";

const router = Router();

router.get("/", getBudget);
router.put("/", upsertBudget);

export default router;
