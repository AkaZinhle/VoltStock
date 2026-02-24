from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from bson import ObjectId
from database import orders_collection

app = FastAPI()

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # In production, replace with specific frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic model for response
class Order(BaseModel):
    id: str  # Changed from int to str for ObjectId
    customer: str  # Mapped from 'source'
    items: int
    status: str
    tracking: str # Mapped from 'tracking_number'
    date: str

@app.get("/api/orders", response_model=List[Order])
def get_orders():
    orders = []
    # Map fields to match logic: source -> customer, tracking_number -> tracking
    for order in orders_collection.find().sort("id", 1): # sorting by id if needed, or date
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
