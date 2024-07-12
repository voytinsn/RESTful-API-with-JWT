import { Request, Response } from "express";
import { User, UsersModel } from "../DB/models/usersModel";
import { createSHA256Hash } from "../services/cryptoHelper";
import { generateJWT, UserJwtPayload } from "../services/jwt";
import { roleAdmin, RolesMap } from "../rights";

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

  // Проверяет отправленные клиентом данные
  const validate = async () => {
    if (!username || !password || !email) {
      res.status(400);
      throw new Error("Username, password or email is not specified");
    }
  };

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
    res.status(201).json(newUser);
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
    role: roleAdmin,
  };

  validate()
    .then(() => checkIbDb(newUser))
    .then(addUser)
    .then(respond)
    .catch(onError);
};

/**
 * Эндпоинт для получения данных текущего пользователя
 *
 * @param req
 * @param res
 */
const me = async (req: Request, res: Response) => {
  // Получение декодированного jwt
  const userJwtPayload: UserJwtPayload = res.app.get("jwt");

  // Определение даты и времени истечения токена
  const expireDate = new Date(userJwtPayload.exp! * 1000);

  /**
   * Извлечение из БД данных о пользователе.
   * Данные из jwt не используются чтобы гарантировать актуальность
   */
  const dbUser: User | null = await UsersModel.getByUsername(
    userJwtPayload.username
  );

  if (dbUser) {
    res.json({
      id: dbUser.id,
      username: dbUser.username,
      email: dbUser.email,
      jwtExpireDate: expireDate,
      role: dbUser.role,
    });
  } else {
    res.status(404);
  }
};

/**
 * Эндпоинт для обновления роли сотрудника в БД
 *
 * @param req
 * @param res
 */
const updateRole = (req: Request, res: Response) => {
  const id: number = Number(req.params["id"]);
  const { role } = req.body;

  const validate = async () => {
    res.status(400);

    if (isNaN(id) || id < 1) {
      throw new Error("Invalid id");
    } else if (!role) {
      throw new Error("role is not specified");
    } else if (!RolesMap.hasOwnProperty(role)) {
      throw new Error("Invalid role");
    } else {
      res.status(200);
    }
  };

  const getDbUser = async (): Promise<User> => {
    const user: User | null = await UsersModel.getById(id);

    if (!user) {
      res.status(404);
      throw new Error("User with specified id was not found");
    }

    return user;
  };

  const changeRole = (user: User): User => {
    user.role = role;
    return user;
  };

  const updateUserInDb = async (user: User): Promise<User> => {
    UsersModel.updateUser(user);
    return user;
  };

  const respond = (user: User) => {
    delete user.password;
    res.json(user);
  };

  const onError = (error: Error) => {
    if (res.statusCode == 200) {
      res.status(500);
    }

    res.json({
      message: error.message,
    });
  };

  validate()
    .then(getDbUser)
    .then(changeRole)
    .then(updateUserInDb)
    .then(respond)
    .catch(onError);
};

export default { login, register, me, updateRole };
