from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from .database import SessionLocal, engine
from . import models

def test_retention():
    db = SessionLocal()
    
    # 1. Add some old logs (e.g., 10 days ago)
    old_time = datetime.utcnow() - timedelta(days=10)
    old_log = models.DailyLog(
        type="Test",
        source="Verifier",
        description="Old log to be deleted",
        timestamp=old_time
    )
    db.add(old_log)
    
    # 2. Add a recent log
    recent_log = models.DailyLog(
        type="Test",
        source="Verifier",
        description="Recent log to keep",
        timestamp=datetime.utcnow()
    )
    db.add(recent_log)
    db.commit()
    
    print("Logs added. Running cleanup...")
    
    # 3. Simulate retention logic
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    deleted_count = db.query(models.DailyLog).filter(models.DailyLog.timestamp < seven_days_ago).delete()
    db.commit()
    
    print(f"Deleted {deleted_count} old logs.")
    
    # 4. Verify
    all_logs = db.query(models.DailyLog).all()
    print(f"Total logs remaining: {len(all_logs)}")
    
    for log in all_logs:
        if log.timestamp < seven_days_ago:
            print(f"ERROR: Found old log {log.id} with timestamp {log.timestamp}")
            return False
            
    print("Verification SUCCESS: No old logs found.")
    db.close()
    return True

if __name__ == "__main__":
    test_retention()
