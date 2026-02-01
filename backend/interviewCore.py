import google.generativeai as genai
import json

# Replace with your actual API key
genai.configure(api_key="YOUR_GEMINI_API_KEY")

class BehavioralInterview:
    def __init__(self):
        # Initializing the array to store JSON-style data
        self.mini_report = []
        
        # Setting up the two models
        self.interviewer_model = genai.GenerativeModel('gemini-1.5-pro')  # The "Thinker"
        self.feedback_model = genai.GenerativeModel('gemini-1.5-flash')    # The "Speedster"
        
        # Start a chat session for the interviewer to maintain context/history
        self.chat_session = self.interviewer_model.start_chat(history=[])

    def get_question(self, previous_feedback=None):
        """
        Acts as the interviewer. Uses the Pro model to generate a 
        thoughtful, adaptive question based on previous feedback.
        """
        if previous_feedback:
            # Empty prompt as requested, but passing feedback for adaptation
            prompt = f"" 
            response = self.chat_session.send_message(prompt)
        else:
            # Initial question call
            prompt = f""
            response = self.chat_session.send_message(prompt)
            
        return response.text.strip()

    def get_response(self):
        """
        Placeholder for the user's transcribed audio response.
        """
        # This will be replaced by your audio_analysis.py logic later
        return "User's transcribed response string goes here."

    def generate_feedback(self, question_asked, user_response):
        """
        Uses the Flash model to give quick feedback on the specific interaction.
        """
        # Empty prompt as requested
        prompt = f""
        response = self.feedback_model.generate_content(prompt)
        
        return response.text.strip()

    def run_interview(self):
        """
        The main loop that controls the interview flow.
        """
        is_active = True
        current_feedback = None

        while is_active:
            # 1. Get the question (Interviewer turn)
            question = self.get_question(previous_feedback=current_feedback)
            
            # Check for the stop condition
            if "Ends" in question:
                print("Interview session concluded.")
                is_active = False
                break

            # 2. Get the user's answer (User turn)
            user_ans = self.get_response()

            # 3. Generate feedback for this turn (Coach turn)
            turn_feedback = self.generate_feedback(question, user_ans)
            
            # 4. Create the JSON-style entry and append to mini_report
            entry = {
                "question_asked": question,
                "user_response": user_ans,
                "feedback": turn_feedback
            }
            self.mini_report.append(entry)

            # 5. Set feedback for the next loop iteration to allow adaptation
            current_feedback = turn_feedback

            # Debug print to see the process in the terminal
            print(f"Added entry: {json.dumps(entry, indent=2)}")

# Example of how to execute the file
if __name__ == "__main__":
    interview = BehavioralInterview()
    interview.run_interview()