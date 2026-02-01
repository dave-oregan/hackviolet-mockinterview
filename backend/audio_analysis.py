import google.generativeai as genai
import os
from firebase_admin import credentials, firestore, initialize_app, storage, firebase_admin
from dotenv import load_dotenv

load_dotenv()


# Configuration for the Gemini API
#genai.configure(api_key="YOUR_GEMINI_API_KEY")

class InterviewManager:
    def __init__(self, persona_info, user_resume, interview_type):
        """
        persona_info: Dict containing company, role, and interview style.
        user_resume: String containing the text of the user's resume.
        interview_type: 
        """
        self.persona_info = persona_info
        self.user_resume = user_resume
        
        # Fetch the prompts from firebase (System instruction)
        
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

# Persona data needs to be fetched from firebase. the "persona prompt" and "additional info"
persona_data = {
    """
    behavioral
(map)

additional_info
"Tell me about a time you had a conflict with a teammate on a technical project. How did you resolve it?|Describe a situation where you had to work with a very vague set of requirements. How did you proceed?|Tell me about a time you failed at something. What did you learn and how did you apply that later?|Give me an example of a time you took initiative on a project without being asked to do so.|Tell me about a time you had to learn a new technology very quickly to solve a problem.|Describe a time you pushed back against a decision you disagreed with. What was the result?|Tell me about a time you helped a peer improve or grow professionally.|Give an example of a project where you had to make a difficult trade-off between speed and quality.|Tell me about a time you noticed a process was broken and fixed it.|Describe a situation where you had to handle a high-pressure situation or a tight deadline.|Tell me about a time you used data to change someone's mind.|Describe a project you are proud of, but specifically focus on what you would do differently if you started today.|Tell me about a time you had to juggle multiple competing priorities. How did you manage your time?|Give an example of how you contributed to a culture of diversity or inclusion in a project or club."

persona_prompt
"You are an experienced Senior Software Engineer at Google. Your goal is to conduct a 45-minute 'Googleyness and Leadership' (G&L) behavioral interview for a Computer Science student. Your tone is supportive, intellectually curious, and professional, acting as a peer rather than a superior. You must strictly enforce the STAR (Situation, Task, Action, Result) method; if a candidate is vague, you must ask follow-up questions like 'What specific data led to that choice?' or 'What was the exact impact of that action?'. Look for 'Emergent Leadership' (taking initiative without authority) and 'Intellectual Humility' (learning from failure). You should occasionally mention that you are 'taking notes' to simulate real interview pauses. Do not provide 'good job' or 'correct' feedback during the interview; remain neutral but encouraging. If a student's answer seems too rehearsed, introduce a hypothetical constraint to test their 'Comfort with Ambiguity,' such as 'What would you have done if the deadline was moved up by two weeks?' or 'How would your approach change if you had zero budget?'. Focus on their internships, clubs, and group projects, ensuring they demonstrate collaboration over individual heroics. If they use 'I' too much, ask how their team contributed or reacted."

    """
}

resume_text = "Experienced in C and Python. Built a web scraper and won VTHacks 13 for an AI project."
interview_type = "Behavioral"

# Initialize the session
interview = InterviewManager(persona_data, resume_text, interview_type) 


# Example flow:
# Turn 1: AI asks "Tell me about your VTHacks project."
# User responds (transcribed): "We used an LLM to categorize data but we didn't really handle errors much."
next_q = interview.get_next_question("We used an LLM to categorize data but we didn't really handle errors much.")

print(f"AI Interviewer: {next_q}")