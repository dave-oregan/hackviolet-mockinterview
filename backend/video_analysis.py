import google.generativeai as genai
import time
import os
import json

def analyze_interview_video(video_file_path):
    """
    Analyzes an interview video and returns behavioral feedback as JSON.
    
    Args:
        video_file_path: Path to the video file to analyze
        
    Returns:
        dict: Video analysis results with scores and feedback
    """
    
    try:
        # 1. Setup API Key from environment variable
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise ValueError("GOOGLE_API_KEY not found in environment variables")
        
        genai.configure(api_key=api_key)
        
        # 2. Upload the video file
        print(f"Uploading file: {video_file_path}...")
        print(f"File size: {os.path.getsize(video_file_path) / (1024*1024):.2f} MB")
        
        video_file = genai.upload_file(path=video_file_path)
        print(f"Completed upload: {video_file.uri}")
        print(f"Initial state: {video_file.state.name}")
        
        # 3. Wait for processing to complete
        print("Waiting for video processing...")
        max_wait_time = 300  # 5 minutes max
        wait_interval = 10
        elapsed = 0
        
        while video_file.state.name == "PROCESSING":
            print('.', end='', flush=True)
            time.sleep(wait_interval)
            elapsed += wait_interval
            
            if elapsed > max_wait_time:
                raise TimeoutError(f"Video processing took longer than {max_wait_time} seconds")
            
            video_file = genai.get_file(video_file.name)
        
        print()  # New line after dots
        print(f"Final state: {video_file.state.name}")
        
        # Check if processing succeeded
        if video_file.state.name == "FAILED":
            # Get more details about the failure
            print(f"❌ Processing failed. File details: {video_file}")
            raise ValueError(f"Video processing failed. State: {video_file.state}")
        
        if video_file.state.name != "ACTIVE":
            raise ValueError(f"Video is in {video_file.state.name} state, expected ACTIVE")
        
        print(f"✅ Video is ready! State: {video_file.state.name}")
        
        # 4. Define the analysis prompt
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
}"""
        
        # 5. Create model and generate analysis
        model = genai.GenerativeModel(
            model_name="gemini-1.5-flash",
            generation_config={"response_mime_type": "application/json"}
        )
        
        print("Analyzing video...")
        response = model.generate_content([
            video_file,
            prompt
        ])
        
        # 6. Parse and return the JSON response
        result = json.loads(response.text)
        print("✅ Video analysis complete!")
        
        return result
        
    except Exception as e:
        print(f"❌ Video analysis error: {str(e)}")
        print(f"Error type: {type(e).__name__}")
        import traceback
        traceback.print_exc()
        
        # Return a fallback mock report so the interview can still complete
        print("⚠️ Returning fallback video report")
        return {
            "score": 75,
            "categories": {
                "gaze_stability": {
                    "score": 75,
                    "feedback": "Video analysis temporarily unavailable",
                    "flags": []
                },
                "posture_professionalism": {
                    "score": 75,
                    "feedback": "Video analysis temporarily unavailable",
                    "flags": []
                },
                "fidget_detection": {
                    "score": 75,
                    "feedback": "Video analysis temporarily unavailable",
                    "flags": []
                }
            }
        }