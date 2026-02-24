from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
from bson import ObjectId
from database import inventory_collection

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Helpers
def inventory_helper(inventory) -> dict:
    stock = inventory.get("stock", 0)
    unit_price = inventory.get("unitPrice", 0.0)
    calculated_total = stock * unit_price
    
    return {
        "sku": str(inventory["_id"]),
        "name": inventory.get("name"),
        "category": inventory.get("category"),
        "stock": stock,
        "minStock": inventory.get("minStock"),
        "location": inventory.get("location"),
        "unitPrice": unit_price,
        "totalValue": f"${calculated_total:,.2f}"
    }

# Reading data model
class InventoryItem(BaseModel):
    sku: str
    name: str
    category: str
    stock: int
    minStock: int
    location: str
    unitPrice: float
    totalValue: str

# Writing data model
class NewInventoryItem(BaseModel):
    name: str
    category: str
    stock: int
    minStock: int
    location: str
    unitPrice: float

@app.get("/api/inventory", response_model=List[InventoryItem])
def get_inventory():
    inventories = []
    for inventory in inventory_collection.find():
        inventories.append(inventory_helper(inventory))
    return inventories

@app.post("/api/inventory", response_model=InventoryItem)
def add_inventory_item(item: NewInventoryItem):
    inventory_data = item.dict()
    # Insert into DB
    new_inventory = inventory_collection.insert_one(inventory_data)
    # Fetch created item
    created_inventory = inventory_collection.find_one({"_id": new_inventory.inserted_id})
    return inventory_helper(created_inventory)


class BulkUpdateItem(BaseModel):
    skus: List[str]
    name: str | None = None
    category: str | None = None
    location: str | None = None
    stock: int | None = None
    minStock: int | None = None

@app.put("/api/inventory/bulk")
def bulk_update_inventory(data: BulkUpdateItem):
    try:
        # Convert string SKUs to ObjectIDs
        object_ids = [ObjectId(sku) for sku in data.skus]
        
        updates = {}
        if data.name is not None: updates["name"] = data.name
        if data.category is not None: updates["category"] = data.category
        if data.location is not None: updates["location"] = data.location
        if data.stock is not None: updates["stock"] = data.stock
        if data.minStock is not None: updates["minStock"] = data.minStock # Note: MongoDB field name should match what we use. standardized camelCase
        
        if not updates:
             return {"message": "No updates provided"}

        result = inventory_collection.update_many(
            {"_id": {"$in": object_ids}},
            {"$set": updates}
        )
        
        return {"message": f"Updated {result.modified_count} items"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.put("/api/inventory/{sku}")
def update_inventory_item(sku: str, item: NewInventoryItem):
    try:
        # The sku is the ObjectId string
        inventory_data = {
            "name": item.name,
            "category": item.category,
            "stock": item.stock,
            "minStock": item.minStock,
            "location": item.location,
            "unitPrice": item.unitPrice
        }
        
        result = inventory_collection.update_one(
            {"_id": ObjectId(sku)},
            {"$set": inventory_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Item not found")
            
        return {"message": "Item updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/inventory/{sku}")
def delete_inventory_item(sku: str):
    try:
        result = inventory_collection.delete_one({"_id": ObjectId(sku)})
        if result.deleted_count == 0:
             raise HTTPException(status_code=404, detail="Item not found")
        return {"message": "Item deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="localhost", port=8000)
