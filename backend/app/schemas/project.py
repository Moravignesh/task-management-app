from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.schemas.auth import UserResponse


class ProjectCreate(BaseModel):
    project_name: str
    description: Optional[str] = None


class ProjectUpdate(BaseModel):
    project_name: Optional[str] = None
    description: Optional[str] = None


class ProjectResponse(BaseModel):
    id: int
    project_name: str
    description: Optional[str]
    owner_id: int
    created_at: datetime
    updated_at: Optional[datetime]
    owner: Optional[UserResponse] = None

    class Config:
        from_attributes = True
