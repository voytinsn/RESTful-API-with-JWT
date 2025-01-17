import { Request, Response } from "express";
import { Book, BooksModel } from "../DB/models/booksModel";
import { isDateValid } from "../services/dateValidator";

/**
 * Эндпоинт для добавления книги
 *
 * @param req
 * @param res
 * @returns
 */
const add = (req: Request, res: Response) => {
  const { title, author, publicationDate, genres } = req.body;

  // Проверяет отправленные клиентом данные
  const validatePayload = async () => {
    if (!title || !author || !genres) {
      res.status(400);
      throw new Error("Title, author or genres is not specified");
    }

    if (publicationDate && !isDateValid(publicationDate)) {
      res.status(400);
      throw new Error("Invalid publicationDate value");
    }
  };

  // Вызовет исключение, если книга с таким названием и автором уже существует
  const checkIbDb = async (book: Book): Promise<Book> => {
    const dbBooks: Book[] = await BooksModel.findByTitle(book.title);

    dbBooks.forEach((dbBook) => {
      if (dbBook.author === author && dbBook.title === title) {
        res.status(409);
        throw new Error(
          "Book with the specified title and author already exists"
        );
      }
    });

    return book;
  };

  // Добавляет запись о книге в БД
  const addBook = async (book: Book): Promise<Book> => {
    const id: number = await BooksModel.addBook(book);
    book.id = id;
    return book;
  };

  // Отправляет клиенту данные созданного пользователя без хеша пароля
  const respond = (book: Book) => {
    res.status(201).json(book);
  };

  // Отвечает клиенту в случае возникновения ошибки
  const onError = (error: Error) => {
    /* Если ранее статус не был задан, значит исключение
    вызвано непреднамеренно, следует вернуть код 500 */
    if (res.statusCode == 200) {
      res.status(500);
    }

    res.json({
      message: error.message,
    });
  };

  const book: Book = {
    title: title,
    author: author,
    publicationDate: publicationDate ? new Date(publicationDate) : null,
    genres: genres,
  };

  validatePayload()
    .then(() => checkIbDb(book))
    .then(addBook)
    .then(respond)
    .catch(onError);
};

/**
 * Эндпоинт для получения списка книг
 *
 * @param req
 * @param res
 */
const getAll = (req: Request, res: Response) => {
  const respond = (books: Book[]) => {
    res.json(books);
  };

  const onError = (error: Error) => {
    if (res.statusCode == 200) {
      res.status(500);
    }

    res.json({
      message: error.message,
    });
  };

  BooksModel.getAll().then(respond).catch(onError);
};

/**
 * Эндпоинт для получения книги по id
 *
 * @param req
 * @param res
 */
const getById = (req: Request, res: Response) => {
  const id: number = Number(req.params["id"]);

  const validate = async () => {
    if (isNaN(id) || id < 1) {
      res.status(400);
      throw new Error("Wrong id");
    }
  };

  const getBook = async () => {
    const book: Book | null = await BooksModel.getById(id);

    if (!book) {
      res.status(404);
      throw new Error("Book with specified id was not found");
    }

    return book;
  };

  const respond = (book: Book) => {
    res.json(book);
  };

  const onError = (error: Error) => {
    if (res.statusCode == 200) {
      res.status(500);
    }

    res.json({
      message: error.message,
    });
  };

  validate().then(getBook).then(respond).catch(onError);
};

/**
 * Эндпоинт для обновления данных о книге
 *
 * @param req
 * @param res
 */
const update = (req: Request, res: Response) => {
  const id: number = Number(req.params["id"]);
  const { title, author, publicationDate, genres } = req.body;

  const validate = async () => {
    res.status(400);

    if (isNaN(id) || id < 1) {
      throw new Error("Wrong id");
    } else if (!title || !author || !genres) {
      throw new Error("Title, author or genres is not specified");
    } else if (publicationDate && !isDateValid(publicationDate)) {
      throw new Error("Invalid publicationDate value");
    } else {
      res.status(200);
    }
  };

  const checkInDb = async () => {
    const book: Book | null = await BooksModel.getById(id);

    if (!book) {
      res.status(404);
      throw new Error("Book with specified id was not found");
    }
  };

  const updateBookInDb = async (book: Book) => {
    await BooksModel.update(book);
    return book;
  };

  const respond = (book: Book) => {
    res.json(book);
  };

  const onError = (error: Error) => {
    if (res.statusCode == 200) {
      res.status(500);
    }

    res.json({
      message: error.message,
    });
  };

  const book: Book = {
    id: id,
    title: title,
    author: author,
    publicationDate: publicationDate ? new Date(publicationDate) : null,
    genres: genres,
  };

  validate()
    .then(checkInDb)
    .then(() => updateBookInDb(book))
    .then(respond)
    .catch(onError);
};

/**
 * Эндпоинт для удаления книги по id
 *
 * @param req
 * @param res
 */
const deleteById = (req: Request, res: Response) => {
  const id: number = Number(req.params["id"]);

  const validate = async () => {
    if (isNaN(id) || id < 1) {
      res.status(400);
      throw new Error("Wrong id");
    }
  };

  const checkInDb = async () => {
    const book: Book | null = await BooksModel.getById(id);

    if (!book) {
      res.status(404);
      throw new Error("Book with specified id was not found");
    }
  };

  const respond = () => {
    res.json({ success: true });
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
    .then(checkInDb)
    .then(() => BooksModel.deleteById(id))
    .then(respond)
    .catch(onError);
};

export default { add, getAll, getById, update, deleteById };
