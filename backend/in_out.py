import re
import os
from datetime import datetime, timedelta
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from database import logs_collection

app = FastAPI()

# Enable CORS for frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Models ---

class LogItem(BaseModel):
    date: str
    id: int | str
    item: str
    quantity: int
    value: float
    source_customer: str
    responsible: str
    total_value: float  # Calculated field
    in_out: str # Added field for database consistency, though filtered in API

class SummaryStats(BaseModel):
    total_inbound_30d: float
    total_outbound_30d: float

# --- Endpoints ---

@app.get("/api/stats", response_model=SummaryStats)
def get_stats():
    # Calculate date 30 days ago
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
            "id": str(log["_id"]), # Mapping Mongo ID
            "item": log["item"],
            "quantity": log["quantity"],
            "value": log["value"],
            "source_customer": log["source_customer"],
            "responsible": log["responsible"],
            "in_out": log["in_out"],
            "total_value": log["quantity"] * log["value"]
        })
    
    return logs

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
