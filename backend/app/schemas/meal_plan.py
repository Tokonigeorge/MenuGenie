from typing import List
from pydantic import BaseModel, Field, GetJsonSchemaHandler
from pydantic.json_schema import JsonSchemaValue

from datetime import datetime, date
from bson import ObjectId
from pydantic_core import core_schema

class PyObjectId(ObjectId):
    @classmethod
    def __get_pydantic_core_schema__(
        cls,
        _source_type: any,
        _handler: any,
    ) -> core_schema.CoreSchema:
        return core_schema.chain_schema([
            core_schema.str_schema(),
            core_schema.no_info_plain_validator_function(cls.validate),
        ])

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)
    
    @classmethod
    def __get_pydantic_json_schema__(
        cls, 
        _schema_generator: GetJsonSchemaHandler,
        _field_schema: JsonSchemaValue,
    ) -> JsonSchemaValue:
        return {"type": "string"}

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

class MealPlanInDB(MealPlanBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    userId: str
    status: str = "pending"  # pending, generating, completed
    createdAt: str = Field(default_factory=lambda: datetime.now().isoformat())
    
    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {
            ObjectId: str
        }

class MealPlanResponse(MealPlanInDB):
    pass