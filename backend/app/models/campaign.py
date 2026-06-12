from app import db
from datetime import datetime

class Campaign(db.Model):
    __tablename__ = 'campaigns'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    segment_id = db.Column(db.Integer, db.ForeignKey('segments.id'))
    name = db.Column(db.String(120))
    goal = db.Column(db.Text)
    channel = db.Column(db.String(20))
    message_subject = db.Column(db.String(200))
    message_body = db.Column(db.Text)
    cta = db.Column(db.String(100))
    status = db.Column(db.String(20), default='draft')
    ai_payload = db.Column(db.JSON)
    memory_context = db.Column(db.JSON)
    predicted_reach = db.Column(db.Integer)
    predicted_open_rate = db.Column(db.Float)
    predicted_revenue = db.Column(db.Float)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    launched_at = db.Column(db.DateTime)
    completed_at = db.Column(db.DateTime)

    messages = db.relationship('CampaignMessage', backref='campaign', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'goal': self.goal,
            'channel': self.channel,
            'status': self.status,
            'message_subject': self.message_subject,
            'message_body': self.message_body,
            'cta': self.cta,
            'ai_payload': self.ai_payload,
            'memory_context': self.memory_context,
            'predicted_reach': self.predicted_reach,
            'predicted_open_rate': self.predicted_open_rate,
            'predicted_revenue': self.predicted_revenue,
            'segment_id': self.segment_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'launched_at': self.launched_at.isoformat() if self.launched_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
        }


class CampaignMessage(db.Model):
    __tablename__ = 'campaign_messages'
    id = db.Column(db.Integer, primary_key=True)
    campaign_id = db.Column(db.Integer, db.ForeignKey('campaigns.id'), nullable=False)
    customer_id = db.Column(db.Integer, db.ForeignKey('customers.id'), nullable=False)
    channel = db.Column(db.String(20))
    status = db.Column(db.String(20), default='queued')
    sent_at = db.Column(db.DateTime)
    delivered_at = db.Column(db.DateTime)
    opened_at = db.Column(db.DateTime)
    clicked_at = db.Column(db.DateTime)
    purchased_at = db.Column(db.DateTime)
    revenue_attr = db.Column(db.Float, default=0.0)

    def to_dict(self):
        return {
            'id': self.id,
            'campaign_id': self.campaign_id,
            'customer_id': self.customer_id,
            'channel': self.channel,
            'status': self.status,
            'sent_at': self.sent_at.isoformat() if self.sent_at else None,
            'delivered_at': self.delivered_at.isoformat() if self.delivered_at else None,
            'opened_at': self.opened_at.isoformat() if self.opened_at else None,
            'clicked_at': self.clicked_at.isoformat() if self.clicked_at else None,
            'purchased_at': self.purchased_at.isoformat() if self.purchased_at else None,
            'revenue_attr': self.revenue_attr,
        }
