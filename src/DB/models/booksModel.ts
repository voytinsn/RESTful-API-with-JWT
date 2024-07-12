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
   * Создает таблицы books и books_authors
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

  static async getAll(): Promise<Book[]> {
    const query: string = `
    select *
    from ${this.tableName}
  `;

    const rows: ResultRecord[] = await DbConnector.instance.executeQuery(query);

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

  /**
   * Находит в БД книгу по ее title
   *
   * @param bookTitle
   */
  static async getByTitle(bookTitle: string): Promise<Book | null> {
    const query: string = `
        select *
        from ${this.tableName}
        where title = '${bookTitle}'
        limit 1
      `;

    const rows: Book[] = await DbConnector.instance.executeQuery<Book>(query);

    if (rows.length === 1) {
      return rows[0];
    } else {
      return null;
    }
  }
}
