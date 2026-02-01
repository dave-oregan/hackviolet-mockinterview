import os
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"

import base64
import tempfile
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

from behavioral import MockInterviewCore
from elevenlabs import generate, set_api_key
import whisper

# -----------------------
# Setup
# -----------------------

load_dotenv()

app = Flask(__name__)

CORS(
    app,
    resources={r"/api/*": {"origins": ["http://localhost:3000"]}},
)

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")

set_api_key(ELEVENLABS_API_KEY)

print("⏳ Loading Whisper model...", flush=True)
whisper_model = whisper.load_model("base")
print("✅ Whisper loaded", flush=True)

current_interview = MockInterviewCore(
    "liamm24@vt.edu",
    company_name="google",
    interview_level="Medium",
    interview_type="behavioral"
)

# -----------------------
# Routes
# -----------------------

@app.route("/api/process-audio", methods=["POST"])
def process_audio():
    try:
        # --- Get inputs ---
        audio_file = request.files.get("audio")
        last_q = request.form.get("question", "")

        if not audio_file:
            return jsonify({"error": "No audio received"}), 400

        # --- Save audio temporarily ---
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp:
            audio_file.save(tmp.name)
            tmp_path = tmp.name

        # --- Whisper STT ---
        result = whisper_model.transcribe(tmp_path)
        user_text = result["text"].strip()
        os.remove(tmp_path)

        print("🗣️ User said:", user_text, flush=True)
        print("❓ Last question:", last_q, flush=True)

        # --- Interview logic ---
        next_q = current_interview.process_turn(user_text, last_q)

        # --- ElevenLabs TTS ---
        audio_bytes = generate(
            text=next_q,
            voice="4e32WqNVWRquDa1OcRYZ",
            model="eleven_monolingual_v1"
        )

        audio_64 = base64.b64encode(audio_bytes).decode("utf-8")

        return jsonify({
            "user_transcription": user_text,
            "ai_response": next_q,
            "audio": audio_64
        })

    except Exception as e:
        print("❌ ERROR:", str(e), flush=True)
        return jsonify({"error": str(e)}), 500


@app.route("/api/chat", methods=["POST"])
def chat_text_only():
    try:
        data = request.json
        user_message = data.get("message")

        if not user_message:
            return jsonify({"error": "No message"}), 400

        ai_text = current_interview.process_turn(user_message, "")

        audio_bytes = generate(
            text=ai_text,
            voice="4e32WqNVWRquDa1OcRYZ",
            model="eleven_monolingual_v1"
        )

        audio_base64 = base64.b64encode(audio_bytes).decode("utf-8")

        return jsonify({
            "reply": ai_text,
            "audio": audio_base64
        })

    except Exception as e:
        print("❌ ERROR:", str(e), flush=True)
        return jsonify({"error": str(e)}), 500


@app.route("/api/reset", methods=["POST"])
def reset_interview():
    global current_interview
    print("🔄 Resetting interview", flush=True)

    current_interview = MockInterviewCore(
        "liamm24@vt.edu",
        company_name="google",
        interview_level="Medium",
        interview_type="behavioral"
    )

    greeting = "Welcome. Let’s begin the behavioral interview. Tell me about yourself."

    return jsonify({"greeting": greeting})


# -----------------------
# Run
# -----------------------

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
