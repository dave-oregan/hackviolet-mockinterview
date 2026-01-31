import google.generativeai as genai
import os

# Configuration for the Gemini API
genai.configure(api_key="YOUR_GEMINI_API_KEY")

class InterviewManager:
    def __init__(self, persona_info, user_resume):
        """
        persona_info: Dict containing company, role, and interview style.
        user_resume: String containing the text of the user's resume.
        """
        self.persona_info = persona_info
        self.user_resume = user_resume
        
        # 1. Define the System Instruction (The Persona)
        system_instruction = (
            f"You are an expert interviewer at {persona_info['company']}. "
            f"You are conducting a {persona_info['type']} for the {persona_info['role']} position. "
            f"Company Interview Style: {persona_info['style_guide']}\n\n"
            "YOUR GOAL: Be adaptive. Do not follow a script. "
            "1. Analyze the candidate's responses for technical gaps or 'weak points.'\n"
            "2. If a user is vague, press them for details.\n"
            "3. Refer to their resume (provided below) to verify claims or ask about specific projects.\n"
            "4. Keep track of 'Private Feedback' internally to guide your next question.\n\n"
            f"CANDIDATE RESUME:\n{self.user_resume}"
        )

        # 2. Initialize the model with the System Instruction
        self.model = genai.GenerativeModel(
            model_name="gemini-1.5-flash", # or gemini-1.5-pro for deeper reasoning
            system_instruction=system_instruction
        )
        
        # 3. Start a stateful chat session
        self.chat_session = self.model.start_chat(history=[])

    def get_next_question(self, user_transcript):
        """
        Processes the transcribed text from audio_analysis.py 
        and returns the next adaptive question.
        """
        
        # We use a specific prompt to ensure it generates both feedback and the question
        prompt = (
            f"The candidate said: '{user_transcript}'\n\n"
            "Tasks:\n"
            "- Internal Thought: Analyze their answer for weaknesses or strengths.\n"
            "- Output: Ask the next relevant follow-up question to probe their depth."
        )

        # Send the transcript to the API
        response = self.chat_session.send_message(prompt)
        
        return response.text

# --- Example Usage ---

# This info would likely come from your project's configuration files
persona_data = {
    "company": "Google",
    "role": "Software Engineer (L4)",
    "type": "Technical / Coding & Systems",
    "style_guide": "Focus on scalability, Big O complexity, and edge cases. Be professional but rigorous."
}

resume_text = "Experienced in C and Python. Built a web scraper and won VTHacks 13 for an AI project."

# Initialize the session
interview = InterviewManager(persona_data, resume_text)

# Example flow:
# Turn 1: AI asks "Tell me about your VTHacks project."
# User responds (transcribed): "We used an LLM to categorize data but we didn't really handle errors much."
next_q = interview.get_next_question("We used an LLM to categorize data but we didn't really handle errors much.")

print(f"AI Interviewer: {next_q}")