from flask import Blueprint, request, jsonify, g
from app.models.customer import Customer
from app.models.campaign import CampaignMessage
from app import db
from app.utils import jwt_required
from datetime import datetime, timedelta

customers_bp = Blueprint('customers', __name__)

@customers_bp.route('/', methods=['GET'])
@jwt_required
def list_customers():
    uid = g.user_id
    search = request.args.get('search', '')
    filter_type = request.args.get('filter', '')
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 20))

    query = Customer.query.filter_by(user_id=uid)
    if search:
        query = query.filter(
            Customer.name.ilike(f'%{search}%') |
            Customer.email.ilike(f'%{search}%')
        )
    if filter_type == 'top':
        query = query.order_by(Customer.lifetime_value.desc())
    elif filter_type == 'inactive':
        cutoff = datetime.utcnow() - timedelta(days=60)
        query = query.filter(Customer.last_purchase_date < cutoff)
    elif filter_type == 'high_risk':
        query = query.filter_by(churn_risk='high')
    elif filter_type == 'new':
        cutoff = datetime.utcnow() - timedelta(days=30)
        query = query.filter(Customer.join_date >= cutoff)

    if not filter_type or filter_type not in ['top']:
        query = query.order_by(Customer.created_at.desc())

    paginated = query.paginate(page=page, per_page=per_page, error_out=False)
    return jsonify({
        'customers': [c.to_dict() for c in paginated.items],
        'total': paginated.total,
        'pages': paginated.pages,
        'page': page
    })

@customers_bp.route('/<int:cid>', methods=['GET'])
@jwt_required
def get_customer(cid):
    customer = Customer.query.filter_by(id=cid, user_id=g.user_id).first_or_404()
    return jsonify({'customer': customer.to_dict()})

@customers_bp.route('/<int:cid>/profile', methods=['GET'])
@jwt_required
def customer_profile(cid):
    customer = Customer.query.filter_by(id=cid, user_id=g.user_id).first_or_404()
    orders = [o.to_dict() for o in customer.orders]
    messages = [m.to_dict() for m in customer.messages]

    ai_profile = customer.ai_profile
    if not ai_profile:
        ai_profile = {
            'summary': f'{customer.name} is a {"high-value" if customer.lifetime_value > 5000 else "regular"} customer from {customer.city or "unknown city"}.',
            'churn_prediction': customer.churn_risk,
            'recommended_channel': customer.preferred_channel,
            'top_category': customer.favorite_category,
            'engagement_score': min(100, int((customer.total_orders or 0) * 10 + (customer.lifetime_value or 0) / 100)),
        }

    return jsonify({
        'customer': customer.to_dict(),
        'ai_profile': ai_profile,
        'orders': orders,
        'journey': messages
    })

@customers_bp.route('/bulk', methods=['POST'])
@jwt_required
def bulk_import():
    data = request.get_json()
    customers = data.get('customers', [])
    imported = 0
    for c in customers:
        customer = Customer(
            user_id=g.user_id,
            name=c['name'],
            email=c.get('email'),
            phone=c.get('phone'),
            city=c.get('city'),
            lifetime_value=c.get('lifetime_value', 0),
            total_orders=c.get('total_orders', 0),
            churn_risk=c.get('churn_risk', 'low'),
            preferred_channel=c.get('preferred_channel', 'email'),
            favorite_category=c.get('favorite_category'),
        )
        db.session.add(customer)
        imported += 1
    db.session.commit()
    return jsonify({'imported': imported}), 201

@customers_bp.route('/<int:cid>/journey', methods=['GET'])
@jwt_required
def customer_journey(cid):
    customer = Customer.query.filter_by(id=cid, user_id=g.user_id).first_or_404()
    messages = CampaignMessage.query.filter_by(customer_id=cid).order_by(CampaignMessage.sent_at.desc()).all()
    return jsonify({'journey': [m.to_dict() for m in messages]})
