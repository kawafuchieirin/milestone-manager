import uuid
from datetime import date, datetime
from typing import Any

from src.models import (
    Milestone,
    MilestoneStatus,
    CreateMilestoneRequest,
    UpdateMilestoneRequest,
)

from .dynamodb import DynamoDBClient


class MilestoneRepository:
    def __init__(self, db: DynamoDBClient):
        self.db = db

    def _to_item(self, milestone: Milestone) -> dict[str, Any]:
        return {
            "PK": f"GOAL#{milestone.goal_id}",
            "SK": f"MILESTONE#{milestone.id}",
            "type": "milestone",
            "id": milestone.id,
            "goal_id": milestone.goal_id,
            "title": milestone.title,
            "description": milestone.description,
            "due_date": milestone.due_date.isoformat(),
            "status": milestone.status.value,
            "order": milestone.order,
            "created_at": milestone.created_at.isoformat(),
            "updated_at": milestone.updated_at.isoformat(),
        }

    def _from_item(self, item: dict[str, Any]) -> Milestone:
        return Milestone(
            id=item["id"],
            goal_id=item["goal_id"],
            title=item["title"],
            description=item.get("description", ""),
            due_date=date.fromisoformat(item["due_date"]),
            status=MilestoneStatus(item["status"]),
            order=int(item.get("order", 0)),
            created_at=datetime.fromisoformat(item["created_at"]),
            updated_at=datetime.fromisoformat(item["updated_at"]),
        )

    def create(self, goal_id: str, request: CreateMilestoneRequest) -> Milestone:
        existing = self.get_all_by_goal(goal_id)
        max_order = max((m.order for m in existing), default=0)

        now = datetime.utcnow()
        milestone = Milestone(
            id=str(uuid.uuid4()),
            goal_id=goal_id,
            title=request.title,
            description=request.description,
            due_date=request.due_date,
            status=MilestoneStatus.PENDING,
            order=max_order + 1,
            created_at=now,
            updated_at=now,
        )
        self.db.put_item(self._to_item(milestone))
        return milestone

    def get_by_id(self, goal_id: str, milestone_id: str) -> Milestone | None:
        item = self.db.get_item(f"GOAL#{goal_id}", f"MILESTONE#{milestone_id}")
        if not item:
            return None
        return self._from_item(item)

    def get_all_by_goal(self, goal_id: str) -> list[Milestone]:
        items = self.db.query(f"GOAL#{goal_id}", sk_prefix="MILESTONE#")
        milestones = [self._from_item(item) for item in items]
        return sorted(milestones, key=lambda m: m.order)

    def update(
        self,
        goal_id: str,
        milestone_id: str,
        request: UpdateMilestoneRequest,
    ) -> Milestone | None:
        existing = self.get_by_id(goal_id, milestone_id)
        if not existing:
            return None

        updates: dict[str, Any] = {"updated_at": datetime.utcnow().isoformat()}

        if request.title is not None:
            updates["title"] = request.title
        if request.description is not None:
            updates["description"] = request.description
        if request.due_date is not None:
            updates["due_date"] = request.due_date.isoformat()
        if request.status is not None:
            updates["status"] = request.status.value
        if request.order is not None:
            updates["order"] = request.order

        updated_item = self.db.update_item(
            f"GOAL#{goal_id}",
            f"MILESTONE#{milestone_id}",
            updates,
        )
        return self._from_item(updated_item)

    def delete(self, goal_id: str, milestone_id: str) -> bool:
        existing = self.get_by_id(goal_id, milestone_id)
        if not existing:
            return False
        self.db.delete_item(f"GOAL#{goal_id}", f"MILESTONE#{milestone_id}")
        return True

    def delete_all_by_goal(self, goal_id: str) -> int:
        milestones = self.get_all_by_goal(goal_id)
        keys = [(f"GOAL#{goal_id}", f"MILESTONE#{m.id}") for m in milestones]
        if keys:
            self.db.batch_delete(keys)
        return len(keys)

    def reorder(self, goal_id: str, ordered_ids: list[str]) -> list[Milestone]:
        now = datetime.utcnow().isoformat()
        milestones = self.get_all_by_goal(goal_id)
        milestone_map = {m.id: m for m in milestones}

        updated_milestones = []
        for order, milestone_id in enumerate(ordered_ids, start=1):
            if milestone_id in milestone_map:
                self.db.update_item(
                    f"GOAL#{goal_id}",
                    f"MILESTONE#{milestone_id}",
                    {"order": order, "updated_at": now},
                )
                milestone = milestone_map[milestone_id]
                milestone.order = order
                updated_milestones.append(milestone)

        return sorted(updated_milestones, key=lambda m: m.order)
