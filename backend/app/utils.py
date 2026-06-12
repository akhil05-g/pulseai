from functools import wraps
from flask import request, jsonify, g
import jwt
import os

def jwt_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        if not token:
            return jsonify({'error': 'Token missing'}), 401
        try:
            data = jwt.decode(token, os.getenv('JWT_SECRET', 'pulseai_super_secret_key_2026'), algorithms=['HS256'])
            g.user_id = data['user_id']
        except Exception:
            return jsonify({'error': 'Invalid token'}), 401
        return f(*args, **kwargs)
    return decorated
