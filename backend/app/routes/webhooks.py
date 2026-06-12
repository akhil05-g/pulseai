from flask import Blueprint, request, jsonify
from app.models.campaign import CampaignMessage
from app import db
from datetime import datetime

webhooks_bp = Blueprint('webhooks', __name__)

@webhooks_bp.route('/callback', methods=['POST'])
def handle_callback():
    data = request.get_json()
    msg = CampaignMessage.query.get(data.get('message_id'))
    if not msg:
        return jsonify({'ok': False}), 404

    event = data.get('event')
    now = datetime.utcnow()

    if event == 'delivered':
        msg.delivered_at = now
        msg.status = 'delivered'
    elif event == 'opened':
        msg.opened_at = now
        msg.status = 'opened'
    elif event == 'clicked':
        msg.clicked_at = now
        msg.status = 'clicked'
    elif event == 'purchased':
        msg.purchased_at = now
        msg.status = 'purchased'
        msg.revenue_attr = data.get('revenue', 0)

    db.session.commit()
    return jsonify({'ok': True})
