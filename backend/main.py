from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.projects import router as projects_router
from backend.tasks import router as tasks_router
from backend.clients import router as clients_router
from backend.users import router as users_router
from backend.auth import router as auth_router
from backend.database import initialize_database

app = FastAPI(title="DevFlow API")

@app.on_event("startup")
def startup():
    initialize_database()


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://devflow-frontend-abke.onrender.com",
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
