# PulseAI — Lightweight CRM & Marketing Campaign Platform

PulseAI is a web application designed for customer record management, audience segmentation, and outbound campaign planning. It provides a web dashboard for marketing and customer teams to inspect purchase histories, define customer segments based on spending criteria, and simulate message delivery across channels without hitting live SMS or email gateways.

---

## Architecture Overview

PulseAI is decoupled into three distinct services:

1. **Flask API Backend (`backend/`):** Handles core business logic, database queries via SQLAlchemy, token authentication, and data formatting.
2. **React Frontend (`frontend/`):** Single-page web client built with Vite and Tailwind CSS for managing customers, creating rules, and viewing campaign reports.
3. **Channel Simulator (`channel-simulator/`):** An independent background service running on port 5001 that accepts dispatch events, simulates message transit, and sends delivery callbacks to mimic live communication APIs.

```text
┌──────────────────────┐         ┌─────────────────────────┐         ┌────────────────────────┐
│   React Dashboard    │  HTTPS  │    Flask REST Server    │  HTTP   │   Channel Simulator    │
│    (Port: 5173)      │ <─────> │      (Port: 5000)       │ <─────> │      (Port: 5001)      │
│                      │         │  - Auth, CRUD, Rules    │         │  - Simulated Delivers  │
└──────────────────────┘         └────────────┬────────────┘         └────────────────────────┘
                                              │
                                              ▼
                                 ┌────────────────────────┐
                                 │   SQLite / PostgreSQL  │
                                 │   - Customers, Orders  │
                                 └────────────────────────┘
```

---

## Live Demo & Credentials

The live deployment can be accessed directly:
- **Web Portal:** [https://frontend-one-plum-lkkev47bos.vercel.app/login](https://frontend-one-plum-lkkev47bos.vercel.app/login)
- **Demo User:** `demo@pulseai.com`
- **Password:** `demo123`

---

## Key Capabilities

- **Customer Records:** Centralized repository storing customer purchase totals, order counts, and contact records with search and pagination.
- **Rule-Based Segmentation:** Filter customer cohorts based on criteria such as spend limits (`total_spend > X`), order recency, and purchase frequency.
- **Campaign Execution:** Create and trigger outreach campaigns targeted at specific saved segments.
- **Copy Suggestions:** Optional prompt-assisted copy generation using Groq API endpoints to quickly draft message variants.
- **Asynchronous Delivery Testing:** Decoupled channel worker mimics network latency, delivery rates, and mock webhook failures for testing before real deployments.
- **JWT Authentication:** Stateless user authentication protecting administrative and data modification endpoints.

---

## Project Structure

```text
pulseai/
├── backend/
│   ├── app/
│   │   ├── models.py            # SQLAlchemy tables (User, Customer, Segment, Campaign)
│   │   ├── routes/              # Auth, customer, segment, and campaign controllers
│   │   └── utils.py             # JWT token helpers and verification
│   ├── requirements.txt         # Python libraries
│   └── run.py                   # Flask server entrypoint
├── frontend/
│   ├── src/
│   │   ├── components/          # Navigation, tables, modals, analytics cards
│   │   ├── pages/               # Login, Customers, Segments, Campaigns
│   │   └── store/               # Zustand application state
│   └── package.json             # React dependencies
└── channel-simulator/
    ├── app.py                   # Flask delivery mock service
    └── requirements.txt         # Simulator dependencies
```

---

## Local Setup

### 1. Backend Service

Requirements: Python 3.10+

```bash
cd backend

# Create and activate environment
python -m venv .venv

# Windows (PowerShell):
.\.venv\Scripts\activate
# macOS / Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start backend
python run.py
```
Backend runs at `http://localhost:5000`.

### 2. Frontend Interface

Requirements: Node.js 18+

```bash
cd frontend

# Install packages
npm install

# Start Vite dev server
npm run dev
```
Frontend runs at `http://localhost:5173`.

### 3. Channel Simulator (Optional)

```bash
cd channel-simulator

python app.py
```
Simulator runs at `http://localhost:5001`.

---

## Environment Configuration

### Backend (`backend/.env`)

```ini
DATABASE_URL=sqlite:///pulseai.db
JWT_SECRET=your_jwt_secret_key
GROQ_API_KEY=optional_groq_api_key_for_copy
CHANNEL_SIMULATOR_URL=http://localhost:5001
```

### Frontend (`frontend/.env`)

```ini
VITE_API_BASE=http://localhost:5000
```

---

## API Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user account | Public |
| `POST` | `/api/auth/login` | Return signed JWT token | Public |

### Customers (`/api/customers`)
| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| `GET` | `/api/customers` | Retrieve customer list with pagination | JWT Required |
| `GET` | `/api/customers/<id>` | Fetch customer order history and profile | JWT Required |
| `POST` | `/api/customers` | Insert customer record | JWT Required |

### Segments (`/api/segments`)
| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| `GET` | `/api/segments` | List saved segments | JWT Required |
| `POST` | `/api/segments` | Save segment rules | JWT Required |
| `POST` | `/api/segments/preview` | Return matching audience count for rule | JWT Required |

### Campaigns (`/api/campaigns`)
| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| `GET` | `/api/campaigns` | List created campaigns and statuses | JWT Required |
| `POST` | `/api/campaigns` | Schedule or dispatch a campaign run | JWT Required |
| `GET` | `/api/campaigns/<id>/stats` | View delivery stats from simulator | JWT Required |

---

## Database Schema

### `users`
| Column | Type | Details |
|---|---|---|
| `id` | Integer | Primary key, autoincrement |
| `email` | String(120) | Unique login email |
| `password_hash` | String(256) | Hashed password string |
| `name` | String(100) | User name |
| `created_at` | DateTime | Signup date |

### `customers`
| Column | Type | Details |
|---|---|---|
| `id` | Integer | Primary key, autoincrement |
| `name` | String(150) | Customer name |
| `email` | String(120) | Contact email |
| `total_spend` | Float | Lifetime spend amount |
| `total_orders` | Integer | Total order count |
| `last_purchase_date` | DateTime | Timestamp of last order |
| `created_at` | DateTime | Ingestion date |

### `segments`
| Column | Type | Details |
|---|---|---|
| `id` | Integer | Primary key, autoincrement |
| `name` | String(100) | Custom segment name |
| `criteria` | JSON / Text | Serialized rule parameters |
| `created_at` | DateTime | Creation date |

### `campaigns`
| Column | Type | Details |
|---|---|---|
| `id` | Integer | Primary key, autoincrement |
| `segment_id` | Integer | Foreign key referencing `segments.id` |
| `title` | String(150) | Campaign identifier |
| `message_content` | Text | Outreach body |
| `channel` | String(50) | Delivery channel (Email, SMS) |
| `status` | String(50) | Draft, Dispatched, or Completed |
| `created_at` | DateTime | Dispatch timestamp |

---

## Deployment Notes

- **Frontend:** Hosted on Vercel with single-page application routing rules configured.
- **Backend & Simulator:** Configured for containerized or runtime-based deployments on Render via `render.yaml`.
- **CORS:** Ensure `VITE_API_BASE` is updated in the frontend environment when pointing to a remote backend.

---

## Author

**Gujjarlapudi Akhil Babu**  
- **GitHub:** [@akhil05-g](https://github.com/akhil05-g)  
- **LinkedIn:** [Akhil Gujjarlapudi](https://www.linkedin.com/in/akhil-gujjarlapudi-409390363)
