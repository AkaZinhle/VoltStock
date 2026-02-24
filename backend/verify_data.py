
from database import inventory_collection, logs_collection, orders_collection

print("--- Inventory ---")
try:
    count = inventory_collection.count_documents({})
    print(f"Count: {count}")
    for item in inventory_collection.find().limit(3):
        print(item)
except Exception as e:
    print(e)
    
print("\n--- Logs ---")
try:
    count = logs_collection.count_documents({})
    print(f"Count: {count}")
except Exception as e:
    print(e)

print("\n--- Orders ---")
try:
    count = orders_collection.count_documents({})
    print(f"Count: {count}")
except Exception as e:
    print(e)
