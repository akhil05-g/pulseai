from flask import Blueprint, jsonify, g
from app.models.customer import Customer
from app.models.order import Order
from app.models.campaign import Campaign, CampaignMessage
from app import db
from app.utils import jwt_required
from datetime import datetime, timedelta
from sqlalchemy import func

analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route('/dashboard/stats', methods=['GET'])
@jwt_required
def dashboard_stats():
    uid = g.user_id
    total_customers = Customer.query.filter_by(user_id=uid).count()
    high_risk = Customer.query.filter_by(user_id=uid, churn_risk='high').count()
    total_revenue = db.session.query(func.sum(Order.amount)).filter(Order.user_id == uid).scalar() or 0
    active = Customer.query.filter(
        Customer.user_id == uid,
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
    high_risk = Customer.query.filter_by(user_id=uid, churn_risk='high').count()
    inactive_cutoff = datetime.utcnow() - timedelta(days=60)
    inactive = Customer.query.filter(Customer.user_id == uid, Customer.last_purchase_date < inactive_cutoff).count()
    top_customers = Customer.query.filter(Customer.user_id == uid, Customer.lifetime_value > 5000).count()

    opportunities = [
        {
            'type': 'churn_prevention',
            'icon': '🔥',
            'tag': 'Churn Prevention',
            'title': f'{high_risk} customers at high churn risk',
            'description': 'These customers show declining engagement. Launch a win-back campaign before it\'s too late.',
            'action': 'Create Win-Back Campaign',
            'urgency': 'high',
            'color': 'red'
        },
        {
            'type': 'reactivation',
            'icon': '💤',
            'tag': 'Reactivation',
            'title': f'{inactive} inactive customers found',
            'description': 'No purchases in 60+ days. A well-timed offer could bring them back.',
            'action': 'Reactivate Now',
            'urgency': 'medium',
            'color': 'amber'
        },
        {
            'type': 'loyalty',
            'icon': '⭐',
            'tag': 'Loyalty Growth',
            'title': f'{top_customers} VIP customers to reward',
            'description': 'High-value customers deserve recognition. Launch an exclusive loyalty campaign.',
            'action': 'Reward VIPs',
            'urgency': 'medium',
            'color': 'indigo'
        },
    ]
    return jsonify({'opportunities': opportunities})

@analytics_bp.route('/analytics/overview', methods=['GET'])
@jwt_required
def analytics_overview():
    uid = g.user_id
    campaigns = Campaign.query.filter_by(user_id=uid).all()
    all_msgs = []
    for c in campaigns:
        msgs = CampaignMessage.query.filter_by(campaign_id=c.id).all()
        all_msgs.extend(msgs)

    total = len(all_msgs)
    return jsonify({
        'total_sent': total,
        'delivered': sum(1 for m in all_msgs if m.delivered_at),
        'opened': sum(1 for m in all_msgs if m.opened_at),
        'clicked': sum(1 for m in all_msgs if m.clicked_at),
        'converted': sum(1 for m in all_msgs if m.purchased_at),
        'total_revenue': sum(m.revenue_attr or 0 for m in all_msgs),
    })

@analytics_bp.route('/analytics/channel-comparison', methods=['GET'])
@jwt_required
def channel_comparison():
    uid = g.user_id
    campaigns = Campaign.query.filter_by(user_id=uid).all()
    channels = {}
    for c in campaigns:
        ch = c.channel or 'email'
        if ch not in channels:
            channels[ch] = {'sent': 0, 'delivered': 0, 'opened': 0, 'clicked': 0, 'revenue': 0}
        msgs = CampaignMessage.query.filter_by(campaign_id=c.id).all()
        for m in msgs:
            channels[ch]['sent'] += 1
            if m.delivered_at: channels[ch]['delivered'] += 1
            if m.opened_at: channels[ch]['opened'] += 1
            if m.clicked_at: channels[ch]['clicked'] += 1
            channels[ch]['revenue'] += m.revenue_attr or 0

    result = []
    for ch, data in channels.items():
        data['channel'] = ch
        data['open_rate'] = round(data['opened'] / max(data['delivered'], 1), 4)
        data['ctr'] = round(data['clicked'] / max(data['opened'], 1), 4)
        result.append(data)

    return jsonify({'channels': result})

@analytics_bp.route('/analytics/revenue-trend', methods=['GET'])
@jwt_required
def revenue_trend():
    uid = g.user_id
    # Generate monthly revenue for last 6 months
    months = []
    for i in range(5, -1, -1):
        date = datetime.utcnow() - timedelta(days=30 * i)
        month_start = date.replace(day=1, hour=0, minute=0, second=0)
        if i > 0:
            next_month = (date + timedelta(days=32)).replace(day=1, hour=0, minute=0, second=0)
        else:
            next_month = datetime.utcnow()

        revenue = db.session.query(func.sum(Order.amount)).filter(
            Order.user_id == uid,
            Order.created_at >= month_start,
            Order.created_at < next_month
        ).scalar() or 0

        months.append({
            'month': month_start.strftime('%b %Y'),
            'revenue': round(revenue, 2)
        })

    return jsonify({'trend': months})

@analytics_bp.route('/analytics/campaign-trends', methods=['GET'])
@jwt_required
def campaign_trends():
    uid = g.user_id
    campaigns = Campaign.query.filter_by(user_id=uid).order_by(Campaign.created_at).all()
    trends = []
    for c in campaigns:
        msgs = CampaignMessage.query.filter_by(campaign_id=c.id).all()
        total = len(msgs)
        if total == 0:
            continue
        trends.append({
            'name': c.name or f'Campaign #{c.id}',
            'open_rate': round(sum(1 for m in msgs if m.opened_at) / max(total, 1), 4),
            'ctr': round(sum(1 for m in msgs if m.clicked_at) / max(total, 1), 4),
            'revenue': sum(m.revenue_attr or 0 for m in msgs),
        })
    return jsonify({'trends': trends})
