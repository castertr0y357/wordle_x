#!/usr/bin/env python3
import os
import sys
import json
import gzip
import logging
from datetime import datetime
from pathlib import Path

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - [Backup] - %(levelname)s - %(message)s'
)
logger = logging.getLogger("backup")

ROOT_DIR = Path(__file__).parent
BACKUPS_DIR = ROOT_DIR / "backups"

def load_env_config():
    from dotenv import load_dotenv
    load_dotenv(ROOT_DIR / ".env")
    
    mongo_url = os.environ.get("MONGO_URL")
    db_name = os.environ.get("DB_NAME")
    
    if not mongo_url or not db_name:
        logger.error("Missing MONGO_URL or DB_NAME in environment. Run doctor.py.")
        sys.exit(1)
        
    return mongo_url, db_name

def run_backup():
    mongo_url, db_name = load_env_config()
    BACKUPS_DIR.mkdir(exist_ok=True)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_file = BACKUPS_DIR / f"{db_name}_backup_{timestamp}.json.gz"
    
    logger.info(f"Starting database backup for database '{db_name}'...")
    
    try:
        from pymongo import MongoClient
        client = MongoClient(mongo_url)
        db = client[db_name]
        
        backup_data = {}
        collections = db.list_collection_names()
        
        for col_name in collections:
            # Skip system indexes or temporary collections
            if col_name.startswith("system."):
                continue
                
            documents = list(db[col_name].find())
            # Convert ObjectIds and datetime objects to string representations for JSON serialization
            serialized_docs = []
            for doc in documents:
                # Helper to convert MongoDB specific types
                serialized_doc = serialize_mongo_doc(doc)
                serialized_docs.append(serialized_doc)
                
            backup_data[col_name] = serialized_docs
            logger.info(f"  Dumped {len(serialized_docs)} documents from collection: {col_name}")
            
        # Write to gzipped JSON file
        with gzip.open(backup_file, "wt", encoding="utf-8") as f:
            json.dump(backup_data, f, indent=2)
            
        logger.info(f"Backup completed successfully: {backup_file.name}")
        print(f"Backup file location: {backup_file.absolute()}")
        return True
    except Exception as e:
        logger.error(f"Failed to perform database backup: {e}")
        return False

def run_restore(backup_file_path):
    mongo_url, db_name = load_env_config()
    backup_path = Path(backup_file_path)
    
    if not backup_path.exists():
        logger.error(f"Backup file not found: {backup_file_path}")
        return False
        
    logger.info(f"Starting database restore from '{backup_path.name}' into '{db_name}'...")
    
    try:
        from pymongo import MongoClient
        client = MongoClient(mongo_url)
        db = client[db_name]
        
        # Read from gzipped JSON file
        with gzip.open(backup_path, "rt", encoding="utf-8") as f:
            backup_data = json.load(f)
            
        for col_name, documents in backup_data.items():
            if not documents:
                logger.info(f"  Collection {col_name} is empty, skipping.")
                continue
                
            # Drop existing collection to ensure clean restore
            db[col_name].drop()
            
            # Deserialization check / mapping back is done transparently, 
            # PyMongo inserts string representation just fine for this simple database schema.
            db[col_name].insert_many(documents)
            logger.info(f"  Restored {len(documents)} documents into collection: {col_name}")
            
        logger.info("Restore completed successfully!")
        return True
    except Exception as e:
        logger.error(f"Failed to restore database: {e}")
        return False

def serialize_mongo_doc(doc):
    """Recursively convert BSON types to JSON serializable types."""
    if isinstance(doc, dict):
        return {k: serialize_mongo_doc(v) for k, v in doc.items()}
    elif isinstance(doc, list):
        return [serialize_mongo_doc(v) for v in doc]
    # Handle ObjectId
    elif hasattr(doc, "__str__") and type(doc).__name__ == "ObjectId":
        return str(doc)
    # Handle datetime
    elif isinstance(doc, datetime):
        return doc.isoformat()
    return doc

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python backup.py backup")
        print("  python backup.py restore <path_to_backup_file>")
        sys.exit(1)
        
    action = sys.argv[1].lower()
    if action == "backup":
        success = run_backup()
        sys.exit(0 if success else 1)
    elif action == "restore":
        if len(sys.argv) < 3:
            print("Error: Please specify the backup file to restore.")
            sys.exit(1)
        success = run_restore(sys.argv[2])
        sys.exit(0 if success else 1)
    else:
        print(f"Unknown action: {action}")
        sys.exit(1)
