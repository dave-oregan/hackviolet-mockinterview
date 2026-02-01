import sys
import whisper
import json
import os

# Helper function for safe debugging
def debug_log(message):
    print(f"DEBUG: {message}", file=sys.stderr)

try:
    debug_log("Python script started.")
    
    # Check if arguments exist
    if len(sys.argv) < 2:
        raise Exception("No audio file path provided to Python script")

    audio_path = sys.argv[1]
    debug_log(f"Received audio path: {audio_path}")

    # Verify file exists
    if not os.path.exists(audio_path):
        raise Exception(f"File not found at {audio_path}")

    debug_log("Loading Whisper model (this might take a moment)...")
    # You can change "base" to "tiny" for faster testing
    model = whisper.load_model("base") 

    debug_log("Transcribing...")
    result = model.transcribe(audio_path)
    
    debug_log("Transcription complete. Preparing JSON.")
    
    # ONLY this print statement goes to stdout for Node to read
    print(json.dumps({"text": result["text"]}))

except Exception as e:
    # Print the actual error object to stderr so Node sees it in console
    debug_log(f"CRITICAL ERROR: {str(e)}")
    # Return a JSON error to Node just in case
    print(json.dumps({"error": str(e)}))
    sys.exit(1)