import json
import sqlite3
from pathlib import Path

from database import (
    DATABASE_FILE,
    initialize_database
)


DATA_DIR = (
    Path(__file__).parent
    / "data"
)


def load_json(filename):
    file_path = DATA_DIR / filename

    with open(
        file_path,
        "r",
        encoding="utf-8"
    ) as file:
        return json.load(file)


def migrate_data():
    users = load_json("users.json")
    clients = load_json("clients.json")
    projects = load_json("projects.json")
    tasks = load_json("tasks.json")

    print("JSON records found:")
    print("Users:", len(users))
    print("Clients:", len(clients))
    print("Projects:", len(projects))
    print("Tasks:", len(tasks))

    initialize_database()

    connection = sqlite3.connect(
        DATABASE_FILE
    )

    connection.execute(
        "PRAGMA foreign_keys = ON"
    )

    try:
        with connection:

            connection.executemany(
                """
                INSERT INTO users (
                    id, name, email, password
                )
                VALUES (?, ?, ?, ?)
                """,
                [
                    (
                        user["id"],
                        user["name"],
                        user["email"],
                        user["password"]
                    )
                    for user in users
                ]
            )

            connection.executemany(
                """
                INSERT INTO clients (
                    id, user_id, name,
                    email, phone, company
                )
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                [
                    (
                        client["id"],
                        client["user_id"],
                        client["name"],
                        client.get("email", ""),
                        client.get("phone", ""),
                        client.get("company", "")
                    )
                    for client in clients
                ]
            )

            connection.executemany(
                """
                INSERT INTO projects (
                    id, user_id, name,
                    description, client_id, status
                )
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                [
                    (
                        project["id"],
                        project["user_id"],
                        project["name"],
                        project.get("description", ""),
                        project.get("client_id"),
                        project.get("status", "active")
                    )
                    for project in projects
                ]
            )

            connection.executemany(
                """
                INSERT INTO tasks (
                    id, project_id, title,
                    description, priority,
                    status, due_date
                )
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                [
                    (
                        task["id"],
                        task["project_id"],
                        task["title"],
                        task.get("description", ""),
                        task.get("priority", "medium"),
                        task.get("status", "pending"),
                        task.get("due_date")
                    )
                    for task in tasks
                ]
            )

        print()
        print("Migration completed successfully.")

    except (sqlite3.Error, KeyError, TypeError) as error:
        print("Migration failed:", error)
        print("The transaction has been rolled back.")
        raise

    finally:
        connection.close()


if __name__ == "__main__":
    migrate_data()
