from app import db
from datetime import datetime

class Segment(db.Model):
    __tablename__ = 'segments'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    filter_rules = db.Column(db.JSON)
    customer_count = db.Column(db.Integer, default=0)
    is_ai_generated = db.Column(db.Boolean, default=False)
    ai_reasoning = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    campaigns = db.relationship('Campaign', backref='segment', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'filter_rules': self.filter_rules,
            'customer_count': self.customer_count,
            'is_ai_generated': self.is_ai_generated,
            'ai_reasoning': self.ai_reasoning,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
