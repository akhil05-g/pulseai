import os
from app import create_app, db
from app.seed import seed_all

app = create_app()

# Auto-seed on startup (works for both gunicorn and dev server)
with app.app_context():
    db.create_all()
    from app.models.user import User
    if not User.query.first():
        seed_all()
        print('Database seeded successfully!')
    else:
        print('Database already has data.')

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV', 'development') == 'development'
    app.run(debug=debug, host='0.0.0.0', port=port)
