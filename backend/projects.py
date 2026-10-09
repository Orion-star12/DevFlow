from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel

from backend.database import get_connection
from backend.dependencies import get_current_user


router = APIRouter(
    prefix="/projects",
    tags=["Projects"],
    dependencies=[
        Depends(get_current_user)
    ]
)


class ProjectCreate(BaseModel):
    name: str
    description: str = ""
    client_id: int | None = None


class ProjectUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    client_id: int | None = None
    status: str | None = None


def client_exists(
    connection,
    client_id,
    user_id
):
    client = connection.execute(
        """
        SELECT id
        FROM clients
        WHERE id = ? AND user_id = ?
        """,
        (client_id, user_id)
    ).fetchone()

    return client is not None


@router.get("/")
def get_projects(
    current_user=Depends(get_current_user)
):
    connection = get_connection()

    try:
        projects = connection.execute(
            """
            SELECT id, user_id, name,
                   description, client_id, status
            FROM projects
            WHERE user_id = ?
            ORDER BY id
            """,
            (current_user["id"],)
        ).fetchall()

        return [
            dict(project)
            for project in projects
        ]

    finally:
        connection.close()


@router.post("/")
def create_project(
    project: ProjectCreate,
    current_user=Depends(get_current_user)
):
    connection = get_connection()

    try:
        if project.client_id is not None:
            if not client_exists(
                connection,
                project.client_id,
                current_user["id"]
            ):
                raise HTTPException(
                    status_code=404,
                    detail="Client not found"
                )

        cursor = connection.execute(
            """
            INSERT INTO projects (
                user_id, name, description,
                client_id, status
            )
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                current_user["id"],
                project.name,
                project.description,
                project.client_id,
                "active"
            )
        )

        connection.commit()

        return {
            "id": cursor.lastrowid,
            "user_id": current_user["id"],
            "name": project.name,
            "description": project.description,
            "client_id": project.client_id,
            "status": "active"
        }

    finally:
        connection.close()


@router.get("/{project_id}")
def get_project(
    project_id: int,
    current_user=Depends(get_current_user)
):
    connection = get_connection()

    try:
        project = connection.execute(
            """
            SELECT id, user_id, name,
                   description, client_id, status
            FROM projects
            WHERE id = ? AND user_id = ?
            """,
            (
                project_id,
                current_user["id"]
            )
        ).fetchone()

        if project is None:
            raise HTTPException(
                status_code=404,
                detail="Project not found"
            )

        return dict(project)

    finally:
        connection.close()


@router.put("/{project_id}")
def update_project(
    project_id: int,
    project_update: ProjectUpdate,
    current_user=Depends(get_current_user)
):
    update_data = (
        project_update.model_dump(
            exclude_unset=True
        )
    )

    allowed_fields = {
        "name",
        "description",
        "client_id",
        "status"
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
        existing_project = connection.execute(
            """
            SELECT id
            FROM projects
            WHERE id = ? AND user_id = ?
            """,
            (
                project_id,
                current_user["id"]
            )
        ).fetchone()

        if existing_project is None:
            raise HTTPException(
                status_code=404,
                detail="Project not found"
            )

        if "client_id" in update_data:
            client_id = update_data["client_id"]

            if client_id is not None:
                if not client_exists(
                    connection,
                    client_id,
                    current_user["id"]
                ):
                    raise HTTPException(
                        status_code=404,
                        detail="Client not found"
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
                project_id,
                current_user["id"]
            ])

            connection.execute(
                f"""
                UPDATE projects
                SET {fields}
                WHERE id = ? AND user_id = ?
                """,
                values
            )

            connection.commit()

        project = connection.execute(
            """
            SELECT id, user_id, name,
                   description, client_id, status
            FROM projects
            WHERE id = ? AND user_id = ?
            """,
            (
                project_id,
                current_user["id"]
            )
        ).fetchone()

        return dict(project)

    finally:
        connection.close()


@router.delete("/{project_id}")
def delete_project(
    project_id: int,
    current_user=Depends(get_current_user)
):
    connection = get_connection()

    try:
        project = connection.execute(
            """
            SELECT id
            FROM projects
            WHERE id = ? AND user_id = ?
            """,
            (
                project_id,
                current_user["id"]
            )
        ).fetchone()

        if project is None:
            raise HTTPException(
                status_code=404,
                detail="Project not found"
            )

        connection.execute(
            """
            DELETE FROM projects
            WHERE id = ? AND user_id = ?
            """,
            (
                project_id,
                current_user["id"]
            )
        )

        connection.commit()

        return {
            "message":
                "Project deleted successfully"
        }

    finally:
        connection.close()
