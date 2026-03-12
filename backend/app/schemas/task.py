from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.models.task import TaskStatus
from app.schemas.auth import UserResponse


class TaskCreate(BaseModel):
    project_id: int
    title: str
    description: Optional[str] = None
    status: TaskStatus = TaskStatus.PENDING
    due_date: Optional[datetime] = None
    assigned_to: Optional[int] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    due_date: Optional[datetime] = None
    assigned_to: Optional[int] = None


class TaskAssign(BaseModel):
    user_id: int


class TaskResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    status: TaskStatus
    due_date: Optional[datetime]
    project_id: int
    created_by: int
    assigned_to: Optional[int]
    created_at: datetime
    updated_at: Optional[datetime]
    assignee: Optional[UserResponse] = None
    creator: Optional[UserResponse] = None

    class Config:
        from_attributes = True
