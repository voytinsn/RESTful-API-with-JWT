const router = require("express").Router();
import controller from "../controllers/booksController";
import authMiddleware from "../middlewares/authMiddleware";
import { Request, Response, NextFunction } from "express";

// Применяем middleware только для POST и PUT запросов
router.use("/", (req: Request, res: Response, next: NextFunction) => {
  if (req.method === "POST" || req.method === "PUT") {
    authMiddleware(req, res, next);
  } else {
    next();
  }
});

router.post("/", controller.add);
router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.put("/:id", controller.update);

export default router;
