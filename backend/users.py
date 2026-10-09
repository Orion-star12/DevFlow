from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from pwdlib import PasswordHash

from backend.database import get_connection


router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


password_hash = PasswordHash.recommended()


class UserCreate(BaseModel):
    name: str
    email: str
    password: str


@router.get("/")
def get_users():
    connection = get_connection()

    try:
        cursor = connection.execute(
            """
            SELECT id, name, email
            FROM users
            """
        )

        return [
            dict(user)
            for user in cursor.fetchall()
        ]

    finally:
        connection.close()


@router.post("/")
def create_user(user: UserCreate):
    connection = get_connection()

    try:
        existing_user = connection.execute(
            """
            SELECT id
            FROM users
            WHERE LOWER(email) = LOWER(?)
            """,
            (user.email,)
        ).fetchone()

        if existing_user:
            raise HTTPException(
                status_code=409,
                detail=(
                    "A user with this email "
                    "already exists"
                )
            )

        hashed_password = password_hash.hash(
            user.password
        )

        cursor = connection.execute(
            """
            INSERT INTO users (
                name, email, password
            )
            VALUES (?, ?, ?)
            """,
            (
                user.name,
                user.email,
                hashed_password
            )
        )

        connection.commit()

        return {
            "id": cursor.lastrowid,
            "name": user.name,
            "email": user.email
        }

    except Exception:
        connection.rollback()
        raise

    finally:
        connection.close()
