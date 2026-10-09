from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel

from backend.database import get_connection
from backend.dependencies import get_current_user


router = APIRouter(
    prefix="/clients",
    tags=["Clients"],
    dependencies=[
        Depends(get_current_user)
    ]
)


class ClientCreate(BaseModel):
    name: str
    email: str = ""
    phone: str = ""
    company: str = ""


class ClientUpdate(BaseModel):
    name: str | None = None
    email: str | None = None
    phone: str | None = None
    company: str | None = None


@router.get("/")
def get_clients(
    current_user=Depends(get_current_user)
):
    connection = get_connection()

    try:
        clients = connection.execute(
            """
            SELECT id, user_id, name,
                   email, phone, company
            FROM clients
            WHERE user_id = ?
            ORDER BY id
            """,
            (current_user["id"],)
        ).fetchall()

        return [
            dict(client)
            for client in clients
        ]

    finally:
        connection.close()


@router.post("/")
def create_client(
    client: ClientCreate,
    current_user=Depends(get_current_user)
):
    connection = get_connection()

    try:
        cursor = connection.execute(
            """
            INSERT INTO clients (
                user_id, name, email,
                phone, company
            )
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                current_user["id"],
                client.name,
                client.email,
                client.phone,
                client.company
            )
        )

        connection.commit()

        return {
            "id": cursor.lastrowid,
            "user_id": current_user["id"],
            "name": client.name,
            "email": client.email,
            "phone": client.phone,
            "company": client.company
        }

    finally:
        connection.close()


@router.get("/{client_id}")
def get_client(
    client_id: int,
    current_user=Depends(get_current_user)
):
    connection = get_connection()

    try:
        client = connection.execute(
            """
            SELECT id, user_id, name,
                   email, phone, company
            FROM clients
            WHERE id = ? AND user_id = ?
            """,
            (
                client_id,
                current_user["id"]
            )
        ).fetchone()

        if client is None:
            raise HTTPException(
                status_code=404,
                detail="Client not found"
            )

        return dict(client)

    finally:
        connection.close()


@router.put("/{client_id}")
def update_client(
    client_id: int,
    client_update: ClientUpdate,
    current_user=Depends(get_current_user)
):
    update_data = (
        client_update.model_dump(
            exclude_unset=True
        )
    )

    allowed_fields = {
        "name",
        "email",
        "phone",
        "company"
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
        existing_client = connection.execute(
            """
            SELECT id
            FROM clients
            WHERE id = ? AND user_id = ?
            """,
            (
                client_id,
                current_user["id"]
            )
        ).fetchone()

        if existing_client is None:
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
                client_id,
                current_user["id"]
            ])

            connection.execute(
                f"""
                UPDATE clients
                SET {fields}
                WHERE id = ? AND user_id = ?
                """,
                values
            )

            connection.commit()

        client = connection.execute(
            """
            SELECT id, user_id, name,
                   email, phone, company
            FROM clients
            WHERE id = ? AND user_id = ?
            """,
            (
                client_id,
                current_user["id"]
            )
        ).fetchone()

        return dict(client)

    finally:
        connection.close()


@router.delete("/{client_id}")
def delete_client(
    client_id: int,
    current_user=Depends(get_current_user)
):
    connection = get_connection()

    try:
        client = connection.execute(
            """
            SELECT id
            FROM clients
            WHERE id = ? AND user_id = ?
            """,
            (
                client_id,
                current_user["id"]
            )
        ).fetchone()

        if client is None:
            raise HTTPException(
                status_code=404,
                detail="Client not found"
            )

        project_count = connection.execute(
            """
            SELECT COUNT(*)
            FROM projects
            WHERE client_id = ?
              AND user_id = ?
            """,
            (
                client_id,
                current_user["id"]
            )
        ).fetchone()[0]

        if project_count:
            raise HTTPException(
                status_code=409,
                detail=(
                    "Cannot delete this client "
                    "because it is assigned to "
                    f"{project_count} project(s)."
                )
            )

        connection.execute(
            """
            DELETE FROM clients
            WHERE id = ? AND user_id = ?
            """,
            (
                client_id,
                current_user["id"]
            )
        )

        connection.commit()

        return {
            "message":
                "Client deleted successfully"
        }

    finally:
        connection.close()

