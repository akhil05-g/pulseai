import json
import os

try:
    from groq import Groq
    client = Groq(api_key=os.getenv('GROQ_API_KEY', ''))
except Exception:
    client = None


def ai_command_response(message, history, memory_ctx, user_id):
    if not client:
        raise Exception('Groq client not configured')

    system = f"""You are PulseAI, an expert AI marketing strategist for a DTC brand.
You help brand owners create campaigns, find audiences, and grow revenue.
You are direct, data-driven, and action-oriented. No fluff.

Your memory of past campaigns:
{memory_ctx or "No past campaigns yet."}

When user gives a marketing goal, suggest:
1. Which audience to target (and why)
2. Best channel (WhatsApp/Email/SMS) with reasoning from past data
3. Campaign message concept
4. Expected outcome
Always end with: "Want me to build this campaign? Just say yes."
"""
    messages = [{"role": "system", "content": system}]
    for h in (history or [])[-6:]:
        messages.append({"role": h['role'], "content": h['content']})
    messages.append({"role": "user", "content": message})

    resp = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=messages,
        max_tokens=600
    )
    return resp.choices[0].message.content


def create_full_campaign_plan(goal, segment_stats, memory_ctx):
    if not client:
        raise Exception('Groq client not configured')

    prompt = f"""You are a marketing AI. Create a complete campaign plan.

Goal: {goal}
Audience stats: {json.dumps(segment_stats)}
Past campaign memory:
{memory_ctx or "No past campaigns."}

Return ONLY valid JSON:
{{
  "campaign_name": "...",
  "recommended_channel": "whatsapp|email|sms",
  "channel_reasoning": "...",
  "message_subject": "...",
  "message_body": "Hi {{name}}, ...",
  "cta": "...",
  "predicted_open_rate": 0.82,
  "predicted_ctr": 0.35,
  "predicted_revenue": 45000,
  "audience_reasoning": "...",
  "memory_insight": "..."
}}"""

    resp = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
        max_tokens=800
    )
    return json.loads(resp.choices[0].message.content)


def nl_to_segment(user_id, query):
    if not client:
        raise Exception('Groq client not configured')

    prompt = f"""Convert this natural language into customer filter rules.

Query: "{query}"

Available fields: lifetime_value (float), total_orders (int),
days_since_purchase (int), churn_risk (low|medium|high), city (string)
Available ops: gt, lt, eq, gte, lte

Return ONLY valid JSON:
{{
  "segment_name": "...",
  "reasoning": "...",
  "filter_rules": [
    {{"field": "days_since_purchase", "op": "gt", "value": 60}},
    {{"field": "lifetime_value", "op": "gt", "value": 3000}}
  ]
}}"""

    resp = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"}
    )
    return json.loads(resp.choices[0].message.content)


def generate_reflection_report(campaign_data, message_stats):
    if not client:
        raise Exception('Groq client not configured')

    prompt = f"""Analyze this completed marketing campaign and generate insights.

Campaign: {json.dumps(campaign_data)}
Performance: {json.dumps(message_stats)}

Return ONLY valid JSON:
{{
  "what_worked": "...",
  "what_failed": "...",
  "key_insight": "...",
  "recommendations": ["...", "...", "..."],
  "next_best_actions": [
    {{"action": "...", "reason": "...", "urgency": "high|medium|low"}}
  ]
}}"""

    resp = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"}
    )
    return json.loads(resp.choices[0].message.content)


def generate_ai_profile(customer):
    if not client:
        return None

    prompt = f"""Generate a brief marketing profile for this customer:
Name: {customer.name}, City: {customer.city}, LTV: {customer.lifetime_value},
Orders: {customer.total_orders}, Churn Risk: {customer.churn_risk},
Channel: {customer.preferred_channel}, Category: {customer.favorite_category}

Return JSON with: summary, engagement_score (0-100), recommended_action"""

    try:
        resp = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            max_tokens=300
        )
        return json.loads(resp.choices[0].message.content)
    except Exception:
        return None
