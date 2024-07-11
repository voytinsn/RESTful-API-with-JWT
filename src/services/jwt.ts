import { sign, verify, JwtPayload } from "jsonwebtoken";
import { User } from "../DB/models/usersModel";

const secret: string = process.env.JWT_SECRET!;

/**
 * Создает JWT токен для пользователя
 *
 * @param user
 * @returns JWT токен
 */
export const generateJWT = (user: User): Promise<string> => {
  const p = new Promise<string>((resolve, reject) => {
    sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      secret,
      {
        expiresIn: "1d",
        subject: "userInfo",
      },
      (err, token) => {
        if (err) reject(err);
        console.log("jwt created:", token);
        resolve(token!);
      }
    );
  });
  return p;
};

/**
 * Проверяет JWT токен
 *
 * @param token
 * @returns декодированный токен
 */
export const verifyJWT = (token: string): Promise<UserJwtPayload> => {
  const p = new Promise<UserJwtPayload>((resolve, reject) => {
    verify(token, secret, (err, decoded) => {
      if (err) reject(err);
      resolve(decoded as UserJwtPayload);
    });
  });
  return p;
};

export interface UserJwtPayload extends JwtPayload {
  id: number;
  username: string;
  mail: string;
}
