# VoltStock: AI-Powered Autonomous Inventory & Agentic Commerce

VoltStock is a professional full-stack inventory management system that integrates agentic AI to automate warehouse operations and procurement. By leveraging the **Model Context Protocol (MCP)** and the **Agent Payments Protocol (AP2)**, VoltStock transforms a traditional inventory ledger into an active, intelligent participant in the business lifecycle.

---

## Key Features

* **AI Co-Pilot**: A natural language chat interface that allows users to query the inventory, troubleshoot discrepancies, and receive real-time alerts.

* **Agentic Commerce**: Autonomous procurement capabilities using Google’s AP2 protocol, allowing the system to research and execute purchases via cryptographically signed mandates.

* **Real-time Dashboard**: A high-performance visualization suite for tracking key performance indicators (KPIs) such as Monthly Turnover Rate and Value Shipped.

* **Intelligent Inventory Management**: Automated tracking of "Safety Stock" and "Reorder Points" to prevent stockouts and minimize excess inventory.

* **Automated Audit Trails**: An immutable "In-Out Log" system that records every inventory movement, ensuring a reliable "Source of Truth" for industrial resource management.

* **Schema-Aware Reasoning**: Uses a dedicated MCP server to provide LLMs with direct, standardized access to the MongoDB database layer.

<img width="1872" height="909" alt="image" src="https://github.com/user-attachments/assets/d4f1fba4-bd79-49fa-ac4d-483ca091c2fa" />
<img width="1872" height="909" alt="image" src="https://github.com/user-attachments/assets/0ec94001-ff12-410f-b0f4-92657382b61d" />
<img width="1872" height="909" alt="image" src="https://github.com/user-attachments/assets/18a93a02-75a3-4f18-9f71-175688ee7504" />
<img width="1872" height="909" alt="image" src="https://github.com/user-attachments/assets/33a3ccfc-16fc-4cdd-b872-d64dad8fdde6" />
<img width="1872" height="909" alt="image" src="https://github.com/user-attachments/assets/8b4175ee-cb62-465b-a85e-a08a971b6367" />
<img width="1872" height="909" alt="image" src="https://github.com/user-attachments/assets/db2dd8b3-50d8-49cb-a350-c5a89bbafdfd" />




---

## Tech Stack

### Frontend

* **Framework**: React with TypeScript.

* **Styling**: Tailwind CSS and Radix UI.

* **Icons**: Lucide React.

### Backend

* **API Framework**: Python FastAPI.

* **Database**: MongoDB Atlas.

* **AI Orchestration**: Dify (Think-Act-Observe workflows).


### AI & Protocols

* **Protocols**: Model Context Protocol (MCP), Agent Payments Protocol (AP2).

* **LLMs**: Support for high-tier providers including Gemini and Claude.

* **Inference**: Optimized via Server-Sent Events (SSE) for streaming responses.


---

## System Architecture

VoltStock operates on a "Data-to-Agent" flow:

1. **Frontend**: The React application handles user interactions and displays real-time metrics.

2. **Backend Services**: Python FastAPI acts as the bridge between the UI and data.

3. **MCP Server**: Standardizes communication between the AI agents and the MongoDB database.

4. **Agentic Layer**: The Dify orchestration framework manages complex multi-step reasoning cycles.

5. **Commerce Layer**: AP2 manages secure, autonomous procurement through verifiable intent mandates.

---

## Getting Started

### Prerequisites

* Python 3.10+.

* Node.js and npm/yarn.

* MongoDB Atlas Cluster.

* Google Cloud Platform (GCP) account for AP2 integration.

* API keys for LLM providers (Gemini or Claude).


### Installation

1. **Clone the Repository**:
```bash
git clone https://github.com/yourusername/voltstock.git
cd voltstock

```


2. **Backend Setup**:
```bash
cd backend
pip install -r requirements.txt
# [cite_start]Configure your .env file with MONGODB_URI and GOOGLE_API_KEY [cite: 125]
uvicorn main:app --reload

```


3. **Frontend Setup**:
```bash
cd frontend
npm install
npm run dev

```


4. **MCP & Dify Configuration**:
* Deploy the MongoDB MCP server.

* Import the provided Dify agentic workflow.


---

## Usage

* **Dashboard**: Monitor warehouse health through live-updated cards and charts.

* **Inventory View**: Perform manual CRUD operations or bulk item imports.

* **Co-Pilot**: Open the chat sidebar and use natural language commands like *"What items are currently below safety stock?"* or *"Initiate a purchase order for 50 units of SKU-123"*.

* **Shipping & Logs**: Track active orders and view the automated movement history for auditing.

---

## License

This project is licensed under the MIT License.
