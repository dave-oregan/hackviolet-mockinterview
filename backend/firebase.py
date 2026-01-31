import os
import firebase_admin
from firebase_admin import credentials, firestore, initialize_app, storage
from dotenv import load_dotenv
import datetime
from datetime import datetime, timezone
import uuid

load_dotenv()

# Initialize only once
# Initialize Firebase
if not firebase_admin._apps:
    cred = credentials.Certificate({
        "project_id": os.getenv("FB_PROJECT_ID"),
        "client_email": os.getenv("FB_CLIENT_EMAIL"),
        "private_key": os.getenv("FB_PRIVATE_KEY").replace('\\n', '\n'),
        "type": "service_account",
        "token_uri": os.getenv("FB_TOKEN_URI"),
    })
    firebase_admin.initialize_app(cred)

db = firestore.client()
print('success')


def add_user(name, user_email, password, school, major, age, resume ):
    # These now come from the function arguments (sent by React)
    user_data = {
        "personal_info": {
            "name": name,
            "email": user_email,
            "password": password,
            "school": school,
            "major": major,
            "age": age,
            "resume": resume
        },
        "password": password, # Reminder: Hash this for real projects!
        "history": [], 
    }
    # .set() will create the user if they don't exist, or overwrite them if they do
    db.collection('accounts').document(user_email).set(user_data)
    print(f"User {user_email} registered in 'accounts' collection")
    return True



def add_interview(user_email, company_name, role_targetted, interview_id, report):
    """
    Adds a new interview to the users history
    """
    interview = {
        "interview_id": interview_id,
        "company_name":company_name,
        "role_targetted":role_targetted,
        "report":report,
        "timestamp": datetime.now(timezone.utc)
    }
    try:
        user_ref = db.collection('accounts').document(user_email)
        user_ref.update({
            "history": firestore.ArrayUnion([interview])  # Update the history
            })
        
        print(f"Interview {interview_id} added for {user_email}")
        return True
    except Exception as e:
        print(f"Error adding interview: {e}")
        return False
         

if __name__ == "__main__":
    add_user('Liam', 'liamm24@vt.edu', '123','Virginia Tech','Data Science', '20', [])
    
    test_report = {
        "score":"80",
        "feedback":"Great communication and movement of hands"
    }
    add_interview('liamm24@vt.edu', 'Google', 'Software Engineer', '1', test_report)
    
    




