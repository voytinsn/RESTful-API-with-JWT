import { Request, Response, NextFunction } from "express";
import { verifyJWT, UserJwtPayload } from "../services/jwt";
import { VerifyErrors } from "jsonwebtoken";

const authTypeBearer = "Bearer";

/**
 * Прерывает обработку запроса, если не передан валидный jwt
 * в заголовке authorization
 *
 * @param req
 * @param res
 * @param next
 */
const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  console.log("authMiddleware invoked");
  const authHeader = req.headers["authorization"];
  console.log("authHeader", authHeader);

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: "not logged in",
    });
  }

  // Разделение строки заголовка на массив ["Bearer", {token}]
  const authHeaderParts = authHeader.split(" ");

  if (authHeaderParts[0] !== authTypeBearer || !authHeaderParts[1]) {
    return res.status(401).json({
      success: false,
      message: "bad authorization header",
    });
  }

  const jwt: string = authHeaderParts[1];
  verifyJWT(jwt)
    .then((decoded: UserJwtPayload) => {
      console.log("decoded jwt:", decoded);
      req.app.set("jwt", decoded);
      next();
    })
    .catch((err: VerifyErrors) => {
      return res.status(401).json({
        success: false,
        message: err.message,
      });
    });
};

export default authMiddleware;
