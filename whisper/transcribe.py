import sys
import whisper
import json
import os

audio_path = sys.argv[1]

model = whisper.load_model("base")  # change if you want
result = model.transcribe(audio_path)

print(json.dumps({
    "text": result["text"]
}))
