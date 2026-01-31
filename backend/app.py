# ==============================
# app.py (Flask backend)
# ==============================

from flask import Flask
import datetime
from flask import Flask, request, jsonify
from firebase import addUser

from flask_cors import CORS

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
    app.run(debug=True)
    
    
    # run app.py