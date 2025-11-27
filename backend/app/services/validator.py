import hashlib
from typing import List, Dict, Set, Tuple
from sqlalchemy.orm import Session
from app.models.models import QRIdentifier

class DataValidator:
    """Service for validating and checking duplicates in uploaded data"""
    
    def __init__(self, db: Session):
        self.db = db
    
    @staticmethod
    def hash_qr_text(qr_text: str) -> str:
        """Generate SHA-256 hash of QR text for efficient storage and comparison"""
        return hashlib.sha256(qr_text.encode()).hexdigest()
    
    def check_internal_duplicates(self, records: List[dict]) -> Tuple[List[dict], List[dict]]:
        """
        Check for duplicates within the uploaded dataset itself
        Returns: (valid_records, duplicate_records)
        """
        seen_qr_ids = set()
        seen_qr_text_hashes = set()
        valid_records = []
        duplicates = []
        
        for record in records:
            qr_id = record['qr_id']
            qr_text_hash = self.hash_qr_text(record['qr_text'])
            
            # Check if QR ID or QR text already seen in this batch
            if qr_id in seen_qr_ids or qr_text_hash in seen_qr_text_hashes:
                duplicates.append({
                    'qr_id': qr_id,
                    'lot_number': record['lot_number'],
                    'reason': 'duplicate_in_upload'
                })
            else:
                seen_qr_ids.add(qr_id)
                seen_qr_text_hashes.add(qr_text_hash)
                record['qr_text_hash'] = qr_text_hash
                valid_records.append(record)
        
        return valid_records, duplicates
    
    def check_database_duplicates(self, records: List[dict], batch_size: int = 1000) -> Tuple[List[dict], List[dict]]:
        """
        Check for duplicates against existing database records
        Uses batch processing for efficiency with large datasets
        Returns: (valid_records, duplicate_records)
        """
        valid_records = []
        duplicates = []
        
        # Process in batches to avoid memory issues
        for i in range(0, len(records), batch_size):
            batch = records[i:i + batch_size]
            
            # Extract QR IDs and text hashes from batch
            qr_ids = [r['qr_id'] for r in batch]
            qr_text_hashes = [r['qr_text_hash'] for r in batch]
            
            # Query database for existing records
            existing = self.db.query(
                QRIdentifier.qr_id,
                QRIdentifier.qr_text_hash
            ).filter(
                (QRIdentifier.qr_id.in_(qr_ids)) |
                (QRIdentifier.qr_text_hash.in_(qr_text_hashes))
            ).all()
            
            # Create sets for faster lookup
            existing_qr_ids = {e.qr_id for e in existing}
            existing_qr_text_hashes = {e.qr_text_hash for e in existing}
            
            # Check each record in batch
            for record in batch:
                if (record['qr_id'] in existing_qr_ids or 
                    record['qr_text_hash'] in existing_qr_text_hashes):
                    duplicates.append({
                        'qr_id': record['qr_id'],
                        'lot_number': record['lot_number'],
                        'reason': 'duplicate_in_database'
                    })
                else:
                    valid_records.append(record)
        
        return valid_records, duplicates
    
    def validate_records(self, records: List[dict]) -> Dict:
        """
        Complete validation pipeline
        1. Check internal duplicates
        2. Check database duplicates
        Returns validation summary
        """
        # Step 1: Check for duplicates within the upload
        valid_records, internal_dupes = self.check_internal_duplicates(records)
        
        # Step 2: Check for duplicates against database
        final_valid, database_dupes = self.check_database_duplicates(valid_records)
        
        # Combine all duplicates
        all_duplicates = internal_dupes + database_dupes
        
        return {
            'valid_records': final_valid,
            'duplicate_records': all_duplicates,
            'total_records': len(records),
            'valid_count': len(final_valid),
            'duplicate_count': len(all_duplicates)
        }
    
    def save_identifiers(self, records: List[dict], upload_session_id: int, batch_size: int = 5000):
        """
        Save QR identifiers to database for future duplicate checking
        Uses batch inserts for efficiency
        """
        identifiers = []
        
        for record in records:
            identifiers.append(QRIdentifier(
                qr_id=record['qr_id'],
                qr_text_hash=record['qr_text_hash'],
                lot_number=record['lot_number'],
                upload_session_id=upload_session_id
            ))
            
            # Batch insert when reaching batch_size
            if len(identifiers) >= batch_size:
                self.db.bulk_save_objects(identifiers)
                self.db.commit()
                identifiers = []
        
        # Insert remaining records
        if identifiers:
            self.db.bulk_save_objects(identifiers)
            self.db.commit()
    
    def group_by_lot(self, records: List[dict]) -> Dict[str, List[dict]]:
        """Group records by lot_number for CSV generation"""
        lots = {}
        for record in records:
            lot_number = record['lot_number']
            if lot_number not in lots:
                lots[lot_number] = []
            lots[lot_number].append(record)
        return lots