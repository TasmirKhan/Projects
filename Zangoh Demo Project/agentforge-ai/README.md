# AgentForge AI
**Tagline:** Outcome-First Autonomous Digital Employees

## Vision
AgentForge AI is an enterprise AI workforce platform where humans define outcomes and Digital Employees autonomously deliver execution.

## Architecture
- Next.js App Router frontend + API routes
- Zustand state layer for workspace interactions
- OpenAI service via `/api/ai/execute`
- Mock enterprise analytics + audit data

## Features
- Landing page with premium product narrative
- Operations dashboard with KPI cards and activity feed
- Employee workspace with workflow stages, reasoning visibility, and AI output
- Audit logs with timestamped action history
- Analytics panel for operational indicators
- Multi-agent simulation (Sales/Support/Ops)

## Setup
1. `npm install`
2. `npm run dev`
3. Open `http://localhost:3000`

## Environment Variables
Create `.env.local`:
- `GEMINI_API_KEY=your_key_here`

## Screenshot Placeholders
- `/docs/screenshots/landing.png`
- `/docs/screenshots/dashboard.png`
- `/docs/screenshots/workspace.png`

## Roadmap
- Streaming token-by-token reasoning UI
- File upload processing for PDF/TXT/DOCX
- Human escalation approvals with edit/reject flows
- Advanced analytics powered by persistent event storage
