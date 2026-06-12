# PulseAI — Complete Build Specification
> AI Marketing Strategist · React + Vite + TailwindCSS · Flask · MySQL · Groq

---

## PART 1 — DESIGN SYSTEM

### Design Philosophy
PulseAI is a **command center for AI-driven marketing**, not a spreadsheet CRM.
The UI must feel like a live, breathing intelligence — dark, premium, and always moving.
Inspiration: Vercel dashboard × Linear × Notion AI × Bloomberg Terminal.

### Color Palette
```
--bg-base:        #080814   ← deep space (page background)
--bg-surface:     #0E0E1C   ← card background
--bg-elevated:    #161628   ← modal, dropdown, elevated panel
--bg-hover:       #1E1E32   ← hover state

--primary:        #7C3AED   ← violet (main brand)
--primary-light:  #8B5CF6   ← lighter violet (hover, icons)
--primary-glow:   rgba(124, 58, 237, 0.25)

--accent:         #06B6D4   ← cyan (AI elements, links)
--accent-glow:    rgba(6, 182, 212, 0.20)

--pink:           #EC4899   ← energy, alerts, high-churn risk
--pink-glow:      rgba(236, 72, 153, 0.20)

--success:        #10B981
--warning:        #F59E0B
--danger:         #EF4444

--border:         rgba(255,255,255,0.07)
--border-strong:  rgba(255,255,255,0.12)

--text-primary:   #F1F5F9
--text-secondary: #94A3B8
--text-muted:     #475569
```

### Typography
```
Display font:  "Plus Jakarta Sans"  → headings, brand name, big numbers
Body font:     "Inter"              → body text, labels, paragraphs
Mono font:     "JetBrains Mono"     → IDs, stats, code blocks, metric numbers
```

Add to index.html:
```html
<link href="https://fonts.googleapis.com/css2?
  family=Plus+Jakarta+Sans:wght@400;600;700;800&
  family=Inter:wght@400;500;600&
  family=JetBrains+Mono:wght@400;500&
  display=swap" rel="stylesheet">
```

### Tailwind Config Extension (tailwind.config.js)
```js
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base:     '#080814',
        surface:  '#0E0E1C',
        elevated: '#161628',
        primary:  '#7C3AED',
        accent:   '#06B6D4',
        pulse:    '#EC4899',
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
        body:    ['Inter', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'glow-violet': '0 0 30px rgba(124,58,237,0.3)',
        'glow-cyan':   '0 0 30px rgba(6,182,212,0.25)',
        'glow-pink':   '0 0 30px rgba(236,72,153,0.25)',
        'card':        '0 4px 24px rgba(0,0,0,0.4)',
      },
      backgroundImage: {
        'gradient-pulse': 'linear-gradient(135deg, #7C3AED, #06B6D4)',
        'gradient-fire':  'linear-gradient(135deg, #7C3AED, #EC4899)',
        'gradient-cool':  'linear-gradient(135deg, #06B6D4, #10B981)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float':      'float 6s ease-in-out infinite',
        'glow':       'glow 2s ease-in-out infinite alternate',
      }
    }
  }
}
```

### Global CSS (index.css)
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  background-color: #080814;
  color: #F1F5F9;
  font-family: 'Inter', sans-serif;
}

/* Signature: AI Pulse ambient glow on main content */
.ai-ambient {
  position: relative;
}
.ai-ambient::before {
  content: '';
  position: fixed;
  top: 20%;
  left: 50%;
  transform: translateX(-50%);
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%);
  pointer-events: none;
  z-index: 0;
  animation: pulse 4s ease-in-out infinite;
}

/* Glass card */
.glass {
  background: rgba(14, 14, 28, 0.8);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 16px;
}

/* Gradient text */
.grad-text {
  background: linear-gradient(135deg, #8B5CF6, #06B6D4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Scrollbar */
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: #080814; }
::-webkit-scrollbar-thumb { background: #2D2D4A; border-radius: 4px; }

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
}
@keyframes glow {
  from { box-shadow: 0 0 20px rgba(124,58,237,0.2); }
  to   { box-shadow: 0 0 40px rgba(124,58,237,0.5); }
}
```

### Signature Design Element
**"The AI Pulse"** — A slow-breathing radial violet glow that persists behind the main
content area. It subtly intensifies when an AI operation is running (add a CSS class
`ai-active` that bumps opacity). This makes AI feel *alive* in the UI.

---

## PART 2 — PROJECT STRUCTURE

```
pulseai/
├── frontend/               ← React + Vite + Tailwind
│   ├── public/
│   ├── src/
│   │   ├── api/            ← axios calls, one file per domain
│   │   │   ├── auth.js
│   │   │   ├── customers.js
│   │   │   ├── orders.js
│   │   │   ├── segments.js
│   │   │   ├── campaigns.js
│   │   │   ├── analytics.js
│   │   │   └── ai.js
│   │   ├── components/     ← reusable UI components
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   ├── Topbar.jsx
│   │   │   │   └── AppLayout.jsx
│   │   │   ├── ui/
│   │   │   │   ├── GlowCard.jsx
│   │   │   │   ├── StatCard.jsx
│   │   │   │   ├── Badge.jsx
│   │   │   │   ├── GradientButton.jsx
│   │   │   │   ├── GlowInput.jsx
│   │   │   │   ├── AITypingIndicator.jsx
│   │   │   │   ├── PulseRing.jsx
│   │   │   │   └── LoadingSkeleton.jsx
│   │   │   ├── charts/
│   │   │   │   ├── RevenueChart.jsx
│   │   │   │   ├── ChannelChart.jsx
│   │   │   │   ├── FunnelChart.jsx
│   │   │   │   └── TrendLine.jsx
│   │   │   └── campaign/
│   │   │       ├── CampaignCard.jsx
│   │   │       ├── MessagePreview.jsx
│   │   │       └── JourneyFunnel.jsx
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   └── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── customers/
│   │   │   │   ├── CustomerList.jsx
│   │   │   │   └── CustomerProfile.jsx
│   │   │   ├── orders/
│   │   │   │   └── OrderList.jsx
│   │   │   ├── segments/
│   │   │   │   └── SegmentBuilder.jsx
│   │   │   ├── ai/
│   │   │   │   └── AICommandCenter.jsx
│   │   │   ├── campaigns/
│   │   │   │   ├── CampaignManager.jsx
│   │   │   │   ├── CampaignPlanner.jsx
│   │   │   │   └── CampaignDetail.jsx
│   │   │   └── analytics/
│   │   │       └── Analytics.jsx
│   │   ├── store/          ← Zustand state management
│   │   │   ├── authStore.js
│   │   │   └── campaignStore.js
│   │   ├── hooks/          ← custom hooks
│   │   │   ├── useAI.js
│   │   │   └── useCampaign.js
│   │   ├── utils/
│   │   │   ├── api.js      ← axios instance with JWT interceptor
│   │   │   └── format.js   ← currency, date formatters
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── tailwind.config.js
│
├── backend/                ← Flask CRM service
│   ├── app/
│   │   ├── __init__.py     ← Flask factory
│   │   ├── config.py
│   │   ├── models/
│   │   │   ├── user.py
│   │   │   ├── customer.py
│   │   │   ├── order.py
│   │   │   ├── segment.py
│   │   │   ├── campaign.py
│   │   │   └── memory.py
│   │   ├── routes/
│   │   │   ├── auth.py
│   │   │   ├── customers.py
│   │   │   ├── orders.py
│   │   │   ├── segments.py
│   │   │   ├── campaigns.py
│   │   │   ├── analytics.py
│   │   │   ├── ai.py
│   │   │   └── webhooks.py
│   │   ├── services/
│   │   │   ├── groq_service.py   ← Groq API wrapper
│   │   │   ├── memory_service.py ← Campaign Memory Engine
│   │   │   └── segment_service.py
│   │   └── seed.py         ← seed realistic data
│   ├── requirements.txt
│   └── run.py
│
└── channel-simulator/      ← Separate Flask service
    ├── app.py
    └── requirements.txt
```

---

## PART 3 — DATABASE MODELS

### user.py
```python
from app import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    __tablename__ = 'users'
    id         = db.Column(db.Integer, primary_key=True)
    email      = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    brand_name = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    customers  = db.relationship('Customer', backref='user', lazy=True)
    campaigns  = db.relationship('Campaign', backref='user', lazy=True)

    def set_password(self, pw):  self.password_hash = generate_password_hash(pw)
    def check_password(self, pw): return check_password_hash(self.password_hash, pw)
    def to_dict(self):
        return {'id': self.id, 'email': self.email, 'brand_name': self.brand_name}
```

### customer.py
```python
import json
from app import db
from datetime import datetime

class Customer(db.Model):
    __tablename__ = 'customers'
    id                 = db.Column(db.Integer, primary_key=True)
    user_id            = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name               = db.Column(db.String(100), nullable=False)
    email              = db.Column(db.String(120))
    phone              = db.Column(db.String(20))
    city               = db.Column(db.String(60))
    join_date          = db.Column(db.DateTime)
    lifetime_value     = db.Column(db.Float, default=0.0)
    total_orders       = db.Column(db.Integer, default=0)
    last_purchase_date = db.Column(db.DateTime)
    preferred_channel  = db.Column(db.String(20), default='email')
    favorite_category  = db.Column(db.String(60))
    churn_risk         = db.Column(db.String(10), default='low')  # low/medium/high
    purchase_frequency_days = db.Column(db.Integer, default=30)
    segment_tags       = db.Column(db.JSON, default=list)    # ["vip","inactive"]
    ai_profile         = db.Column(db.JSON)                   # cached Groq response
    created_at         = db.Column(db.DateTime, default=datetime.utcnow)

    orders    = db.relationship('Order', backref='customer', lazy=True)
    messages  = db.relationship('CampaignMessage', backref='customer', lazy=True)

    def to_dict(self):
        return {
            'id': self.id, 'name': self.name, 'email': self.email,
            'phone': self.phone, 'city': self.city,
            'lifetime_value': self.lifetime_value,
            'total_orders': self.total_orders,
            'churn_risk': self.churn_risk,
            'preferred_channel': self.preferred_channel,
            'favorite_category': self.favorite_category,
            'purchase_frequency_days': self.purchase_frequency_days,
            'segment_tags': self.segment_tags or [],
            'last_purchase_date': self.last_purchase_date.isoformat() if self.last_purchase_date else None,
            'join_date': self.join_date.isoformat() if self.join_date else None,
        }
```

### order.py
```python
from app import db
from datetime import datetime

class Order(db.Model):
    __tablename__ = 'orders'
    id          = db.Column(db.Integer, primary_key=True)
    user_id     = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    customer_id = db.Column(db.Integer, db.ForeignKey('customers.id'), nullable=False)
    order_ref   = db.Column(db.String(20), unique=True)   # e.g. ORD-00123
    amount      = db.Column(db.Float, nullable=False)
    category    = db.Column(db.String(60))
    status      = db.Column(db.String(20), default='completed')
    created_at  = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id, 'order_ref': self.order_ref,
            'amount': self.amount, 'category': self.category,
            'status': self.status,
            'customer_id': self.customer_id,
            'created_at': self.created_at.isoformat()
        }
```

### segment.py
```python
from app import db
from datetime import datetime

class Segment(db.Model):
    __tablename__ = 'segments'
    id             = db.Column(db.Integer, primary_key=True)
    user_id        = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name           = db.Column(db.String(100), nullable=False)
    description    = db.Column(db.Text)
    filter_rules   = db.Column(db.JSON)    # [{"field":"lifetime_value","op":"gt","value":5000}]
    customer_count = db.Column(db.Integer, default=0)
    is_ai_generated = db.Column(db.Boolean, default=False)
    ai_reasoning   = db.Column(db.Text)
    created_at     = db.Column(db.DateTime, default=datetime.utcnow)

    campaigns = db.relationship('Campaign', backref='segment', lazy=True)

    def to_dict(self):
        return {
            'id': self.id, 'name': self.name, 'description': self.description,
            'filter_rules': self.filter_rules, 'customer_count': self.customer_count,
            'is_ai_generated': self.is_ai_generated, 'ai_reasoning': self.ai_reasoning,
            'created_at': self.created_at.isoformat()
        }
```

### campaign.py
```python
from app import db
from datetime import datetime

class Campaign(db.Model):
    __tablename__ = 'campaigns'
    id              = db.Column(db.Integer, primary_key=True)
    user_id         = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    segment_id      = db.Column(db.Integer, db.ForeignKey('segments.id'))
    name            = db.Column(db.String(120))
    goal            = db.Column(db.Text)
    channel         = db.Column(db.String(20))       # whatsapp/email/sms/rcs
    message_subject = db.Column(db.String(200))
    message_body    = db.Column(db.Text)
    cta             = db.Column(db.String(100))
    status          = db.Column(db.String(20), default='draft')  # draft/running/completed
    ai_payload      = db.Column(db.JSON)             # full Groq response cached
    memory_context  = db.Column(db.JSON)             # injected past campaign memories
    predicted_reach    = db.Column(db.Integer)
    predicted_open_rate = db.Column(db.Float)
    predicted_revenue  = db.Column(db.Float)
    created_at      = db.Column(db.DateTime, default=datetime.utcnow)
    launched_at     = db.Column(db.DateTime)
    completed_at    = db.Column(db.DateTime)

    messages = db.relationship('CampaignMessage', backref='campaign', lazy=True)

    def to_dict(self):
        return {
            'id': self.id, 'name': self.name, 'goal': self.goal,
            'channel': self.channel, 'status': self.status,
            'message_subject': self.message_subject,
            'message_body': self.message_body,
            'cta': self.cta,
            'ai_payload': self.ai_payload,
            'predicted_reach': self.predicted_reach,
            'predicted_open_rate': self.predicted_open_rate,
            'predicted_revenue': self.predicted_revenue,
            'segment_id': self.segment_id,
            'created_at': self.created_at.isoformat(),
            'launched_at': self.launched_at.isoformat() if self.launched_at else None,
        }

class CampaignMessage(db.Model):
    __tablename__ = 'campaign_messages'
    id           = db.Column(db.Integer, primary_key=True)
    campaign_id  = db.Column(db.Integer, db.ForeignKey('campaigns.id'), nullable=False)
    customer_id  = db.Column(db.Integer, db.ForeignKey('customers.id'), nullable=False)
    channel      = db.Column(db.String(20))
    # Status: queued → sent → delivered → opened → clicked → purchased
    status       = db.Column(db.String(20), default='queued')
    sent_at      = db.Column(db.DateTime)
    delivered_at = db.Column(db.DateTime)
    opened_at    = db.Column(db.DateTime)
    clicked_at   = db.Column(db.DateTime)
    purchased_at = db.Column(db.DateTime)
    revenue_attr = db.Column(db.Float, default=0.0)   # attributed revenue

    def to_dict(self):
        return {
            'id': self.id, 'campaign_id': self.campaign_id,
            'customer_id': self.customer_id, 'channel': self.channel,
            'status': self.status,
            'sent_at': self.sent_at.isoformat() if self.sent_at else None,
            'delivered_at': self.delivered_at.isoformat() if self.delivered_at else None,
            'opened_at': self.opened_at.isoformat() if self.opened_at else None,
            'clicked_at': self.clicked_at.isoformat() if self.clicked_at else None,
            'purchased_at': self.purchased_at.isoformat() if self.purchased_at else None,
            'revenue_attr': self.revenue_attr
        }
```

### memory.py (Campaign Memory Engine — MARLF-inspired)
```python
from app import db
from datetime import datetime

class CampaignMemory(db.Model):
    __tablename__ = 'campaign_memory'
    id              = db.Column(db.Integer, primary_key=True)
    user_id         = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    campaign_id     = db.Column(db.Integer, db.ForeignKey('campaigns.id'), nullable=False)
    audience_type   = db.Column(db.String(60))    # "inactive","vip","new","high_spender"
    channel         = db.Column(db.String(20))
    goal_keywords   = db.Column(db.JSON)          # ["churn","reactivate","discount"]
    # Outcome metrics
    reach           = db.Column(db.Integer)
    delivery_rate   = db.Column(db.Float)
    open_rate       = db.Column(db.Float)
    ctr             = db.Column(db.Float)
    conversion_rate = db.Column(db.Float)
    revenue         = db.Column(db.Float)
    # Learnings generated by Groq after campaign ends
    what_worked     = db.Column(db.Text)
    what_failed     = db.Column(db.Text)
    recommendations = db.Column(db.Text)
    created_at      = db.Column(db.DateTime, default=datetime.utcnow)

    def to_summary(self):
        """Returns compact string injected as memory context into next campaign prompt."""
        return (
            f"Past {self.audience_type} campaign via {self.channel}: "
            f"open_rate={self.open_rate:.0%}, ctr={self.ctr:.0%}, "
            f"revenue=₹{self.revenue:,.0f}. "
            f"Worked: {self.what_worked}. Failed: {self.what_failed}."
        )
```

---

## PART 4 — API ENDPOINTS

### Base setup (api/utils.py)
```python
# All routes use this decorator for JWT protection
from functools import wraps
from flask import request, jsonify, g
import jwt, os

def jwt_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        if not token:
            return jsonify({'error': 'Token missing'}), 401
        try:
            data = jwt.decode(token, os.getenv('JWT_SECRET'), algorithms=['HS256'])
            g.user_id = data['user_id']
        except:
            return jsonify({'error': 'Invalid token'}), 401
        return f(*args, **kwargs)
    return decorated
```

### AUTH ROUTES — /api/auth/
```
POST   /api/auth/register      → { email, password, brand_name } → { token, user }
POST   /api/auth/login         → { email, password }             → { token, user }
GET    /api/auth/me            → (protected)                     → { user }
```

### CUSTOMER ROUTES — /api/customers/
```
GET    /api/customers               → list with ?search=&filter=&page=&per_page=
GET    /api/customers/:id           → customer detail
GET    /api/customers/:id/profile   → customer + orders + journey + ai_profile
POST   /api/customers/bulk          → import array of customers
GET    /api/customers/:id/journey   → array of CampaignMessage events
```

### ORDER ROUTES — /api/orders/
```
GET    /api/orders               → list with ?customer_id=&category=&page=
POST   /api/orders/bulk          → seed/import orders
GET    /api/orders/stats         → total, by category, by month
```

### SEGMENT ROUTES — /api/segments/
```
GET    /api/segments             → all segments for user
POST   /api/segments             → create manual segment (filter_rules JSON)
POST   /api/segments/ai-discover → { query: "customers likely to churn" } → segment + reasoning
GET    /api/segments/:id         → segment detail
GET    /api/segments/:id/preview → list of matching customers (apply filter rules)
DELETE /api/segments/:id         → delete
```

### CAMPAIGN ROUTES — /api/campaigns/
```
GET    /api/campaigns            → all campaigns, ?status=draft|running|completed
POST   /api/campaigns            → create campaign (calls Groq for full AI plan)
GET    /api/campaigns/:id        → campaign detail with ai_payload
POST   /api/campaigns/:id/launch → send to channel simulator, set status=running
POST   /api/campaigns/:id/pause  → pause running campaign
GET    /api/campaigns/:id/analytics  → live stats: sent/delivered/opened/clicked/revenue
GET    /api/campaigns/:id/reflection → AI reflection report (Groq)
GET    /api/campaigns/:id/next-actions → AI next best action suggestions (Groq)
```

### AI ROUTES — /api/ai/
```
POST   /api/ai/command           → { message } → AI Command Center chat response
GET    /api/dashboard/stats      → aggregated numbers
GET    /api/dashboard/opportunities → AI-generated opportunity cards (cached)
```

### ANALYTICS ROUTES — /api/analytics/
```
GET    /api/analytics/overview           → all-time metrics
GET    /api/analytics/channel-comparison → per-channel stats
GET    /api/analytics/revenue-trend      → monthly revenue array for chart
GET    /api/analytics/campaign-trends    → open/ctr trends over time
```

### WEBHOOK — /api/webhooks/
```
POST   /api/webhooks/callback    → called by Channel Simulator
                                    body: { message_id, customer_id, event }
                                    events: delivered|opened|clicked|purchased
```

### CHANNEL SIMULATOR — separate Flask service (port 5001)
```
POST   /simulate/send            → { campaign_id, messages:[{customer_id, message_id, channel, body}] }
                                    starts async simulation threads, returns 200 immediately
```

---

## PART 5 — MODULE-BY-MODULE BREAKDOWN

---

### MODULE 1: AUTHENTICATION

#### Backend (routes/auth.py)
```python
from flask import Blueprint, request, jsonify
from app.models.user import User
from app import db
import jwt, os
from datetime import datetime, timedelta

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already exists'}), 409
    user = User(email=data['email'], brand_name=data['brand_name'])
    user.set_password(data['password'])
    db.session.add(user)
    db.session.commit()
    token = jwt.encode(
        {'user_id': user.id, 'exp': datetime.utcnow() + timedelta(days=7)},
        os.getenv('JWT_SECRET'), algorithm='HS256'
    )
    return jsonify({'token': token, 'user': user.to_dict()}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data['email']).first()
    if not user or not user.check_password(data['password']):
        return jsonify({'error': 'Invalid credentials'}), 401
    token = jwt.encode(
        {'user_id': user.id, 'exp': datetime.utcnow() + timedelta(days=7)},
        os.getenv('JWT_SECRET'), algorithm='HS256'
    )
    return jsonify({'token': token, 'user': user.to_dict()})
```

#### Frontend UI — Login.jsx
**Layout**: Split screen — left 55% brand panel, right 45% form panel.
```
Left Panel (gradient #7C3AED → #06B6D4):
  - Large PulseAI logo + tagline
  - "The AI Marketing Strategist"
  - Three floating testimonial-like stat cards
    e.g. "432 churning customers detected in 3 seconds"
  - Animated particle/orb in background

Right Panel (bg-surface):
  - "Welcome back." heading (Plus Jakarta Sans, 700, 2xl)
  - Email field with icon
  - Password field with show/hide toggle
  - "Sign In" button → gradient bg, glow on hover
  - "Don't have an account? Register" link
```

**Key Tailwind classes:**
```jsx
// Left panel
<div className="w-[55%] bg-gradient-to-br from-violet-700 via-violet-600 to-cyan-500
                flex flex-col items-center justify-center p-16 relative overflow-hidden">

// Right panel
<div className="w-[45%] bg-surface flex flex-col items-center justify-center p-12">

// Input field
<input className="w-full bg-elevated border border-white/10 rounded-xl px-4 py-3
                  text-text-primary placeholder:text-text-muted
                  focus:outline-none focus:ring-2 focus:ring-primary/50
                  transition-all duration-200" />

// Submit button
<button className="w-full bg-gradient-to-r from-violet-600 to-cyan-500
                   text-white font-semibold py-3 rounded-xl
                   hover:shadow-glow-violet transition-all duration-300
                   hover:scale-[1.02] active:scale-[0.98]">
  Sign In
</button>
```

---

### MODULE 2: SMART DASHBOARD

#### Backend (routes/dashboard - inside analytics.py)
```python
@analytics_bp.route('/dashboard/stats', methods=['GET'])
@jwt_required
def dashboard_stats():
    uid = g.user_id
    total_customers = Customer.query.filter_by(user_id=uid).count()
    high_risk = Customer.query.filter_by(user_id=uid, churn_risk='high').count()
    total_revenue = db.session.query(db.func.sum(Order.amount))\
        .join(Customer).filter(Customer.user_id==uid).scalar() or 0
    active = Customer.query.filter(
        Customer.user_id==uid,
        Customer.last_purchase_date >= datetime.utcnow() - timedelta(days=30)
    ).count()
    campaign_count = Campaign.query.filter_by(user_id=uid).count()
    return jsonify({
        'total_customers': total_customers,
        'at_risk': high_risk,
        'total_revenue': round(total_revenue, 2),
        'active_customers': active,
        'total_campaigns': campaign_count
    })

@analytics_bp.route('/dashboard/opportunities', methods=['GET'])
@jwt_required
def dashboard_opportunities():
    uid = g.user_id
    # Serve from cache if exists
    # Otherwise call Groq with summary stats and cache for 30 min
    ...
```

#### Frontend UI — Dashboard.jsx
```
Layout:
  AppLayout wrapper (Sidebar + Topbar + content area)

  Row 1: 5 stat cards
    [Total Customers] [Revenue] [Active] [At-Risk] [Campaigns]

  Row 2: AI Opportunity Center (full width)
    Header: "✦ AI Opportunities — Updated just now"
    3 glowing cards in a row, each with:
      - Icon + tag ("Churn Prevention" / "Loyalty" / "Growth")
      - Title: "432 customers at risk of churning"
      - Sub: "They haven't ordered in 75+ days. Launch a win-back campaign."
      - Button: "Create Campaign →"

  Row 3: Left 60% = Revenue trend chart (Recharts)
           Right 40% = Recent Campaigns mini-list

  Row 4: Top 5 customers table (compact)
```

**Stat Card Component:**
```jsx
// GlowCard.jsx
export function StatCard({ label, value, icon, trend, color }) {
  const colorMap = {
    violet: 'from-violet-500/20 to-violet-500/5 border-violet-500/20',
    cyan:   'from-cyan-500/20 to-cyan-500/5 border-cyan-500/20',
    pink:   'from-pink-500/20 to-pink-500/5 border-pink-500/20',
    green:  'from-green-500/20 to-green-500/5 border-green-500/20',
  }
  return (
    <div className={`glass p-6 bg-gradient-to-br ${colorMap[color]}
                     hover:scale-[1.02] transition-transform cursor-default`}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-text-muted text-sm font-body">{label}</span>
        <div className={`p-2 rounded-lg bg-${color}-500/20`}>{icon}</div>
      </div>
      <div className="font-mono text-3xl font-bold text-text-primary">{value}</div>
      {trend && <div className="text-green-400 text-sm mt-2">{trend}</div>}
    </div>
  )
}
```

**AI Opportunity Card:**
```jsx
// Glowing border that pulses slowly
<div className="relative glass p-6 overflow-hidden
                hover:shadow-glow-violet transition-all duration-500 group">
  {/* Ambient glow on hover */}
  <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent
                  opacity-0 group-hover:opacity-100 transition-opacity duration-500"/>

  <div className="flex items-start gap-4">
    <div className="p-3 rounded-xl bg-violet-500/20 text-violet-400">
      {/* Icon */}
    </div>
    <div>
      <span className="text-xs font-mono text-violet-400 uppercase tracking-widest">
        Churn Prevention
      </span>
      <h3 className="font-display font-bold text-lg text-text-primary mt-1">
        432 customers at churn risk
      </h3>
      <p className="text-text-secondary text-sm mt-2 font-body">
        No purchases in 75+ days. Previously active, avg spend ₹2,500+
      </p>
      <button className="mt-4 text-sm text-violet-400 hover:text-violet-300
                         font-semibold flex items-center gap-2 group/btn">
        Create Campaign
        <span className="group-hover/btn:translate-x-1 transition-transform">→</span>
      </button>
    </div>
  </div>
</div>
```

---

### MODULE 3: CUSTOMER MANAGEMENT

#### Backend (routes/customers.py)
```python
from app.services.groq_service import generate_ai_profile

@customers_bp.route('/', methods=['GET'])
@jwt_required
def list_customers():
    uid = g.user_id
    search = request.args.get('search', '')
    filter_type = request.args.get('filter', '')  # top/inactive/new/high_value
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 20))

    query = Customer.query.filter_by(user_id=uid)
    if search:
        query = query.filter(Customer.name.ilike(f'%{search}%') |
                            Customer.email.ilike(f'%{search}%'))
    if filter_type == 'top':
        query = query.order_by(Customer.lifetime_value.desc())
    elif filter_type == 'inactive':
        cutoff = datetime.utcnow() - timedelta(days=60)
        query = query.filter(Customer.last_purchase_date < cutoff)
    elif filter_type == 'high_risk':
        query = query.filter_by(churn_risk='high')

    paginated = query.paginate(page=page, per_page=per_page, error_out=False)
    return jsonify({
        'customers': [c.to_dict() for c in paginated.items],
        'total': paginated.total,
        'pages': paginated.pages,
        'page': page
    })

@customers_bp.route('/<int:cid>/profile', methods=['GET'])
@jwt_required
def customer_profile(cid):
    customer = Customer.query.filter_by(id=cid, user_id=g.user_id).first_or_404()

    # Generate AI profile if not cached
    if not customer.ai_profile:
        customer.ai_profile = generate_ai_profile(customer)
        db.session.commit()

    orders = [o.to_dict() for o in customer.orders]
    messages = [m.to_dict() for m in customer.messages]

    return jsonify({
        'customer': customer.to_dict(),
        'ai_profile': customer.ai_profile,
        'orders': orders,
        'journey': messages
    })
```

#### Frontend UI — CustomerList.jsx
```
Page Layout:
  Header: "Customers" (h1) + "Add Customer" button (top-right)

  Filter Bar:
    - Search input (magnifier icon) — live search
    - Filter chips: [All] [Top] [Inactive] [At Risk] [New]
    - Sort dropdown

  Customer Table:
    Columns: Avatar+Name | Email | City | LTV | Orders | Churn Risk | Last Purchase | →
    Rows: alternating subtle bg, hover highlight
    Churn Risk badge:
      high   → bg-pink-500/20 text-pink-400 border border-pink-500/30
      medium → bg-yellow-500/20 text-yellow-400 border border-yellow-500/30
      low    → bg-green-500/20 text-green-400 border border-green-500/30

  Pagination at bottom
```

#### Frontend UI — CustomerProfile.jsx
```
Layout: 2-column
  Left (35%):
    - Avatar circle (initials-based, gradient bg)
    - Name, Email, Phone, City
    - Join Date, Last Purchase
    - Segment tags (chips)
    - "AI Profile" section with pulsing border
      (dynamically generated: Churn Risk, Preferred Channel,
       Fav Category, Purchase Frequency)

  Right (65%):
    - Tab bar: [Orders] [Campaign History] [Journey]
    - Orders tab: table of all orders
    - Journey tab: vertical funnel
        Sent → Delivered → Opened → Clicked → Purchased
        Each step shows count + status icon
```

---

### MODULE 4: ORDER MANAGEMENT

#### Backend
```python
@orders_bp.route('/', methods=['GET'])
@jwt_required
def list_orders():
    uid = g.user_id
    customer_id = request.args.get('customer_id')
    category = request.args.get('category')
    page = int(request.args.get('page', 1))

    query = Order.query.join(Customer).filter(Customer.user_id==uid)
    if customer_id:
        query = query.filter(Order.customer_id==customer_id)
    if category:
        query = query.filter(Order.category==category)

    query = query.order_by(Order.created_at.desc())
    paginated = query.paginate(page=page, per_page=25)
    return jsonify({'orders': [o.to_dict() for o in paginated.items],
                    'total': paginated.total})
```

#### Frontend UI — OrderList.jsx
```
Header: "Orders" + stats row: [Total Orders] [Total GMV] [Avg Order Value]
Category filter chips: [All] [Sneakers] [Apparel] [Accessories] ...
Table: Order ID | Customer | Amount | Category | Date | Status
Status badge: completed=green, pending=yellow, returned=red
Mini sparkline chart showing order volume last 30 days (Recharts)
```

---

### MODULE 5: SEGMENT BUILDER

#### Backend (routes/segments.py)
```python
from app.services.segment_service import apply_filter_rules
from app.services.groq_service import nl_to_segment

@segments_bp.route('/', methods=['POST'])
@jwt_required
def create_segment():
    data = request.get_json()
    customers = apply_filter_rules(g.user_id, data['filter_rules'])
    seg = Segment(
        user_id=g.user_id,
        name=data['name'],
        filter_rules=data['filter_rules'],
        customer_count=len(customers)
    )
    db.session.add(seg)
    db.session.commit()
    return jsonify({'segment': seg.to_dict(), 'preview_count': len(customers)}), 201

@segments_bp.route('/ai-discover', methods=['POST'])
@jwt_required
def ai_discover():
    data = request.get_json()
    # Groq converts natural language → filter_rules JSON
    result = nl_to_segment(g.user_id, data['query'])
    customers = apply_filter_rules(g.user_id, result['filter_rules'])
    seg = Segment(
        user_id=g.user_id,
        name=result['segment_name'],
        description=result['reasoning'],
        filter_rules=result['filter_rules'],
        customer_count=len(customers),
        is_ai_generated=True,
        ai_reasoning=result['reasoning']
    )
    db.session.add(seg)
    db.session.commit()
    return jsonify({'segment': seg.to_dict(), 'customers': [c.to_dict() for c in customers[:10]]})
```

#### services/segment_service.py
```python
from app.models.customer import Customer
from datetime import datetime, timedelta

FIELD_MAP = {
    'lifetime_value': Customer.lifetime_value,
    'total_orders': Customer.total_orders,
    'days_since_purchase': None,   # computed
    'churn_risk': Customer.churn_risk,
    'city': Customer.city,
}

OP_MAP = {
    'gt': lambda col, val: col > val,
    'lt': lambda col, val: col < val,
    'eq': lambda col, val: col == val,
    'gte': lambda col, val: col >= val,
    'lte': lambda col, val: col <= val,
}

def apply_filter_rules(user_id, rules):
    query = Customer.query.filter_by(user_id=user_id)
    for rule in rules:
        field, op, value = rule['field'], rule['op'], rule['value']
        if field == 'days_since_purchase':
            cutoff = datetime.utcnow() - timedelta(days=value)
            if op == 'gt':
                query = query.filter(Customer.last_purchase_date < cutoff)
            elif op == 'lt':
                query = query.filter(Customer.last_purchase_date > cutoff)
        elif field in FIELD_MAP and FIELD_MAP[field] is not None:
            col = FIELD_MAP[field]
            query = query.filter(OP_MAP[op](col, value))
    return query.all()
```

#### Frontend UI — SegmentBuilder.jsx
```
Page: Left panel = Builder, Right panel = Live Preview

Left Panel "Build Segment":
  Mode toggle: [Manual Rules] [Ask AI ✦]

  ─── MANUAL MODE ───
  Segment name input
  "Add Condition" button
  Condition rows (dynamic):
    [ Field dropdown ▾ ] [ Operator ▾ ] [ Value input ] [ × ]
    e.g. Lifetime Value  >              5000
    Operators animate in, rows slide in on add
  "AND" connector label between rows
  "Preview Matches" button → API call
  "Save Segment" button

  ─── AI MODE ───
  Large textarea:
    "Find customers who haven't bought in 60 days
     and previously spent more than ₹3000"
  [ ✦ Discover Audience ] button (gradient, glowing)
  → Streaming-like loading (show dots animation)
  → AI reasoning card appears below:
    "PulseAI found 312 customers matching this pattern.
     Reason: last_purchase_date > 60 days + lifetime_value > 3000"

Right Panel "Preview":
  Count badge: "312 customers match"
  Mini table: first 8 customers
  Segment list below (saved segments as cards)
```

---

### MODULE 6: AI COMMAND CENTER

#### Backend (routes/ai.py)
```python
from app.services.groq_service import ai_command_response
from app.services.memory_service import get_relevant_memories

@ai_bp.route('/command', methods=['POST'])
@jwt_required
def command():
    data = request.get_json()
    user_message = data['message']
    history = data.get('history', [])

    # Pull relevant campaign memories for context
    memories = get_relevant_memories(g.user_id, user_message, limit=3)
    memory_ctx = '\n'.join([m.to_summary() for m in memories])

    response = ai_command_response(user_message, history, memory_ctx, g.user_id)
    return jsonify({'response': response})
```

#### services/groq_service.py (key functions)
```python
from groq import Groq
import json, os

client = Groq(api_key=os.getenv('GROQ_API_KEY'))

def ai_command_response(message, history, memory_ctx, user_id):
    system = f"""You are PulseAI, an expert AI marketing strategist for a DTC brand.
You help brand owners create campaigns, find audiences, and grow revenue.
You are direct, data-driven, and action-oriented. No fluff.

Your memory of past campaigns:
{memory_ctx or "No past campaigns yet."}

When user gives a marketing goal, suggest:
1. Which audience to target (and why)
2. Best channel (WhatsApp/Email/SMS) with reasoning from past data
3. Campaign message concept
4. Expected outcome
Always end with: "Want me to build this campaign? Just say yes."
"""
    messages = [{"role": "system", "content": system}]
    for h in history[-6:]:  # last 3 exchanges
        messages.append({"role": h['role'], "content": h['content']})
    messages.append({"role": "user", "content": message})

    resp = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=messages,
        max_tokens=600
    )
    return resp.choices[0].message.content

def create_full_campaign_plan(goal, segment_stats, memory_ctx):
    prompt = f"""You are a marketing AI. Create a complete campaign plan.

Goal: {goal}
Audience stats: {json.dumps(segment_stats)}
Past campaign memory:
{memory_ctx or "No past campaigns."}

Return ONLY valid JSON:
{{
  "campaign_name": "...",
  "recommended_channel": "whatsapp|email|sms",
  "channel_reasoning": "...",
  "message_subject": "...",
  "message_body": "Hi {{name}}, ...",
  "cta": "...",
  "predicted_open_rate": 0.82,
  "predicted_ctr": 0.35,
  "predicted_revenue": 45000,
  "audience_reasoning": "...",
  "memory_insight": "..."
}}"""
    resp = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
        max_tokens=800
    )
    return json.loads(resp.choices[0].message.content)

def nl_to_segment(user_id, query):
    prompt = f"""Convert this natural language into customer filter rules.

Query: "{query}"

Available fields: lifetime_value (float), total_orders (int),
days_since_purchase (int), churn_risk (low|medium|high), city (string)
Available ops: gt, lt, eq, gte, lte

Return ONLY valid JSON:
{{
  "segment_name": "...",
  "reasoning": "...",
  "filter_rules": [
    {{"field": "days_since_purchase", "op": "gt", "value": 60}},
    {{"field": "lifetime_value", "op": "gt", "value": 3000}}
  ]
}}"""
    resp = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"}
    )
    return json.loads(resp.choices[0].message.content)

def generate_reflection_report(campaign_data, message_stats):
    prompt = f"""Analyze this completed marketing campaign and generate insights.

Campaign: {json.dumps(campaign_data)}
Performance: {json.dumps(message_stats)}

Return ONLY valid JSON:
{{
  "what_worked": "...",
  "what_failed": "...",
  "key_insight": "...",
  "recommendations": ["...", "...", "..."],
  "next_best_actions": [
    {{"action": "...", "reason": "...", "urgency": "high|medium|low"}}
  ]
}}"""
    resp = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"}
    )
    return json.loads(resp.choices[0].message.content)
```

#### Frontend UI — AICommandCenter.jsx
```
Full-page chat interface — the hero feature.

Layout:
  Top bar: "✦ AI Command Center" title + "Powered by PulseAI Memory Engine" badge
  Body: chat message list (scrollable, flex-col-reverse)
  Bottom: input bar (pinned)

Chat Messages:
  User message:
    Right-aligned, bg-violet-600/20, border-violet-500/20, rounded-2xl rounded-tr-sm
  AI message:
    Left-aligned, bg-surface, border-white/10, rounded-2xl rounded-tl-sm
    Has ✦ PulseAI avatar on left (gradient circle)

  AI Typing Indicator:
    3 dots bouncing (animation-delay staggered)
    "PulseAI is thinking..."

  Memory Context Badge (on AI replies):
    Small tag: "📚 Used 3 campaign memories"
    Tooltip: shows which memories were injected

Starter Prompts (shown when empty):
  4 suggestion chips:
    "Bring back inactive customers"
    "Increase repeat purchases"
    "Promote summer collection"
    "Reward my top customers"

Input Bar:
  bg-surface border border-white/10 rounded-2xl
  Textarea (auto-resize) + Send button (gradient icon)
  Ctrl+Enter to send

After AI responds with a plan:
  CTA card appears inline:
  "Ready to build this campaign? →"
  [ Build Campaign ] button that pre-fills the Campaign Planner
```

---

### MODULE 7: CAMPAIGN PLANNER + GENERATOR

#### Backend (routes/campaigns.py)
```python
from app.services.memory_service import get_relevant_memories, save_memory_after_campaign

@campaigns_bp.route('/', methods=['POST'])
@jwt_required
def create_campaign():
    data = request.get_json()
    uid = g.user_id

    # Pull segment stats
    segment = Segment.query.filter_by(id=data['segment_id'], user_id=uid).first_or_404()
    customers = apply_filter_rules(uid, segment.filter_rules)
    segment_stats = {
        'count': len(customers),
        'avg_ltv': sum(c.lifetime_value for c in customers) / max(len(customers), 1),
        'churn_risk_breakdown': {
            'high': sum(1 for c in customers if c.churn_risk == 'high'),
            'medium': sum(1 for c in customers if c.churn_risk == 'medium'),
            'low': sum(1 for c in customers if c.churn_risk == 'low'),
        }
    }

    # Get memory context
    memories = get_relevant_memories(uid, data['goal'], limit=3)
    memory_ctx = '\n'.join([m.to_summary() for m in memories])

    # Single Groq call — full plan
    ai_plan = create_full_campaign_plan(data['goal'], segment_stats, memory_ctx)

    campaign = Campaign(
        user_id=uid,
        segment_id=data['segment_id'],
        name=ai_plan['campaign_name'],
        goal=data['goal'],
        channel=ai_plan['recommended_channel'],
        message_subject=ai_plan['message_subject'],
        message_body=ai_plan['message_body'],
        cta=ai_plan['cta'],
        ai_payload=ai_plan,
        memory_context=[m.to_summary() for m in memories],
        predicted_reach=len(customers),
        predicted_open_rate=ai_plan['predicted_open_rate'],
        predicted_revenue=ai_plan['predicted_revenue'],
        status='draft'
    )
    db.session.add(campaign)
    db.session.commit()
    return jsonify({'campaign': campaign.to_dict()}), 201

@campaigns_bp.route('/<int:cid>/launch', methods=['POST'])
@jwt_required
def launch_campaign(cid):
    campaign = Campaign.query.filter_by(id=cid, user_id=g.user_id).first_or_404()
    segment = Segment.query.get(campaign.segment_id)
    customers = apply_filter_rules(g.user_id, segment.filter_rules)

    # Create CampaignMessage rows
    messages = []
    for c in customers:
        msg = CampaignMessage(
            campaign_id=campaign.id,
            customer_id=c.id,
            channel=campaign.channel,
            status='queued'
        )
        db.session.add(msg)
        db.session.flush()  # get msg.id
        messages.append({
            'message_id': msg.id,
            'customer_id': c.id,
            'name': c.name,
            'channel': campaign.channel,
            'body': campaign.message_body.replace('{name}', c.name)
        })

    campaign.status = 'running'
    campaign.launched_at = datetime.utcnow()
    db.session.commit()

    # Fire and forget to Channel Simulator
    import threading, requests
    def call_simulator():
        requests.post(
            os.getenv('CHANNEL_SIMULATOR_URL') + '/simulate/send',
            json={'campaign_id': campaign.id, 'messages': messages},
            timeout=5
        )
    threading.Thread(target=call_simulator, daemon=True).start()

    return jsonify({'status': 'running', 'dispatched': len(messages)})
```

#### Frontend UI — CampaignPlanner.jsx
```
3-step flow with animated step indicator

STEP 1: "Choose Your Goal"
  ─────────────────────────
  Large textarea: "What do you want to achieve?"
  Suggestion pills below:
    [Bring back inactive customers] [Reward loyal customers]
    [Promote new collection] [Drive repeat purchases]

  Segment selector:
    Cards showing saved segments with customer count
    "Create New Segment" option
  [ Next → ]

STEP 2: "AI Building Your Campaign..."
  ─────────────────────────────────────
  Animated loading sequence (2-3 seconds):
    ✦ Analyzing your audience...
    📚 Checking campaign memory...
    ✍️ Crafting your message...

  Then result appears as an edit-ready card:

  ┌─ AI Campaign Plan ──────────────────────────────────┐
  │ Channel: WhatsApp  (⚡ 82% open rate in past campaigns) │
  │                                                         │
  │ Subject: "We Miss You ❤️"                              │
  │                                                         │
  │ Message:                                                │
  │  Hi {name}, we noticed you haven't shopped in a while. │
  │  Enjoy 20% OFF your next order. Use code: BACK20       │
  │                                                         │
  │ CTA: "Shop Now →"                                       │
  │                                                         │
  │ 📚 Memory Insight:                                      │
  │  WhatsApp drove 2x conversions for inactive segments   │
  └─────────────────────────────────────────────────────────┘

  All fields editable inline.
  [ ← Back ] [ Next: Simulate → ]

STEP 3: "Campaign Simulator"
  ─────────────────────────
  Prediction cards (4 in a row):
    Reach: 2,400    Open Rate: 82%
    Revenue: ₹2.3L  CTR: 35%

  "Memory-Enhanced Prediction" badge
  Sub-label: "Based on 3 similar past campaigns"

  Channel comparison mini-chart:
    WhatsApp 82% | Email 33% | SMS 45%

  [ ← Edit ] [ 🚀 Launch Campaign ]
```

---

### MODULE 8: CAMPAIGN MEMORY ENGINE

#### services/memory_service.py (MARLF-inspired)
```python
from app.models.memory import CampaignMemory
from app import db

def get_relevant_memories(user_id, goal_text, limit=3):
    """
    Fetch past campaign memories relevant to current goal.
    Simple keyword matching (extensible to embeddings later).
    """
    all_memories = CampaignMemory.query.filter_by(user_id=user_id)\
        .order_by(CampaignMemory.created_at.desc()).limit(20).all()

    # Score by keyword overlap
    goal_words = set(goal_text.lower().split())
    scored = []
    for m in all_memories:
        if m.goal_keywords:
            overlap = len(goal_words & set(m.goal_keywords))
            scored.append((m, overlap))

    scored.sort(key=lambda x: x[1], reverse=True)
    return [m for m, _ in scored[:limit]]

def save_memory_after_campaign(campaign, message_stats, ai_reflection):
    """
    Called when campaign completes. Saves outcome as memory
    so future campaigns can learn from it.
    """
    goal_keywords = campaign.goal.lower().split()
    memory = CampaignMemory(
        user_id=campaign.user_id,
        campaign_id=campaign.id,
        audience_type=guess_audience_type(campaign.goal),
        channel=campaign.channel,
        goal_keywords=goal_keywords[:10],
        reach=message_stats['total'],
        delivery_rate=message_stats['delivery_rate'],
        open_rate=message_stats['open_rate'],
        ctr=message_stats['ctr'],
        conversion_rate=message_stats['conversion_rate'],
        revenue=message_stats['revenue'],
        what_worked=ai_reflection['what_worked'],
        what_failed=ai_reflection['what_failed'],
        recommendations='; '.join(ai_reflection['recommendations'])
    )
    db.session.add(memory)
    db.session.commit()
    return memory

def guess_audience_type(goal_text):
    goal = goal_text.lower()
    if any(w in goal for w in ['inactive','churn','back','win']): return 'inactive'
    if any(w in goal for w in ['loyal','vip','reward','top']):    return 'vip'
    if any(w in goal for w in ['new','welcome','onboard']):       return 'new'
    if any(w in goal for w in ['high','premium','spend']):        return 'high_spender'
    return 'general'
```

---

### MODULE 9: CHANNEL SIMULATOR (Separate Service)

#### channel-simulator/app.py
```python
from flask import Flask, request, jsonify
from flask_cors import CORS
import threading, time, random, requests, os

app = Flask(__name__)
CORS(app)

CRM_CALLBACK_URL = os.getenv('CRM_URL', 'http://localhost:5000') + '/api/webhooks/callback'

CHANNEL_PROFILES = {
    'whatsapp': {'delivered': 0.95, 'opened': 0.82, 'clicked': 0.45, 'purchased': 0.20},
    'email':    {'delivered': 0.90, 'opened': 0.33, 'clicked': 0.18, 'purchased': 0.08},
    'sms':      {'delivered': 0.92, 'opened': 0.45, 'clicked': 0.22, 'purchased': 0.10},
    'rcs':      {'delivered': 0.88, 'opened': 0.55, 'clicked': 0.30, 'purchased': 0.14},
}

def simulate_one(message_id, customer_id, channel):
    profile = CHANNEL_PROFILES.get(channel, CHANNEL_PROFILES['email'])
    events = [
        ('delivered', profile['delivered'], 2),
        ('opened',    profile['opened'],    5),
        ('clicked',   profile['clicked'],   9),
        ('purchased', profile['purchased'], 15),
    ]
    for event, prob, delay in events:
        time.sleep(delay + random.uniform(0, 3))
        if random.random() < prob:
            try:
                requests.post(CRM_CALLBACK_URL, json={
                    'message_id': message_id,
                    'customer_id': customer_id,
                    'event': event,
                    'revenue': round(random.uniform(800, 5000), 2) if event == 'purchased' else 0
                }, timeout=5)
            except Exception as e:
                print(f"Callback failed: {e}")
        else:
            break  # Stop at first missed event

@app.route('/simulate/send', methods=['POST'])
def simulate_send():
    data = request.get_json()
    for msg in data.get('messages', []):
        t = threading.Thread(
            target=simulate_one,
            args=(msg['message_id'], msg['customer_id'], msg['channel']),
            daemon=True
        )
        t.start()
    return jsonify({'status': 'simulation_started', 'count': len(data['messages'])}), 200

if __name__ == '__main__':
    app.run(port=5001, debug=False)
```

#### Backend Webhook (routes/webhooks.py)
```python
from datetime import datetime

@webhooks_bp.route('/callback', methods=['POST'])
def handle_callback():
    data = request.get_json()
    msg = CampaignMessage.query.get(data['message_id'])
    if not msg: return jsonify({'ok': False}), 404

    event = data['event']
    now = datetime.utcnow()

    if event == 'delivered': msg.delivered_at = now; msg.status = 'delivered'
    elif event == 'opened':  msg.opened_at = now;    msg.status = 'opened'
    elif event == 'clicked': msg.clicked_at = now;   msg.status = 'clicked'
    elif event == 'purchased':
        msg.purchased_at = now
        msg.status = 'purchased'
        msg.revenue_attr = data.get('revenue', 0)

    db.session.commit()
    return jsonify({'ok': True})
```

---

### MODULE 10: CAMPAIGN MANAGER

#### Frontend UI — CampaignManager.jsx
```
Header: "Campaigns" + [New Campaign] button

Status Tabs: [All] [Draft] [Running] [Completed]

Campaign Cards Grid (2 columns):
  Each card:
    ┌─────────────────────────────────────────┐
    │ [Running ●] [WhatsApp]                  │
    │ "Win-Back Inactive Customers"           │
    │ Launched: June 10, 2026                 │
    │                                         │
    │ ████████░░ 82% open rate                │
    │ Reach: 2,400  Revenue: ₹2.3L            │
    │                                         │
    │ [View Analytics] [Pause] [Duplicate]    │
    └─────────────────────────────────────────┘

  Status indicator:
    Running  → pulsing green dot (animate-pulse)
    Draft    → gray dot
    Completed → static green checkmark

  Progress bar: open rate as visual fill
  Revenue in bold font-mono
```

---

### MODULE 11: CAMPAIGN DETAIL + ANALYTICS

#### Backend
```python
@campaigns_bp.route('/<int:cid>/analytics', methods=['GET'])
@jwt_required
def campaign_analytics(cid):
    campaign = Campaign.query.filter_by(id=cid, user_id=g.user_id).first_or_404()
    messages = CampaignMessage.query.filter_by(campaign_id=cid).all()
    total = len(messages)
    if total == 0:
        return jsonify({'stats': {}, 'messages': []})

    stats = {
        'total': total,
        'delivered': sum(1 for m in messages if m.delivered_at),
        'opened':    sum(1 for m in messages if m.opened_at),
        'clicked':   sum(1 for m in messages if m.clicked_at),
        'purchased': sum(1 for m in messages if m.purchased_at),
        'revenue':   sum(m.revenue_attr for m in messages),
    }
    stats['delivery_rate']   = round(stats['delivered'] / total, 4)
    stats['open_rate']       = round(stats['opened']    / max(stats['delivered'],1), 4)
    stats['ctr']             = round(stats['clicked']   / max(stats['opened'],1), 4)
    stats['conversion_rate'] = round(stats['purchased'] / max(stats['clicked'],1), 4)
    return jsonify({'stats': stats, 'campaign': campaign.to_dict()})

@campaigns_bp.route('/<int:cid>/reflection', methods=['GET'])
@jwt_required
def campaign_reflection(cid):
    campaign = Campaign.query.filter_by(id=cid, user_id=g.user_id).first_or_404()
    if campaign.status != 'completed':
        return jsonify({'error': 'Campaign not completed yet'}), 400

    # Check if reflection already cached in ai_payload
    if campaign.ai_payload and campaign.ai_payload.get('reflection'):
        return jsonify({'reflection': campaign.ai_payload['reflection']})

    # Generate and cache
    messages = CampaignMessage.query.filter_by(campaign_id=cid).all()
    total = len(messages)
    stats = {
        'delivery_rate': sum(1 for m in messages if m.delivered_at) / max(total, 1),
        'open_rate':     sum(1 for m in messages if m.opened_at)    / max(total, 1),
        'ctr':           sum(1 for m in messages if m.clicked_at)   / max(total, 1),
        'revenue':       sum(m.revenue_attr for m in messages),
    }
    reflection = generate_reflection_report(campaign.to_dict(), stats)

    # Save to memory engine
    save_memory_after_campaign(campaign, stats, reflection)

    # Cache in campaign
    payload = campaign.ai_payload or {}
    payload['reflection'] = reflection
    campaign.ai_payload = payload
    db.session.commit()

    return jsonify({'reflection': reflection})
```

#### Frontend UI — CampaignDetail.jsx
```
Top: Campaign name, status badge, launch date, channel badge

Metric Row (4 cards):
  Sent | Delivered | Opened | Clicked | Purchased | Revenue
  Each with animated counter on load
  Funnel progress bar connecting them

Tabs: [Overview] [Reflection Report ✦] [Next Actions ✦]

─── OVERVIEW TAB ───
  Left: Recharts FunnelChart (Sent→Delivered→Opened→Clicked→Purchased)
  Right: Channel comparison bar chart

─── REFLECTION TAB ───
  AI-generated report card:
  ┌─ What Worked ──────────────────────────────┐
  │ ✓ WhatsApp delivered 2x higher conversions │
  │ ✓ Discount messaging resonated strongly    │
  └────────────────────────────────────────────┘
  ┌─ What Failed ──────────────────────────────┐
  │ ✗ Message length was too long              │
  │ ✗ CTA placement could be earlier           │
  └────────────────────────────────────────────┘
  ┌─ Recommendations ──────────────────────────┐
  │ → Use shorter messages (under 120 chars)   │
  │ → Lead with discount in first line         │
  └────────────────────────────────────────────┘

─── NEXT ACTIONS TAB ───
  Proactive suggestion cards:
    [High Urgency] "Reward the 95 customers who purchased"
    [Medium]       "Retarget 312 who clicked but didn't buy"
    [Low]          "Launch loyalty tier for top 50 spenders"
  Each with [Build This Campaign →] button
```

---

### MODULE 12: ANALYTICS DASHBOARD

#### Frontend UI — Analytics.jsx
```
Header: "Analytics" + date range picker [Last 7D] [30D] [90D] [All]

Row 1: 6 KPI cards with Recharts TinyLine sparklines
  Total Sent | Delivered | Opened | Clicked | Converted | Revenue

Row 2: 2-column
  Left: Revenue Trend (LineChart, area fill, violet gradient)
  Right: Channel Comparison (BarChart, grouped)

Row 3: 2-column
  Left: Open Rate Trend per campaign (LineChart)
  Right: Top Performing Campaigns table

Row 4: Campaign comparison table
  Name | Channel | Sent | Open Rate | CTR | Revenue | Status
```

---

## PART 6 — LAYOUT COMPONENTS

### Sidebar.jsx
```jsx
const navItems = [
  { icon: <LayoutDashboard/>, label: 'Dashboard',   path: '/'              },
  { icon: <Users/>,           label: 'Customers',   path: '/customers'     },
  { icon: <Package/>,         label: 'Orders',      path: '/orders'        },
  { icon: <Filter/>,          label: 'Segments',    path: '/segments'      },
  { icon: <Sparkles/>,        label: 'AI Command',  path: '/ai'            },
  { icon: <Megaphone/>,       label: 'Campaigns',   path: '/campaigns'     },
  { icon: <BarChart2/>,       label: 'Analytics',   path: '/analytics'     },
]

// Active item: bg-violet-500/20 text-violet-300 border-l-2 border-violet-500
// Inactive:    text-text-muted hover:text-text-primary hover:bg-white/5
```

**Sidebar Structure:**
```
┌─ Sidebar (w-64, fixed, full-height) ─────────────────┐
│                                                        │
│  ✦ PulseAI                    (logo + brand name)      │
│  The AI Marketing Strategist  (tagline, text-muted)    │
│                                                        │
│  ─────────── MAIN ────────────                         │
│  🏠 Dashboard                                          │
│  👥 Customers                                          │
│  📦 Orders                                             │
│  🎯 Segments                                           │
│                                                        │
│  ─────────── AI ──────────────                         │
│  ✦ AI Command                (highlighted, gradient)   │
│  📣 Campaigns                                          │
│  📊 Analytics                                          │
│                                                        │
│  ─────────────────────────────                         │
│  [Avatar] Akhil · Brand Name                           │
│  Logout                                                │
└────────────────────────────────────────────────────────┘
```

---

## PART 7 — DEPENDENCY INSTALL COMMANDS

### Frontend
```bash
cd frontend
npm create vite@latest . -- --template react
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install axios zustand react-router-dom recharts lucide-react
npm install @headlessui/react framer-motion
```

### Backend
```
# requirements.txt
flask
flask-sqlalchemy
flask-cors
flask-migrate
pymysql
python-dotenv
pyjwt
werkzeug
groq
requests
```

```bash
cd backend
pip install -r requirements.txt
```

### Channel Simulator
```
# requirements.txt
flask
flask-cors
requests
python-dotenv
```

---
