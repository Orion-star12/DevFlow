import sqlite3
from pathlib import Path


DATABASE_FILE = (
    Path(__file__).parent
    / "devflow.db"
)


def get_connection():
    connection = sqlite3.connect(
        DATABASE_FILE
    )

    connection.row_factory = (
        sqlite3.Row
    )

    connection.execute(
        "PRAGMA foreign_keys = ON"
    )

    return connection


def initialize_database():
    connection = get_connection()

    try:
        connection.executescript(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS clients (
                id INTEGER PRIMARY KEY,
                user_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                email TEXT NOT NULL DEFAULT '',
                phone TEXT NOT NULL DEFAULT '',
                company TEXT NOT NULL DEFAULT '',

                FOREIGN KEY (user_id)
                    REFERENCES users(id)
            );

            CREATE TABLE IF NOT EXISTS projects (
                id INTEGER PRIMARY KEY,
                user_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                description TEXT NOT NULL DEFAULT '',
                client_id INTEGER,
                status TEXT NOT NULL DEFAULT 'active',

                FOREIGN KEY (user_id)
                    REFERENCES users(id),

                FOREIGN KEY (client_id)
                    REFERENCES clients(id)
                    ON DELETE RESTRICT
            );

            CREATE TABLE IF NOT EXISTS tasks (
                id INTEGER PRIMARY KEY,
                project_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                description TEXT NOT NULL DEFAULT '',
                priority TEXT NOT NULL DEFAULT 'medium',
                status TEXT NOT NULL DEFAULT 'pending',
                due_date TEXT,

                FOREIGN KEY (project_id)
                    REFERENCES projects(id)
                    ON DELETE CASCADE
            );
            """
        )

        connection.commit()

    finally:
        connection.close()
