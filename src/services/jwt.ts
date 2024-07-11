import jwt from "jsonwebtoken";
import { User } from "../DB/models/usersModel";

/**
 * Создает JWT токен для пользователя
 * 
 * @param user 
 * @returns JWT токен
 */
export const generateJWT = (user: User): Promise<string> => {
  const secret: string = process.env.DB_USER!;

  const p = new Promise<string>((resolve, reject) => {
    jwt.sign(
      {
        id: user.id,
        username: user.username,
      },
      secret,
      {
        expiresIn: "1d",
        subject: "userInfo",
      },
      (err, token) => {
        if (err) {
          reject(err);
        } else {
          resolve(token!);
        }
      }
    );
  });
  return p;
};
