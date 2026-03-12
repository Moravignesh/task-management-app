from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.models.user import User
from app.models.task import Task
from app.models.project import Project
from app.models.notification import Notification
from app.schemas.task import TaskCreate, TaskUpdate, TaskAssign, TaskResponse
from app.core.security import get_current_user

router = APIRouter(tags=["Tasks"])


@router.post("/tasks", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    task_data: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(
        Project.id == task_data.project_id,
        Project.owner_id == current_user.id
    ).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    task = Task(
        title=task_data.title,
        description=task_data.description,
        status=task_data.status,
        due_date=task_data.due_date,
        project_id=task_data.project_id,
        created_by=current_user.id,
        assigned_to=task_data.assigned_to
    )
    db.add(task)
    db.commit()
    db.refresh(task)

    # Create notification if task is assigned
    if task_data.assigned_to and task_data.assigned_to != current_user.id:
        notification = Notification(
            user_id=task_data.assigned_to,
            title="New Task Assigned",
            message=f"You have been assigned the task: '{task.title}' in project '{project.project_name}'"
        )
        db.add(notification)
        db.commit()

    return task


@router.get("/projects/{project_id}/tasks", response_model=List[TaskResponse])
def get_tasks_by_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    tasks = db.query(Task).filter(Task.project_id == project_id).all()
    return tasks


@router.get("/tasks/assigned", response_model=List[TaskResponse])
def get_assigned_tasks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    tasks = db.query(Task).filter(Task.assigned_to == current_user.id).all()
    return tasks


@router.get("/tasks/{task_id}", response_model=TaskResponse)
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return task


@router.put("/tasks/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    task_data: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    old_assigned_to = task.assigned_to
    update_data = task_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(task, field, value)

    db.commit()
    db.refresh(task)

    # Notify new assignee
    new_assigned_to = update_data.get("assigned_to")
    if new_assigned_to and new_assigned_to != old_assigned_to and new_assigned_to != current_user.id:
        project = db.query(Project).filter(Project.id == task.project_id).first()
        notification = Notification(
            user_id=new_assigned_to,
            title="Task Assigned to You",
            message=f"You have been assigned the task: '{task.title}' in project '{project.project_name}'"
        )
        db.add(notification)
        db.commit()

    return task


@router.delete("/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    db.delete(task)
    db.commit()


@router.post("/tasks/{task_id}/assign", response_model=TaskResponse)
def assign_task(
    task_id: int,
    assign_data: TaskAssign,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    assignee = db.query(User).filter(User.id == assign_data.user_id).first()
    if not assignee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    old_assigned_to = task.assigned_to
    task.assigned_to = assign_data.user_id
    db.commit()
    db.refresh(task)

    # Create notification
    if assign_data.user_id != old_assigned_to and assign_data.user_id != current_user.id:
        project = db.query(Project).filter(Project.id == task.project_id).first()
        notification = Notification(
            user_id=assign_data.user_id,
            title="Task Assigned to You",
            message=f"You have been assigned the task: '{task.title}' in project '{project.project_name}'"
        )
        db.add(notification)
        db.commit()

    return task
