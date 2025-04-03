

from pydantic import  GetJsonSchemaHandler
from pydantic.json_schema import JsonSchemaValue


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