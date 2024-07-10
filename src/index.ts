import express, { Express, Request, Response } from "express";
import jwt from "jsonwebtoken";
import "dotenv/config";
import { Configuration } from "ts-postgres";
import DbConnector from "./DB/DbConnector";
import { User, UsersModel } from "./DB/models/UsersModel";
import bodyParser from "body-parser";

const JWT_SECRET: string = process.env.JWT_SECRET!;

const dbConnectConf: Configuration = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT!),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

const dbConnector = new DbConnector(dbConnectConf);

const app: Express = express();
app.use(bodyParser.json());
app.set("jwt_secret", JWT_SECRET);

app.post("/users/login", (req: Request, res: Response) => {
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

  UsersModel.getByUsername(username, dbConnector)
    .then(checkPassword)
    .then(generateJWT)
    .then(respond)
    .catch(onError);
});

app.listen(process.env.PORT, () => {
  console.log(
    `[server]: Server is running at http://localhost:${process.env.PORT}`
  );
});
