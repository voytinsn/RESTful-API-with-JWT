import { Request, Response } from "express";
import { User } from "../DB/models/usersModel";
import { UsersModel } from "../DB/models/usersModel";
import { createSHA256Hash } from "../services/cryptoHelper";
import { generateJWT } from "../services/jwt";

/**
 * Эндпоинт для авторизации
 * 
 * @param req 
 * @param res 
 * @returns 
 */
const login = (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).send("Username or password is not specified");
  }

  const checkPassword = (user: User | null): User => {
    if (user === null || user.password !== createSHA256Hash(password)) {
      throw new Error("Wrong username or password");
    }

    return user;
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

/**
 * Эндпоинт для регистрации нового пользователя
 * 
 * @param req 
 * @param res 
 * @returns 
 */
const register = (req: Request, res: Response) => {
  const { username, password, email } = req.body;

  if (!username || !password || !email) {
    return res.status(400).send("Username, password or email is not specified");
  }

  // Вызовет исключение, если пользователь с таким username уже существует
  const checkIbDb = async (newUser: User): Promise<User> => {
    const dbUser = await UsersModel.getByUsername(newUser.username);
    if (dbUser !== null) {
      throw new Error("User with the specified name already exists");
    }
    return newUser;
  };

  // Добавляет пользователя в БД
  const addUser = async (newUser: User): Promise<User> => {
    const userId: number = await UsersModel.addUser(newUser);

    newUser.id = userId;
    return newUser;
  };

  // Отправляет клиенту данные созданного пользователя без хеша пароля
  const respond = (newUser: User) => {
    delete newUser.password;
    res.json(newUser);
  };

  // Отвечает клиенту в случае возникновения ошибки
  const onError = (error: Error) => {
    res.status(400).json({
      message: error.message,
    });
  };

  const newUser: User = {
    username: username,
    password: password,
    email: email,
  };

  checkIbDb(newUser).then(addUser).then(respond).catch(onError);
};

export default { login, register };
