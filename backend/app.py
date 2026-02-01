import os
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"
import base64
import tempfile
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

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

if not GOOGLE_API_KEY:
    print("❌ WARNING: GOOGLE_API_KEY not found in .env", flush=True)
if not ELEVENLABS_API_KEY:
    print("❌ WARNING: ELEVENLABS_API_KEY not found in .env", flush=True)

# 3. Initialize APIs
# --- UPDATED: New Client Initialization ---
client = genai.Client(api_key=GOOGLE_API_KEY)
set_api_key(ELEVENLABS_API_KEY)

# 4. Load Whisper Model
print("⏳ Loading Whisper model... (this may take a moment)", flush=True)
try:
    whisper_model = whisper.load_model("base")
    print("✅ Whisper model loaded successfully!", flush=True)
except Exception as e:
    print(f"❌ Error loading Whisper: {e}", flush=True)
    print("Make sure FFmpeg is installed and added to your PATH.", flush=True)

# 5. Define Persona
GOLDMAN_SACHS_PERSONA = """
You are "Marcus," a Senior Vice President in Technology at Goldman Sachs. 
Your goal is to conduct a technical interview for a Software Engineering Intern candidate.

Tone: Intellectual, rigorous, and professional. You do not make small talk.
Style: Concise. Keep your responses under 2-3 sentences to keep the conversation flowing naturally.
Focus: Java, Object-Oriented Design, and Scalability.

Start by asking the candidate to introduce themselves.
"""

# --- UPDATED: Chat Session Management ---
# The new SDK creates chats via the client. 
# We initialize a global session here.
def create_chat_session():
    return client.chats.create(
        model="gemini-2.0-flash", # Updated to faster/newer model
        config=types.GenerateContentConfig(
            system_instruction=GOLDMAN_SACHS_PERSONA,
            temperature=0.7
        )
    )

chat_session = create_chat_session()


# --- ROUTES ---

@app.route('/api/process-audio', methods=['POST'])
def process_audio():
    try:
        # Step A: Validate Input
        if 'audio' not in request.files:
            return jsonify({"error": "No audio file provided"}), 400
            
        audio_file = request.files['audio']
        
        # Step B: Save Temp File for Whisper
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as temp_audio:
            audio_file.save(temp_audio.name)
            temp_path = temp_audio.name

        # Step C: Transcribe with Whisper
        print("🎤 Transcribing audio...", flush=True) # Added flush=True
        result = whisper_model.transcribe(temp_path)
        user_text = result["text"]
        
        # This is the line that was missing output before:
        print(f"🗣️ User said: {user_text}", flush=True) 

        # Cleanup temp file
        os.remove(temp_path)

        if not user_text.strip():
            return jsonify({"error": "No speech detected"}), 400

        # Step D: Get AI Reply (Text) using New SDK
        # The new SDK uses .send_message just like the old one, but strictly text-to-text here
        response = chat_session.send_message(user_text)
        ai_text = response.text
        
        print(f"🤖 Marcus replied: {ai_text}", flush=True)

        # Step E: Generate AI Audio (ElevenLabs)
        audio_bytes = generate(
            text=ai_text,
            voice="4e32WqNVWRquDa1OcRYZ", 
            model="eleven_monolingual_v1"
        )
        
        audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')

        return jsonify({
            "user_transcription": user_text,
            "ai_response": ai_text,
            "audio": audio_base64
        })

    except Exception as e:
        print(f"❌ Error processing audio: {e}", flush=True)
        return jsonify({"error": str(e)}), 500


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