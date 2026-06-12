from app import db
from datetime import datetime

class Customer(db.Model):
    __tablename__ = 'customers'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120))
    phone = db.Column(db.String(20))
    city = db.Column(db.String(60))
    join_date = db.Column(db.DateTime)
    lifetime_value = db.Column(db.Float, default=0.0)
    total_orders = db.Column(db.Integer, default=0)
    last_purchase_date = db.Column(db.DateTime)
    preferred_channel = db.Column(db.String(20), default='email')
    favorite_category = db.Column(db.String(60))
    churn_risk = db.Column(db.String(10), default='low')
    purchase_frequency_days = db.Column(db.Integer, default=30)
    segment_tags = db.Column(db.JSON, default=list)
    ai_profile = db.Column(db.JSON)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    orders = db.relationship('Order', backref='customer', lazy=True)
    messages = db.relationship('CampaignMessage', backref='customer', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'city': self.city,
            'lifetime_value': self.lifetime_value,
            'total_orders': self.total_orders,
            'churn_risk': self.churn_risk,
            'preferred_channel': self.preferred_channel,
            'favorite_category': self.favorite_category,
            'purchase_frequency_days': self.purchase_frequency_days,
            'segment_tags': self.segment_tags or [],
            'last_purchase_date': self.last_purchase_date.isoformat() if self.last_purchase_date else None,
            'join_date': self.join_date.isoformat() if self.join_date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
