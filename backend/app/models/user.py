from app import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    brand_name = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    customers = db.relationship('Customer', backref='user', lazy=True)
    campaigns = db.relationship('Campaign', backref='user', lazy=True)

    def set_password(self, pw):
        self.password_hash = generate_password_hash(pw)

    def check_password(self, pw):
        return check_password_hash(self.password_hash, pw)

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'brand_name': self.brand_name,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
