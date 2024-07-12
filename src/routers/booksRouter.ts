const router = require("express").Router();
import controller from "../controllers/booksController";
import authMiddleware from "../middlewares/authMiddleware";
import { Request, Response, NextFunction } from "express";

// Применяем middleware для POST, PUT и DELETE запросов
router.use("/", (req: Request, res: Response, next: NextFunction) => {
  if (["POST", "PUT", "DELETE"].includes(req.method)) {
    authMiddleware(req, res, next);
  } else {
    next();
  }
});

router.post("/", controller.add);
router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.put("/:id", controller.update);
router.delete("/:id", controller.deleteById)

export default router;
