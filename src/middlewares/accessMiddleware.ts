import { Request, Response, NextFunction } from "express";
import { UserJwtPayload } from "../services/jwt";
import { RolesMap, RightsBitmask } from "../rights";

const authTypeBearer = "Bearer";

/**
 * Прерывает обработку запроса если клиент не
 * имеет права на создание ресурсов
 *
 * @param req
 * @param res
 * @param next
 */
export const requireCreateRights = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("requireCreateRights invoked");

  /* Ресурсы создаются POST запросами, 
  в иных случаях проверка прав на создание не требуется */
  if (req.method !== "POST") {
    return next();
  }

  const role: keyof RolesMap = req.app.get("userRole") as keyof RolesMap;

  if (!(RolesMap[role] & RightsBitmask.CREATE)) {
    return res.status(403).json({ message: "Access denied" });
  } else {
    next();
  }
};

/**
 * Прерывает обработку запроса если клиент не
 * имеет права на обновление ресурсов
 *
 * @param req
 * @param res
 * @param next
 */
export const requireUpdateRights = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("requireUpdateRights invoked");

  /* Ресурсы обновляются PUT запросами, 
  в иных случаях проверка прав на изменение не требуется */
  if (req.method !== "PUT") {
    return next();
  }

  const role: keyof RolesMap = req.app.get("userRole") as keyof RolesMap;

  if (!(RolesMap[role] & RightsBitmask.UPDATE)) {
    return res.status(403).json({ message: "Access denied" });
  } else {
    next();
  }
};

/**
 * Прерывает обработку запроса если клиент не
 * имеет права на удаление ресурсов
 *
 * @param req
 * @param res
 * @param next
 */
export const requireDeleteRights = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("requireDeleteRights invoked");

  /* Ресурсы обновляются DELETE запросами, 
  в иных случаях проверка прав на удаление не требуется */
  if (req.method !== "DELETE") {
    return next();
  }

  const role: keyof RolesMap = req.app.get("userRole") as keyof RolesMap;

  if (!(RolesMap[role] & RightsBitmask.DELETE)) {
    return res.status(403).json({ message: "Access denied" });
  } else {
    next();
  }
};
