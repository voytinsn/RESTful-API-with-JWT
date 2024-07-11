import { Request, Response } from "express";
import { User } from "../DB/models/UsersModel";
import jwt from "jsonwebtoken";
import { UsersModel } from "../DB/models/UsersModel";
import DbConnector from "../DB/DbConnector";

const login = (req: Request, res: Response) => {
  const { username, password } = req.body;
  const secret = req.app.get("jwt_secret");

  if (!username || !password) {
    return res.status(400).send("Username name or password is not specified");
  }

  const checkPassword = (user: User | null): User => {
    if (user === null || user.password !== password) {
      throw new Error("Wrong username or password");
    }

    return user;
  };

  const generateJWT = (user: User): Promise<string> => {
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

  const respond = (token: String) => {
    res.json({
      message: "logged in successfully",
      token,
    });
  };

  const onError = (error: Error) => {
    res.status(403).json({
      message: error.message,
    });
  };

  UsersModel.getByUsername(username)
    .then(checkPassword)
    .then(generateJWT)
    .then(respond)
    .catch(onError);
};

export default { login };
