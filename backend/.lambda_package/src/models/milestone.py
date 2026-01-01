from datetime import date, datetime
from enum import Enum
from pydantic import BaseModel, Field


class MilestoneStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


class Milestone(BaseModel):
    id: str
    goal_id: str
    title: str
    description: str
    due_date: date
    status: MilestoneStatus
    order: int
    created_at: datetime
    updated_at: datetime


class CreateMilestoneRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(default="", max_length=2000)
    due_date: date


class UpdateMilestoneRequest(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=2000)
    due_date: date | None = None
    status: MilestoneStatus | None = None
    order: int | None = None


class ReorderMilestonesRequest(BaseModel):
    ordered_ids: list[str] = Field(..., min_length=1)


class MilestoneResponse(BaseModel):
    id: str
    goalId: str
    title: str
    description: str
    dueDate: str
    status: str
    order: int
    createdAt: str
    updatedAt: str

    @classmethod
    def from_milestone(cls, milestone: Milestone) -> "MilestoneResponse":
        return cls(
            id=milestone.id,
            goalId=milestone.goal_id,
            title=milestone.title,
            description=milestone.description,
            dueDate=milestone.due_date.isoformat(),
            status=milestone.status.value,
            order=milestone.order,
            createdAt=milestone.created_at.isoformat(),
            updatedAt=milestone.updated_at.isoformat(),
        )


class MilestoneListResponse(BaseModel):
    milestones: list[MilestoneResponse]
    count: int
