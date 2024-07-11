const router = require("express").Router();
import controller from "../controllers/usersController";

router.post("/login", controller.login);
router.post("/register", controller.register);

export default router;
