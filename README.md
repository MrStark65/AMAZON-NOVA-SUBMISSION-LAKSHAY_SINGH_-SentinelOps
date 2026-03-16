# SentinelOps AI

Autonomous Cloud Risk, Cost & Failure Prediction System

## Quick Start

### Backend
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env   
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000, then click **Run Infrastructure Scan**.

## Demo Flow
1. Click "Run Infrastructure Scan"
2. Dashboard shows live metrics, critical nodes, cost waste
3. Navigate to each section for detailed analysis
4. Use AI Assistant to ask questions about your infrastructure

## AI Mode
- With `OPENAI_API_KEY` set → uses GPT-4.1 for real AI responses
- Without key → uses smart keyword-based mock responses (fully functional for demo)

## Stack
- Frontend: Next.js 15, TypeScript, Tailwind CSS, Recharts, Framer Motion
- Backend: FastAPI, Python, scikit-learn (Isolation Forest), OpenAI
- Data: Simulated demo datasets in `/data`
