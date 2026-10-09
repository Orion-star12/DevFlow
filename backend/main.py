from fastapi import FastAPI
from projects import router as projects_router
from fastapi.middleware.cors import CORSMiddleware
from tasks import router as tasks_router
from clients import router as clients_router
from users import router as users_router
from auth import router as auth_router

app = FastAPI(title="DevFlow API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(projects_router)
app.include_router(tasks_router)
app.include_router(clients_router)
app.include_router(users_router)
app.include_router(auth_router)



@app.get("/")
def home():
    return {
        "message": "Welcome to DevFlow API",
        "status": "running"
    }
