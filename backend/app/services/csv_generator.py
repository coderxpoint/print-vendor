import csv
import os
from datetime import datetime
from typing import List, Dict
from app.core.config import settings

class CSVGenerator:
    """Service for generating CSV files from validated data"""
    
    def __init__(self):
        self.upload_dir = settings.UPLOAD_DIR
        self._ensure_upload_dir()
    
    def _ensure_upload_dir(self):
        """Create upload directory if it doesn't exist"""
        if not os.path.exists(self.upload_dir):
            os.makedirs(self.upload_dir)
    
    def generate_filename(self, lot_number: str) -> str:
        """
        Generate unique filename for CSV
        Format: {lot_number}_{timestamp}.csv
        """
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{lot_number}_{timestamp}.csv"
        return filename
    
    def save_to_csv(self, lot_number: str, records: List[dict]) -> Dict[str, str]:
        """
        Save records to CSV file
        Returns: {file_path, file_name}
        """
        filename = self.generate_filename(lot_number)
        file_path = os.path.join(self.upload_dir, filename)
        
        # CSV headers
        headers = ['qr_id', 'qr_text', 'lot_number', 'print_format']
        
        # Write to CSV
        with open(file_path, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=headers)
            writer.writeheader()
            
            for record in records:
                writer.writerow({
                    'qr_id': record['qr_id'],
                    'qr_text': record['qr_text'],
                    'lot_number': record['lot_number'],
                    'print_format': record['print_format']
                })
        
        return {
            'file_path': file_path,
            'file_name': filename
        }
    
    def file_exists(self, file_path: str) -> bool:
        """Check if file exists"""
        return os.path.exists(file_path)
    
    def get_file_size(self, file_path: str) -> int:
        """Get file size in bytes"""
        return os.path.getsize(file_path)