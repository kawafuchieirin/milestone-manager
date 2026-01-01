from fastapi import APIRouter, Depends, HTTPException, status

from src.core.security import CurrentUser, get_current_user
from src.models import (
    CreateMilestoneRequest,
    UpdateMilestoneRequest,
    ReorderMilestonesRequest,
    MilestoneResponse,
    MilestoneListResponse,
)
from src.repositories import GoalRepository, MilestoneRepository, get_dynamodb_client

router = APIRouter(tags=["milestones"])


def get_goal_repository() -> GoalRepository:
    return GoalRepository(get_dynamodb_client())


def get_milestone_repository() -> MilestoneRepository:
    return MilestoneRepository(get_dynamodb_client())


async def verify_goal_ownership(
    goal_id: str,
    current_user: CurrentUser,
    goal_repo: GoalRepository,
) -> None:
    """Verify that the goal belongs to the current user"""
    goal = goal_repo.get_by_id(current_user.user_id, goal_id)
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found",
        )


@router.get("/goals/{goal_id}/milestones", response_model=MilestoneListResponse)
async def list_milestones(
    goal_id: str,
    current_user: CurrentUser = Depends(get_current_user),
    goal_repo: GoalRepository = Depends(get_goal_repository),
    milestone_repo: MilestoneRepository = Depends(get_milestone_repository),
) -> MilestoneListResponse:
    """Get all milestones for a goal"""
    await verify_goal_ownership(goal_id, current_user, goal_repo)

    milestones = milestone_repo.get_all_by_goal(goal_id)
    return MilestoneListResponse(
        milestones=[MilestoneResponse.from_milestone(m) for m in milestones],
        count=len(milestones),
    )


@router.post(
    "/goals/{goal_id}/milestones",
    response_model=MilestoneResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_milestone(
    goal_id: str,
    request: CreateMilestoneRequest,
    current_user: CurrentUser = Depends(get_current_user),
    goal_repo: GoalRepository = Depends(get_goal_repository),
    milestone_repo: MilestoneRepository = Depends(get_milestone_repository),
) -> MilestoneResponse:
    """Create a new milestone for a goal"""
    await verify_goal_ownership(goal_id, current_user, goal_repo)

    milestone = milestone_repo.create(goal_id, request)
    return MilestoneResponse.from_milestone(milestone)


@router.get(
    "/goals/{goal_id}/milestones/{milestone_id}",
    response_model=MilestoneResponse,
)
async def get_milestone(
    goal_id: str,
    milestone_id: str,
    current_user: CurrentUser = Depends(get_current_user),
    goal_repo: GoalRepository = Depends(get_goal_repository),
    milestone_repo: MilestoneRepository = Depends(get_milestone_repository),
) -> MilestoneResponse:
    """Get a specific milestone"""
    await verify_goal_ownership(goal_id, current_user, goal_repo)

    milestone = milestone_repo.get_by_id(goal_id, milestone_id)
    if not milestone:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Milestone not found",
        )
    return MilestoneResponse.from_milestone(milestone)


@router.put(
    "/goals/{goal_id}/milestones/{milestone_id}",
    response_model=MilestoneResponse,
)
async def update_milestone(
    goal_id: str,
    milestone_id: str,
    request: UpdateMilestoneRequest,
    current_user: CurrentUser = Depends(get_current_user),
    goal_repo: GoalRepository = Depends(get_goal_repository),
    milestone_repo: MilestoneRepository = Depends(get_milestone_repository),
) -> MilestoneResponse:
    """Update a milestone"""
    await verify_goal_ownership(goal_id, current_user, goal_repo)

    milestone = milestone_repo.update(goal_id, milestone_id, request)
    if not milestone:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Milestone not found",
        )
    return MilestoneResponse.from_milestone(milestone)


@router.delete(
    "/goals/{goal_id}/milestones/{milestone_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_milestone(
    goal_id: str,
    milestone_id: str,
    current_user: CurrentUser = Depends(get_current_user),
    goal_repo: GoalRepository = Depends(get_goal_repository),
    milestone_repo: MilestoneRepository = Depends(get_milestone_repository),
) -> None:
    """Delete a milestone"""
    await verify_goal_ownership(goal_id, current_user, goal_repo)

    deleted = milestone_repo.delete(goal_id, milestone_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Milestone not found",
        )


@router.post(
    "/goals/{goal_id}/milestones/reorder",
    response_model=MilestoneListResponse,
)
async def reorder_milestones(
    goal_id: str,
    request: ReorderMilestonesRequest,
    current_user: CurrentUser = Depends(get_current_user),
    goal_repo: GoalRepository = Depends(get_goal_repository),
    milestone_repo: MilestoneRepository = Depends(get_milestone_repository),
) -> MilestoneListResponse:
    """Reorder milestones for a goal"""
    await verify_goal_ownership(goal_id, current_user, goal_repo)

    milestones = milestone_repo.reorder(goal_id, request.ordered_ids)
    return MilestoneListResponse(
        milestones=[MilestoneResponse.from_milestone(m) for m in milestones],
        count=len(milestones),
    )
