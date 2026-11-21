import { Router } from "express";
import { createBook, deleteBook, getBookById, listBooks, updateBook } from "../controllers/books.controller.js";
import { authMiddleware, requireRole } from "../middlewares/auth.middleware.js";
import { validateBody, validateQuery } from "../middlewares/validate.js";
import { createBookSchema, listBooksQuerySchema, updateBookSchema } from "../schemas/book.schema.js";

const router = Router();
const onlyAdmin = [authMiddleware, requireRole("admin")];

router.get("/", validateQuery(listBooksQuerySchema), listBooks);
router.get("/:id", getBookById);
router.post("/", onlyAdmin, validateBody(createBookSchema), createBook);
router.put("/:id", onlyAdmin, validateBody(updateBookSchema), updateBook);
router.patch("/:id", onlyAdmin, validateBody(updateBookSchema), updateBook);
router.delete("/:id", onlyAdmin, deleteBook);

export default router;
