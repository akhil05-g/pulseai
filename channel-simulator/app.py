from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import threading, time, random, requests, os

load_dotenv()

app = Flask(__name__)
CORS(app)

CRM_CALLBACK_URL = os.getenv('CRM_URL', 'http://localhost:5000') + '/api/webhooks/callback'

CHANNEL_PROFILES = {
    'whatsapp': {'delivered': 0.95, 'opened': 0.82, 'clicked': 0.45, 'purchased': 0.20},
    'email':    {'delivered': 0.90, 'opened': 0.33, 'clicked': 0.18, 'purchased': 0.08},
    'sms':      {'delivered': 0.92, 'opened': 0.45, 'clicked': 0.22, 'purchased': 0.10},
    'rcs':      {'delivered': 0.88, 'opened': 0.55, 'clicked': 0.30, 'purchased': 0.14},
}

def simulate_one(message_id, customer_id, channel):
    profile = CHANNEL_PROFILES.get(channel, CHANNEL_PROFILES['email'])
    events = [
        ('delivered', profile['delivered'], 2),
        ('opened',    profile['opened'],    5),
        ('clicked',   profile['clicked'],   9),
        ('purchased', profile['purchased'], 15),
    ]
    for event, prob, delay in events:
        time.sleep(delay + random.uniform(0, 3))
        if random.random() < prob:
            try:
                requests.post(CRM_CALLBACK_URL, json={
                    'message_id': message_id,
                    'customer_id': customer_id,
                    'event': event,
                    'revenue': round(random.uniform(800, 5000), 2) if event == 'purchased' else 0
                }, timeout=5)
            except Exception as e:
                print(f'Callback failed: {e}')
        else:
            break

@app.route('/simulate/send', methods=['POST'])
def simulate_send():
    data = request.get_json()
    for msg in data.get('messages', []):
        t = threading.Thread(
            target=simulate_one,
            args=(msg['message_id'], msg['customer_id'], msg['channel']),
            daemon=True
        )
        t.start()
    return jsonify({'status': 'simulation_started', 'count': len(data['messages'])}), 200

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'service': 'channel-simulator'})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=False)
