import "dotenv/config";
import express, { Express, Request, Response } from "express";
import bodyParser from "body-parser";
import usersRouter from "./routers/usersRouter";
const morgan = require("morgan");


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
