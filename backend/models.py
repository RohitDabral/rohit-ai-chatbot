from typing import List, Optional, Union, Dict, Any, Literal
from pydantic import BaseModel, Field, field_validator

class ChatRequest(BaseModel):
    session_id: str = Field(..., description="Unique session identifier, 1-128 chars")
    message: str = Field(..., description="User message, 1-4000 chars after trimming")
    system_prompt: Optional[str] = Field(None, description="Optional system prompt overriding default")

    @field_validator("session_id")
    @classmethod
    def validate_session_id(cls, v: str) -> str:
        trimmed = v.strip()
        if not trimmed:
            raise ValueError("session_id cannot be empty or whitespace only")
        if len(trimmed) > 128:
            raise ValueError("session_id length cannot exceed 128 characters")
        return trimmed

    @field_validator("message")
    @classmethod
    def validate_message(cls, v: str) -> str:
        trimmed = v.strip()
        if not trimmed:
            raise ValueError("message cannot be empty or whitespace only")
        if len(trimmed) > 4000:
            raise ValueError("message length cannot exceed 4000 characters")
        return trimmed

class ChatMetadata(BaseModel):
    resolution_source: Literal["LIVE_INFERENCE", "LLM_CACHE"]
    model: str
    latency_ms: int
    input_tokens: int
    output_tokens: int
    key_id: Optional[str] = None
    fallback_attempts: int

class ChatResponse(BaseModel):
    session_id: str
    reply: str
    metadata: ChatMetadata

class HistoryAssistantMetadata(BaseModel):
    resolution_source: str
    input_tokens: int
    output_tokens: int

class HistoryMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str
    metadata: Optional[Dict[str, Any]] = None

class SessionHistoryResponse(BaseModel):
    session_id: str
    messages: List[Dict[str, Any]]

class HealthResponse(BaseModel):
    status: str = "ok"
    keys_configured: int
    cache_enabled: bool = True

class ErrorDetail(BaseModel):
    detail: Union[str, List[Any], Dict[str, Any]]
