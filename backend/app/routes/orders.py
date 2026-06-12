from flask import Blueprint, request, jsonify, g
from app.models.order import Order
from app.models.customer import Customer
from app import db
from app.utils import jwt_required
from sqlalchemy import func, extract

orders_bp = Blueprint('orders', __name__)

@orders_bp.route('/', methods=['GET'])
@jwt_required
def list_orders():
    uid = g.user_id
    customer_id = request.args.get('customer_id')
    category = request.args.get('category')
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 25))

    query = Order.query.filter_by(user_id=uid)
    if customer_id:
        query = query.filter(Order.customer_id == customer_id)
    if category:
        query = query.filter(Order.category == category)

    query = query.order_by(Order.created_at.desc())
    paginated = query.paginate(page=page, per_page=per_page, error_out=False)
    return jsonify({
        'orders': [o.to_dict() for o in paginated.items],
        'total': paginated.total,
        'pages': paginated.pages,
        'page': page
    })

@orders_bp.route('/bulk', methods=['POST'])
@jwt_required
def bulk_import():
    data = request.get_json()
    orders = data.get('orders', [])
    imported = 0
    for o in orders:
        order = Order(
            user_id=g.user_id,
            customer_id=o['customer_id'],
            order_ref=o.get('order_ref', f'ORD-{imported:05d}'),
            amount=o['amount'],
            category=o.get('category'),
            status=o.get('status', 'completed'),
        )
        db.session.add(order)
        imported += 1
    db.session.commit()
    return jsonify({'imported': imported}), 201

@orders_bp.route('/stats', methods=['GET'])
@jwt_required
def order_stats():
    uid = g.user_id
    total_orders = Order.query.filter_by(user_id=uid).count()
    total_revenue = db.session.query(func.sum(Order.amount)).filter(Order.user_id == uid).scalar() or 0
    avg_order = total_revenue / max(total_orders, 1)

    # By category
    by_category = db.session.query(
        Order.category, func.count(Order.id), func.sum(Order.amount)
    ).filter(Order.user_id == uid).group_by(Order.category).all()

    categories = [{'category': c or 'Other', 'count': cnt, 'revenue': rev or 0} for c, cnt, rev in by_category]

    return jsonify({
        'total_orders': total_orders,
        'total_revenue': round(total_revenue, 2),
        'avg_order_value': round(avg_order, 2),
        'by_category': categories,
    })
