from pydantic import BaseModel, EmailStr, HttpUrl, field_validator
from typing import Literal, Optional
from datetime import datetime, timezone

class CreateInterviewSchema(BaseModel):
    candidate_email: EmailStr
    role:            str
    department:      Optional[str] = None
    type:            Literal["TECHNICAL", "HR", "MANAGERIAL", "CULTURE_FIT", "FINAL_ROUND"]
    mode:            Literal["ONLINE", "IN_PERSON", "PHONE"]
    date:            datetime
    duration_min:    int = 60
    interviewer:     Optional[str] = None
    meeting_link:    Optional[HttpUrl] = None
    notes:           Optional[str] = None
    category:        Optional[str] = ""

    @field_validator("duration_min")
    def check_duration(cls, v):
        if not (15 <= v <= 240):
            raise ValueError("duration_min must be 15–240")
        return v

    @field_validator("meeting_link", mode="before")
    @classmethod
    def empty_string_to_none(cls, v):
        if v == "":
            return None
        return v

    @field_validator("date")
    def must_be_future(cls, v):
        # Handle timezone-aware or naive datetimes safely
        now = datetime.now(timezone.utc) if v.tzinfo else datetime.now()
        if v <= now:
            raise ValueError("Interview date must be in the future")
        return v

class UpdateStatusSchema(BaseModel):
    status: Literal["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "RESCHEDULED"]

class CreateNoticeSchema(BaseModel):
    title:    str
    body:     str
    type:     Literal["GENERAL", "REMINDER", "UPDATE", "IMPORTANT", "HOLIDAY"]
    priority: Literal["LOW", "MEDIUM", "HIGH"]
