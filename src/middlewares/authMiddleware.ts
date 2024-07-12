import { Request, Response, NextFunction } from "express";
import { decodeJwt, UserJwtPayload } from "../services/jwt";
import { User, UsersModel } from "../DB/models/usersModel";

const authTypeBearer = "Bearer";

/**
 * Прерывает обработку запроса, если не передан валидный jwt
 * в заголовке authorization
 *
 * @param req
 * @param res
 * @param next
 */
export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("authMiddleware invoked");

  const getAuthHeader = async (): Promise<string> => {
    const authHeader = req.headers["authorization"];
    console.log("authHeader", authHeader);

    if (!authHeader) {
      console.log("Empty authHeader");
      throw new Error("not logged in");
    }

    return authHeader;
  };

  const getJwtFromHeader = (authHeader: string): string => {
    // Разделение строки заголовка на массив ["Bearer", {token}]
    const authHeaderParts = authHeader.split(" ");

    if (authHeaderParts[0] !== authTypeBearer || !authHeaderParts[1]) {
      console.log("Wrong auth header format");
      throw new Error("bad authorization header");
    }

    return authHeaderParts[1];
  };

  const setJwt = (decoded: UserJwtPayload) => {
    req.app.set("jwt", decoded);
    return decoded;
  };

  // Поиск пользователя в БД чтобы затем узнать актуальную роль
  const getDbUser = async (decoded: UserJwtPayload) => {
    const dbUser = await UsersModel.getById(decoded.id);

    if (!dbUser) {
      throw new Error("User does not exist in the database")
    }

    return dbUser;
  }

  const setRole = (dbUser: User) => {
    req.app.set("userRole", dbUser.role);
  }

  const onError = (error: Error) => {
    return res.status(401).json({
      success: false,
      message: error.message,
    });
  };

  getAuthHeader()
    .then(getJwtFromHeader)
    .then(decodeJwt)
    .then(setJwt)
    .then(getDbUser)
    .then(setRole)
    .then(next)
    .catch(onError);
};

/**
 * Обертка для authMiddleware, выполняется только для POST запросов
 *
 * @param req
 * @param res
 * @param next
 */
export const authMiddlewarePost = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("authMiddlewarePost invoked");
  if (req.method === "POST") {
    authMiddleware(req, res, next);
  } else {
    next();
  }
};

/**
 * Обертка для authMiddleware, выполняется только для PUT запросов
 *
 * @param req
 * @param res
 * @param next
 */
export const authMiddlewarePut = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("authMiddlewarePut invoked");
  if (req.method === "PUT") {
    authMiddleware(req, res, next);
  } else {
    next();
  }
};

/**
 * Обертка для authMiddleware, выполняется только для DELETE запросов
 *
 * @param req
 * @param res
 * @param next
 */
export const authMiddlewareDelete = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("authMiddlewareDelete invoked");
  if (req.method === "DELETE") {
    authMiddleware(req, res, next);
  } else {
    next();
  }
};
