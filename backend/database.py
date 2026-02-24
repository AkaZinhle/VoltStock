from pymongo import MongoClient
import os
import certifi
from dotenv import load_dotenv
from pathlib import Path

# Construct paths to .env and .env.local files
# 1. backend/.env
# 2. backend/.env.local
# 3. root/.env
# 4. root/.env.local

BASE_DIR = Path(__file__).resolve().parent
ROOT_DIR = BASE_DIR.parent

dotenv_files = [
    BASE_DIR / ".env",
    BASE_DIR / ".env.local",
    ROOT_DIR / ".env",
    ROOT_DIR / ".env.local"
]

for env_file in dotenv_files:
    if env_file.exists():
        load_dotenv(dotenv_path=env_file, encoding="utf-8-sig")

MONGO_URI = os.getenv("MONGO_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME", "voltstock_db")

client = MongoClient(MONGO_URI, tlsCAFile=certifi.where())
database = client[DATABASE_NAME]

inventory_collection = database.get_collection("inventory_collection")
logs_collection = database.get_collection("logs_collection")
orders_collection = database.get_collection("orders_collection")
automation_collection = database.get_collection("automation_collection")

def test_connection():
    try:
        client.admin.command('ping')
        print("Pinged your deployment. You successfully connected to MongoDB!")
    except Exception as e:
        print(e)

if __name__ == "__main__":
    test_connection()
