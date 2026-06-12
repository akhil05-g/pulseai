from app.models.customer import Customer
from datetime import datetime, timedelta

FIELD_MAP = {
    'lifetime_value': Customer.lifetime_value,
    'total_orders': Customer.total_orders,
    'days_since_purchase': None,
    'churn_risk': Customer.churn_risk,
    'city': Customer.city,
    'preferred_channel': Customer.preferred_channel,
    'favorite_category': Customer.favorite_category,
}

OP_MAP = {
    'gt': lambda col, val: col > val,
    'lt': lambda col, val: col < val,
    'eq': lambda col, val: col == val,
    'gte': lambda col, val: col >= val,
    'lte': lambda col, val: col <= val,
}

def apply_filter_rules(user_id, rules):
    query = Customer.query.filter_by(user_id=user_id)
    for rule in (rules or []):
        field = rule.get('field')
        op = rule.get('op')
        value = rule.get('value')
        if not field or not op:
            continue

        if field == 'days_since_purchase':
            cutoff = datetime.utcnow() - timedelta(days=int(value))
            if op in ('gt', 'gte'):
                query = query.filter(Customer.last_purchase_date < cutoff)
            elif op in ('lt', 'lte'):
                query = query.filter(Customer.last_purchase_date > cutoff)
        elif field in FIELD_MAP and FIELD_MAP[field] is not None:
            col = FIELD_MAP[field]
            if op in OP_MAP:
                query = query.filter(OP_MAP[op](col, value))

    return query.all()
