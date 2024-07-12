const router = require("express").Router();
import controller from "../controllers/booksController";

import {
  authMiddlewarePost,
  authMiddlewareDelete,
  authMiddlewarePut,
} from "../middlewares/authMiddleware";

import {
  requireCreateRights,
  requireDeleteRights,
  requireUpdateRights,
} from "../middlewares/accessMiddleware";

router.use("/", [authMiddlewarePost, requireCreateRights]);
router.post("/", controller.add);
router.get("/", controller.getAll);

router.use("/:id", [
  authMiddlewareDelete,
  authMiddlewarePut,
  requireDeleteRights,
  requireUpdateRights,
]);
router.get("/:id", controller.getById);
router.put("/:id", controller.update);
router.delete("/:id", controller.deleteById);

export default router;
