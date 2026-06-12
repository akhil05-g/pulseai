from flask import Blueprint, request, jsonify, g
from app.models.segment import Segment
from app import db
from app.utils import jwt_required
from app.services.segment_service import apply_filter_rules

segments_bp = Blueprint('segments', __name__)

@segments_bp.route('/', methods=['GET'])
@jwt_required
def list_segments():
    segments = Segment.query.filter_by(user_id=g.user_id).order_by(Segment.created_at.desc()).all()
    return jsonify({'segments': [s.to_dict() for s in segments]})

@segments_bp.route('/', methods=['POST'])
@jwt_required
def create_segment():
    data = request.get_json()
    customers = apply_filter_rules(g.user_id, data.get('filter_rules', []))
    seg = Segment(
        user_id=g.user_id,
        name=data['name'],
        description=data.get('description', ''),
        filter_rules=data.get('filter_rules', []),
        customer_count=len(customers)
    )
    db.session.add(seg)
    db.session.commit()
    return jsonify({'segment': seg.to_dict(), 'preview_count': len(customers)}), 201

@segments_bp.route('/ai-discover', methods=['POST'])
@jwt_required
def ai_discover():
    data = request.get_json()
    query_text = data.get('query', '')

    try:
        from app.services.groq_service import nl_to_segment
        result = nl_to_segment(g.user_id, query_text)
    except Exception:
        # Fallback if Groq unavailable
        result = {
            'segment_name': f'AI Segment: {query_text[:40]}',
            'reasoning': 'AI service unavailable. Created with default filters.',
            'filter_rules': [{'field': 'lifetime_value', 'op': 'gt', 'value': 1000}]
        }

    customers = apply_filter_rules(g.user_id, result['filter_rules'])
    seg = Segment(
        user_id=g.user_id,
        name=result['segment_name'],
        description=result.get('reasoning', ''),
        filter_rules=result['filter_rules'],
        customer_count=len(customers),
        is_ai_generated=True,
        ai_reasoning=result.get('reasoning', '')
    )
    db.session.add(seg)
    db.session.commit()
    return jsonify({
        'segment': seg.to_dict(),
        'customers': [c.to_dict() for c in customers[:10]],
        'reasoning': result.get('reasoning', '')
    })

@segments_bp.route('/<int:sid>', methods=['GET'])
@jwt_required
def get_segment(sid):
    seg = Segment.query.filter_by(id=sid, user_id=g.user_id).first_or_404()
    return jsonify({'segment': seg.to_dict()})

@segments_bp.route('/<int:sid>/preview', methods=['GET'])
@jwt_required
def preview_segment(sid):
    seg = Segment.query.filter_by(id=sid, user_id=g.user_id).first_or_404()
    customers = apply_filter_rules(g.user_id, seg.filter_rules or [])
    return jsonify({
        'customers': [c.to_dict() for c in customers[:20]],
        'total': len(customers)
    })

@segments_bp.route('/<int:sid>', methods=['DELETE'])
@jwt_required
def delete_segment(sid):
    seg = Segment.query.filter_by(id=sid, user_id=g.user_id).first_or_404()
    db.session.delete(seg)
    db.session.commit()
    return jsonify({'ok': True})
