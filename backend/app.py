# ==============================
# app.py (Flask backend)
# ==============================

from flask import Flask
import datetime
from flask import Flask, request, jsonify
from backend.firebase import addUser

from flask_cors import CORS
<<<<<<< HEAD
from dotenv import load_dotenv
from behavioral import run_test_loop

# --- UPDATED: New Google SDK ---
from google import genai
from google.genai import types

# Keep existing ElevenLabs imports
from elevenlabs import generate, set_api_key
import whisper

# 1. Load Environment Variables
load_dotenv()
=======
>>>>>>> parent of 1775e5e (THIS WORKS BRO)

# Initializing flask app
app = Flask(__name__)
CORS(app)

# Route for seeing a data
@app.route('/add_user', methods=['POST'])
def add_user():
    # Call addUser function in firebase.py
    return 1

    
# Running app
if __name__ == '__main__':
<<<<<<< HEAD
    # Run on port 5001
    app.run(host='0.0.0.0', port=5001, debug=True)
=======
    app.run(debug=True)
    
    
    # run app.py
>>>>>>> parent of 1775e5e (THIS WORKS BRO)
