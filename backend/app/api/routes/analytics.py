from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Any

from app.db.database import get_db
from app.models.user import User
from app.models.task import Task, TaskStatus
from app.models.project import Project
from app.core.security import get_current_user

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/tasks")
def get_task_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    # Get all projects for this user
    user_projects = db.query(Project).filter(Project.owner_id == current_user.id).all()
    project_ids = [p.id for p in user_projects]

    # Total tasks
    total_tasks = db.query(Task).filter(Task.project_id.in_(project_ids)).count()

    # Completed tasks
    completed_tasks = db.query(Task).filter(
        Task.project_id.in_(project_ids),
        Task.status == TaskStatus.COMPLETED
    ).count()

    # Pending tasks
    pending_tasks = db.query(Task).filter(
        Task.project_id.in_(project_ids),
        Task.status == TaskStatus.PENDING
    ).count()

    # In progress tasks
    in_progress_tasks = db.query(Task).filter(
        Task.project_id.in_(project_ids),
        Task.status == TaskStatus.IN_PROGRESS
    ).count()

    # Tasks per project
    tasks_per_project = []
    for project in user_projects:
        count = db.query(Task).filter(Task.project_id == project.id).count()
        tasks_per_project.append({
            "project_id": project.id,
            "project_name": project.project_name,
            "task_count": count
        })

    return {
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks,
        "pending_tasks": pending_tasks,
        "in_progress_tasks": in_progress_tasks,
        "tasks_per_project": tasks_per_project
    }
