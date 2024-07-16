import axios, { AxiosResponse } from "axios";
import { roleAdmin, roleReader } from "./src/rights";
import { isDateValid } from "./src/services/dateValidator";

const baseUrl = "http://localhost:3000";
const adminName = "admin_username_for_testing";
const adminPass = "admin_password_for_testing";
const adminEmail = "admin_username_for_testing@jestjs.io";
const readerName = "reader_username_for_testing";
const readerPass = "reader_password_for_testing";
const readerEmail = "reader_username_for_testing@jestjs.io";
const errNotLoggedIn = "not logged in";
const errAccessDenied = "Access denied";
const errBookNotFound = "Book with specified id was not found";

const firstBook = {
  title: "Война и мир",
  author: "Лев Толстой",
  publicationDate: "1867-01-01T00:00:00.000Z",
  genres: ["Роман", "Историческая проза", "Исторический жанр"],
};

const secondBook = {
  title: "1984",
  author: "Джордж Оруэлл",
  publicationDate: "1949-01-01T00:00:00.000Z",
  genres: ["Антиутопия", "Политическая фантастика"],
};

let firstBookId: number;
let secondBookId: number;
let adminId: number;
let adminJwt: string;
let readerId: number;
let readerJwt: string;

type UserInfo = {
  id: number;
  username: string;
  email: string;
  jwtExpireDate: string;
  role: string;
};

/**
 * Получение данных авторизованного пользователя.
 * Используется в нескольких блоках
 */
const getUserInfo = async (jwt: string): Promise<AxiosResponse> => {
  return axios.get(baseUrl + "/users/me", {
    headers: { Authorization: `Bearer ${jwt}` },
  });
};

// #region Ресурс users
describe("Регистрация пользователей", () => {
  const run = () => {
    test("Регистрация админа", registerAdmin);
    test("Регистрация читателя", registerReader);
    test("Отправка пустого запроса", registerEmptyBody);
    test("Попытка регистрации с занятым username", registerSameName);
    test("Попытка регистрации с занятым email", registerSameEmail);
    test(
      "Попытка регистрации с email ошибочного формата",
      registerInvalidEmail
    );
  };

  const urlRegister = baseUrl + "/users/register";
  const errorNameExists = "User with the specified name already exists";
  const errorEmailExists =
    "User with the specified email address already exists";
  const errorUserNotSpecified = "Username, password or email is not specified";
  const errorInvalidEmail = "Email is invalid";
  const invalidEmail = "invalid.email@ru";

  const payloadAdmin = {
    username: adminName,
    password: adminPass,
    email: adminEmail,
  };

  const payloadReader = {
    username: readerName,
    password: readerPass,
    email: readerEmail,
  };

  const registerAdmin = async () => {
    const res: AxiosResponse = await axios.post(urlRegister, payloadAdmin);

    expect(res.status).toBe(201);
    expect(res.headers["content-type"]).toBe("application/json; charset=utf-8");
    expect(res.data.username).toBe(adminName);
    expect(res.data.role).toBe(roleAdmin);
    adminId = res.data.id;
  };

  const registerReader = async () => {
    const res: AxiosResponse = await axios.post(urlRegister, payloadReader);

    expect(res.status).toBe(201);
    expect(res.headers["content-type"]).toBe("application/json; charset=utf-8");
    expect(res.data.username).toBe(readerName);
    expect(res.data.role).toBe(roleAdmin);
    readerId = res.data.id;
  };

  const registerSameName = () => {
    axios
      .post(urlRegister, {
        ...payloadReader,
        email: payloadReader.email + "other",
      })
      .catch((error) => {
        const res = error.response;
        expect(res.status).toBe(400);
        expect(res.headers["content-type"]).toBe(
          "application/json; charset=utf-8"
        );
        expect(res.data.message).toBe(errorNameExists);
      });
  };

  const registerSameEmail = () => {
    axios
      .post(urlRegister, {
        ...payloadReader,
        username: payloadReader.username + "other",
      })
      .catch((error) => {
        const res = error.response;
        expect(res.status).toBe(400);
        expect(res.headers["content-type"]).toBe(
          "application/json; charset=utf-8"
        );
        expect(res.data.message).toBe(errorEmailExists);
      });
  };

  const registerInvalidEmail = () => {
    const payload = {
      username: readerName + "other",
      password: readerPass,
      email: invalidEmail,
    };

    axios.post(urlRegister, payload).catch((error) => {
      const res = error.response;
      expect(res.status).toBe(400);
      expect(res.headers["content-type"]).toBe(
        "application/json; charset=utf-8"
      );
      expect(res.data.message).toBe(errorInvalidEmail);
    });
  };

  const registerEmptyBody = () => {
    axios.post(urlRegister, {}).catch((error) => {
      const res = error.response;
      expect(res.status).toBe(400);
      expect(res.headers["content-type"]).toBe(
        "application/json; charset=utf-8"
      );
      expect(res.data.message).toBe(errorUserNotSpecified);
    });
  };

  run();
});

describe("Авторизация с получением JWT", () => {
  const run = () => {
    test("Авторизация под администратором", loginAdmin);
    test("Авторизация под читателем", loginReader);
    test(
      "Получение ожидаемого отказа при авторизации с ошибочным логином",
      loginWrongUsername
    );
    test(
      "Получение ожидаемого отказа при авторизации с ошибочным паролем",
      loginWrongPassword
    );
    test(
      "Получение ожидаемого отказа при авторизации с пустым телом запроса",
      loginEmptyBody
    );
  };

  const urlLogin = baseUrl + "/users/login";
  const errNameOrPass = "Wrong username or password";
  const errNotSpecified = "Username or password is not specified";

  const payloadAdmin = {
    username: adminName,
    password: adminPass,
  };

  const payloadReader = {
    username: readerName,
    password: readerPass,
  };

  const loginAdmin = async () => {
    const res = await axios.post(urlLogin, payloadAdmin);
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toBe("application/json; charset=utf-8");
    expect(res.data.hasOwnProperty("token")).toBe(true);
    adminJwt = res.data.token;
  };

  const loginReader = async () => {
    const res = await axios.post(urlLogin, payloadReader);
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toBe("application/json; charset=utf-8");
    expect(res.data.hasOwnProperty("token")).toBe(true);
    readerJwt = res.data.token;
  };

  const loginWrongUsername = () => {
    expect.assertions(3);
    return axios
      .post(urlLogin, {
        ...payloadReader,
        username: payloadReader.username + "wrong",
      })
      .catch((error) => {
        const res = error.response;
        expect(res.status).toBe(401);
        expect(res.headers["content-type"]).toBe(
          "application/json; charset=utf-8"
        );
        expect(res.data.message).toBe(errNameOrPass);
      });
  };

  const loginWrongPassword = () => {
    expect.assertions(3);
    return axios
      .post(urlLogin, {
        ...payloadReader,
        username: payloadReader.password + "wrong",
      })
      .catch((error) => {
        const res = error.response;
        expect(res.status).toBe(401);
        expect(res.headers["content-type"]).toBe(
          "application/json; charset=utf-8"
        );
        expect(res.data.message).toBe(errNameOrPass);
      });
  };

  const loginEmptyBody = () => {
    expect.assertions(3);
    return axios.post(urlLogin, {}).catch((error) => {
      const res = error.response;
      expect(res.status).toBe(400);
      expect(res.headers["content-type"]).toBe("text/html; charset=utf-8");
      expect(res.data).toBe(errNotSpecified);
    });
  };

  run();
});

describe("Получение данных авторизованного пользователя", () => {
  const run = () => {
    test("Получение данных админа", getAdminInfo);
    test("Получение данных читателя", getReaderInfo);
    test(
      "Получение ожидаемого отказа при попытке получения данных пользователя без отправки JWT",
      getInfoWithNoJwt
    );
    test(
      "Получение ожидаемого отказа при попытке получения данных пользователя c ошибочным JWT",
      getInfoWithWrongJwt
    );
  };

  const urlMe = baseUrl + "/users/me";
  const errInvalidToken = "invalid token";

  const getAdminInfo = async () => {
    const res = await getUserInfo(adminJwt);
    const userInfo = res.data as UserInfo;

    expect(userInfo.id).toBe(adminId);
    expect(userInfo.username).toBe(adminName);
    expect(userInfo.email).toBe(adminEmail);
    expect(userInfo.role).toBe(roleAdmin);
    expect(isDateValid(userInfo.jwtExpireDate)).toBe(true);
  };

  const getReaderInfo = async () => {
    const res = await getUserInfo(readerJwt);
    const userInfo = res.data as UserInfo;

    expect(userInfo.id).toBe(readerId);
    expect(userInfo.username).toBe(readerName);
    expect(userInfo.email).toBe(readerEmail);
    expect(userInfo.role).toBe(roleAdmin); // изначально читатель тоже с ролью админ
    expect(isDateValid(userInfo.jwtExpireDate)).toBe(true);
  };

  const getInfoWithNoJwt = () => {
    expect.assertions(2);
    return axios.get(urlMe).catch((error) => {
      let res = error.response;
      expect(res.status).toBe(401);
      expect(res.data.message).toBe(errNotLoggedIn);
    });
  };

  const getInfoWithWrongJwt = () => {
    expect.assertions(2);
    return axios
      .get(urlMe, {
        headers: { Authorization: `Bearer wrong${readerJwt}` },
      })
      .catch((error) => {
        let res = error.response;
        expect(res.status).toBe(401);
        expect(res.data.message).toBe(errInvalidToken);
      });
  };

  run();
});

describe("Изменение роли пользователя", () => {
  const run = () => {
    test(
      "Проверка возможности установить роль reader",
      userReaderSetRoleReader
    );
    test(
      "Получение ожидаемого отказа при попытке изменить роль без прав на это",
      trySetRoleAsReader
    );
    test(
      "Получение ожидаемого отказа при попытке изменить роль без отправки JWT",
      trySetRoleWithNoJwt
    );
    test("Проверка возможности установить роль admin", userReaderSetRoleAdmin);

    test(
      "Установка Читателю роли reader для дальнейших тестов",
      userReaderSetRoleReader
    );
  };

  const urlUsers = baseUrl + "/users";

  const userReaderSetRoleReader = async () => {
    const payload = {
      role: roleReader,
    };

    const config = {
      headers: { Authorization: `Bearer ${adminJwt}` },
    };

    const res = await axios.put(
      `${urlUsers}/${readerId}/role`,
      payload,
      config
    );

    const userInfo = res.data as UserInfo;

    expect(res.status).toBe(200);
    expect(userInfo.id).toBe(readerId);
    expect(userInfo.username).toBe(readerName);
    expect(userInfo.email).toBe(readerEmail);
    expect(userInfo.role).toBe(roleReader);
  };

  const userReaderSetRoleAdmin = async () => {
    const payload = {
      role: roleAdmin,
    };

    const config = {
      headers: { Authorization: `Bearer ${adminJwt}` },
    };

    const res = await axios.put(
      `${urlUsers}/${readerId}/role`,
      payload,
      config
    );

    const userInfo = res.data as UserInfo;

    expect(res.status).toBe(200);
    expect(userInfo.id).toBe(readerId);
    expect(userInfo.username).toBe(readerName);
    expect(userInfo.email).toBe(readerEmail);
    expect(userInfo.role).toBe(roleAdmin);
  };

  const trySetRoleAsReader = () => {
    const payload = {
      role: roleAdmin,
    };

    const config = {
      headers: { Authorization: `Bearer ${readerJwt}` },
    };

    expect.assertions(2);

    return axios
      .put(`${urlUsers}/${readerId}/role`, payload, config)
      .catch((error) => {
        const res = error.response;

        expect(res.status).toBe(403);
        expect(res.data.message).toBe(errAccessDenied);
      });
  };

  const trySetRoleWithNoJwt = () => {
    const payload = {
      role: roleAdmin,
    };

    expect.assertions(2);

    return axios.put(`${urlUsers}/${readerId}/role`, payload).catch((error) => {
      const res = error.response;

      expect(res.status).toBe(401);
      expect(res.data.message).toBe(errNotLoggedIn);
    });
  };

  run();
});
// #endregion

// #region Ресурс books
describe("Добавление книг", () => {
  const run = () => {
    test("Добавление книг", addBooks);
    test(
      "Получение ожидаемого отказа при попытке добавить книгу без авторизации",
      tryAddWithNoAuth
    );
    test(
      "Получение ожидаемого отказа при попытке добавить книгу с ролью reader",
      tryAddAsReader
    );
    test(
      "Проверка правильности ответа при попытке добавить дубликат",
      tryAddDuplicate
    );
    test(
      "Проверка правильности ответа при попытке добавить книгу без указания автора",
      tryAddWithNoAuthor
    );
    test(
      "Проверка правильности ответа при попытке добавить книгу без указания названия",
      tryAddWithNoTitle
    );

    test(
      "Проверка правильности ответа при попытке добавить книгу с указанием невалидной даты",
      tryAddWithInvalidDate
    );
  };

  const url = baseUrl + "/books";
  const errAlreadyExists =
    "Book with the specified title and author already exists";
  const errNotSpecified = "Title, author or genres is not specified";
  const errInvalidDate = "Invalid publicationDate value";

  const addBooks = async () => {
    const config = {
      headers: { Authorization: `Bearer ${adminJwt}` },
    };

    let res = await axios.post(url, firstBook, config);
    expect(res.data.title).toBe("Война и мир");
    expect(res.data.author).toBe("Лев Толстой");
    expect(new Date(res.data.publicationDate)).toEqual(new Date("1867-01-01"));
    expect(res.data.genres).toEqual([
      "Роман",
      "Историческая проза",
      "Исторический жанр",
    ]);
    firstBookId = res.data.id;

    res = await axios.post(url, secondBook, config);
    expect(res.data.title).toBe("1984");
    expect(res.data.author).toBe("Джордж Оруэлл");
    expect(new Date(res.data.publicationDate)).toEqual(new Date("1949-01-01"));
    expect(res.data.genres).toEqual(["Антиутопия", "Политическая фантастика"]);
    secondBookId = res.data.id;
  };

  const tryAddWithNoAuth = () => {
    expect.assertions(2);
    return axios.post(url, firstBook).catch((error) => {
      const res = error.response;
      expect(res.status).toBe(401);
      expect(res.data.message).toBe(errNotLoggedIn);
    });
  };

  const tryAddAsReader = () => {
    const config = {
      headers: { Authorization: `Bearer ${readerJwt}` },
    };

    expect.assertions(2);
    return axios.post(url, firstBook, config).catch((error) => {
      const res = error.response;
      expect(res.status).toBe(403);
      expect(res.data.message).toBe(errAccessDenied);
    });
  };

  const tryAddDuplicate = () => {
    const config = {
      headers: { Authorization: `Bearer ${adminJwt}` },
    };
    expect.assertions(2);
    return axios.post(url, firstBook, config).catch((error) => {
      const res = error.response;

      expect(res.status).toBe(409);
      expect(res.data.message).toBe(errAlreadyExists);
    });
  };

  const tryAddWithNoAuthor = () => {
    const config = {
      headers: { Authorization: `Bearer ${adminJwt}` },
    };
    const payload = { ...firstBook, author: null };

    expect.assertions(2);

    return axios.post(url, payload, config).catch((error) => {
      const res = error.response;

      expect(res.status).toBe(400);
      expect(res.data.message).toBe(errNotSpecified);
    });
  };

  const tryAddWithNoTitle = () => {
    const config = {
      headers: { Authorization: `Bearer ${adminJwt}` },
    };
    const payload = { ...firstBook, title: null };

    expect.assertions(2);

    return axios.post(url, payload, config).catch((error) => {
      const res = error.response;

      expect(res.status).toBe(400);
      expect(res.data.message).toBe(errNotSpecified);
    });
  };

  const tryAddWithInvalidDate = () => {
    const config = {
      headers: { Authorization: `Bearer ${adminJwt}` },
    };
    const payload = {
      title: "test name",
      author: "test_author",
      publicationDate: "invalid",
      genres: ["test"],
    };

    expect.assertions(2);

    return axios.post(url, payload, config).catch((error) => {
      const res = error.response;

      expect(res.status).toBe(400);
      expect(res.data.message).toBe(errInvalidDate);
    });
  };

  run();
});

describe("Получение данных о книгах", () => {
  const run = () => {
    test("Получение списка книг", getAllBooks);
    test("Получение информации о книге по id", getBookById);
    test(
      "Проверка корректности ответа при попытке получить данные о книге со строкой вместо id",
      tryGetBookWithInvalidId
    );
    test(
      "Проверка корректности ответа при попытке получить данные о книге с несуществующим id",
      tryGetBookNonexistentId
    );
  };

  const url = baseUrl + "/books";
  const errWrongId = "Wrong id";

  const getAllBooks = async () => {
    const res = await axios.get(url);

    expect(res.data).toEqual([
      { ...firstBook, id: firstBookId },
      { ...secondBook, id: secondBookId },
    ]);
  };

  const getBookById = async () => {
    const res = await axios.get(`${url}/${secondBookId}`);

    expect(res.data).toEqual({ ...secondBook, id: secondBookId });
  };

  const tryGetBookWithInvalidId = async () => {
    expect.assertions(2);
    return axios.get(`${url}/invalid_id`).catch((error) => {
      const res = error.response;

      expect(res.status).toBe(400);
      expect(res.data.message).toBe(errWrongId);
    });
  };

  const tryGetBookNonexistentId = async () => {
    expect.assertions(2);
    return axios.get(`${url}/9999999`).catch((error) => {
      const res = error.response;

      expect(res.status).toBe(404);
      expect(res.data.message).toBe(errBookNotFound);
    });
  };

  run();
});

describe("Обновление данных о книге", () => {
  const run = () => {
    test("Обновление данных о книге с ролью admin", changeBookAsAdmin);
    test(
      "Проверка корректности ответа при попытке обновления данных о книге с ролью reader",
      tryChangeBookAsReader
    );
    test(
      "Проверка правильности ответа при попытке обновить данные о книге без указания автора",
      tryUpdateWithNoAuthor
    );
    test(
      "Проверка правильности ответа при попытке обновить данные о книге без указания названия",
      tryUpdateWithNoTitle
    );

    test(
      "Проверка правильности ответа при попытке обновить данные о книге с указанием невалидной даты",
      tryUpdateWithInvalidDate
    );
  };

  const url = `${baseUrl}/books/`;
  const errNotSpecified = "Title, author or genres is not specified";
  const errInvalidDate = "Invalid publicationDate value";

  const changeBookAsAdmin = async () => {
    const config = {
      headers: { Authorization: `Bearer ${adminJwt}` },
    };

    const payload = {
      ...firstBook,
      id: firstBookId,
      title: "Война и мир. Том 1",
    };

    const res = await axios.put(url + firstBookId, payload, config);

    expect(res.status).toBe(200);
    expect(res.data).toEqual(payload);
  };

  const tryChangeBookAsReader = async () => {
    const config = {
      headers: { Authorization: `Bearer ${readerJwt}` },
    };

    const payload = {
      ...firstBook,
      id: firstBookId,
      title: "Война и мир. Том 1",
    };

    expect.assertions(2);

    return axios.put(url + firstBookId, payload, config).catch((error) => {
      const res = error.response;

      expect(res.status).toBe(403);
      expect(res.data.message).toBe(errAccessDenied);
    });
  };

  const tryUpdateWithNoAuthor = () => {
    const config = {
      headers: { Authorization: `Bearer ${adminJwt}` },
    };
    const payload = { ...firstBook, author: null };

    expect.assertions(2);

    return axios.put(url + firstBookId, payload, config).catch((error) => {
      const res = error.response;

      expect(res.status).toBe(400);
      expect(res.data.message).toBe(errNotSpecified);
    });
  };

  const tryUpdateWithNoTitle = () => {
    const config = {
      headers: { Authorization: `Bearer ${adminJwt}` },
    };
    const payload = { ...firstBook, title: null };

    expect.assertions(2);

    return axios.put(url + firstBookId, payload, config).catch((error) => {
      const res = error.response;

      expect(res.status).toBe(400);
      expect(res.data.message).toBe(errNotSpecified);
    });
  };

  const tryUpdateWithInvalidDate = () => {
    const config = {
      headers: { Authorization: `Bearer ${adminJwt}` },
    };
    const payload = {
      title: "test name",
      author: "test_author",
      publicationDate: "invalid",
      genres: ["test"],
    };

    expect.assertions(2);

    return axios.put(url + firstBookId, payload, config).catch((error) => {
      const res = error.response;

      expect(res.status).toBe(400);
      expect(res.data.message).toBe(errInvalidDate);
    });
  };

  run();
});

describe("Удаление книги", () => {
  const run = () => {
    test(
      "Проверка корректности ответа при попытке удалить книгу с ролью reader",
      tryDeleteBooksAsReader
    );
    test(
      "Проверка корректности ответа при попытке удалить книгу c несуществующим id",
      tryDeleteNonexistentBook
    );
    test("Удаление книги", deleteBook);
  };

  const url = baseUrl + "/books/";

  const tryDeleteBooksAsReader = () => {
    const config = {
      headers: { Authorization: `Bearer ${readerJwt}` },
    };

    expect.assertions(2);

    return axios.delete(url + firstBookId, config).catch((error) => {
      const res = error.response;

      expect(res.status).toBe(403);
      expect(res.data.message).toBe(errAccessDenied);
    });
  };

  const tryDeleteNonexistentBook = () => {
    const config = {
      headers: { Authorization: `Bearer ${adminJwt}` },
    };

    expect.assertions(2);

    return axios.delete(url + 999999, config).catch((error) => {
      const res = error.response;

      expect(res.status).toBe(404);
      expect(res.data.message).toBe(errBookNotFound);
    });
  };

  const deleteBook = async () => {
    const config = {
      headers: { Authorization: `Bearer ${adminJwt}` },
    };

    const res = await axios.delete(url + firstBookId, config);

    expect(res.status).toBe(200);
    expect(res.data.success).toBe(true);

    axios.delete(url + firstBookId, config).catch((error) => {
      expect(error.response.status).toBe(404);
    });

    // Удаляем вторую кингу чтобы в базе не осталось тестовых
    await axios.delete(url + secondBookId, config);
  };

  run();
});
// #endregion
