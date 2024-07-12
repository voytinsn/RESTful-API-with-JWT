const router = require("express").Router();
import controller from "../controllers/usersController";
import { requireUpdateRights } from "../middlewares/accessMiddleware";
import { authMiddleware } from "../middlewares/authMiddleware";

router.post("/register", controller.register);

router.post("/login", controller.login);

router.use("/me", authMiddleware);
router.get("/me", controller.me);

router.use("/:id/role", [authMiddleware, requireUpdateRights]);
router.put("/:id/role", controller.updateRole);

export default router;
