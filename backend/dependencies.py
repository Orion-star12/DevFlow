import jwt

from fastapi import Depends, HTTPException
from fastapi.security import (
    HTTPAuthorizationCredentials,
    HTTPBearer
)

from database import get_connection


SECRET_KEY = (
    "devflow-development-secret-key"
)

ALGORITHM = "HS256"

security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials =
        Depends(security)
):
    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        user_id = payload.get("sub")

        if user_id is None:
            raise HTTPException(
                status_code=401,
                detail="Invalid authentication token"
            )

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=401,
            detail="Authentication token has expired"
        )

    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication token"
        )

    connection = get_connection()

    try:
        user = connection.execute(
            """
            SELECT id, name, email
            FROM users
            WHERE id = ?
            """,
            (int(user_id),)
        ).fetchone()

        if user is None:
            raise HTTPException(
                status_code=401,
                detail="User not found"
            )

        return dict(user)

    finally:
        connection.close()

