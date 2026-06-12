import os

class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'sqlite:///pulseai.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET = os.getenv('JWT_SECRET', 'pulseai_super_secret_key_2026')
    GROQ_API_KEY = os.getenv('GROQ_API_KEY', '')
    CHANNEL_SIMULATOR_URL = os.getenv('CHANNEL_SIMULATOR_URL', 'http://localhost:5001')
