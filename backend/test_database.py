from database import get_connection


connection = get_connection()

try:
    print("DEVFLOW DATABASE INTEGRITY CHECK")
    print("-" * 35)

    tables = [
        "users",
        "clients",
        "projects",
        "tasks"
    ]

    for table in tables:
        count = connection.execute(
            f"SELECT COUNT(*) FROM {table}"
        ).fetchone()[0]

        print(f"{table}: {count} records")

    print()
    print("Checking foreign-key relationships...")

    foreign_key_errors = connection.execute(
        "PRAGMA foreign_key_check"
    ).fetchall()

    if foreign_key_errors:
        print("FAIL: Foreign-key errors found.")

        for error in foreign_key_errors:
            print(tuple(error))
    else:
        print("PASS: No foreign-key errors.")

    print()
    print("Checking project-client ownership...")

    ownership_errors = connection.execute(
        """
        SELECT projects.id
        FROM projects
        JOIN clients
            ON projects.client_id = clients.id
        WHERE projects.user_id != clients.user_id
        """
    ).fetchall()

    if ownership_errors:
        print("FAIL: Ownership mismatches found.")

        for error in ownership_errors:
            print("Project ID:", error["id"])
    else:
        print("PASS: Project-client ownership is valid.")

    print()
    print("Checking task-project relationships...")

    orphan_tasks = connection.execute(
        """
        SELECT tasks.id
        FROM tasks
        LEFT JOIN projects
            ON tasks.project_id = projects.id
        WHERE projects.id IS NULL
        """
    ).fetchall()

    if orphan_tasks:
        print("FAIL: Tasks without projects found.")

        for error in orphan_tasks:
            print("Task ID:", error["id"])
    else:
        print("PASS: Every task has a project.")

finally:
    connection.close()
