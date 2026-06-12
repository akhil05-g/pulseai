from app import db
from datetime import datetime

class CampaignMemory(db.Model):
    __tablename__ = 'campaign_memory'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    campaign_id = db.Column(db.Integer, db.ForeignKey('campaigns.id'), nullable=False)
    audience_type = db.Column(db.String(60))
    channel = db.Column(db.String(20))
    goal_keywords = db.Column(db.JSON)
    reach = db.Column(db.Integer)
    delivery_rate = db.Column(db.Float)
    open_rate = db.Column(db.Float)
    ctr = db.Column(db.Float)
    conversion_rate = db.Column(db.Float)
    revenue = db.Column(db.Float)
    what_worked = db.Column(db.Text)
    what_failed = db.Column(db.Text)
    recommendations = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_summary(self):
        try:
            return (
                f"Past {self.audience_type} campaign via {self.channel}: "
                f"open_rate={self.open_rate:.0%}, ctr={self.ctr:.0%}, "
                f"revenue=₹{self.revenue:,.0f}. "
                f"Worked: {self.what_worked}. Failed: {self.what_failed}."
            )
        except Exception:
            return f"Past campaign via {self.channel}: {self.what_worked}"
