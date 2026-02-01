import google.generativeai as genai
import json
import os
from firebase import get_persona_data, get_user_info
import uuid

# Configuration for the Gemini API
genai.configure(api_key="YOUR_GEMINI_API_KEY")

class MockInterviewCore:
    def __init__(self, user_email, company_name, interview_level, interview_type):
        self.mini_report = []
        self.company_name = company_name
        self.interview_level = interview_level
        self.interview_type = interview_type
        
        # 1. Fetch Data from Database
        persona_prompt, additional_info = get_persona_data(company_name, interview_type)
        user_data = get_user_info(user_email)
        self.personal_info = user_data['personal_info']
        self.user_resume = self.personal_info['resume']
        
        # 2. Set up the Gemini 3 Brains
        # Question Generator: The Strategist (Gemini 3 Pro)
        self.interviewer_model = genai.GenerativeModel(
            model_name='gemini-3-pro-preview',
            system_instruction=self._build_interviewer_system_prompt(persona_prompt)
        )
        
        # Feedback Brain: The Tactical Coach (Gemini 3 Flash)
        self.feedback_model = genai.GenerativeModel(
            model_name='gemini-3-flash-preview',
            system_instruction=self._build_feedback_system_prompt()
        )
        
        # Start stateful session for the Interviewer
        self.chat_session = self.interviewer_model.start_chat(history=[])

    def _build_interviewer_system_prompt(self, persona_prompt):
        return f"""
        ### ROLE
        {persona_prompt}

        ### INTERVIEW CONTEXT
        - **Company:** {self.company_name}
        - **Level:** {self.interview_level}
        - **Candidate:** {self.personal_info['name']}, {self.personal_info['major']} at {self.personal_info['school']}
        - **Resume:** {self.user_resume}

        ### OPERATIONAL CORE: ADAPTATION
        Analyze the 'Tactical Analysis' from your internal evaluator for every turn. 
        If a 'Weakness' is flagged, your next question MUST drill into that specific gap.
        Maintain your persona tone strictly.

        ### TERMINATION
        If the session logic dictates the end (based on {self.interview_level}), output exactly: "Ends".
        """

    def _build_feedback_system_prompt(self):
        return """
        ### ROLE
        Tactical Evaluator. Analyze the user response for STAR method compliance and technical depth.
        
        ### OUTPUT FORMAT
        Return JSON ONLY:
        {
          "star_score": { "S": 1-5, "T": 1-5, "A": 1-5, "R": 1-5 },
          "identified_weakness": "Description of the gap",
          "suggested_drill_down": "Recommended follow-up topic"
        }
        """

    def get_question(self, last_feedback=None):
        """Generates adaptive question using the 3 Pro model."""
        if last_feedback:
            prompt = f"INTERNAL ANALYSIS: {last_feedback}\n\nAsk the next adaptive follow-up."
        else:
            prompt = "Introduce yourself and ask the first question based on my resume."
            
        response = self.chat_session.send_message(prompt)
        return response.text.strip()

    def generate_feedback(self, question_asked, user_response):
        """Tactical analysis using the 3 Flash model."""
        prompt = f"Question: {question_asked}\nResponse: {user_response}"
        
        response = self.feedback_model.generate_content(
            prompt,
            generation_config={"response_mime_type": "application/json"}
        )
        return response.text.strip()

    def get_response(self):
        # Link this to your audio_analysis.py later
        return "User's transcribed response string goes here."

    def run_interview(self):
        is_active = True
        current_feedback = None

        while is_active:
            # 1. AI generates question
            question = self.get_question(last_feedback=current_feedback)
            if "Ends" in question:
                break

            # 2. User provides answer (simulated or real)
            user_ans = self.get_response()

            # 3. Tactical Turn Analysis (Flash Model)
            turn_feedback_json = self.generate_feedback(question, user_ans)
            
            # 4. Log to internal report
            self.mini_report.append({
                "question_asked": question,
                "user_response": user_ans,
                "feedback": json.loads(turn_feedback_json)
            })

            current_feedback = turn_feedback_json

        # --- AFTER THE LOOP ENDS ---
        print("\nInterview Concluded. Generating Final Audio Report...")
        
        # This now contains ONLY the 'audio' object structure
        final_report_object = self.generate_overall_feedback()

        # Save to Firebase history using the function in firebase.py
        from firebase import add_interview
        
        # add_interview(
        #     user_email=self.user_email,
        #     company_name=self.company_name,
        #     role_targetted="Software Engineer",
        #     interview_id=str(uuid.uuid4()),
        #     report=final_report_object # Gemini output matches your 'report' schema
        # )

        return final_report_object
    def generate_overall_feedback(self):
        """
        Synthesizes the entire session into the final report JSON.
        Focuses exclusively on audio-specific feedback as requested.
        """
        # This prompt tells the model to look at the entire chat history
        final_prompt = """
        The interview is over. Based on the entire conversation history:
        1. Evaluate the candidate's audio-based responses.
        2. Assign an 'audio_score' (0-100).
        3. Provide 'overall_feedback' (3-4 sentences).
        4. List 'exact_details' for questions that needed improvement.

        Return ONLY a JSON object with this exact structure:
        {
        "audio": {
            "audio_score": int,
            "feedback": {
            "overall_feedback": "string",
            "exact_details": [
                {
                "question": "string",
                "response": "string",
                "improvement": "string"
                }
            ]
            }
        }
        }
        """

        # We use the stateful session so it remembers all turns
        response = self.chat_session.send_message(
            final_prompt,
            generation_config={"response_mime_type": "application/json"}
        )
        
        # Return the dictionary directly so it can be passed to Firebase
        return json.loads(response.text.strip())

# import google.generativeai as genai
# import json
# import os
# from firebase import get_persona_data, get_user_info

# Configure your API Key
genai.configure(api_key="AIzaSyD_3ZqPlweHfBMtB_woGdMO1T4oY0zc00k")

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

#     def _build_system_prompt(self, persona_prompt):
#         return f"""
#         {persona_prompt}
#         Candidate: {self.personal_info['name']}, {self.personal_info['major']} at {self.personal_info['school']}.
#         Resume: {self.user_resume}
#         Goal: Conduct a {self.interview_type} interview. If the candidate is vague, drill deeper. 
#         Output 'Ends' when the session is over.
#         """

#     def get_question(self, last_feedback=None):
#         prompt = f"Internal Feedback: {last_feedback}\n\nNext Question:" if last_feedback else "Start the interview."
#         response = self.chat_session.send_message(prompt)
#         return response.text.strip()

#     def generate_feedback(self, question, answer):
#         # Force JSON output for structured tactical analysis
#         prompt = f"Analyze this interaction for STAR method compliance:\nQ: {question}\nA: {answer}"
#         response = self.feedback_model.generate_content(
#             prompt, 
#             generation_config={"response_mime_type": "application/json"}
#         )
#         return response.text.strip()

#     def get_response(self):
#         """Simulates the audio transcription by taking terminal input."""
#         print("\n" + "-"*20)
#         user_input = input("YOUR ANSWER: ")
#         print("-"*20)
#         return user_input

#     def run_test_loop(self):
#         print(f"Starting {self.company_name} Interview Simulation...\n")
#         current_feedback = None
        
#         # Run for 3-4 turns to test adaptation
#         for i in range(4):
#             question = self.get_question(last_feedback=current_feedback)
#             if "Ends" in question: break
            
#             print(f"AI: {question}")
#             answer = self.get_response()
            
#             # Generate tactical feedback for the next turn
#             current_feedback = self.generate_feedback(question, answer)
            
#             self.mini_report.append({
#                 "turn": i+1,
#                 "question": question,
#                 "answer": answer,
#                 "feedback": json.loads(current_feedback)
#             })
            
#         print("\nInterview Complete. Final Mini-Report:")
#         print(json.dumps(self.mini_report, indent=2))

# if __name__ == "__main__":
#     # Ensure these match a document in your 'accounts' collection in Firebase
#     tester = MockInterviewCore(
#         user_email="liamm24@vt.edu", 
#         company_name="google", 
#         interview_level="Medium",
#         interview_type="behavioral"
#     )
#     tester.run_test_loop()