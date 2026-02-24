
from database import MONGO_URI, client, database, DATABASE_NAME

print(f"MONGO_URI: {MONGO_URI}")

if not MONGO_URI:
    print("MONGO_URI is None! Defaulting to localhost implicitly by MongoClient.")

print(f"Connected to: {client.address}")

try:
    # severe connection
    client.admin.command('ping')
    print("Ping successful!")
    print(f"Server Info: {client.server_info()['version']}")
except Exception as e:
    print(f"Ping failed or could not get server info: {e}")

print(f"Database Name: {DATABASE_NAME}")
print(f"Collections: {database.list_collection_names()}")
