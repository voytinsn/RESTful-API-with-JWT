import { sign, verify, JwtPayload } from "jsonwebtoken";
import { User } from "../DB/models/usersModel";
import { RolesMap } from "../rights";

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
        role: user.role,
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
export const decodeJwt = (token: string): Promise<UserJwtPayload> => {
  const p = new Promise<UserJwtPayload>((resolve, reject) => {
    verify(token, secret, (err, decoded) => {
      if (err) {
        console.log("JWT validation error:", err.message);
        reject(err);
      }
      console.log("decoded JWT: ", decoded);
      resolve(decoded as UserJwtPayload);
    });
  });
  return p;
};

export interface UserJwtPayload extends JwtPayload {
  id: number;
  username: string;
  mail: string;
  role: keyof RolesMap;
}
