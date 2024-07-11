const router = require("express").Router();
import controller from "../controllers/usersController";

router.post("/login", controller.login);

export default router;
