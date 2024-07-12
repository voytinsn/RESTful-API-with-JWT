const router = require("express").Router();
import controller from "../controllers/usersController";
import {authMiddleware} from "../middlewares/authMiddleware";


router.post("/register", controller.register);

router.post("/login", controller.login);

router.use('/me', authMiddleware)
router.get("/me", controller.me)

export default router;
