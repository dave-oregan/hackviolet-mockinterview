import os
from fastapi import FastAPI, HTTPException, Depends, Header
from pydantic import BaseModel
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, auth, firestore
from datetime import datetime, timezone

load_dotenv()

# ------------------ Firebase Init ------------------
if not firebase_admin._apps:
    cred = credentials.Certificate({
        "type": "service_account",
        "project_id": os.getenv("FB_PROJECT_ID"),
        "client_email": os.getenv("FB_CLIENT_EMAIL"),
        "private_key": os.getenv("FB_PRIVATE_KEY").replace("\\n", "\n"),
        "token_uri": os.getenv("FB_TOKEN_URI"),
    })
    firebase_admin.initialize_app(cred)

db = firestore.client()

app = FastAPI()

class SignupRequest(BaseModel):
    name: str
    email: str
    password: str
    school: str | None = None
    major: str | None = None
    age: int | None = None
    resume: list = []

class InterviewRequest(BaseModel):
    company_name: str
    role_targetted: str
    report: dict

def verify_firebase_token(authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid auth header")

    token = authorization.split(" ")[1]

    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token["uid"]
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

@app.post("/signup")
def signup_user(data: SignupRequest):
    try:
        # Create Firebase Auth user
        user = auth.create_user(
            email=data.email,
            password=data.password,
            display_name=data.name
        )

        uid = user.uid

        # Create Firestore profile
        user_doc = {
            "personal_info": {
                "name": data.name,
                "email": data.email,
                "school": data.school,
                "major": data.major,
                "age": data.age,
                "resume": data.resume,
            },
            "history": [],
            "created_at": datetime.now(timezone.utc)
        }

        db.collection("accounts").document(uid).set(user_doc)

        return {"success": True, "uid": uid}

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/me")
def get_my_profile(uid: str = Depends(verify_firebase_token)):
    doc = db.collection("accounts").document(uid).get()

    if not doc.exists:
        raise HTTPException(status_code=404, detail="User profile not found")

    return doc.to_dict()

@app.post("/interview")
def add_interview(
    data: InterviewRequest,
    uid: str = Depends(verify_firebase_token)
):
    interview = {
        "interview_id": str(datetime.now().timestamp()),
        "company_name": data.company_name,
        "role_targetted": data.role_targetted,
        "report": data.report,
        "timestamp": datetime.now(timezone.utc),
    }

    db.collection("accounts").document(uid).update({
        "history": firestore.ArrayUnion([interview])
    })

    return {"success": True}
