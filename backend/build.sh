#!/usr/bin/env bash
set -o errexit

pip install -r requirements.txt

# Initialize the database and seed data
python -c "
from app import create_app, db
from app.seed import seed_all
from app.models.user import User

app = create_app()
with app.app_context():
    db.create_all()
    if not User.query.first():
        seed_all()
        print('Database seeded successfully!')
    else:
        print('Database already has data.')
"
