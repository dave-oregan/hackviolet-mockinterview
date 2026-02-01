import google.generativeai as genai
import json
import os
import time
from firebase import get_persona_data, get_user_info
import uuid

# Configuration for the Gemini API
genai.configure(api_key="AIzaSyCYudu_1t08_aTCpmKTOSZSTVxZUkY0nyY")

# class MockInterviewCore:
#     def __init__(self, user_email, company_name, interview_level, interview_type):
#         self.user_email = user_email # Ensure this is stored
#         self.mini_report = []
#         self.company_name = company_name
#         self.interview_level = interview_level
#         self.interview_type = interview_type
        
#         persona_prompt, additional_info = get_persona_data(company_name, interview_type)
#         user_data = get_user_info(user_email)
#         self.personal_info = user_data['personal_info']
#         self.user_resume = self.personal_info['resume']
        
#         # Using Pro for the Interviewer
#         self.interviewer_model = genai.GenerativeModel(
#             model_name='gemini-1.5-pro',
#             system_instruction=self._build_interviewer_system_prompt(persona_prompt)
#         )
        
#         # Using Flash for instant tactical feedback
#         self.feedback_model = genai.GenerativeModel(
#             model_name='gemini-1.5-flash',
#             system_instruction=self._build_feedback_system_prompt()
#         )
        
#         self.chat_session = self.interviewer_model.start_chat(history=[])

#     def _build_interviewer_system_prompt(self, persona_prompt):
#         return f"""
#         ### ROLE
#         {persona_prompt}

#         ### INTERVIEW CONTEXT
#         - **Company:** {self.company_name}
#         - **Candidate:** {self.personal_info['name']}
        
#         ### TIMING & ADAPTATION
#         You will receive timing metadata with user responses. 
#         - If a user's response is under 30 seconds, encourage more detail.
#         - If a user is rambling (over 3 minutes), politely transition to the next topic.
#         - Monitor the total interview duration to ensure all key behavioral areas are covered.

#         ### TERMINATION
#         If the interview reaches a natural conclusion or time limit, output exactly: "Ends".
#         """

#     def _build_feedback_system_prompt(self):
#         return """
#         ### ROLE
#         Tactical Evaluator. Analyze user response for STAR method and pacing.
        
#         ### OUTPUT FORMAT
#         Return JSON ONLY:
#         {
#           "star_score": { "S": 1-5, "T": 1-5, "A": 1-5, "R": 1-5 },
#           "pacing_analysis": "Too short / Good / Too long",
#           "identified_weakness": "Description of the gap",
#           "suggested_drill_down": "Recommended follow-up"
#         }
#         """

#     def get_question(self, last_feedback=None, interview_start_time=None):
#         """Generates adaptive question using timestamps for context."""
#         current_ts = int(time.time() * 1000)
#         elapsed_minutes = 0
#         if interview_start_time:
#             elapsed_minutes = (current_ts - int(interview_start_time)) / 60000

#         if last_feedback:
#             prompt = f"INTERNAL ANALYSIS: {last_feedback}\nELAPSED TIME: {elapsed_minutes:.1f} mins.\n\nAsk the next adaptive follow-up."
#         else:
#             prompt = "Introduce yourself and ask the first question based on my resume."
            
#         response = self.chat_session.send_message(prompt)
#         return response.text.strip()

#     def generate_feedback(self, question_asked, user_response, start_ms, end_ms):
#         """Tactical analysis including duration calculation."""
#         duration_sec = (int(end_ms) - int(start_ms)) / 1000
#         prompt = f"Question: {question_asked}\nResponse: {user_response}\nDuration: {duration_sec} seconds."
        
#         response = self.feedback_model.generate_content(
#             prompt,
#             generation_config={"response_mime_type": "application/json"}
#         )
#         return response.text.strip()

#     def process_turn(self, question, user_ans, start_ms, end_ms):
#         """Processes a single turn of the interview and logs it."""
#         turn_feedback_json = self.generate_feedback(question, user_ans, start_ms, end_ms)
        
#         self.mini_report.append({
#             "question_asked": question,
#             "user_response": user_ans,
#             "start_time": start_ms,
#             "end_time": end_ms,
#             "duration_sec": (int(end_ms) - int(start_ms)) / 1000,
#             "feedback": json.loads(turn_feedback_json)
#         })
#         return turn_feedback_json

#     def generate_audio_feedback(self, ended_early=False):
#         session_history = json.dumps(self.mini_report, indent=2)
        
#         status_note = ""
#         if ended_early:
#             status_note = "\nCRITICAL NOTE: The user ended this interview early. Note this as a negative impact on 'Endurance' and 'Professionalism' in the report."

#         final_prompt = f"""
#         Analyze the following interview transcript and timing metadata.
        
#         SESSION DATA:
#         {session_history}
#         {status_note}

#         Return ONLY a JSON object:
#         {{
#           "audio_analysis": {{
#               "score": int, 
#               "categories": {{
#                 "vocal_clarity": {{ "score": int, "feedback": "string" }},
#                 "pacing_and_flow": {{ "score": int, "feedback": "string" }},
#                 "tone_and_confidence": {{ "score": int, "feedback": "string" }}
#               }}
#           }}
#         }}
#         """
#         response = self.chat_session.send_message(
#             final_prompt,
#             generation_config={"response_mime_type": "application/json"}
#         )
#         return json.loads(response.text.strip())
# # TEST #
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

# # if __name__ == "__main__":
# #     # Ensure these match a document in your 'accounts' collection in Firebase
# #     tester = MockInterviewCore(
# #         user_email="liamm24@vt.edu", 
# #         company_name="google", 
# #         interview_level="Medium",
# #         interview_type="behavioral"
# #     )
# #     tester.run_test_loop()

# import google.generativeai as genai
# import json
# import os
# import time
# from firebase import get_persona_data, get_user_info
# import uuid

# # Configuration for the Gemini API
# genai.configure(api_key="YOUR_GEMINI_API_KEY")

# class MockInterviewCore:
#     def __init__(self, user_email, company_name, interview_level, interview_type):
#         self.user_email = user_email # Ensure this is stored
#         self.mini_report = []
#         self.company_name = company_name
#         self.interview_level = interview_level
#         self.interview_type = interview_type
        
#         persona_prompt, additional_info = get_persona_data(company_name, interview_type)
#         user_data = get_user_info(user_email)
#         self.personal_info = user_data['personal_info']
#         self.user_resume = self.personal_info['resume']
        
#         # Using Pro for the Interviewer
#         self.interviewer_model = genai.GenerativeModel(
#             model_name='gemini-1.5-pro',
#             system_instruction=self._build_interviewer_system_prompt(persona_prompt)
#         )
        
#         # Using Flash for instant tactical feedback
#         self.feedback_model = genai.GenerativeModel(
#             model_name='gemini-1.5-flash',
#             system_instruction=self._build_feedback_system_prompt()
#         )
        
#         self.chat_session = self.interviewer_model.start_chat(history=[])

#     def _build_interviewer_system_prompt(self, persona_prompt):
#         return f"""
#         ### ROLE
#         {persona_prompt}

#         ### INTERVIEW CONTEXT
#         - **Company:** {self.company_name}
#         - **Candidate:** {self.personal_info['name']}
        
#         ### TIMING & ADAPTATION
#         You will receive timing metadata with user responses. 
#         - If a user's response is under 30 seconds, encourage more detail.
#         - If a user is rambling (over 3 minutes), politely transition to the next topic.
#         - Monitor the total interview duration to ensure all key behavioral areas are covered.

#         ### TERMINATION
#         If the interview reaches a natural conclusion or time limit, output exactly: "Ends".
#         """

#     def _build_feedback_system_prompt(self):
#         return """
#         ### ROLE
#         Tactical Evaluator. Analyze user response for STAR method and pacing.
        
#         ### OUTPUT FORMAT
#         Return JSON ONLY:
#         {
#           "star_score": { "S": 1-5, "T": 1-5, "A": 1-5, "R": 1-5 },
#           "pacing_analysis": "Too short / Good / Too long",
#           "identified_weakness": "Description of the gap",
#           "suggested_drill_down": "Recommended follow-up"
#         }
#         """

#     def get_question(self, last_feedback=None, interview_start_time=None):
#         """Generates adaptive question using timestamps for context."""
#         current_ts = int(time.time() * 1000)
#         elapsed_minutes = 0
#         if interview_start_time:
#             elapsed_minutes = (current_ts - int(interview_start_time)) / 60000

#         if last_feedback:
#             prompt = f"INTERNAL ANALYSIS: {last_feedback}\nELAPSED TIME: {elapsed_minutes:.1f} mins.\n\nAsk the next adaptive follow-up."
#         else:
#             prompt = "Introduce yourself and ask the first question based on my resume."
            
#         response = self.chat_session.send_message(prompt)
#         return response.text.strip()

#     def generate_feedback(self, question_asked, user_response, start_ms, end_ms):
#         """Tactical analysis including duration calculation."""
#         duration_sec = (int(end_ms) - int(start_ms)) / 1000
#         prompt = f"Question: {question_asked}\nResponse: {user_response}\nDuration: {duration_sec} seconds."
        
#         response = self.feedback_model.generate_content(
#             prompt,
#             generation_config={"response_mime_type": "application/json"}
#         )
#         return response.text.strip()

#     # def process_turn(self, question, user_ans, start_ms, end_ms):
#     #     """Processes a single turn of the interview and logs it."""
#     #     turn_feedback_json = self.generate_feedback(question, user_ans, start_ms, end_ms)
        
#     #     self.mini_report.append({
#     #         "question_asked": question,
#     #         "user_response": user_ans,
#     #         "start_time": start_ms,
#     #         "end_time": end_ms,
#     #         "duration_sec": (int(end_ms) - int(start_ms)) / 1000,
#     #         "feedback": json.loads(turn_feedback_json)
#     #     })
#     #     return turn_feedback_json

#     def process_turn(self, question, user_ans, start_ms, end_ms):
#         """
#         Called every time a user stops recording. 
#         It transcribes the text, runs tactical feedback, and logs everything.
#         """
#         # 1. Run the Tactical Feedback (Flash Model)
#         # We now pass the text received from Whisper
#         feedback_json = self.generate_feedback(question, user_ans, start_ms, end_ms)
        
#         # 2. Update the mini_report with the new data
#         self.mini_report.append({
#             "question": question,
#             "answer": user_ans,
#             "start_time": start_ms,
#             "end_time": end_ms,
#             "duration_sec": (int(end_ms) - int(start_ms)) / 1000,
#             "analysis": json.loads(feedback_json)
#         })
        
#         return feedback_json
    

#     def generate_audio_feedback(self, ended_early=False):
#         session_history = json.dumps(self.mini_report, indent=2)
        
#         status_note = ""
#         if ended_early:
#             status_note = "\nCRITICAL NOTE: The user ended this interview early. Note this as a negative impact on 'Endurance' and 'Professionalism' in the report."

#         final_prompt = f"""
#         Analyze the following interview transcript and timing metadata.
        
#         SESSION DATA:
#         {session_history}
#         {status_note}

#         Return ONLY a JSON object:
#         {{
#           "audio_analysis": {{
#               "score": int, 
#               "categories": {{
#                 "vocal_clarity": {{ "score": int, "feedback": "string" }},
#                 "pacing_and_flow": {{ "score": int, "feedback": "string" }},
#                 "tone_and_confidence": {{ "score": int, "feedback": "string" }}
#               }}
#           }}
#         }}
#         """
#         response = self.chat_session.send_message(
#             final_prompt,
#             generation_config={"response_mime_type": "application/json"}
#         )
#         return json.loads(response.text.strip())
