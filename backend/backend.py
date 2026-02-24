import os
import re
from bson import ObjectId
# FIX: Imported 'automation_collection' (singular) matching your database.py
from database import inventory_collection, logs_collection, orders_collection, automation_collection
from datetime import datetime, timedelta
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Any
from urllib import response
import httpx

# Gemini Config
DIFY_API_KEY = "enter dify key" 
DIFY_API_URL = "https://api.dify.ai/v1/chat-messages"

app = FastAPI()

# Cors config
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data Models
class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]
    conversation_id: str = None 

# API Endpoints
@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    try:
        if not request.messages:
            raise HTTPException(status_code=400, detail="No messages provided")

        last_user_message = request.messages[-1].content

        headers = {
            "Authorization": f"Bearer {DIFY_API_KEY}",
            "Content-Type": "application/json"
        }

        payload = {
            "inputs": {},
            "query": last_user_message,
            "response_mode": "blocking",
            "user": "api-user-1234", 
            "files": []
        }

        if request.conversation_id:
            payload["conversation_id"] = request.conversation_id

        async with httpx.AsyncClient() as client:
            response = await client.post(DIFY_API_URL, json=payload, headers=headers, timeout=300.0)
            
            if response.status_code != 200:
                print(f"Dify Error: {response.text}")
                raise HTTPException(status_code=response.status_code, detail="Error from AI Provider")

            dify_data = response.json()
            bot_response = dify_data.get("answer", "")
            new_conversation_id = dify_data.get("conversation_id", "")

            return {
                "role": "model",
                "content": bot_response,
                "conversation_id": new_conversation_id 
            }

    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

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
    new_inventory = inventory_collection.insert_one(inventory_data)
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
        object_ids = [ObjectId(sku) for sku in data.skus]
        
        updates = {}
        if data.name is not None: updates["name"] = data.name
        if data.category is not None: updates["category"] = data.category
        if data.location is not None: updates["location"] = data.location
        if data.stock is not None: updates["stock"] = data.stock
        if data.minStock is not None: updates["minStock"] = data.minStock
        
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

# --- AUTOMATION LOGIC START ---

class NewAutomationRule(BaseModel):
    sku: int
    type: str 
    condition: int
    amount: int
    source_name: str
    source_link: str
    status: str = "active"

class AutomationRuleResponse(BaseModel):
    id: str
    sku: int
    type: str
    condition: int
    amount: int
    source_name: str
    source_link: str
    status: str
    linked_items: List[dict] = []

@app.get("/api/automations", response_model=List[AutomationRuleResponse])
def get_automations():
    # FIX: "from": "inventory_collection" matches the exact name in your database.py
    pipeline = [
        {
            "$lookup": {
                "from": "inventory_collection", 
                "localField": "sku", 
                "foreignField": "sku", 
                "as": "linked_items"
            }
        }
    ]
    
    rules = []
    try:
        # FIX: using automation_collection (singular)
        cursor = automation_collection.aggregate(pipeline)
        for doc in cursor:
            doc["id"] = str(doc["_id"])
            
            # Sanitizing linked items IDs
            for item in doc.get("linked_items", []):
                if "_id" in item:
                    item["_id"] = str(item["_id"])
            
            rules.append(doc)
        return rules
    except Exception as e:
        print(f"Error fetching automations: {e}")
        # Return empty list instead of crashing if DB is empty/erroring slightly
        return [] 

@app.post("/api/automations")
def create_automation(rule: NewAutomationRule):
    try:
        rule_data = rule.dict()
        
        # Verify SKU exists (optional check)
        # Note: inventory_collection uses ObjectId as _id, but maybe 'sku' field as string?
        # Adjust query based on your schema. Assuming 'sku' field exists in inventory.
        # If your inventory uses _id as SKU, use: inventory_collection.find_one({"_id": ObjectId(rule.sku)})
        
        result = automation_collection.insert_one(rule_data)
        
        # Return created object
        created_rule = {
            **rule_data, 
            "id": str(result.inserted_id),
            "linked_items": [] # Frontend handles reload or we mock it
        }
        return created_rule
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/automations/{rule_id}/status")
def toggle_automation_status(rule_id: str, status_update: dict):
    try:
        result = automation_collection.update_one(
            {"_id": ObjectId(rule_id)},
            {"$set": {"status": status_update.get("status")}}
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Rule not found")
        return {"message": "Status updated"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- AUTOMATION LOGIC END ---

class LogItem(BaseModel):
    date: str
    id: int | str
    item: str
    quantity: int
    value: float
    source_customer: str
    responsible: str
    total_value: float
    in_out: str

class SummaryStats(BaseModel):
    total_inbound_30d: float
    total_outbound_30d: float

@app.get("/api/stats", response_model=SummaryStats)
def get_stats():
    current_date = datetime(2026, 1, 12) 
    thirty_days_ago = (current_date - timedelta(days=30)).strftime("%Y-%m-%d")
    
    pipeline_inbound = [
        {"$match": {"in_out": "in", "date": {"$gte": thirty_days_ago}}},
        {"$group": {"_id": None, "total": {"$sum": {"$multiply": ["$quantity", "$value"]}}}}
    ]
    
    pipeline_outbound = [
        {"$match": {"in_out": "out", "date": {"$gte": thirty_days_ago}}},
        {"$group": {"_id": None, "total": {"$sum": {"$multiply": ["$quantity", "$value"]}}}}
    ]
    
    inbound_result = list(logs_collection.aggregate(pipeline_inbound))
    outbound_result = list(logs_collection.aggregate(pipeline_outbound))
    
    inbound_total = inbound_result[0]['total'] if inbound_result else 0.0
    outbound_total = outbound_result[0]['total'] if outbound_result else 0.0
    
    return {
        "total_inbound_30d": round(inbound_total, 2),
        "total_outbound_30d": round(outbound_total, 2)
    }

@app.get("/api/logs/{log_type}", response_model=List[LogItem])
def get_logs(log_type: str):
    if log_type not in ['inbound', 'outbound']:
        raise HTTPException(status_code=400, detail="Invalid log type")
    
    db_type = 'in' if log_type == 'inbound' else 'out'
    
    logs = []
    cursor = logs_collection.find({"in_out": db_type}).sort("date", -1)
    
    for log in cursor:
        logs.append({
            "date": log["date"],
            "id": str(log["_id"]),
            "item": log["item"],
            "quantity": log["quantity"],
            "value": log["value"],
            "source_customer": log["source_customer"],
            "responsible": log["responsible"],
            "in_out": log["in_out"],
            "total_value": log["quantity"] * log["value"]
        })
    
    return logs

class Order(BaseModel):
    id: str
    customer: str
    items: int
    status: str
    tracking: str
    date: str

@app.get("/api/orders", response_model=List[Order])
def get_orders():
    orders = []
    for order in orders_collection.find().sort("id", 1):
        orders.append({
            "id": str(order["_id"]),
            "customer": order.get("customer"),
            "items": order.get("items"),
            "status": order.get("status"),
            "tracking": order.get("tracking_number"),
            "date": order.get("date")
        })
    return orders

@app.delete("/api/orders/{order_id}")
def delete_order(order_id: str):
    try:
        result = orders_collection.delete_one({"_id": ObjectId(order_id)})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Order not found")
            
        return {"message": "Order deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- DASHBOARD AGGREGATION START ---

@app.get("/api/dashboard")
def get_dashboard_data():
    try:
        # 1. SET THE ANCHOR DATE
        # We use Jan 12, 2026 (or datetime.now() if you prefer real-time)
        anchor_date = datetime(2026, 1, 12) 
        
        # Generate the list of LAST 30 DAYS as Strings in "dd/mm/yyyy" format
        # This solves the format mismatch issue.
        target_dates = []
        for i in range(30):
            d = anchor_date - timedelta(days=i)
            # CRITICAL: Format as dd/mm/yyyy to match MongoDB
            target_dates.append(d.strftime("%d/%m/%Y")) 

        # --- 1. Inventory Stats ---
        inventory_pipeline = [
            {
                "$group": {
                    "_id": None,
                    "totalValue": {"$sum": {"$multiply": ["$stock", "$unitPrice"]}},
                    "lowStockCount": {"$sum": {"$cond": [{"$lt": ["$stock", "$minStock"]}, 1, 0]}}
                }
            }
        ]
        inv_stats = list(inventory_collection.aggregate(inventory_pipeline))
        total_inv_value = inv_stats[0]["totalValue"] if inv_stats else 0
        low_stock_count = inv_stats[0]["lowStockCount"] if inv_stats else 0
        
        # --- 2. Pending Orders ---
        pending_orders = orders_collection.count_documents({"status": {"$ne": "Shipped"}})

        # --- 3. CHART DATA (In vs Out) ---
        # Since dates are strings, we cannot use $gte range queries reliably.
        # Instead, we look for documents where the date is exactly IN our list of 30 days.
        chart_pipeline = [
            {"$match": {
                "date": {"$in": target_dates}, # Match specific dd/mm/yyyy strings
                "in_out": {"$in": ["in", "out"]}
            }},
            {"$group": {
                "_id": {
                    "date": "$date",
                    "type": "$in_out"
                },
                "dailyValue": {"$sum": {"$multiply": ["$quantity", "$value"]}}
            }}
        ]
        
        logs_data = list(logs_collection.aggregate(chart_pipeline))
        
        # Create a dictionary for fast lookup: data_map["12/01/2026"]["in"] = 500
        data_map = {}
        for entry in logs_data:
            d_str = entry["_id"]["date"]
            t = entry["_id"]["type"]
            val = entry["dailyValue"]
            
            if d_str not in data_map: data_map[d_str] = {"in": 0.0, "out": 0.0}
            data_map[d_str][t] = val

        # Reconstruct the 30-day array in chronological order
        chart_data = []
        # Loop 29 down to 0 to show oldest date on left, newest on right
        for i in range(29, -1, -1):
            date_obj = anchor_date - timedelta(days=i)
            d_str = date_obj.strftime("%d/%m/%Y") # Lookup key
            day_label = date_obj.strftime("%d")   # X-axis label (Day number)
            
            day_stats = data_map.get(d_str, {"in": 0.0, "out": 0.0})
            
            chart_data.append({
                "day": day_label,
                "inbound": day_stats["in"],
                "outbound": day_stats["out"]
            })

        # --- 4. KPI Calculations (Turnover/Top Item) ---
        # Note: Calculating "MTD" or "Last 30 days" with string dates is tricky in Mongo.
        # For simplicity/performance, we reuse the data we just fetched for the chart.
        
        mtd_shipped_value = sum(item['outbound'] for item in chart_data)
        
        # For Top Item, we need a separate query using the $in list
        top_item_pipeline = [
            {"$match": {
                "in_out": "out", 
                "date": {"$in": target_dates}
            }},
            {"$group": {"_id": "$item", "totalQty": {"$sum": "$quantity"}}},
            {"$sort": {"totalQty": -1}},
            {"$limit": 1}
        ]
        top_item_stats = list(logs_collection.aggregate(top_item_pipeline))
        top_selling_item = top_item_stats[0]["_id"] if top_item_stats else "N/A"
        top_selling_qty = top_item_stats[0]["totalQty"] if top_item_stats else 0

        turnover_rate = 0
        if total_inv_value > 0:
            turnover_rate = round(mtd_shipped_value / total_inv_value * 100, 1)

        return {
            "total_inventory_value": total_inv_value,
            "low_stock_count": low_stock_count,
            "pending_orders": pending_orders,
            "turnover_rate": turnover_rate,
            "top_selling_item": top_selling_item,
            "top_selling_qty": top_selling_qty,
            "mtd_shipped_value": mtd_shipped_value,
            "chart_data": chart_data
        }

    except Exception as e:
        print(f"Dashboard Error: {e}")
        raise HTTPException(status_code=500, detail="Error fetching dashboard metrics")

# --- DASHBOARD AGGREGATION END ---

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="localhost", port=8000)