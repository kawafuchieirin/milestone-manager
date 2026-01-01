from datetime import date, datetime
from enum import Enum
from pydantic import BaseModel, Field


class GoalStatus(str, Enum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    ON_HOLD = "on_hold"


class Goal(BaseModel):
    id: str
    user_id: str
    title: str
    description: str
    start_date: date
    end_date: date
    status: GoalStatus
    created_at: datetime
    updated_at: datetime


class CreateGoalRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(default="", max_length=2000)
    start_date: date
    end_date: date

    def model_post_init(self, __context) -> None:
        if self.end_date < self.start_date:
            raise ValueError("end_date must be after start_date")


class UpdateGoalRequest(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=2000)
    start_date: date | None = None
    end_date: date | None = None
    status: GoalStatus | None = None


class GoalResponse(BaseModel):
    id: str
    userId: str
    title: str
    description: str
    startDate: str
    endDate: str
    status: str
    createdAt: str
    updatedAt: str

    @classmethod
    def from_goal(cls, goal: Goal) -> "GoalResponse":
        return cls(
            id=goal.id,
            userId=goal.user_id,
            title=goal.title,
            description=goal.description,
            startDate=goal.start_date.isoformat(),
            endDate=goal.end_date.isoformat(),
            status=goal.status.value,
            createdAt=goal.created_at.isoformat(),
            updatedAt=goal.updated_at.isoformat(),
        )


class GoalListResponse(BaseModel):
    goals: list[GoalResponse]
    count: int
