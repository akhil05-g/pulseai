from flask import Blueprint, request, jsonify, g
from app.models.campaign import Campaign, CampaignMessage
from app.models.segment import Segment
from app import db
from app.utils import jwt_required
from app.services.segment_service import apply_filter_rules
from datetime import datetime
import os, threading

campaigns_bp = Blueprint('campaigns', __name__)

@campaigns_bp.route('/', methods=['GET'])
@jwt_required
def list_campaigns():
    uid = g.user_id
    status = request.args.get('status')
    query = Campaign.query.filter_by(user_id=uid)
    if status:
        query = query.filter_by(status=status)
    campaigns = query.order_by(Campaign.created_at.desc()).all()
    return jsonify({'campaigns': [c.to_dict() for c in campaigns]})

@campaigns_bp.route('/', methods=['POST'])
@jwt_required
def create_campaign():
    data = request.get_json()
    uid = g.user_id

    segment = Segment.query.filter_by(id=data['segment_id'], user_id=uid).first_or_404()
    customers = apply_filter_rules(uid, segment.filter_rules or [])
    segment_stats = {
        'count': len(customers),
        'avg_ltv': sum(c.lifetime_value or 0 for c in customers) / max(len(customers), 1),
        'churn_risk_breakdown': {
            'high': sum(1 for c in customers if c.churn_risk == 'high'),
            'medium': sum(1 for c in customers if c.churn_risk == 'medium'),
            'low': sum(1 for c in customers if c.churn_risk == 'low'),
        }
    }

    # Try AI plan
    try:
        from app.services.groq_service import create_full_campaign_plan
        from app.services.memory_service import get_relevant_memories
        memories = get_relevant_memories(uid, data.get('goal', ''), limit=3)
        memory_ctx = '\n'.join([m.to_summary() for m in memories])
        ai_plan = create_full_campaign_plan(data.get('goal', ''), segment_stats, memory_ctx)
    except Exception:
        ai_plan = {
            'campaign_name': data.get('name', f'Campaign for {segment.name}'),
            'recommended_channel': 'email',
            'channel_reasoning': 'Default channel selected.',
            'message_subject': 'Special offer just for you!',
            'message_body': 'Hi {name}, we have an exclusive offer waiting for you. Don\'t miss out!',
            'cta': 'Shop Now',
            'predicted_open_rate': 0.35,
            'predicted_ctr': 0.15,
            'predicted_revenue': len(customers) * 500,
            'audience_reasoning': f'Targeting {len(customers)} customers from segment "{segment.name}".',
            'memory_insight': 'No campaign memory available yet.',
        }
        memories = []

    campaign = Campaign(
        user_id=uid,
        segment_id=data['segment_id'],
        name=ai_plan.get('campaign_name', 'New Campaign'),
        goal=data.get('goal', ''),
        channel=ai_plan.get('recommended_channel', 'email'),
        message_subject=ai_plan.get('message_subject', ''),
        message_body=ai_plan.get('message_body', ''),
        cta=ai_plan.get('cta', ''),
        ai_payload=ai_plan,
        memory_context=[m.to_summary() for m in memories] if memories else [],
        predicted_reach=len(customers),
        predicted_open_rate=ai_plan.get('predicted_open_rate', 0.3),
        predicted_revenue=ai_plan.get('predicted_revenue', 0),
        status='draft'
    )
    db.session.add(campaign)
    db.session.commit()
    return jsonify({'campaign': campaign.to_dict()}), 201

@campaigns_bp.route('/<int:cid>', methods=['GET'])
@jwt_required
def get_campaign(cid):
    campaign = Campaign.query.filter_by(id=cid, user_id=g.user_id).first_or_404()
    return jsonify({'campaign': campaign.to_dict()})

@campaigns_bp.route('/<int:cid>/launch', methods=['POST'])
@jwt_required
def launch_campaign(cid):
    campaign = Campaign.query.filter_by(id=cid, user_id=g.user_id).first_or_404()
    segment = Segment.query.get(campaign.segment_id)
    if not segment:
        return jsonify({'error': 'Segment not found'}), 404

    customers = apply_filter_rules(g.user_id, segment.filter_rules or [])

    messages_data = []
    for c in customers:
        msg = CampaignMessage(
            campaign_id=campaign.id,
            customer_id=c.id,
            channel=campaign.channel,
            status='sent',
            sent_at=datetime.utcnow()
        )
        db.session.add(msg)
        db.session.flush()
        messages_data.append({
            'message_id': msg.id,
            'customer_id': c.id,
            'name': c.name,
            'channel': campaign.channel,
            'body': (campaign.message_body or '').replace('{name}', c.name)
        })

    campaign.status = 'running'
    campaign.launched_at = datetime.utcnow()
    db.session.commit()

    # Fire to channel simulator
    try:
        import requests
        sim_url = os.getenv('CHANNEL_SIMULATOR_URL', 'http://localhost:5001')
        def call_sim():
            try:
                requests.post(f'{sim_url}/simulate/send',
                    json={'campaign_id': campaign.id, 'messages': messages_data}, timeout=5)
            except Exception:
                pass
        threading.Thread(target=call_sim, daemon=True).start()
    except Exception:
        pass

    return jsonify({'status': 'running', 'dispatched': len(messages_data)})

@campaigns_bp.route('/<int:cid>/pause', methods=['POST'])
@jwt_required
def pause_campaign(cid):
    campaign = Campaign.query.filter_by(id=cid, user_id=g.user_id).first_or_404()
    campaign.status = 'paused'
    db.session.commit()
    return jsonify({'status': 'paused'})

@campaigns_bp.route('/<int:cid>', methods=['DELETE'])
@jwt_required
def delete_campaign(cid):
    campaign = Campaign.query.filter_by(id=cid, user_id=g.user_id).first_or_404()
    # Delete associated messages first
    CampaignMessage.query.filter_by(campaign_id=cid).delete()
    db.session.delete(campaign)
    db.session.commit()
    return jsonify({'status': 'deleted', 'id': cid})

@campaigns_bp.route('/<int:cid>/analytics', methods=['GET'])
@jwt_required
def campaign_analytics(cid):
    campaign = Campaign.query.filter_by(id=cid, user_id=g.user_id).first_or_404()
    messages = CampaignMessage.query.filter_by(campaign_id=cid).all()
    total = len(messages)
    if total == 0:
        return jsonify({'stats': {}, 'campaign': campaign.to_dict()})

    stats = {
        'total': total,
        'sent': sum(1 for m in messages if m.sent_at),
        'delivered': sum(1 for m in messages if m.delivered_at),
        'opened': sum(1 for m in messages if m.opened_at),
        'clicked': sum(1 for m in messages if m.clicked_at),
        'purchased': sum(1 for m in messages if m.purchased_at),
        'revenue': sum(m.revenue_attr or 0 for m in messages),
    }
    stats['delivery_rate'] = round(stats['delivered'] / max(total, 1), 4)
    stats['open_rate'] = round(stats['opened'] / max(stats['delivered'], 1), 4)
    stats['ctr'] = round(stats['clicked'] / max(stats['opened'], 1), 4)
    stats['conversion_rate'] = round(stats['purchased'] / max(stats['clicked'], 1), 4)

    return jsonify({'stats': stats, 'campaign': campaign.to_dict()})

@campaigns_bp.route('/<int:cid>/reflection', methods=['GET'])
@jwt_required
def campaign_reflection(cid):
    campaign = Campaign.query.filter_by(id=cid, user_id=g.user_id).first_or_404()

    if campaign.ai_payload and campaign.ai_payload.get('reflection'):
        return jsonify({'reflection': campaign.ai_payload['reflection']})

    messages = CampaignMessage.query.filter_by(campaign_id=cid).all()
    total = len(messages)
    stats = {
        'total': total,
        'delivery_rate': sum(1 for m in messages if m.delivered_at) / max(total, 1),
        'open_rate': sum(1 for m in messages if m.opened_at) / max(total, 1),
        'ctr': sum(1 for m in messages if m.clicked_at) / max(total, 1),
        'conversion_rate': sum(1 for m in messages if m.purchased_at) / max(total, 1),
        'revenue': sum(m.revenue_attr or 0 for m in messages),
    }

    try:
        from app.services.groq_service import generate_reflection_report
        from app.services.memory_service import save_memory_after_campaign
        reflection = generate_reflection_report(campaign.to_dict(), stats)
        save_memory_after_campaign(campaign, stats, reflection)
    except Exception:
        reflection = {
            'what_worked': 'Campaign reached the target audience successfully.',
            'what_failed': 'Some messages were not opened.',
            'key_insight': f'Open rate was {stats["open_rate"]:.0%}.',
            'recommendations': ['Try shorter messages', 'Use WhatsApp for higher engagement', 'Add urgency to CTA'],
            'next_best_actions': [
                {'action': 'Retarget non-openers', 'reason': 'Many customers did not engage', 'urgency': 'high'},
                {'action': 'Reward purchasers', 'reason': 'Build loyalty', 'urgency': 'medium'},
            ]
        }

    payload = campaign.ai_payload or {}
    payload['reflection'] = reflection
    campaign.ai_payload = payload
    db.session.commit()

    return jsonify({'reflection': reflection})

@campaigns_bp.route('/<int:cid>/next-actions', methods=['GET'])
@jwt_required
def next_actions(cid):
    campaign = Campaign.query.filter_by(id=cid, user_id=g.user_id).first_or_404()

    if campaign.ai_payload and campaign.ai_payload.get('reflection', {}).get('next_best_actions'):
        return jsonify({'actions': campaign.ai_payload['reflection']['next_best_actions']})

    messages = CampaignMessage.query.filter_by(campaign_id=cid).all()
    clicked_not_purchased = sum(1 for m in messages if m.clicked_at and not m.purchased_at)
    purchased = sum(1 for m in messages if m.purchased_at)

    actions = [
        {'action': f'Retarget {clicked_not_purchased} customers who clicked but didn\'t buy', 'reason': 'High intent audience', 'urgency': 'high'},
        {'action': f'Reward {purchased} customers who purchased', 'reason': 'Build loyalty and repeat purchases', 'urgency': 'medium'},
        {'action': 'Launch follow-up campaign for non-openers', 'reason': 'Re-engage cold audience', 'urgency': 'low'},
    ]
    return jsonify({'actions': actions})
