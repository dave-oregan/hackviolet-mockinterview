import os
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"

import base64
import tempfile
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

from behavioral import MockInterviewCore
from video_analysis import analyze_interview_video

from elevenlabs import generate, set_api_key
import whisper
current_interview = None

# -----------------------
# Setup
# -----------------------


app = Flask(__name__)

CORS(
    app,
    resources={r"/api/*": {"origins": ["http://localhost:3000"]}},
)
#GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")

set_api_key(ELEVENLABS_API_KEY)

print("⏳ Loading Whisper model...", flush=True)
whisper_model = whisper.load_model("base")
print("✅ Whisper loaded", flush=True)

# -----------------------
# Routes
# -----------------------
@app.route("/api/reset", methods=["POST"])
def start():
    global current_interview
    user_uuid = "an649NxxwZPpTe2AOSX7n9H1keB2"

    current_interview = MockInterviewCore(
        uuid = user_uuid,
        user_email="liamm24@vt.edu",
        company_name="google",
        interview_level="Medium",
        interview_type="behavioral"
    )

# Opener is always this. 
    name = current_interview.personal_info.get('fullName')
    first_q = f"Hi {name}, thanks for joining us today. To start, can you tell me a bit about your background and what interests you about {current_interview.company_name}?"
# Generate audio    
    try:
        audio_bytes = generate(
            text=first_q,
            voice="4e32WqNVWRquDa1OcRYZ",
            model="eleven_monolingual_v1"
        )
        audio_64 = base64.b64encode(audio_bytes).decode("utf-8")
    except Exception as e:
        print(f"ElevenLabs Error: {e}")
        audio_64 = ""

    return jsonify({
        "ai_response": first_q,
        "audio": audio_64
    })
    
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
        print(f"Next question {next_q}")

        # --- ElevenLabs TTS ---
        audio_bytes = generate(   # Generate text
            text=next_q,
            voice="4e32WqNVWRquDa1OcRYZ",
            model="eleven_monolingual_v1"
        )

        audio_64 = base64.b64encode(audio_bytes).decode("utf-8")

        # Send next question audio 
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
@app.route("/api/finalize", methods=["POST"])
def finalize_interview():
    try:
        # 1. Get the video file from frontend
        video_file = request.files.get("video")
        if not video_file:
            return jsonify({"error": "No video recording found"}), 400

        # 2. Save it to a temp file for Gemini to process
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as tmp:
            video_file.save(tmp.name)
            temp_video_path = tmp.name
            
        print('starting final analysis')
        
        # 3. Trigger Audio Analysis
        audio_report = current_interview.generate_audio_feedback()
        print(f"Audio report: {audio_report}")

        # 4. Trigger Video Analysis
        video_report = analyze_interview_video(temp_video_path)
        print(f"Video report: {video_report}")
        
        # 5. Final Synthesis
        overall = current_interview.generate_final_synthesis(
            audio_report, 
            video_report
        )
        print(f"Overall: {overall}")

        # 6. Combine all reports into one master dict
        master_report = {
            **audio_report,      # Spreads audio_analysis into the dict
            "video_analysis": video_report,  # Adds video_analysis
            **overall            # Spreads overall_analysis into the dict
        }
        
        print(f"Master report: {master_report}")

        # 7. Clean up the disk
        os.remove(temp_video_path)

        return jsonify(master_report)

    except Exception as e:
        print("❌ FINALIZATION ERROR:", str(e), flush=True)
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
# -----------------------
# Run
# -----------------------

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=3001, debug=True)
