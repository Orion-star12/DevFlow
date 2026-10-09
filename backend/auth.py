from datetime import datetime, timedelta, timezone

import jwt
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from pwdlib import PasswordHash

from backend.database import get_connection


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


SECRET_KEY = (
    "devflow-development-secret-key"
)

ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = 60

password_hash = PasswordHash.recommended()


class LoginRequest(BaseModel):
    email: str
    password: str


def create_access_token(user_id: int):
    expire = (
        datetime.now(timezone.utc)
        + timedelta(
            minutes=ACCESS_TOKEN_EXPIRE_MINUTES
        )
    )

    payload = {
        "sub": str(user_id),
        "exp": expire
    }

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )


@router.post("/login")
def login(login_data: LoginRequest):
    connection = get_connection()

    try:
        user = connection.execute(
            """
            SELECT id, email, password
            FROM users
            WHERE LOWER(email) = LOWER(?)
            """,
            (login_data.email,)
        ).fetchone()

        if user is None:
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password"
            )

        password_is_valid = (
            password_hash.verify(
                login_data.password,
                user["password"]
            )
        )

        if not password_is_valid:
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password"
            )

        access_token = create_access_token(
            user["id"]
        )

        return {
            "access_token": access_token,
            "token_type": "bearer"
        }

    finally:
        connection.close()
