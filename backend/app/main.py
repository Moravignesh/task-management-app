
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.database import create_tables
from app.api.routes import auth, projects, tasks, analytics, notifications

app = FastAPI(
    title="Task Management & Collaboration System",
    description="A full-stack task management system with project tracking and analytics",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(tasks.router)
app.include_router(analytics.router)
app.include_router(notifications.router)


@app.on_event("startup")
def startup_event():
    create_tables()


@app.get("/")
def root():
    return {"message": "Task Management API is running", "docs": "/docs"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}
