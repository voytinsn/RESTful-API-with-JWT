import "dotenv/config";
import express, { Express } from "express";
import bodyParser from "body-parser";
import usersRouter from "./routers/usersRouter";
import DbConnector from "./DB/dbConnector";
const morgan = require("morgan");

// Создание таблиц в БД, если их нет
DbConnector.instance.initTables();


const app: Express = express();
app.use(bodyParser.json());
app.use(morgan("dev"));
app.set("jwt_secret", process.env.JWT_SECRET);

app.use("/users", usersRouter);

app.listen(process.env.PORT, () => {
  console.log(
    `[server]: Server is running at http://localhost:${process.env.PORT}`
  );
});
