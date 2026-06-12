from app import db
from datetime import datetime

class Order(db.Model):
    __tablename__ = 'orders'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    customer_id = db.Column(db.Integer, db.ForeignKey('customers.id'), nullable=False)
    order_ref = db.Column(db.String(20), unique=True)
    amount = db.Column(db.Float, nullable=False)
    category = db.Column(db.String(60))
    status = db.Column(db.String(20), default='completed')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'order_ref': self.order_ref,
            'amount': self.amount,
            'category': self.category,
            'status': self.status,
            'customer_id': self.customer_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
