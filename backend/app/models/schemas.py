from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime

# Authentication Schemas
class AdminLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

# API Token Schemas
class APITokenCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)

class APITokenResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    token: str
    name: str
    is_active: bool
    created_at: datetime
    last_used_at: Optional[datetime] = None
    usage_count: int

# Upload Schemas
class QRData(BaseModel):
    qr_id: str = Field(min_length=1, max_length=100)
    qr_text: str = Field(min_length=1)
    lot_number: str = Field(min_length=1, max_length=50)
    print_format: str = Field(min_length=1)

class UploadRequest(BaseModel):
    data: List[QRData]

class UploadResponse(BaseModel):
    message: str
    total_records: int
    valid_records: int
    duplicate_records: int
    lots_created: List[str]
    duplicates: Optional[List[dict]] = None

# Lot Schemas
class LotResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    lot_number: str
    record_count: int
    file_name: str
    uploaded_at: datetime
    uploaded_by_token: Optional[str] = None

class LotsListResponse(BaseModel):
    total: int
    page: int
    limit: int
    lots: List[LotResponse]

class StatsResponse(BaseModel):
    total_lots: int
    total_records: int
    total_uploads: int
    active_tokens: int

class DownloadMultipleRequest(BaseModel):
    lot_ids: List[int]

class DownloadMultipleResponse(BaseModel):
    message: str
    total_lots: int
    lots: List[dict]