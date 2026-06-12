from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from dotenv import load_dotenv
import os

load_dotenv()

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    app.config.from_object('app.config.Config')
    
    db.init_app(app)
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.customers import customers_bp
    from app.routes.orders import orders_bp
    from app.routes.segments import segments_bp
    from app.routes.campaigns import campaigns_bp
    from app.routes.analytics import analytics_bp
    from app.routes.ai import ai_bp
    from app.routes.webhooks import webhooks_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(customers_bp, url_prefix='/api/customers')
    app.register_blueprint(orders_bp, url_prefix='/api/orders')
    app.register_blueprint(segments_bp, url_prefix='/api/segments')
    app.register_blueprint(campaigns_bp, url_prefix='/api/campaigns')
    app.register_blueprint(analytics_bp, url_prefix='/api')
    app.register_blueprint(ai_bp, url_prefix='/api/ai')
    app.register_blueprint(webhooks_bp, url_prefix='/api/webhooks')

    return app
