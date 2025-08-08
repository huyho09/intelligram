# intelligram/backend/main.py
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from gpt4o_service import get_gpt4o_response
from plantuml_converter import convert_plantuml_to_png
import uuid
import os
import sqlite3
import bcrypt

# Initialize Flask App
app = Flask(__name__)
# Allow requests from your Angular app's origin
CORS(app)

# Database Setup
DB_PATH = os.path.join(os.path.dirname(__file__), 'user_data.db')

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# --- User Authentication Endpoints ---
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    username, password = data.get('username'), data.get('password')
    if not username or not password:
        return jsonify({'error': 'Username and password are required.'}), 400
    
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    try:
        with get_db_connection() as conn:
            conn.execute("INSERT INTO users (username, password) VALUES (?, ?)", (username, hashed_password))
            conn.commit()
        return jsonify({'message': 'User registered successfully.'}), 201
    except sqlite3.IntegrityError:
        return jsonify({'error': 'Username already exists.'}), 409

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username, password = data.get('username'), data.get('password')
    if not username or not password:
        return jsonify({'error': 'Username and password are required.'}), 400

    with get_db_connection() as conn:
        user = conn.execute("SELECT * FROM users WHERE username = ?", (username,)).fetchone()
    
    if user and bcrypt.checkpw(password.encode('utf-8'), user['password']):
        # In a real app, you would return a JWT token here
        return jsonify({
            'message': 'Login successful.', 
            'userId': user['id'], 
            'username': user['username']
        }), 200
    else:
        return jsonify({'error': 'Invalid username or password.'}), 401

# --- History Endpoint ---
@app.route('/api/history/chat/<int:user_id>', methods=['GET'])
def get_chat_history(user_id):
    """Fetches the 5 latest interactions (10 rows: 5 user, 5 model)."""
    with get_db_connection() as conn:
        history = conn.execute(
            "SELECT role, content FROM chat_history WHERE user_id = ? ORDER BY timestamp DESC LIMIT 10", (user_id,)
        ).fetchall()
    # Reverse to show in chronological order
    return jsonify([dict(row) for row in reversed(history)])

# --- Core Application Endpoint (Modified) ---
@app.route('/api/generate_diagram', methods=['POST'])
def generate_diagram():
    data = request.get_json()
    user_story, user_id = data.get('user_story'), data.get('user_id')
    if not all([user_story, user_id]):
        return jsonify({"error": "User story and user ID are required"}), 400

    try:
        plantuml_code = get_gpt4o_response(user_story)
        if "```plantuml" in plantuml_code:
            plantuml_code = plantuml_code.split("```plantuml\n")[1].split("```")[0]

        unique_id = uuid.uuid4()
        output_dir = os.path.join(os.path.dirname(__file__), 'results')
        os.makedirs(output_dir, exist_ok=True)
        diagram_filename = f"diagram_{unique_id}.png"
        diagram_path = os.path.join(output_dir, diagram_filename)
        
        convert_plantuml_to_png(plantuml_code, diagram_path)

        with get_db_connection() as conn:
            conn.execute("INSERT INTO chat_history (user_id, role, content) VALUES (?, ?, ?)", (user_id, 'user', user_story))
            conn.execute("INSERT INTO chat_history (user_id, role, content) VALUES (?, ?, ?)", (user_id, 'model', plantuml_code))
            conn.execute("INSERT INTO uml_diagram_history (user_id, puml_code, diagram_path) VALUES (?, ?, ?)", (user_id, plantuml_code, diagram_path))
            conn.commit()

        # Return a relative path for the frontend to use
        return jsonify({"diagram_url": f"/results/{diagram_filename}", "plantuml_code": plantuml_code})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/results/<filename>')
def get_diagram(filename):
    return send_from_directory('results', filename)

# --- Main Execution ---
if __name__ == '__main__':
    from database import init_db
    init_db()  # Ensures the database is ready on startup
    app.run(debug=True, port=5001)