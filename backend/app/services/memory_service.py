from app.models.memory import CampaignMemory
from app import db

def get_relevant_memories(user_id, goal_text, limit=3):
    all_memories = CampaignMemory.query.filter_by(user_id=user_id)\
        .order_by(CampaignMemory.created_at.desc()).limit(20).all()

    goal_words = set(goal_text.lower().split())
    scored = []
    for m in all_memories:
        if m.goal_keywords:
            overlap = len(goal_words & set(m.goal_keywords))
            scored.append((m, overlap))
        else:
            scored.append((m, 0))

    scored.sort(key=lambda x: x[1], reverse=True)
    return [m for m, _ in scored[:limit]]

def save_memory_after_campaign(campaign, message_stats, ai_reflection):
    goal_keywords = (campaign.goal or '').lower().split()[:10]
    memory = CampaignMemory(
        user_id=campaign.user_id,
        campaign_id=campaign.id,
        audience_type=guess_audience_type(campaign.goal or ''),
        channel=campaign.channel,
        goal_keywords=goal_keywords,
        reach=message_stats.get('total', 0),
        delivery_rate=message_stats.get('delivery_rate', 0),
        open_rate=message_stats.get('open_rate', 0),
        ctr=message_stats.get('ctr', 0),
        conversion_rate=message_stats.get('conversion_rate', 0),
        revenue=message_stats.get('revenue', 0),
        what_worked=ai_reflection.get('what_worked', ''),
        what_failed=ai_reflection.get('what_failed', ''),
        recommendations='; '.join(ai_reflection.get('recommendations', []))
    )
    db.session.add(memory)
    db.session.commit()
    return memory

def guess_audience_type(goal_text):
    goal = goal_text.lower()
    if any(w in goal for w in ['inactive', 'churn', 'back', 'win']): return 'inactive'
    if any(w in goal for w in ['loyal', 'vip', 'reward', 'top']): return 'vip'
    if any(w in goal for w in ['new', 'welcome', 'onboard']): return 'new'
    if any(w in goal for w in ['high', 'premium', 'spend']): return 'high_spender'
    return 'general'
