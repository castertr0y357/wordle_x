#!/usr/bin/env python3
import os
import sys
import logging
from pathlib import Path

# Setup logging in standard format
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - [Doctor] - %(levelname)s - %(message)s'
)
logger = logging.getLogger("doctor")

ROOT_DIR = Path(__file__).parent

def check_env_file():
    logger.info("Checking environment configuration files...")
    env_path = ROOT_DIR / ".env"
    example_path = ROOT_DIR / ".env.example"
    
    if not env_path.exists():
        logger.error("No .env file found! Please copy .env.example to .env.")
        return False
        
    logger.info("  .env file exists.")
    
    # Read variables
    from dotenv import dotenv_values
    env_vars = dotenv_values(env_path)
    example_vars = dotenv_values(example_path)
    
    missing_vars = [var for var in example_vars if var not in env_vars]
    if missing_vars:
        logger.warning(f"  Missing variables in .env relative to .env.example: {', '.join(missing_vars)}")
    else:
        logger.info("  All environment variables from .env.example are present in .env.")
        
    required = ["MONGO_URL", "DB_NAME", "JWT_SECRET_KEY"]
    for req in required:
        val = env_vars.get(req)
        if not val or val == "replace_with_secure_random_key_in_production":
            logger.warning(f"  Value for {req} is empty, default, or insecure: '{val}'")
            
    return True

def check_db_connection():
    logger.info("Checking database connection...")
    from dotenv import load_dotenv
    load_dotenv(ROOT_DIR / ".env")
    
    mongo_url = os.environ.get("MONGO_URL")
    db_name = os.environ.get("DB_NAME")
    
    if not mongo_url:
        logger.error("  MONGO_URL is not set.")
        return False
        
    try:
        from pymongo import MongoClient
        client = MongoClient(mongo_url, serverSelectionTimeoutMS=3000)
        # Trigger a connection
        client.admin.command('ping')
        logger.info(f"  Successfully connected to MongoDB at {mongo_url}")
        
        db = client[db_name]
        logger.info(f"  Connected to database: {db_name}")
        
        # Check collections
        collections = db.list_collection_names()
        logger.info(f"  Existing collections: {', '.join(collections) if collections else 'None (empty database)'}")
        return True
    except ImportError:
        logger.warning("  pymongo is not installed on the host environment. Skipping database ping check.")
        logger.info("  Note: Database connectivity will be tested inside the Docker containers during runtime.")
        return True
    except Exception as e:
        logger.error(f"  Failed to connect to MongoDB: {e}")
        return False

def check_rules_sync():
    logger.info("Verifying workspace rules files...")
    rules_files = [".cursorrules", ".windsurfrules", "AGENTS.md", "CLAUDE.md"]
    
    all_ok = True
    for f in rules_files:
        rules_path = ROOT_DIR / f
        if not rules_path.exists():
            logger.error(f"  Rule file {f} is missing!")
            all_ok = False
            continue
            
        content = rules_path.read_text(encoding="utf-8")
        if "docker-compose config" not in content:
            logger.warning(f"  Rule file {f} does not reference 'docker-compose config' verify command.")
            all_ok = False
            
    if all_ok:
        logger.info("  All local rules files exist and contain appropriate verify command configuration.")
    return all_ok

def run_diagnostics():
    logger.info("=" * 60)
    logger.info("Wordle X Workspace Diagnostic Doctor")
    logger.info("=" * 60)
    
    env_ok = check_env_file()
    db_ok = check_db_connection()
    rules_ok = check_rules_sync()
    
    logger.info("=" * 60)
    if env_ok and db_ok and rules_ok:
        logger.info("All checks PASSED! Workspace is healthy.")
        sys.exit(0)
    else:
        logger.error("Some checks FAILED. Please review the warnings/errors above.")
        sys.exit(1)

if __name__ == "__main__":
    run_diagnostics()
