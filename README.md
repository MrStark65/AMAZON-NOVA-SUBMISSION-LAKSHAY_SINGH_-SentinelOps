# SentinelOps AI

Autonomous cloud infrastructure monitoring, risk detection, cost optimization, and AI-powered remediation — built for the Amazon Nova Hackathon.

**Live Demo:** https://sentinelops-amazon-nova.netlify.app
**Backend API:** https://amazon-nova-submission-lakshay-singh.onrender.com

---

## What It Does

SentinelOps continuously scans your cloud infrastructure and uses Amazon Nova AI models to:

- Predict service failures before they happen (Isolation Forest anomaly detection)
- Detect security misconfigurations and vulnerabilities
- Identify idle resources and cost waste
- Autonomously remediate issues via AI agent automation
- Answer natural language questions about your infrastructure
- Respond to voice queries with spoken AI answers

---

## Amazon Nova Models Used

| Model | Usage |
|---|---|
| `amazon.nova-2-lite-v1:0` | Infrastructure analysis, AI chat assistant, scan summaries, agent task suggestions |
| `amazon.nova-2-sonic-v1:0` | Voice AI — spoken queries answered with synthesized audio |
| `amazon.nova-act-v1:0` | Agent automation — multi-step autonomous DevOps actions |
| `amazon.nova-2-multimodal-embeddings-v1:0` | Semantic embeddings for infrastructure context search |

All models fall back to smart mock responses when Bedrock credentials are not set, so the full demo works without AWS access.

---

## Stack

**Frontend**
- Next.js 15.3.9 + TypeScript
- Tailwind CSS + Framer Motion
- Recharts (metrics visualization)
- Deployed on Netlify

**Backend**
- FastAPI + Python 3.11
- scikit-learn (Isolation Forest for anomaly/failure prediction)
- AWS Bedrock (Amazon Nova models via HTTP Bearer auth)
- Deployed on Render

**Data**
- Simulated demo datasets in `data_files/` (metrics, logs, security, costs)
- Agent state resets on every server restart so all errors reappear fresh for demos

---

## Local Development

### Prerequisites
- Node.js 18+
- Python 3.11+
- AWS account with Bedrock access (optional — works in demo mode without it)

### Backend

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env and add your AWS credentials (optional)
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000

### Environment Variables

**Backend** (`backend/.env`):
```env
AWS_BEARER_TOKEN_BEDROCK=your-bedrock-bearer-token
AWS_DEFAULT_REGION=us-east-1
```

**Frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

For production, set `NEXT_PUBLIC_API_URL` to your deployed backend URL.

---

## Demo Flow

1. Open the app and click **Run Infrastructure Scan**
2. Dashboard shows live metrics, node health, cost waste, and an AI-generated summary
3. Navigate to **Infrastructure** — see per-node CPU/memory/disk with health status
4. Navigate to **Failure Prediction** — AI-predicted failure probabilities with ETAs
5. Navigate to **Security Risks** — misconfigurations ranked by severity with remediation commands
6. Navigate to **Cost Optimization** — idle resources with monthly waste estimates
7. Navigate to **AI Assistant** — ask natural language questions about your infrastructure
8. Navigate to **Voice AI** — speak a query and get an audio response from Nova 2 Sonic
9. Navigate to **Agent Automation** — run autonomous multi-step remediation tasks
   - Fixed tasks persist on the dashboard across the session
   - Click **Reset Demo** to restore all issues

---

## Project Structure

```
sentinelops/
├── frontend/                  # Next.js app
│   ├── app/                   # App router (page.tsx)
│   ├── components/
│   │   ├── Sidebar.tsx        # Responsive nav with mobile drawer
│   │   ├── ScanButton.tsx
│   │   ├── ui/                # Card, Badge, StatCard, HealthRing, etc.
│   │   └── views/             # One component per section
│   ├── lib/
│   │   ├── api.ts             # All backend API calls
│   │   └── types.ts           # Shared TypeScript types
│   └── netlify.toml
│
├── backend/                   # FastAPI app
│   ├── main.py                # App entry point + CORS + demo state reset
│   ├── api/routes.py          # All API endpoints
│   ├── ai/
│   │   ├── bedrock_client.py  # Shared AWS Bedrock HTTP client
│   │   ├── llm.py             # Nova 2 Lite — general inference
│   │   ├── summarizer.py      # Dashboard AI summary
│   │   ├── log_analyzer.py    # Log anomaly analysis
│   │   ├── security_analyzer.py # Security risk analysis
│   │   ├── anomaly.py         # Isolation Forest predictions
│   │   ├── agent.py           # Nova Act — agent automation
│   │   ├── voice.py           # Nova 2 Sonic — voice synthesis
│   │   └── embeddings.py      # Nova Multimodal Embeddings
│   ├── data/
│   │   ├── loader.py          # Loads and processes demo datasets
│   │   └── demo_state.py      # Persists agent fixes during session
│   └── data_files/            # JSON demo datasets
│
└── data/                      # Original seed datasets
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `POST` | `/api/scan` | Full infrastructure scan with AI analysis |
| `POST` | `/api/chat` | AI assistant chat (Nova 2 Lite) |
| `POST` | `/api/voice` | Voice query synthesis (Nova 2 Sonic) |
| `POST` | `/api/agent/run` | Run an agent automation task (Nova Act) |
| `GET` | `/api/agent/suggestions` | Get AI-recommended tasks for current state |
| `POST` | `/api/agent/reset` | Reset demo state (restore all issues) |

---

## Deployment

**Frontend → Netlify**
```bash
cd frontend
netlify deploy --prod
```

**Backend → Render**
- Connect GitHub repo to Render
- Set `AWS_BEARER_TOKEN_BEDROCK` and `AWS_DEFAULT_REGION` as environment variables
- Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

---

## Author

Lakshay Singh — Amazon Nova Hackathon Submission
