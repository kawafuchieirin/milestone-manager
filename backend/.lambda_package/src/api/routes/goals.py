from fastapi import APIRouter, Depends, HTTPException, status

from src.core.security import CurrentUser, get_current_user
from src.models import (
    CreateGoalRequest,
    UpdateGoalRequest,
    GoalResponse,
    GoalListResponse,
)
from src.repositories import GoalRepository, MilestoneRepository, get_dynamodb_client

router = APIRouter(prefix="/goals", tags=["goals"])


def get_goal_repository() -> GoalRepository:
    return GoalRepository(get_dynamodb_client())


def get_milestone_repository() -> MilestoneRepository:
    return MilestoneRepository(get_dynamodb_client())


@router.get("", response_model=list[GoalResponse])
async def list_goals(
    current_user: CurrentUser = Depends(get_current_user),
    repo: GoalRepository = Depends(get_goal_repository),
) -> list[GoalResponse]:
    """Get all goals for the current user"""
    goals = repo.get_all_by_user(current_user.user_id)
    return [GoalResponse.from_goal(g) for g in goals]


@router.post("", response_model=GoalResponse, status_code=status.HTTP_201_CREATED)
async def create_goal(
    request: CreateGoalRequest,
    current_user: CurrentUser = Depends(get_current_user),
    repo: GoalRepository = Depends(get_goal_repository),
) -> GoalResponse:
    """Create a new goal"""
    goal = repo.create(current_user.user_id, request)
    return GoalResponse.from_goal(goal)


@router.get("/{goal_id}", response_model=GoalResponse)
async def get_goal(
    goal_id: str,
    current_user: CurrentUser = Depends(get_current_user),
    repo: GoalRepository = Depends(get_goal_repository),
) -> GoalResponse:
    """Get a specific goal by ID"""
    goal = repo.get_by_id(current_user.user_id, goal_id)
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found",
        )
    return GoalResponse.from_goal(goal)


@router.put("/{goal_id}", response_model=GoalResponse)
async def update_goal(
    goal_id: str,
    request: UpdateGoalRequest,
    current_user: CurrentUser = Depends(get_current_user),
    repo: GoalRepository = Depends(get_goal_repository),
) -> GoalResponse:
    """Update a goal"""
    goal = repo.update(current_user.user_id, goal_id, request)
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found",
        )
    return GoalResponse.from_goal(goal)


@router.delete("/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_goal(
    goal_id: str,
    current_user: CurrentUser = Depends(get_current_user),
    goal_repo: GoalRepository = Depends(get_goal_repository),
    milestone_repo: MilestoneRepository = Depends(get_milestone_repository),
) -> None:
    """Delete a goal and all its milestones"""
    goal = goal_repo.get_by_id(current_user.user_id, goal_id)
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found",
        )

    # Delete all milestones first
    milestone_repo.delete_all_by_goal(goal_id)

    # Delete the goal
    goal_repo.delete(current_user.user_id, goal_id)
