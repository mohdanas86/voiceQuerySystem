from __future__ import annotations

from pydantic import BaseModel, Field


class QueryCreate(BaseModel):
    source_language: str = Field(min_length=1, max_length=32)
    original_transcript: str = Field(min_length=1, max_length=5000)
    translated_transcript: str = Field(min_length=1, max_length=5000)
    phone_country_code: str = Field(pattern=r"^\+\d{1,4}$")
    phone_number: str = Field(pattern=r"^[\d\s]{6,15}$")
    phone_full: str = Field(pattern=r"^\+\d[\d\s]{5,20}$")
    client_timestamp: str = Field(min_length=1, max_length=64)
    client_timezone: str = Field(min_length=1, max_length=64)


class QueryResponse(BaseModel):
    id: str
    status: str = "accepted"
    submitted_at: str
