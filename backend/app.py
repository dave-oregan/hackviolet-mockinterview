import os
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"
import base64
import tempfile
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from behavioral import MockInterviewCore, run_loop

# --- UPDATED: New Google SDK ---
from google import genai
from google.genai import types

# Keep existing ElevenLabs imports
from elevenlabs import generate, set_api_key
import whisper

# 1. Load Environment Variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Allow React frontend to access this API

# 2. Configuration Checks
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")

# 3. Initialize APIs
# Set up whisper client
set_api_key(ELEVENLABS_API_KEY)

# 4. Load Whisper Model
print("⏳ Loading Whisper model... (this may take a moment)", flush=True)
try:
    whisper_model = whisper.load_model("base")
    print("✅ Whisper model loaded successfully!", flush=True)
except Exception as e:
    print(f"❌ Error loading Whisper: {e}", flush=True)

current_interview =  MockInterviewCore('liamm24@vt.edu',company_name="google", 
        interview_level="Medium",
        interview_type="behavioral")
sessions = {}


# --- ROUTES ---

@app.route('/api/process-audio', methods=['POST'])
def process_audio():
   # A. Get the stuff React sent
    audio_file = request.files['audio']
    last_q = request.form.get('question') # 'Question being asked'

    # B. Whisper: Speech -> Text
    with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp:
        audio_file.save(tmp.name)
        user_text = whisper_model.transcribe(tmp.name)["text"]
    os.remove(tmp.name)

    # C. Logic: Process the answer and get the NEXT question
    # This does the heavy lifting: Feedback + Gemini
    next_q = current_interview.process_turn(user_text, last_q)

    # D. ElevenLabs: Text -> Speech
    audio_bytes = generate(text=next_q, voice="4e32WqNVWRquDa1OcRYZ")
    audio_64 = base64.b64encode(audio_bytes).decode('utf-8')

    # E. Send it back to the UI
    return jsonify({
        "ai_response": next_q,
        "audio": audio_64
    })
@app.route('/api/chat', methods=['POST'])
def chat_text_only():
    data = request.json
    user_message = data.get('message')
    
    if not user_message:
        return jsonify({"error": "No message provided"}), 400

    try:
        # Get AI Response
        response = chat_session.send_message(user_message)
        ai_text = response.text
        print(f"🤖 Marcus replied (Text Mode): {ai_text}", flush=True)

        # Generate Audio
        audio_bytes = generate(
            text=ai_text,
            voice="4e32WqNVWRquDa1OcRYZ", 
            model="eleven_monolingual_v1"
        )
        audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')

        return jsonify({
            "reply": ai_text,
            "audio": audio_base64
        })

    except Exception as e:
        print(f"Error: {e}", flush=True)
        return jsonify({"error": str(e)}), 500


@app.route('/api/reset', methods=['POST'])
def reset_interview():
    """
    Resets the interview context/history.
    """
    global chat_session
    print("🔄 Resetting Interview Session...", flush=True)
    chat_session = create_chat_session()
    
    # Get an initial greeting to restart the conversation
    greeting = chat_session.send_message("The interview is starting. Briefly introduce yourself.")
    
    return jsonify({"message": "Interview reset", "greeting": greeting.text})


if __name__ == '__main__':
    # Run on port 5001
    app.run(host='0.0.0.0', port=5001, debug=True)