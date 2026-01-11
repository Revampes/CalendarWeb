from flask import Flask, request, jsonify
import requests
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/canvas-events', methods=['POST'])
def canvas_events():
    data = request.json or {}
    base_url = data.get('baseUrl', '').rstrip('/')
    token = data.get('token', '')
    start_date = data.get('startDate')
    end_date = data.get('endDate')
    if not base_url or not token or not start_date or not end_date:
        return jsonify({'error': 'Missing required parameters'}), 400
    url = f"{base_url}/api/v1/calendar_events"
    params = {
        'start_date': start_date,
        'end_date': end_date,
        'per_page': '100',
        'include[]': 'assignment'
    }
    headers = {
        'Authorization': f'Bearer {token}'
    }
    try:
        resp = requests.get(url, headers=headers, params=params)
        resp.raise_for_status()
        return jsonify(resp.json())
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)
