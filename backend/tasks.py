from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel

from backend.database import get_connection
from backend.dependencies import get_current_user


router = APIRouter(
    prefix="/tasks",
    tags=["Tasks"],
    dependencies=[
        Depends(get_current_user)
    ]
)


class TaskCreate(BaseModel):
    project_id: int
    title: str
    description: str = ""
    priority: str = "medium"
    due_date: str | None = None


class TaskUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    priority: str | None = None
    status: str | None = None
    due_date: str | None = None


def get_user_project(
    connection,
    project_id,
    user_id
):
    return connection.execute(
        """
        SELECT id
        FROM projects
        WHERE id = ? AND user_id = ?
        """,
        (project_id, user_id)
    ).fetchone()


@router.get("/")
def get_tasks(
    current_user=Depends(get_current_user)
):
    connection = get_connection()

    try:
        tasks = connection.execute(
            """
            SELECT tasks.id,
                   tasks.project_id,
                   tasks.title,
                   tasks.description,
                   tasks.priority,
                   tasks.status,
                   tasks.due_date
            FROM tasks
            JOIN projects
                ON tasks.project_id = projects.id
            WHERE projects.user_id = ?
            ORDER BY tasks.id
            """,
            (current_user["id"],)
        ).fetchall()

        return [
            dict(task)
            for task in tasks
        ]

    finally:
        connection.close()


@router.get("/project/{project_id}")
def get_project_tasks(
    project_id: int,
    current_user=Depends(get_current_user)
):
    connection = get_connection()

    try:
        project = get_user_project(
            connection,
            project_id,
            current_user["id"]
        )

        if project is None:
            raise HTTPException(
                status_code=404,
                detail="Project not found"
            )

        tasks = connection.execute(
            """
            SELECT id, project_id, title,
                   description, priority,
                   status, due_date
            FROM tasks
            WHERE project_id = ?
            ORDER BY id
            """,
            (project_id,)
        ).fetchall()

        return [
            dict(task)
            for task in tasks
        ]

    finally:
        connection.close()


@router.post("/")
def create_task(
    task: TaskCreate,
    current_user=Depends(get_current_user)
):
    connection = get_connection()

    try:
        project = get_user_project(
            connection,
            task.project_id,
            current_user["id"]
        )

        if project is None:
            raise HTTPException(
                status_code=404,
                detail="Project not found"
            )

        cursor = connection.execute(
            """
            INSERT INTO tasks (
                project_id, title, description,
                priority, status, due_date
            )
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                task.project_id,
                task.title,
                task.description,
                task.priority,
                "pending",
                task.due_date
            )
        )

        connection.commit()

        return {
            "id": cursor.lastrowid,
            "project_id": task.project_id,
            "title": task.title,
            "description": task.description,
            "priority": task.priority,
            "status": "pending",
            "due_date": task.due_date
        }

    finally:
        connection.close()


@router.get("/{task_id}")
def get_task(
    task_id: int,
    current_user=Depends(get_current_user)
):
    connection = get_connection()

    try:
        task = connection.execute(
            """
            SELECT tasks.id,
                   tasks.project_id,
                   tasks.title,
                   tasks.description,
                   tasks.priority,
                   tasks.status,
                   tasks.due_date
            FROM tasks
            JOIN projects
                ON tasks.project_id = projects.id
            WHERE tasks.id = ?
              AND projects.user_id = ?
            """,
            (
                task_id,
                current_user["id"]
            )
        ).fetchone()

        if task is None:
            raise HTTPException(
                status_code=404,
                detail="Task not found"
            )

        return dict(task)

    finally:
        connection.close()


@router.put("/{task_id}")
def update_task(
    task_id: int,
    task_update: TaskUpdate,
    current_user=Depends(get_current_user)
):
    update_data = (
        task_update.model_dump(
            exclude_unset=True
        )
    )

    allowed_fields = {
        "title",
        "description",
        "priority",
        "status",
        "due_date"
    }

    if not set(update_data).issubset(
        allowed_fields
    ):
        raise HTTPException(
            status_code=400,
            detail="Invalid update fields"
        )

    connection = get_connection()

    try:
        existing_task = connection.execute(
            """
            SELECT tasks.id
            FROM tasks
            JOIN projects
                ON tasks.project_id = projects.id
            WHERE tasks.id = ?
              AND projects.user_id = ?
            """,
            (
                task_id,
                current_user["id"]
            )
        ).fetchone()

        if existing_task is None:
            raise HTTPException(
                status_code=404,
                detail="Task not found"
            )

        if update_data:
            fields = ", ".join(
                f"{field} = ?"
                for field in update_data
            )

            values = list(
                update_data.values()
            )

            values.extend([
                task_id,
                current_user["id"]
            ])

            connection.execute(
                f"""
                UPDATE tasks
                SET {fields}
                WHERE id = ?
                  AND project_id IN (
                      SELECT id
                      FROM projects
                      WHERE user_id = ?
                  )
                """,
                values
            )

            connection.commit()

        task = connection.execute(
            """
            SELECT tasks.id,
                   tasks.project_id,
                   tasks.title,
                   tasks.description,
                   tasks.priority,
                   tasks.status,
                   tasks.due_date
            FROM tasks
            JOIN projects
                ON tasks.project_id = projects.id
            WHERE tasks.id = ?
              AND projects.user_id = ?
            """,
            (
                task_id,
                current_user["id"]
            )
        ).fetchone()

        return dict(task)

    finally:
        connection.close()


@router.delete("/{task_id}")
def delete_task(
    task_id: int,
    current_user=Depends(get_current_user)
):
    connection = get_connection()

    try:
        existing_task = connection.execute(
            """
            SELECT tasks.id
            FROM tasks
            JOIN projects
                ON tasks.project_id = projects.id
            WHERE tasks.id = ?
              AND projects.user_id = ?
            """,
            (
                task_id,
                current_user["id"]
            )
        ).fetchone()

        if existing_task is None:
            raise HTTPException(
                status_code=404,
                detail="Task not found"
            )

        connection.execute(
            """
            DELETE FROM tasks
            WHERE id = ?
            """,
            (task_id,)
        )

        connection.commit()

        return {
            "message":
                "Task deleted successfully"
        }

    finally:
        connection.close()
