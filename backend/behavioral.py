import google.generativeai as genai
import json
import os
import time
from firebase import get_persona_data, get_user_info
import uuid
from pathlib import Path

# Configuration for the Gemini API
genai.configure(api_key=os.getenv('GOOGLE_API_KEY'))

class MockInterviewCore:
    def __init__(self, user_email, company_name, interview_level, interview_type):
        self.company_name = company_name
        self.interview_level = interview_level
        self.interview_type = interview_type
        self.mini_report = []
        # 1. Fetch data from your Firebase functions
        # Note: Ensure get_persona_data in firebase.py returns the data!
        persona_prompt, _ = get_persona_data(company_name, interview_type)
        user_data = get_user_info(user_email)
        self.personal_info = user_data['personal_info']
        self.user_resume = self.personal_info['resume']
        
        # 2. Setup Gemini 3 Models
        self.interviewer_model = genai.GenerativeModel(
            model_name='gemini-3-pro-preview', # The adaptive strategist
            system_instruction=self._build_system_prompt(persona_prompt)
        )
        self.feedback_model = genai.GenerativeModel(
            model_name='gemini-3-flash-preview' # The tactical evaluator
        )
        
        self.chat_session = self.interviewer_model.start_chat(history=[])

    def _build_system_prompt(self, persona_prompt):
        return f"""
        {persona_prompt}
        Candidate: {self.personal_info['name']}, {self.personal_info['major']} at {self.personal_info['school']}.
        Resume: {self.user_resume}
        Goal: Conduct a {self.interview_type} interview. If the candidate is vague, drill deeper. 
        Output 'Ends' when the session is over.
        """

    def get_question(self, last_feedback=None):
        prompt = f"Internal Feedback: {last_feedback}\n\nNext Question:" if last_feedback else "Start the interview."
        response = self.chat_session.send_message(prompt)
        return response.text.strip()

    def generate_feedback(self, question, answer):
        # Force JSON output for structured tactical analysis
        prompt = f"Analyze this interaction for STAR method compliance:\nQ: {question}\nA: {answer}"
        response = self.feedback_model.generate_content(
            prompt, 
            generation_config={"response_mime_type": "application/json"}
        )
        return response.text.strip()

    def get_response(self):
        """Simulates the audio transcription by taking terminal input."""
        print("\n" + "-"*20)
        user_input = input("YOUR ANSWER: ")
        print("-"*20)
        return user_input
    
    def generate_audio_feedback(self): # overall
        session_history = json.dumps(self.mini_report, indent=2)

        final_prompt = f"""
        You are an expert Speech and Vocal Analyst. 
        Analyze the following interview transcript and metadata to audit the candidate's vocal performance.
        
        SESSION DATA:
        {session_history}

        ### ANALYSIS CRITERIA:
        - VOCAL CLARITY: Assess articulation and volume consistency based on the transcript quality and structure.
        - PACING & FLOW: Track speed of speech, use of filler words, and awkward pauses.
        - TONE & CONFIDENCE: Identify inflection patterns, confidence in word choice, and overall energy.

        Return ONLY a JSON object in this exact structure:
        {{
          "audio_analysis": {{
              "score": int, 
              "categories": {{
                "vocal_clarity": {{
                  "score": int, 
                  "feedback": "string",
                  "flags": [{"question_number": "N/A", "event": "string"}]
                }},
                "pacing_and_flow": {{
                  "score": int, 
                  "feedback": "string",
                  "flags": [{"question_number": "N/A", "event": "string"}]
                }},
                "tone_and_confidence": {{
                  "score": int, 
                  "feedback": "string",
                  "flags": [{"question": "N/A", "event": "string"}]
                }}
              }}
          }}
        }}
        """
        # We use the stateful session so it remembers all turns
        response = self.chat_session.send_message(
            final_prompt,
            generation_config={"response_mime_type": "application/json"}
        )
        return json.loads(response.text.strip())        
def process_turn(self, answer, question):
    "Takes the user answer, generates feedback, generates question, returns question"
    feedback_json = self.generate_feedback(question, answer)
    feedback_data = json.loads(feedback_json)
    
    self.mini_report.append({
            "turn": len(self.mini_report) + 1,
            "question": question,
            "answer": answer,
            "feedback": feedback_data
        })
        
    next_question = self.get_question(feedback_data)
    
    return next_question