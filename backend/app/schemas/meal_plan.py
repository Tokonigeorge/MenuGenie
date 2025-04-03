from typing import List, Optional, Union
from pydantic import BaseModel, Field, GetJsonSchemaHandler
from pydantic.json_schema import JsonSchemaValue

from datetime import datetime, date
from bson import ObjectId
from pydantic_core import core_schema

from app.schemas.common import PyObjectId

class MealPlanBase(BaseModel):
    startDate: date
    endDate: date
    mealType: List[str]
    dietaryPreferences: List[str] = []
    cuisineTypes: List[str] = []
    complexityLevels: List[str] = []
    dietaryRestrictions: List[str] = []

class MealPlanCreate(MealPlanBase):
    pass

class MealNutritionalInfo(BaseModel):
    calories: int = 0
    protein: int = 0
    carbs: int = 0
    fat: int = 0

class RecipeStep(BaseModel):
    step: str
    description: str
    required: bool = True

class MealItem(BaseModel):
    type: str
    description: Optional[str] = None
    name: str
    ingredients: List[str]
    recipe: Union[str, List[RecipeStep]]
    nutritionalInfo: MealNutritionalInfo
class MealDay(BaseModel):
    day: int
    description: Optional[str] = None
    meals: List[MealItem]
    isFavorite: Optional[bool] = False

class MealPlanData(BaseModel):
    days: List[MealDay]

class MealPlanInDB(MealPlanBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    userId: str
    status: str = "pending"  # pending, generating, completed
    mealPlan: Optional[MealPlanData] = None
    completedAt: Optional[str] = None
    createdAt: str = Field(default_factory=lambda: datetime.now().isoformat())
    
    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {
            ObjectId: str
        }

class MealPlanResponse(MealPlanInDB):
    pass