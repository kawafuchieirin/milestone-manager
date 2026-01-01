import uuid
from datetime import date, datetime
from typing import Any

from src.models import Goal, GoalStatus, CreateGoalRequest, UpdateGoalRequest

from .dynamodb import DynamoDBClient


class GoalRepository:
    def __init__(self, db: DynamoDBClient):
        self.db = db

    def _to_item(self, goal: Goal, user_id: str) -> dict[str, Any]:
        return {
            "PK": f"USER#{user_id}",
            "SK": f"GOAL#{goal.id}",
            "type": "goal",
            "id": goal.id,
            "user_id": goal.user_id,
            "title": goal.title,
            "description": goal.description,
            "start_date": goal.start_date.isoformat(),
            "end_date": goal.end_date.isoformat(),
            "status": goal.status.value,
            "created_at": goal.created_at.isoformat(),
            "updated_at": goal.updated_at.isoformat(),
        }

    def _from_item(self, item: dict[str, Any]) -> Goal:
        return Goal(
            id=item["id"],
            user_id=item["user_id"],
            title=item["title"],
            description=item.get("description", ""),
            start_date=date.fromisoformat(item["start_date"]),
            end_date=date.fromisoformat(item["end_date"]),
            status=GoalStatus(item["status"]),
            created_at=datetime.fromisoformat(item["created_at"]),
            updated_at=datetime.fromisoformat(item["updated_at"]),
        )

    def create(self, user_id: str, request: CreateGoalRequest) -> Goal:
        now = datetime.utcnow()
        goal = Goal(
            id=str(uuid.uuid4()),
            user_id=user_id,
            title=request.title,
            description=request.description,
            start_date=request.start_date,
            end_date=request.end_date,
            status=GoalStatus.NOT_STARTED,
            created_at=now,
            updated_at=now,
        )
        self.db.put_item(self._to_item(goal, user_id))
        return goal

    def get_by_id(self, user_id: str, goal_id: str) -> Goal | None:
        item = self.db.get_item(f"USER#{user_id}", f"GOAL#{goal_id}")
        if not item:
            return None
        return self._from_item(item)

    def get_all_by_user(self, user_id: str) -> list[Goal]:
        items = self.db.query(f"USER#{user_id}", sk_prefix="GOAL#")
        return [self._from_item(item) for item in items]

    def update(
        self,
        user_id: str,
        goal_id: str,
        request: UpdateGoalRequest,
    ) -> Goal | None:
        existing = self.get_by_id(user_id, goal_id)
        if not existing:
            return None

        updates: dict[str, Any] = {"updated_at": datetime.utcnow().isoformat()}

        if request.title is not None:
            updates["title"] = request.title
        if request.description is not None:
            updates["description"] = request.description
        if request.start_date is not None:
            updates["start_date"] = request.start_date.isoformat()
        if request.end_date is not None:
            updates["end_date"] = request.end_date.isoformat()
        if request.status is not None:
            updates["status"] = request.status.value

        updated_item = self.db.update_item(
            f"USER#{user_id}",
            f"GOAL#{goal_id}",
            updates,
        )
        return self._from_item(updated_item)

    def delete(self, user_id: str, goal_id: str) -> bool:
        existing = self.get_by_id(user_id, goal_id)
        if not existing:
            return False
        self.db.delete_item(f"USER#{user_id}", f"GOAL#{goal_id}")
        return True
