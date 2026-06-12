import random
from datetime import datetime, timedelta
from app import db
from app.models.user import User
from app.models.customer import Customer
from app.models.order import Order
from app.models.segment import Segment
from app.models.campaign import Campaign, CampaignMessage
from app.models.memory import CampaignMemory

def seed_all():
    # Demo user
    user = User(email='demo@pulseai.com', brand_name='UrbanKicks')
    user.set_password('demo123')
    db.session.add(user)
    db.session.flush()

    names = [
        'Aarav Sharma', 'Priya Patel', 'Rohit Kumar', 'Ananya Singh', 'Vikram Reddy',
        'Sneha Gupta', 'Arjun Nair', 'Kavya Iyer', 'Raj Malhotra', 'Meera Joshi',
        'Aditya Verma', 'Divya Rao', 'Karthik Menon', 'Pooja Desai', 'Siddharth Bhat',
        'Neha Kapoor', 'Rahul Chauhan', 'Ishita Agarwal', 'Varun Saxena', 'Tanvi Pillai',
        'Amit Pandey', 'Riya Mehta', 'Harsh Tiwari', 'Simran Kaur', 'Manish Yadav',
        'Swati Mishra', 'Nikhil Jain', 'Anjali Nanda', 'Deepak Chandra', 'Preeti Sinha',
        'Gaurav Thakur', 'Shruti Bansal', 'Akash Dubey', 'Nidhi Rastogi', 'Saurabh Goyal',
        'Pallavi Kulkarni', 'Vivek Bhargava', 'Ritika Soni', 'Abhishek Kohli', 'Kriti Mukherjee',
        'Mayank Arora', 'Sonali Deshpande', 'Tushar Hegde', 'Aditi Choudhary', 'Pankaj Sethi',
        'Bhavya Rajan', 'Yash Mittal', 'Sonal Khatri', 'Rajesh Venkat', 'Tanya Grover',
    ]
    cities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Jaipur', 'Ahmedabad', 'Lucknow']
    categories = ['Sneakers', 'Apparel', 'Accessories', 'Streetwear', 'Watches']
    channels = ['whatsapp', 'email', 'sms']

    customers = []
    for i, name in enumerate(names):
        days_ago = random.randint(10, 365)
        ltv = round(random.uniform(500, 25000), 2)
        orders_count = random.randint(1, 20)
        last_purchase = datetime.utcnow() - timedelta(days=random.randint(1, 180))
        risk = 'high' if last_purchase < datetime.utcnow() - timedelta(days=90) else ('medium' if last_purchase < datetime.utcnow() - timedelta(days=45) else 'low')

        c = Customer(
            user_id=user.id,
            name=name,
            email=f'{name.lower().replace(" ", ".")}@email.com',
            phone=f'+91{random.randint(7000000000, 9999999999)}',
            city=random.choice(cities),
            join_date=datetime.utcnow() - timedelta(days=days_ago),
            lifetime_value=ltv,
            total_orders=orders_count,
            last_purchase_date=last_purchase,
            preferred_channel=random.choice(channels),
            favorite_category=random.choice(categories),
            churn_risk=risk,
            purchase_frequency_days=random.randint(7, 90),
            segment_tags=['vip'] if ltv > 10000 else (['at_risk'] if risk == 'high' else []),
        )
        db.session.add(c)
        customers.append(c)
    db.session.flush()

    # Orders
    order_count = 0
    for c in customers:
        num_orders = random.randint(1, min(c.total_orders, 8))
        for j in range(num_orders):
            o = Order(
                user_id=user.id,
                customer_id=c.id,
                order_ref=f'ORD-{order_count:05d}',
                amount=round(random.uniform(300, 8000), 2),
                category=random.choice(categories),
                status=random.choice(['completed', 'completed', 'completed', 'pending', 'returned']),
                created_at=datetime.utcnow() - timedelta(days=random.randint(1, 300)),
            )
            db.session.add(o)
            order_count += 1
    db.session.flush()

    # Segments
    seg1 = Segment(user_id=user.id, name='VIP Customers', description='High lifetime value customers',
                   filter_rules=[{'field': 'lifetime_value', 'op': 'gt', 'value': 10000}],
                   customer_count=len([c for c in customers if c.lifetime_value > 10000]))
    seg2 = Segment(user_id=user.id, name='At-Risk Churners', description='Customers at high churn risk',
                   filter_rules=[{'field': 'churn_risk', 'op': 'eq', 'value': 'high'}],
                   customer_count=len([c for c in customers if c.churn_risk == 'high']))
    seg3 = Segment(user_id=user.id, name='Frequent Buyers', description='Customers with many orders',
                   filter_rules=[{'field': 'total_orders', 'op': 'gte', 'value': 5}],
                   customer_count=len([c for c in customers if c.total_orders >= 5]))
    db.session.add_all([seg1, seg2, seg3])
    db.session.flush()

    # Campaigns
    camp1 = Campaign(
        user_id=user.id, segment_id=seg2.id,
        name='Win-Back Inactive Customers', goal='Bring back customers who haven\'t purchased in 60+ days',
        channel='whatsapp', message_subject='We Miss You ❤️',
        message_body='Hi {name}, we noticed you haven\'t shopped in a while. Enjoy 20% OFF your next order! Use code: BACK20',
        cta='Shop Now →', status='completed',
        ai_payload={'campaign_name': 'Win-Back Inactive Customers', 'recommended_channel': 'whatsapp',
                    'predicted_open_rate': 0.82, 'predicted_ctr': 0.35},
        predicted_reach=seg2.customer_count, predicted_open_rate=0.82, predicted_revenue=45000,
        launched_at=datetime.utcnow() - timedelta(days=5),
        completed_at=datetime.utcnow() - timedelta(days=3),
    )
    camp2 = Campaign(
        user_id=user.id, segment_id=seg1.id,
        name='VIP Loyalty Rewards', goal='Reward top customers with exclusive offers',
        channel='email', message_subject='Exclusive VIP Offer Inside 👑',
        message_body='Hi {name}, as one of our most valued customers, enjoy early access to our new collection with 15% OFF!',
        cta='Unlock VIP Access', status='draft',
        predicted_reach=seg1.customer_count, predicted_open_rate=0.65, predicted_revenue=80000,
    )
    db.session.add_all([camp1, camp2])
    db.session.flush()

    # Campaign messages for completed campaign
    risk_customers = [c for c in customers if c.churn_risk == 'high'][:15]
    for c in risk_customers:
        delivered = random.random() < 0.95
        opened = delivered and random.random() < 0.80
        clicked = opened and random.random() < 0.40
        purchased = clicked and random.random() < 0.20
        msg = CampaignMessage(
            campaign_id=camp1.id, customer_id=c.id, channel='whatsapp',
            status='purchased' if purchased else ('clicked' if clicked else ('opened' if opened else ('delivered' if delivered else 'sent'))),
            sent_at=datetime.utcnow() - timedelta(days=5),
            delivered_at=(datetime.utcnow() - timedelta(days=5, hours=-1)) if delivered else None,
            opened_at=(datetime.utcnow() - timedelta(days=4)) if opened else None,
            clicked_at=(datetime.utcnow() - timedelta(days=4, hours=-2)) if clicked else None,
            purchased_at=(datetime.utcnow() - timedelta(days=3)) if purchased else None,
            revenue_attr=round(random.uniform(1500, 5000), 2) if purchased else 0,
        )
        db.session.add(msg)

    # Campaign memory
    mem = CampaignMemory(
        user_id=user.id, campaign_id=camp1.id,
        audience_type='inactive', channel='whatsapp',
        goal_keywords=['inactive', 'churn', 'back', 'win', 'customers'],
        reach=len(risk_customers), delivery_rate=0.95, open_rate=0.80, ctr=0.35,
        conversion_rate=0.20, revenue=12000,
        what_worked='WhatsApp delivered 2x higher open rates vs email for inactive segments',
        what_failed='Message was slightly long, some users didn\'t read fully',
        recommendations='Use shorter messages; Lead with discount; Add urgency',
    )
    db.session.add(mem)
    db.session.commit()
    print(f'✓ Seeded: 1 user, {len(customers)} customers, {order_count} orders, 3 segments, 2 campaigns')
