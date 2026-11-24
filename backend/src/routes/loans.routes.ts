import { Router } from "express";
import { createLoan, listLoans, listMyLoans, loanSummary, returnLoanById, updateLoan } from "../controllers/loans.controller.js";
import { authMiddleware, requireRole } from "../middlewares/auth.middleware.js";
import { validateBody, validateQuery } from "../middlewares/validate.js";
import { createLoanSchema, listLoansQuerySchema, updateLoanSchema } from "../schemas/loan.schema.js";

const router = Router();
const onlyAdmin = [authMiddleware, requireRole("admin")];

router.get("/summary", ...onlyAdmin, loanSummary);
router.get("/mine", authMiddleware, listMyLoans);
router.get("/", ...onlyAdmin, validateQuery(listLoansQuerySchema), listLoans);
router.post("/", authMiddleware, validateBody(createLoanSchema), createLoan);
router.patch("/:id", ...onlyAdmin, validateBody(updateLoanSchema), updateLoan);
router.post("/:id/return", authMiddleware, returnLoanById);

export default router;
