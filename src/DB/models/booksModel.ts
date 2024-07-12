import { ResultRecord } from "ts-postgres";
import DbConnector from "../dbConnector";

export type Book = {
  id?: number;
  title: string;
  author: string;
  publicationDate: Date | null;
  genres: string[];
};

export class BooksModel {
  static tableName: string = "books";

  /**
   * Создает таблицу books
   */
  static async initTable() {
    // Создание таблицы books
    const query: string = `
      CREATE TABLE "${this.tableName}" (
        "id" serial NOT NULL,
        PRIMARY KEY ("id"),
        "title" character varying(128) NOT NULL,
        "author" character varying(128) NOT NULL,
        "genres" character varying(256) NOT NULL,
        "publication_date" date NULL
      );
    `;
    DbConnector.instance.executeNonQuery(query);

    console.log(`table "${this.tableName}" created`);
  }

  /**
   * Создает в БД запись о книге
   *
   * @param book
   * @returns id созданной книги
   */
  static async addBook(book: Book): Promise<number> {
    const genresJson = JSON.stringify(book.genres);

    let publicationDate = "NULL";

    if (book.publicationDate) {
      publicationDate = `'${book.publicationDate.toISOString()}'`;
    }

    const query: string = `
      INSERT INTO "${this.tableName}" ("title", "author", "genres", "publication_date")
      VALUES ('${book.title}', '${book.author}', '${genresJson}', ${publicationDate})
      RETURNING id;
    `;

    const rows: { id: number }[] = await DbConnector.instance.executeQuery<{
      id: number;
    }>(query);

    return rows[0].id;
  }

  /**
   * Обновляет запись о книге в БД
   *
   * @param book
   */
  static async update(book: Book): Promise<void> {
    const genresJson = JSON.stringify(book.genres);

    let publicationDate = "NULL";

    if (book.publicationDate) {
      publicationDate = `'${book.publicationDate.toISOString()}'`;
    }

    const query: string = `
      UPDATE "${this.tableName}" 
      SET title='${book.title}',
          author='${book.author}',
          genres='${genresJson}',
          publication_date=${publicationDate}
      WHERE id = ${book.id};
    `;

    return await DbConnector.instance.executeNonQuery(query);
  }

  /**
   * Получает все книги из БД
   *
   * @returns
   */
  static async getAll(): Promise<Book[]> {
    const query: string = `
      select *
      from ${this.tableName}
    `;

    const rows: ResultRecord[] = await DbConnector.instance.executeQuery(query);
    return this.rowsToBooks(rows);
  }

  /**
   * Находит книги по названию,
   * разные авторы могут иметь книги с
   * одинаковым названием
   *
   * @param bookTitle
   */
  static async findByTitle(bookTitle: string): Promise<Book[]> {
    const query: string = `
        select *
        from ${this.tableName}
        where title = '${bookTitle}'
      `;

    const rows: ResultRecord[] =
      await DbConnector.instance.executeQuery<ResultRecord>(query);

    return this.rowsToBooks(rows);
  }

  /**
   * Получает из БД книгу по id
   *
   * @param id
   * @returns
   */
  static async getById(id: number): Promise<Book | null> {
    const query: string = `
      select *
      from ${this.tableName}
      where id = '${id}'
    `;

    const rows: ResultRecord[] =
      await DbConnector.instance.executeQuery<ResultRecord>(query);

    const books: Book[] = this.rowsToBooks(rows);

    if (rows.length === 1) {
      return books[0];
    } else {
      return null;
    }
  }

  /**
   * Преобразовывает ResultRecord[] в Book[]
   *
   * @param rows
   * @returns
   */
  static rowsToBooks(rows: ResultRecord[]): Book[] {
    let books: Book[] = [];

    rows.forEach((element) => {
      books.push({
        id: element.id,
        title: element.title,
        author: element.author,
        publicationDate: element.publication_date
          ? new Date(element.publication_date)
          : null,
        genres: JSON.parse(element.genres),
      });
    });

    return books;
  }
}
