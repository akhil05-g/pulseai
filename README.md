# PulseAI CRM

PulseAI is an AI-native mini CRM and campaign planning platform designed for shopper outreach, customer analysis, and AI-assisted marketing workflows.

This project combines:
- a Flask backend for CRM, analytics, campaign logic, and AI integrations
- a React + Vite frontend for the user interface
- a separate channel simulator for testing campaign delivery without real messaging providers

It is a strong fit for the Xeno Engineering internship assignment, with AI-assisted campaign planning, customer segmentation, analytics, and channel simulation built into the workflow.

## Features

- Customer management and profile views
- Order and revenue analytics
- Segment creation and AI-assisted segment discovery
- Campaign planning and launch workflows
- AI-generated campaign recommendations and insights
- Simulated channel delivery for testing
- JWT-based authentication

## Tech Stack

### Backend
- Python
- Flask
- Flask-SQLAlchemy
- Flask-CORS
- PyJWT
- Groq AI integration
- SQLite for local development

### Frontend
- React
- Vite
- Tailwind CSS
- Axios
- Zustand

## Project Structure

```text
backend/         # Flask API and business logic
frontend/        # React frontend
channel-simulator/  # simulated delivery service
```

## Prerequisites

Before running the project, make sure you have:
- Python 3.10+
- Node.js 18+
- npm or yarn

## Quick Start

### 1. Backend Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # macOS/Linux
.\.venv\Scripts\activate    # Windows PowerShell
pip install -r requirements.txt
python run.py
```

The backend will start on:
- http://localhost:5000

### 2. Frontend Setup

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend will start on:
- http://localhost:5173

### 3. Channel Simulator

If you want to test campaign simulation:

```bash
cd channel-simulator
python app.py
```

## Environment Variables

Create a `.env` file inside `backend/` with values similar to:

```env
DATABASE_URL=sqlite:///pulseai.db
JWT_SECRET=your_secret_key
GROQ_API_KEY=your_groq_key
CHANNEL_SIMULATOR_URL=http://localhost:5001
```
## 🚀 Live Demo

👉 [Try CRM Application](https://frontend-one-plum-lkkev47bos.vercel.app/login)<br>
<br>
Sample mailid :-demo@pulseai.com<br>
password:-demo123

## License

This project is for educational and assignment purposes.

## Author
PulseAI Founder
G.AKHIL BABU
