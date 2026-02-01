import google.generativeai as genai
import time
import json

# 1. Setup your API Key
genai.configure(api_key="AIzaSyD_3ZqPlweHfBMtB_woGdMO1T4oY0zc00k")

# 2. Path to your file

def analyze_interview_video(video_path):
  print(f"Uploading file...")
  video_file = genai.upload_file(path=video_path)
  print(f"Completed upload: {video_file.uri}")

  while video_file.state.name == "PROCESSING":
    print('.', end='', flush=True)
    time.sleep(5)
    video_file = genai.get_file(video_file.name)
    
  prompt = """You are an expert Interview Behavioral Analyst.
Your task is to audit the provided video and return ONLY a JSON object.

For every issue or positive behavior identified, provide a specific timestamp (e.g., "0:05").

### SECTION 1: GAZE & EYE CONTACT
- Assess camera focus vs. looking away.

### SECTION 2: BODY POSTURE
- Analyze sitting posture and frame alignment.

### SECTION 3: DISTRACTIONS
- Identify fidgeting or repetitive gestures.

Return the result in this exact JSON structure:
{
  "video_analysis": {
      "score": int,
      "categories": {
        "gaze_stability": {
          "score": int, 
          "feedback": "string",
          "flags": [{"timestamp": "string", "event": "string"}]
        },
        "posture_professionalism": {
          "score": int, 
          "feedback": "string",
          "flags": [{"timestamp": "string", "event": "string"}]
        },
        "fidget_detection": {
          "score": int, 
          "feedback": "string",
          "flags": [{"timestamp": "string", "event": "string"}]
        }
      }
  }
}"""
  model = genai.GenerativeModel(
    model_name="gemini-3-flash-preview", 
    system_instruction=prompt, 
    generation_config={"response_mime_type": "application/json"})
  print("\nAnalyzing video...")

  response = model.generate_content([
    video_file,
    "Please analyze this interview according to your instructions"    
  ])

  return json.loads(response.text)