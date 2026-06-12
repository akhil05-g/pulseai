from flask import Blueprint, request, jsonify, g
from app.utils import jwt_required
from app import db
import random, hashlib

ai_bp = Blueprint('ai', __name__)

# ─── Creative Response Templates ───
# Each goal pattern maps to multiple unique response styles
CREATIVE_RESPONSES = {
    'inactive': [
        lambda stats: (
            f"🔥 **Win-Back Strategy: \"We Miss You\" Edition**\n\n"
            f"I found **{stats['at_risk']} customers** who haven't shopped in 30+ days. Here's my plan:\n\n"
            f"📨 **Channel:** Email (best for re-engagement — personal, detailed)\n"
            f"✉️ **Subject:** \"We saved something special for you, {{name}}\"\n"
            f"💬 **Message:** \"Hey {{name}}, it's been a while! We've added {stats['top_category']} pieces you'd love. "
            f"Here's 15% off to welcome you back. Use code MISSYOU15.\"\n"
            f"🎯 **CTA:** \"Claim My Discount →\"\n\n"
            f"📊 **Predicted:** {stats['at_risk']*450:.0f}₹ revenue | ~35% open rate\n\n"
            f"Want me to build this campaign? Just say **yes**."
        ),
        lambda stats: (
            f"💫 **Re-Engagement Blitz: \"Your Cart Misses You\"**\n\n"
            f"We have **{stats['at_risk']} dormant customers** — let's wake them up!\n\n"
            f"📱 **Channel:** SMS (high urgency, 92% delivery rate)\n"
            f"💬 **Message:** \"{{name}}, your favorites in {stats['top_category']} are selling fast! "
            f"Flat 20% OFF for the next 48 hours. Shop now → [link]\"\n"
            f"🎯 **CTA:** \"Shop Before It's Gone\"\n\n"
            f"📊 **Why SMS?** Short, punchy, impossible to ignore. Perfect for time-limited offers.\n"
            f"📊 **Predicted:** {stats['at_risk']*380:.0f}₹ revenue | ~45% open rate\n\n"
            f"Want me to build this campaign? Just say **yes**."
        ),
        lambda stats: (
            f"🎭 **\"The Comeback Collection\" Campaign**\n\n"
            f"**{stats['at_risk']} customers** are slipping away. Let's bring them home.\n\n"
            f"📲 **Channel:** RCS (rich media — images, carousels, buttons!)\n"
            f"✨ **Headline:** \"New drops. Old favorites. Zero excuses.\"\n"
            f"💬 **Message:** \"{{name}}, we've been busy! Check out what's new in {stats['top_category']}. "
            f"As a returning VIP, enjoy early access + free shipping.\"\n"
            f"🎯 **CTA:** \"Explore What's New →\"\n\n"
            f"📊 **Why RCS?** Rich visuals = 55% open rate. Carousel format lets them browse without leaving chat.\n"
            f"📊 **Predicted:** {stats['at_risk']*520:.0f}₹ revenue\n\n"
            f"Want me to build this campaign? Just say **yes**."
        ),
    ],
    'repeat': [
        lambda stats: (
            f"🔄 **\"Loyalty Pays\" — Repeat Purchase Engine**\n\n"
            f"Your **{stats['active']} active customers** are primed for repeat orders!\n\n"
            f"📱 **Channel:** WhatsApp (82% open rate, conversational)\n"
            f"💬 **Message:** \"Hey {{name}}! 🎉 You've been with us for a while now. "
            f"Here's an exclusive deal: Buy 2 {stats['top_category']} items, get 1 FREE. "
            f"Only for our loyal fam!\"\n"
            f"🎯 **CTA:** \"Grab My Deal 🛒\"\n\n"
            f"📊 **Strategy:** Bundle offers drive 2.3x higher AOV than flat discounts.\n"
            f"📊 **Predicted:** {stats['active']*600:.0f}₹ revenue | ~82% open rate\n\n"
            f"Want me to build this campaign? Just say **yes**."
        ),
        lambda stats: (
            f"⚡ **\"Members-Only Flash Sale\" Campaign**\n\n"
            f"Let's drive repeat purchases from your **{stats['active']} active buyers**.\n\n"
            f"📨 **Channel:** Email (perfect for detailed product showcases)\n"
            f"✉️ **Subject:** \"48-Hour Flash Sale — Members Only 🔒\"\n"
            f"💬 **Message:** \"{{name}}, as one of our valued customers, you get first access to our "
            f"48-hour members-only sale. Up to 30% off on {stats['top_category']} + free express shipping!\"\n"
            f"🎯 **CTA:** \"Unlock My Deals →\"\n\n"
            f"📊 **Why it works:** Exclusivity + time pressure = urgency. Members-only framing boosts CTR by 40%.\n"
            f"📊 **Predicted:** {stats['active']*480:.0f}₹ revenue | ~33% open rate\n\n"
            f"Want me to build this campaign? Just say **yes**."
        ),
    ],
    'reward': [
        lambda stats: (
            f"⭐ **\"The Royal Treatment\" — VIP Rewards Campaign**\n\n"
            f"Your top **{stats['vip_count']} VIP customers** (LTV > ₹{stats['avg_ltv']:.0f}) deserve the best!\n\n"
            f"📲 **Channel:** RCS (premium feel with rich cards)\n"
            f"✨ **Headline:** \"You're in the top 10%. Here's your crown. 👑\"\n"
            f"💬 **Message:** \"{{name}}, your loyalty has earned you VIP status! "
            f"Enjoy: Early access to new {stats['top_category']} drops, 25% lifetime discount, "
            f"and a surprise gift on your next order.\"\n"
            f"🎯 **CTA:** \"Claim VIP Perks 👑\"\n\n"
            f"📊 **Insight:** VIP customers spend 3x more than average. Rewarding them increases retention by 67%.\n"
            f"📊 **Predicted:** {stats['vip_count']*900:.0f}₹ revenue\n\n"
            f"Want me to build this campaign? Just say **yes**."
        ),
        lambda stats: (
            f"🎁 **\"Thank You\" Gratitude Campaign**\n\n"
            f"**{stats['vip_count']} loyal customers** have been with you through thick and thin.\n\n"
            f"📱 **Channel:** WhatsApp (personal, warm tone)\n"
            f"💬 **Message:** \"Hey {{name}}! 💛 Just wanted to say THANK YOU for being amazing. "
            f"No catch, no sale — just a gift card worth ₹500 on your next order. Because you matter.\"\n"
            f"🎯 **CTA:** \"Redeem My Gift 🎁\"\n\n"
            f"📊 **Why this works:** Surprise rewards without a catch build emotional loyalty. "
            f"73% of customers say unexpected gifts make them shop more.\n"
            f"📊 **Predicted:** {stats['vip_count']*750:.0f}₹ revenue | ~85% open rate\n\n"
            f"Want me to build this campaign? Just say **yes**."
        ),
    ],
    'promote': [
        lambda stats: (
            f"☀️ **\"Drop Alert\" — New Collection Launch**\n\n"
            f"Time to make noise! Target: **{stats['total']} customers**\n\n"
            f"📨 **Channel:** Email (detailed lookbook style)\n"
            f"✉️ **Subject:** \"It's here. The collection you've been waiting for. 🔥\"\n"
            f"💬 **Message:** \"{{name}}, introducing our latest {stats['top_category']} collection — "
            f"designed for those who lead, not follow. Be the first to own these limited-edition pieces. "
            f"First 50 orders get free customization!\"\n"
            f"🎯 **CTA:** \"Shop The Drop →\"\n\n"
            f"📊 **Strategy:** Scarcity (\"first 50\") + exclusivity = 2x conversion rate.\n"
            f"📊 **Predicted:** {stats['total']*350:.0f}₹ revenue | ~38% open rate\n\n"
            f"Want me to build this campaign? Just say **yes**."
        ),
        lambda stats: (
            f"🚀 **\"Sneak Peek\" Teaser Campaign**\n\n"
            f"Build hype before the launch! **{stats['total']} customers** will see this.\n\n"
            f"📱 **Channel:** SMS (fast, immediate attention)\n"
            f"💬 **Message:** \"{{name}} 👀 Something BIG is dropping tomorrow. "
            f"Hint: {stats['top_category']}. Reply YES for early access before everyone else!\"\n"
            f"🎯 **CTA:** \"Reply YES\"\n\n"
            f"📊 **Why SMS?** Teasers work best when short and mysterious. "
            f"SMS reply-based engagement gets 3x the interaction of links.\n"
            f"📊 **Predicted:** {stats['total']*280:.0f}₹ revenue | ~48% open rate\n\n"
            f"Want me to build this campaign? Just say **yes**."
        ),
    ],
    'default': [
        lambda stats: (
            f"🎯 **Smart Campaign Recommendation**\n\n"
            f"Based on your data (**{stats['total']} customers**, **{stats['at_risk']} at risk**), here's what I suggest:\n\n"
            f"📨 **Channel:** Email (versatile, great for detailed messaging)\n"
            f"✉️ **Subject:** \"{{name}}, this one's just for you ✨\"\n"
            f"💬 **Message:** \"We handpicked these {stats['top_category']} recommendations just for you, {{name}}. "
            f"Based on what you love, we think you'll adore these new arrivals. Plus, enjoy 10% off as our thanks!\"\n"
            f"🎯 **CTA:** \"See My Picks →\"\n\n"
            f"📊 **Predicted:** {stats['total']*300:.0f}₹ revenue | ~32% open rate\n\n"
            f"Want me to build this campaign? Just say **yes**."
        ),
        lambda stats: (
            f"⚡ **Data-Driven Campaign Plan**\n\n"
            f"Here's what the numbers tell me about your **{stats['total']} customers**:\n\n"
            f"📱 **Channel:** SMS (fast delivery, high read rate)\n"
            f"💬 **Message:** \"Hey {{name}}! 🔥 Hot deals on {stats['top_category']} — "
            f"up to 25% off for the next 24 hours only. Don't sleep on this!\"\n"
            f"🎯 **CTA:** \"Shop Now →\"\n\n"
            f"📊 **Why this works:** Short, urgent, personal. SMS has 98% read rate within 3 minutes.\n"
            f"📊 **Predicted:** {stats['total']*250:.0f}₹ revenue | ~45% open rate\n\n"
            f"Want me to build this campaign? Just say **yes**."
        ),
        lambda stats: (
            f"💎 **Premium Engagement Campaign**\n\n"
            f"Let's create something special for your **{stats['total']} customers**.\n\n"
            f"📲 **Channel:** RCS (rich interactive messages with images)\n"
            f"✨ **Headline:** \"Your style. Elevated.\"\n"
            f"💬 **Message:** \"{{name}}, we've curated a collection of {stats['top_category']} "
            f"that matches your taste perfectly. Swipe through our top picks and enjoy member pricing!\"\n"
            f"🎯 **CTA:** \"Explore Collection →\"\n\n"
            f"📊 **Why RCS?** Interactive carousels get 3x more engagement than plain text. "
            f"Perfect for showcasing products visually.\n"
            f"📊 **Predicted:** {stats['total']*400:.0f}₹ revenue | ~55% open rate\n\n"
            f"Want me to build this campaign? Just say **yes**."
        ),
    ],
}

# Channel selection based on goal context
CHANNEL_MAP = {
    'inactive': ['email', 'sms', 'rcs'],
    'repeat': ['whatsapp', 'email'],
    'reward': ['rcs', 'whatsapp'],
    'promote': ['email', 'sms'],
    'default': ['email', 'sms', 'rcs', 'whatsapp'],
}

CAMPAIGN_NAMES = {
    'inactive': ['Win-Back Blitz', 'The Comeback Campaign', 'We Miss You', 'Re-Engage & Revive', 'Second Chance Sale'],
    'repeat': ['Loyalty Rewards', 'Repeat & Save', 'Members-Only Flash', 'The Loyal Fam Deal', 'Come Back For More'],
    'reward': ['VIP Royal Treatment', 'Thank You Campaign', 'Crown Your Loyals', 'Gold Member Perks', 'The Gratitude Drop'],
    'promote': ['Collection Drop Alert', 'Sneak Peek Launch', 'New Arrivals Buzz', 'The Big Reveal', 'Fresh Off The Rack'],
    'default': ['Smart Reach Campaign', 'Pulse Engage', 'Curated For You', 'Personal Picks', 'Flash Deal Friday'],
}

SUBJECTS = {
    'inactive': ['We saved something special for you', 'It\'s been a while, {name}!', 'Your cart misses you 💔', 'Come back to something amazing'],
    'repeat': ['Exclusive deal inside 🔒', 'Buy more, save more — just for you', 'Your next favorite is here', 'Members-only: 48hr flash sale'],
    'reward': ['You\'ve earned something special 👑', 'A gift, just because 🎁', 'VIP status unlocked!', 'Thank you for being amazing'],
    'promote': ['It\'s here. The drop you waited for 🔥', 'New collection alert!', 'First look: exclusive preview', 'Be the first to own this'],
    'default': ['{name}, this one\'s for you ✨', 'Handpicked just for you', 'Something special awaits', 'Your personal recommendations'],
}

MESSAGES = {
    'inactive': [
        'Hey {name}, it\'s been a while! We\'ve added stunning new pieces to our {category} collection. Here\'s 15% off to welcome you back. Use code MISSYOU15.',
        '{name}, we noticed you haven\'t visited in a bit. No worries — we saved the best {category} picks for you. Flat 20% OFF for the next 48 hours!',
        'Hi {name}! 👋 New {category} just dropped and we think you\'ll love them. As a thank-you for being with us, enjoy free shipping on your next order.',
    ],
    'repeat': [
        'Hey {name}! 🎉 You\'ve been with us for a while now. Buy 2 {category} items, get 1 FREE. Only for our loyal fam!',
        '{name}, as one of our valued customers, you get first access to our 48-hour members-only sale. Up to 30% off on {category}!',
        'Hi {name}! Your taste in {category} is 🔥. We have new arrivals that match your style perfectly. Plus 10% off as a loyalty bonus!',
    ],
    'reward': [
        '{name}, your loyalty has earned you VIP status! Enjoy early access to new {category} drops, 25% lifetime discount, and a surprise gift!',
        'Hey {name}! 💛 Just wanted to say THANK YOU. No catch — just a ₹500 gift card on your next order. Because you matter.',
        '{name}, you\'re in our top 10% of customers! 👑 Unlock exclusive perks: priority shipping, birthday surprises, and VIP-only {category} drops.',
    ],
    'promote': [
        '{name}, introducing our latest {category} collection — designed for those who lead, not follow. First 50 orders get free customization!',
        '👀 {name}, something BIG is here. Our new {category} line is unlike anything we\'ve done before. Early birds get 20% off!',
        '{name}, the wait is over! Our new {category} collection is LIVE. Limited stock, unlimited style. Shop before it\'s gone!',
    ],
    'default': [
        'Hi {name}! We handpicked these {category} recommendations just for you. Enjoy 10% off as our thanks! ✨',
        '{name}, hot deals on {category} — up to 25% off for the next 24 hours only. Don\'t sleep on this! 🔥',
        'Hey {name}! We curated a collection of {category} that matches your taste perfectly. Enjoy member pricing!',
    ],
}

CTAS = {
    'inactive': ['Claim My Discount →', 'Shop Before It\'s Gone', 'Welcome Back Deal →', 'Explore What\'s New'],
    'repeat': ['Grab My Deal 🛒', 'Unlock My Deals →', 'Shop The Sale', 'Buy Now, Thank Later'],
    'reward': ['Claim VIP Perks 👑', 'Redeem My Gift 🎁', 'Unlock My Rewards', 'See What I\'ve Earned'],
    'promote': ['Shop The Drop →', 'Get Early Access', 'See The Collection', 'Be First To Own This'],
    'default': ['See My Picks →', 'Shop Now →', 'Explore Collection →', 'Discover More'],
}


def _detect_goal_type(message):
    """Categorize user message into a goal type."""
    msg = message.lower()
    if any(w in msg for w in ['inactive', 'churn', 'lapsed', 'dormant', 'bring back', 'win back', 'haven\'t', 'not purchased', 'at-risk', 'at risk', 'lost']):
        return 'inactive'
    if any(w in msg for w in ['repeat', 'loyalty', 'retain', 'again', 'more', 'frequent', 'returning']):
        return 'repeat'
    if any(w in msg for w in ['reward', 'vip', 'top', 'best', 'loyal', 'thank', 'gift', 'premium', 'gold']):
        return 'reward'
    if any(w in msg for w in ['promote', 'new', 'launch', 'collection', 'summer', 'winter', 'seasonal', 'announce', 'drop']):
        return 'promote'
    return 'default'


def _get_customer_stats(user_id):
    """Get real stats from the database."""
    from app.models.customer import Customer
    customers = Customer.query.filter_by(user_id=user_id).all()
    if not customers:
        return {'total': 0, 'at_risk': 0, 'active': 0, 'avg_ltv': 0, 'top_category': 'products', 'vip_count': 0}

    categories = [c.favorite_category for c in customers if c.favorite_category]
    top_category = max(set(categories), key=categories.count) if categories else 'products'
    at_risk = sum(1 for c in customers if c.churn_risk in ('high', 'medium'))
    avg_ltv = sum(c.lifetime_value or 0 for c in customers) / len(customers)
    vip_count = sum(1 for c in customers if (c.lifetime_value or 0) > avg_ltv)

    return {
        'total': len(customers),
        'at_risk': at_risk,
        'active': len(customers) - at_risk,
        'avg_ltv': avg_ltv,
        'top_category': top_category,
        'vip_count': vip_count,
    }


@ai_bp.route('/command', methods=['POST'])
@jwt_required
def command():
    data = request.get_json()
    user_message = data.get('message', '')
    history = data.get('history', [])

    # Check for confirmation first
    confirm_words = ['yes', 'build', 'create', 'launch', 'do it', 'go ahead', "let's go", 'proceed', 'sure', 'ok', 'okay', 'yep', 'yeah', 'absolutely']
    is_confirm = any(w in user_message.lower().strip() for w in confirm_words)

    prev_suggested_campaign = False
    if history and len(history) >= 1:
        for h in reversed(history):
            if h.get('role') == 'assistant':
                last_ai = h.get('content', '')
                if 'want me to build' in last_ai.lower() or 'just say yes' in last_ai.lower() or 'say **yes**' in last_ai.lower():
                    prev_suggested_campaign = True
                break

    try:
        from app.services.groq_service import ai_command_response
        from app.services.memory_service import get_relevant_memories
        memories = get_relevant_memories(g.user_id, user_message, limit=3)
        memory_ctx = '\n'.join([m.to_summary() for m in memories])

        created_campaign = None
        if is_confirm and prev_suggested_campaign:
            created_campaign = _auto_create_campaign(g.user_id, history, user_message, memory_ctx, memories)
            if created_campaign:
                response = _build_success_response(created_campaign)
            else:
                response = ai_command_response(user_message, history, memory_ctx, g.user_id)
        else:
            response = ai_command_response(user_message, history, memory_ctx, g.user_id)

        return jsonify({
            'response': response,
            'memories_used': len(memories),
            'campaign_created': created_campaign,
        })

    except Exception:
        # Smart fallback — creative, varied responses
        stats = _get_customer_stats(g.user_id)
        created_campaign = None

        if is_confirm and prev_suggested_campaign:
            created_campaign = _auto_create_campaign(g.user_id, history, user_message, '', [])
            if created_campaign:
                response = _build_success_response(created_campaign)
                return jsonify({'response': response, 'memories_used': 0, 'campaign_created': created_campaign})

        # Generate creative response based on goal type
        goal_type = _detect_goal_type(user_message)
        templates = CREATIVE_RESPONSES.get(goal_type, CREATIVE_RESPONSES['default'])

        # Use message hash to pick a different template each time
        idx = int(hashlib.md5(user_message.encode()).hexdigest(), 16) % len(templates)
        response = templates[idx](stats)

        return jsonify({'response': response, 'memories_used': 0, 'campaign_created': None})


def _build_success_response(campaign):
    return (
        f"✅ **Campaign Created Successfully!**\n\n"
        f"🏷️ **Name:** {campaign.get('name', 'New Campaign')}\n"
        f"📨 **Channel:** {campaign.get('channel', 'email').upper()}\n"
        f"👥 **Target Audience:** {campaign.get('predicted_reach', 0)} customers\n"
        f"💰 **Predicted Revenue:** ₹{campaign.get('predicted_revenue', 0):,.0f}\n\n"
        f"Your campaign is saved as a **draft**. Click the campaign card below to review and **launch it**! 🚀"
    )


def _auto_create_campaign(user_id, history, user_message, memory_ctx, memories):
    """Extract goal from conversation history and create a real campaign."""
    from app.models.campaign import Campaign
    from app.models.segment import Segment
    from app.models.customer import Customer
    from app.services.segment_service import apply_filter_rules

    # Extract the goal from conversation history
    goal = ''
    for h in history:
        if h.get('role') == 'user' and h.get('content', '').lower().strip() not in ['yes', 'build', 'create', 'launch', 'do it', 'go ahead', 'sure', 'ok', 'okay', 'proceed', 'yep', 'yeah', 'absolutely']:
            goal = h['content']

    if not goal:
        goal = 'Engage customers and drive sales'

    goal_type = _detect_goal_type(goal)

    # Find the best matching segment
    segments = Segment.query.filter_by(user_id=user_id).all()
    segment = None
    if segments:
        # Match segment to goal type
        for s in segments:
            name_lower = s.name.lower()
            if goal_type == 'inactive' and any(w in name_lower for w in ['risk', 'churn', 'inactive']):
                segment = s
                break
            if goal_type == 'reward' and any(w in name_lower for w in ['vip', 'top', 'loyal', 'premium', 'gold']):
                segment = s
                break
            if goal_type == 'repeat' and any(w in name_lower for w in ['frequent', 'buyer', 'active', 'repeat']):
                segment = s
                break
        if not segment:
            segment = segments[0]
    else:
        all_customers = Customer.query.filter_by(user_id=user_id).all()
        segment = Segment(
            user_id=user_id, name='All Customers',
            description='All customers', filter_rules=[],
            customer_count=len(all_customers), is_ai_generated=True,
            ai_reasoning='Auto-created for AI campaign'
        )
        db.session.add(segment)
        db.session.commit()

    customers = apply_filter_rules(user_id, segment.filter_rules or [])
    customer_count = len(customers)
    stats = _get_customer_stats(user_id)

    # Try AI plan
    try:
        from app.services.groq_service import create_full_campaign_plan
        segment_stats = {
            'count': customer_count,
            'avg_ltv': sum(c.lifetime_value or 0 for c in customers) / max(customer_count, 1),
        }
        ai_plan = create_full_campaign_plan(goal, segment_stats, memory_ctx)
    except Exception:
        # Smart fallback with varied channels and creative messages
        channels = CHANNEL_MAP.get(goal_type, CHANNEL_MAP['default'])
        channel = random.choice(channels)
        names = CAMPAIGN_NAMES.get(goal_type, CAMPAIGN_NAMES['default'])
        subjects = SUBJECTS.get(goal_type, SUBJECTS['default'])
        messages = MESSAGES.get(goal_type, MESSAGES['default'])
        ctas = CTAS.get(goal_type, CTAS['default'])

        cat = stats['top_category']
        subject = random.choice(subjects).replace('{name}', '{name}')
        body = random.choice(messages).replace('{category}', cat)
        cta = random.choice(ctas)
        name = random.choice(names)

        open_rates = {'whatsapp': 0.82, 'email': 0.33, 'sms': 0.45, 'rcs': 0.55}
        ctrs = {'whatsapp': 0.45, 'email': 0.18, 'sms': 0.22, 'rcs': 0.30}

        ai_plan = {
            'campaign_name': name,
            'recommended_channel': channel,
            'channel_reasoning': f'{channel.title()} selected for {goal_type} campaigns — optimal for this audience.',
            'message_subject': subject,
            'message_body': body,
            'cta': cta,
            'predicted_open_rate': open_rates.get(channel, 0.35),
            'predicted_ctr': ctrs.get(channel, 0.2),
            'predicted_revenue': customer_count * random.randint(350, 650),
            'audience_reasoning': f'Targeting {customer_count} customers from "{segment.name}".',
            'memory_insight': 'Campaign crafted by PulseAI Command Center.',
        }

    campaign = Campaign(
        user_id=user_id,
        segment_id=segment.id,
        name=ai_plan.get('campaign_name', f'AI Campaign: {goal[:40]}'),
        goal=goal,
        channel=ai_plan.get('recommended_channel', 'email'),
        message_subject=ai_plan.get('message_subject', ''),
        message_body=ai_plan.get('message_body', ''),
        cta=ai_plan.get('cta', ''),
        ai_payload=ai_plan,
        memory_context=[m.to_summary() for m in memories] if memories else [],
        predicted_reach=customer_count,
        predicted_open_rate=ai_plan.get('predicted_open_rate', 0.3),
        predicted_revenue=ai_plan.get('predicted_revenue', 0),
        status='draft'
    )
    db.session.add(campaign)
    db.session.commit()
    return campaign.to_dict()
