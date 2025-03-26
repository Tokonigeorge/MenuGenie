from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from motor.motor_asyncio import AsyncIOMotorClient
from typing import List, Dict, Optional, Any
from datetime import datetime, date
from bson import ObjectId
from bson.errors import InvalidId
import json
import asyncio
from functools import lru_cache
import time
import openai
import re

from app.schemas.meal_plan import MealPlanCreate, MealPlanResponse, MealPlanInDB
from app.config import settings
from app.utils.auth import get_current_user
from app.utils.websocket import manager

router = APIRouter()

# MongoDB client setup
client = AsyncIOMotorClient(settings.DATABASE_URL)
db = client[settings.DATABASE_NAME]

openai_client = None
if settings.OPENAI_API_KEY:
    openai_client = openai.AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
else:
    print("WARNING: OPENAI_API_KEY not set. OpenAI features will not be available.")

# Cache for OpenAI requests - simple in-memory cache
OPENAI_CACHE = {}
OPENAI_LAST_REQUEST_TIME = 0
OPENAI_RATE_LIMIT = 5  # 5 requests per minute
OPENAI_RATE_INTERVAL = 60
OPENAI_CACHE_TTL = 60 * 60 * 24 * 7  # 7 days in seconds

@lru_cache(maxsize=100)
def get_cached_response(query_key: str) -> Optional[Dict[str, Any]]:
    """Get cached OpenAI response if available"""
    if query_key in OPENAI_CACHE:
        cache_entry = OPENAI_CACHE[query_key]
        if time.time() - cache_entry["timestamp"] < OPENAI_CACHE_TTL:
            return cache_entry["data"]
        else:
            # Cache expired, remove it
            del OPENAI_CACHE[query_key]
    return None

def cache_response(query_key: str, response: Dict[str, Any]) -> None:
    """Cache OpenAI response"""
    OPENAI_CACHE[query_key] = {
        "data": response,
        "timestamp": time.time()
    }

async def get_previous_meal_plans(user_id: str, limit: int = 3) -> List[Dict[str, Any]]:
    """Get the user's previous meal plans for context"""
    try:
        previous_plans = await db[settings.MEAL_PLAN_COLLECTION].find(
            {"userId": user_id, "status": "completed"}
        ).sort("createdAt", -1).limit(limit).to_list(limit)
        
        return previous_plans
    except Exception as e:
        print(f"Error fetching previous meal plans: {e}")
        return []

async def generate_meal_plan(meal_plan_id: str, user_id: str, firebase_uid: str) -> None: 
    """
    Background task to generate a meal plan using GPT
    """
    try:
        if not openai_client:
            raise Exception("OpenAI API key not configured. Cannot generate meal plan.")
        # Get the meal plan from the database
        print(f'started meal generation')
        meal_plan = await db[settings.MEAL_PLAN_COLLECTION].find_one({"_id": ObjectId(meal_plan_id)})
        print(f'meal plan found {meal_plan}')
        if not meal_plan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,  
                detail="Meal plan not found"
            )

        
        # Get previous meal plans for context
        previous_plans = await get_previous_meal_plans(meal_plan["userId"])
        print(f'previous plan')
        #check cache first
        cache_key = f"{meal_plan['userId']}_{meal_plan['dietaryRestrictions']}_{meal_plan['dietaryPreferences']}_{meal_plan.get('cuisineTypes', [])}"
        cached_result = get_cached_response(cache_key)
        print(f'cached_result, {cached_result}')

        if cached_result:
             
             update_data = {
                "status": "completed",
                "mealPlan": cached_result,
                "updatedAt": datetime.now().isoformat()
             }
             await db[settings.MEAL_PLAN_COLLECTION].update_one(
                {"_id": ObjectId(meal_plan_id)},
                {"$set": update_data}
             )
            # Notify client that meal plan is ready
             updated_meal_plan = await db[settings.MEAL_PLAN_COLLECTION].find_one({"_id": ObjectId(meal_plan_id)})
             if updated_meal_plan:
                updated_meal_plan["_id"] = str(updated_meal_plan["_id"])
                updated_meal_plan["userId"] = str(updated_meal_plan["userId"])
                          
             # Notify client that meal plan is ready with the complete data
             await manager.send_message(
                 {"type": "meal_plan_completed", "meal_plan_id": meal_plan_id, "meal_plan_data": updated_meal_plan},
                 firebase_uid
             )
             return


     # Rate limiting - ensure we don't exceed OpenAI's rate limits
        global OPENAI_LAST_REQUEST_TIME
        current_time = time.time()
        time_since_last_request = current_time - OPENAI_LAST_REQUEST_TIME
        
        if time_since_last_request < (OPENAI_RATE_INTERVAL / OPENAI_RATE_LIMIT):
            wait_time = (OPENAI_RATE_INTERVAL / OPENAI_RATE_LIMIT) - time_since_last_request
            await asyncio.sleep(wait_time) 
                        # Convert string dates to datetime objects
        start_date = datetime.fromisoformat(meal_plan.get('startDate')).date()
        end_date = datetime.fromisoformat(meal_plan.get('endDate')).date()
        days_difference = (end_date - start_date).days + 1

        #prepare prompt
        print(f'preparing prompt')
        previous_meals_context = ""
        if previous_plans:
            previous_meals_context = "Previous meal plans:\n"
            for plan in previous_plans:
                if "mealPlan" in plan and plan["mealPlan"]:
                    previous_meals_context += json.dumps(plan["mealPlan"], indent=2) + "\n\n"
             
        prompt = f"""
Generate a personalized meal plan for {days_difference} days. 
Dietary preferences: {', '.join(meal_plan.get('dietaryPreferences', []))}
Meal types: {', '.join(meal_plan.get('mealType', []))}
Cuisine types: {', '.join(meal_plan.get('cuisineTypes', []))}
Complexity levels: {', '.join(meal_plan.get('complexityLevels', []))}
Dietary restrictions: {', '.join(meal_plan.get('dietaryRestrictions', []))}

{previous_meals_context if previous_meals_context else ''}

Please return the meal plan as a JSON object with the following structure:
{{
  "days": [
    {{
      "day": 1,
      "meals": [
        {{
          "type": "breakfast",
          "name": "Meal name",
          "ingredients": ["ingredient1", "ingredient2"],
          "recipe": "Step-by-step recipe instructions",
          "nutritionalInfo": {{
            "calories": 0,
            "protein": 0,
            "carbs": 0,
            "fat": 0
          }}
        }},
        // add lunch, dinner, snacks if applicable
      ]
    }},
    // add more days if applicable
  ]
}}      
"""
 # Call OpenAI API to generate meal plan
        OPENAI_LAST_REQUEST_TIME = time.time()
        response = await openai_client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a nutritionist and meal planning expert."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=4000
        )   
                # Extract and parse the response
        try:
            result_text = response.choices[0].message.content
            # Parse the JSON response
                      
            cleaned_text = re.sub(r'//.*', '', result_text)
            cleaned_text = re.sub(r'/\*.*?\*/', '', cleaned_text, flags=re.DOTALL)
            try:
                meal_plan_data = json.loads(cleaned_text)
            except json.JSONDecodeError:
                # Fall back to extracting JSON if direct parsing fails
                json_start = result_text.find('{')
                json_end = result_text.rfind('}') + 1
                if json_start >= 0 and json_end > 0:
                    json_str = result_text[json_start:json_end]
                    meal_plan_data = json.loads(json_str)
                else:
                    meal_plan_data = {"error": "Failed to parse JSON response", "raw": result_text}
        except Exception as e:
            error_message = f"Failed to parse response: {str(e)}, {response.choices[0].message.content}"

            print( error_message)
        
        # Cache the result
        cache_response(cache_key, meal_plan_data)
        
        # Update the meal plan in the database
        update_data = {
            "status": "completed",
            "mealPlan": meal_plan_data,
            "completedAt": datetime.now().isoformat()
        }
        print(f'response:{meal_plan_data}')
        await db[settings.MEAL_PLAN_COLLECTION].update_one(
            {"_id": ObjectId(meal_plan_id)},
            {"$set": update_data}
            )
        updated_meal_plan = await db[settings.MEAL_PLAN_COLLECTION].find_one({"_id": ObjectId(meal_plan_id)})
        if updated_meal_plan:
            updated_meal_plan["_id"] = str(updated_meal_plan["_id"])
            updated_meal_plan["userId"] = str(updated_meal_plan["userId"])
                # Notify client that meal plan is ready
        print(f'ping frontend')
        try:
            await manager.send_message(
                {"type": "meal_plan_completed", "meal_plan_id": meal_plan_id, "meal_plan_data": updated_meal_plan},
                firebase_uid
            )
            print(f'Websocket messae sent successfully')
        except Exception as e:
            print(f'Failed to send websocket message: {e}')

    except Exception as e:
            # Update database with error status
            try:
                await db[settings.MEAL_PLAN_COLLECTION].update_one(
                    {"_id": ObjectId(meal_plan_id)},
                    {"$set": {
                        "status": "error",
                        "error": str(e),
                        "completedAt": datetime.now().isoformat()
                    }}
                )
            except Exception as db_error:
                print(f"Failed to update meal plan with error status: {db_error}")
            
            print(f"Error generating meal plan: {e}")   
        

@router.post("/", response_model=MealPlanResponse)
async def create_meal_plan(meal_plan: MealPlanCreate, background_tasks: BackgroundTasks, current_user = Depends(get_current_user)):
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
        meal_plan_dict["firebaseUid"] = current_user["firebaseUid"]
        
        # Insert into database
        result = await db[settings.MEAL_PLAN_COLLECTION].insert_one(meal_plan_dict)
        
        # Trigger background task for meal plan generation
        background_tasks.add_task(generate_meal_plan, str(result.inserted_id), current_user["_id"], current_user["firebaseUid"])
        
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