from flask import Blueprint, request, jsonify
from app.models.user import User
from app import db
from app.utils import jwt_required
from flask import g
import jwt as pyjwt
import os
from datetime import datetime, timedelta

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email and password required'}), 400
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already exists'}), 409
    user = User(email=data['email'], brand_name=data.get('brand_name', 'My Brand'))
    user.set_password(data['password'])
    db.session.add(user)
    db.session.commit()
    token = pyjwt.encode(
        {'user_id': user.id, 'exp': datetime.utcnow() + timedelta(days=7)},
        os.getenv('JWT_SECRET', 'pulseai_super_secret_key_2026'), algorithm='HS256'
    )
    return jsonify({'token': token, 'user': user.to_dict()}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email and password required'}), 400
    user = User.query.filter_by(email=data['email']).first()
    if not user or not user.check_password(data['password']):
        return jsonify({'error': 'Invalid credentials'}), 401
    token = pyjwt.encode(
        {'user_id': user.id, 'exp': datetime.utcnow() + timedelta(days=7)},
        os.getenv('JWT_SECRET', 'pulseai_super_secret_key_2026'), algorithm='HS256'
    )
    return jsonify({'token': token, 'user': user.to_dict()})

@auth_bp.route('/me', methods=['GET'])
@jwt_required
def me():
    user = User.query.get(g.user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify({'user': user.to_dict()})
