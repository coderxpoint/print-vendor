from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.models.database import get_db
from app.models.models import APIToken, UploadSession, Lot
from app.models.schemas import UploadRequest, UploadResponse
from app.api.deps import validate_api_token
from app.services.validator import DataValidator
from app.services.csv_generator import CSVGenerator

router = APIRouter(prefix="/upload", tags=["Upload"])

@router.post("", response_model=UploadResponse)
def upload_data(
    request: UploadRequest,
    db: Session = Depends(get_db),
    api_token: APIToken = Depends(validate_api_token)
):
    """
    Public endpoint for merchants to upload data
    Requires valid API token as query parameter
    
    Process:
    1. Validate data
    2. Check for duplicates
    3. Group by lot_number
    4. Generate CSV files
    5. Save metadata
    """
    # Convert Pydantic models to dicts
    records = [record.model_dump() for record in request.data]
    
    # Initialize services
    validator = DataValidator(db)
    csv_generator = CSVGenerator()
    
    # Validate and check duplicates
    validation_result = validator.validate_records(records)
    
    valid_records = validation_result['valid_records']
    duplicate_records = validation_result['duplicate_records']
    
    if not valid_records:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="All records are duplicates. No data to upload."
        )
    
    # Create upload session
    upload_session = UploadSession(
        token_id=api_token.id,
        total_records=validation_result['total_records'],
        valid_records=validation_result['valid_count'],
        duplicate_records=validation_result['duplicate_count']
    )
    db.add(upload_session)
    db.commit()
    db.refresh(upload_session)
    
    # Group records by lot_number
    lots_data = validator.group_by_lot(valid_records)
    
    # Generate CSV files for each lot
    lots_created = []
    for lot_number, lot_records in lots_data.items():
        # Save to CSV
        file_info = csv_generator.save_to_csv(lot_number, lot_records)
        
        # Save lot metadata
        lot = Lot(
            lot_number=lot_number,
            record_count=len(lot_records),
            file_path=file_info['file_path'],
            file_name=file_info['file_name'],
            upload_session_id=upload_session.id
        )
        db.add(lot)
        lots_created.append(lot_number)
    
    db.commit()
    
    # Save QR identifiers for future duplicate checking
    validator.save_identifiers(valid_records, upload_session.id)
    
    # Prepare response
    response = UploadResponse(
        message="Data uploaded successfully",
        total_records=validation_result['total_records'],
        valid_records=validation_result['valid_count'],
        duplicate_records=validation_result['duplicate_count'],
        lots_created=lots_created,
        duplicates=duplicate_records[:100] if duplicate_records else None  # Limit to first 100
    )
    
    return response