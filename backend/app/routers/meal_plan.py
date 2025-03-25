from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorClient
from typing import List
from datetime import datetime, date
from bson import ObjectId
from bson.errors import InvalidId

from app.schemas.meal_plan import MealPlanCreate, MealPlanResponse, MealPlanInDB
from app.config import settings
from app.utils.auth import get_current_user

router = APIRouter()

# MongoDB client setup
client = AsyncIOMotorClient(settings.DATABASE_URL)
db = client[settings.DATABASE_NAME]

@router.post("/", response_model=MealPlanResponse)
async def create_meal_plan(meal_plan: MealPlanCreate, current_user = Depends(get_current_user)):
    """
    Create a new meal plan for the authenticated user
    """
    try:
        # Convert meal plan to dict and add user ID
        meal_plan_dict = meal_plan.dict()
        if isinstance(meal_plan_dict.get("startDate"), date):
            meal_plan_dict["startDate"] = meal_plan_dict["startDate"].isoformat()
        if isinstance(meal_plan_dict.get("endDate"), date):
            meal_plan_dict["endDate"] = meal_plan_dict["endDate"].isoformat()


        meal_plan_dict["userId"] = current_user["_id"]
        meal_plan_dict["status"] = "pending"
        meal_plan_dict["createdAt"] = datetime.now().isoformat()
        
        # Insert into database
        result = await db[settings.MEAL_PLAN_COLLECTION].insert_one(meal_plan_dict)
        
        # Trigger background task for meal plan generation (will implement later)
        # background_tasks.add_task(generate_meal_plan, str(result.inserted_id))
        
        # Return the created meal plan
        created_meal_plan = await db[settings.MEAL_PLAN_COLLECTION].find_one({"_id": result.inserted_id})
        if not created_meal_plan:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
                    detail="Failed to retrieve created meal plan"
            )
                # Convert ObjectId to strings before returning
        created_meal_plan["_id"] = str(created_meal_plan["_id"])
        created_meal_plan["userId"] = str(created_meal_plan["userId"])
        return created_meal_plan
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create meal plan: {str(e)}"
        ) from e

@router.get("/", response_model=List[MealPlanResponse])
async def get_user_meal_plans(current_user = Depends(get_current_user)):
    """
    Get all meal plans for the authenticated user
    """
    try:
        meal_plans = await db[settings.MEAL_PLAN_COLLECTION].find(
            {"userId": current_user["_id"]}
        ).to_list(100)
        for plan in meal_plans:
            plan["_id"] = str(plan["_id"])
            plan["userId"] = str(plan["userId"])
        return meal_plans
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get meal plans: {str(e)}"
        ) from e

@router.get("/{meal_plan_id}", response_model=MealPlanResponse)
async def get_meal_plan(meal_plan_id: str, current_user = Depends(get_current_user)):
    """
    Get a specific meal plan by ID for the authenticated user
    """
    try:
            # Convert string ID to ObjectId
            try:
                object_id = ObjectId(meal_plan_id)
            except InvalidId:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid meal plan ID format"
                ) 
            meal_plan = await db[settings.MEAL_PLAN_COLLECTION].find_one(
                {"_id": object_id, "userId": current_user["_id"]}
            )
            if not meal_plan:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND, 
                    detail="Meal plan not found or you don't have permission to access it"
                )
                        # Convert ObjectId to strings
            meal_plan["_id"] = str(meal_plan["_id"])
            meal_plan["userId"] = str(meal_plan["userId"])
            return meal_plan
    except HTTPException:
            raise
    except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to retrieve meal plan: {str(e)}"
            ) from e