const router = require("express").Router();
import controller from "../controllers/booksController";
import authMiddleware from "../middlewares/authMiddleware";
import { Request, Response, NextFunction } from "express";

// Применяем middleware только для POST запросов
router.use("/", (req: Request, res: Response, next: NextFunction) => {
  if (req.method === "POST") {
    console.log("in POST");
    authMiddleware(req, res, next);
  } else {
    next();
  }
});
router.post("/", controller.add);

router.get("/", controller.getAll);

router.get("/:id", controller.getById);

export default router;
