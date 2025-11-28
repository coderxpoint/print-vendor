from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from app.models.database import get_db
from app.models.models import AdminUser, Lot, UploadSession, APIToken
from app.models.schemas import LotsListResponse, LotResponse, StatsResponse, DownloadMultipleRequest, DownloadMultipleResponse
from app.api.deps import get_current_admin
import os

router = APIRouter(prefix="/lots", tags=["Lots"])

@router.get("", response_model=LotsListResponse)
def list_lots(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(50, ge=1, le=100, description="Items per page"),
    lot_number: Optional[str] = Query(None, description="Filter by lot number"),
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """
    Get paginated list of all lots
    Requires admin authentication
    """
    query = db.query(Lot)
    
    # Filter by lot_number if provided
    if lot_number:
        query = query.filter(Lot.lot_number.contains(lot_number))
    
    # Get total count
    total = query.count()
    
    # Paginate
    offset = (page - 1) * limit
    lots = query.order_by(Lot.uploaded_at.desc()).offset(offset).limit(limit).all()
    
    # Add token name to each lot
    lots_with_token = []
    for lot in lots:
        lot_dict = LotResponse.model_validate(lot).model_dump()
        
        # Get token name
        upload_session = db.query(UploadSession).filter(
            UploadSession.id == lot.upload_session_id
        ).first()
        
        if upload_session and upload_session.token:
            lot_dict['uploaded_by_token'] = upload_session.token.name
        
        lots_with_token.append(LotResponse(**lot_dict))
    
    return LotsListResponse(
        total=total,
        page=page,
        limit=limit,
        lots=lots_with_token
    )

@router.get("/download/{lot_id}")
def download_lot(
    lot_id: int,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """
    Download CSV file for a specific lot
    Requires admin authentication
    """
    print(f"[DEBUG] Download requested for lot_id: {lot_id}")
    
    lot = db.query(Lot).filter(Lot.id == lot_id).first()
    
    if not lot:
        print(f"[DEBUG] Lot {lot_id} not found in database")
        # List available lots for debugging
        all_lots = db.query(Lot.id, Lot.lot_number).all()
        available_ids = [str(l.id) for l in all_lots]
        print(f"[DEBUG] Available lot IDs: {', '.join(available_ids) if available_ids else 'None'}")
        
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Lot with ID {lot_id} not found. Available lot IDs: {', '.join(available_ids) if available_ids else 'none - please upload data first'}"
        )
    
    print(f"[DEBUG] Lot found: {lot.lot_number}, file_path: {lot.file_path}")
    
    file_path = str(lot.file_path)
    if not os.path.exists(file_path):
        print(f"[DEBUG] File not found at path: {file_path}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"File not found on server: {lot.file_name}"
        )
    
    print(f"[DEBUG] Sending file: {file_path}")
    return FileResponse(
        path=file_path,
        filename=str(lot.file_name),
        media_type='text/csv'
    )

@router.post("/download-multiple", response_model=DownloadMultipleResponse)
def download_multiple_lots(
    request: DownloadMultipleRequest,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """
    Get download information for multiple lots
    Returns list of lot IDs and their availability
    Frontend can then download them one by one
    """
    lots = db.query(Lot).filter(Lot.id.in_(request.lot_ids)).all()
    
    if not lots:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No lots found with provided IDs"
        )
    
    lots_info = []
    for lot in lots:
        lots_info.append({
            "lot_id": lot.id,
            "lot_number": lot.lot_number,
            "file_name": lot.file_name,
            "available": os.path.exists(str(lot.file_path))
        })
    
    return DownloadMultipleResponse(
        message="Lot information retrieved",
        total_lots=len(lots_info),
        lots=lots_info
    )

@router.get("/stats", response_model=StatsResponse)
def get_stats(
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """
    Get statistics about uploads
    Requires admin authentication
    """
    total_lots = db.query(func.count(Lot.id)).scalar()
    total_records = db.query(func.sum(Lot.record_count)).scalar() or 0
    total_uploads = db.query(func.count(UploadSession.id)).scalar()
    active_tokens = db.query(func.count(APIToken.id)).filter(APIToken.is_active == True).scalar()
    
    return StatsResponse(
        total_lots=total_lots,
        total_records=total_records,
        total_uploads=total_uploads,
        active_tokens=active_tokens
    )

@router.delete("/{lot_id}")
def delete_lot(
    lot_id: int,
    db: Session = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """
    Delete a lot and its CSV file
    Requires admin authentication
    """
    lot = db.query(Lot).filter(Lot.id == lot_id).first()
    
    if not lot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lot not found"
        )
    
    # Delete file if exists
    file_path = str(lot.file_path)
    if os.path.exists(file_path):
        try:
            os.remove(file_path)
            print(f"[DEBUG] Deleted file: {file_path}")
        except Exception as e:
            # Log error but continue with database deletion
            print(f"[ERROR] Error deleting file: {e}")
    
    # Delete from database
    db.delete(lot)
    db.commit()
    
    print(f"[DEBUG] Deleted lot {lot_id} from database")
    return {"message": "Lot deleted successfully"}