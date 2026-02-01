import google.generativeai as genai
import os
from dotenv import load_dotenv
from firebase import get_persona_data, get_user_info
load_dotenv()



class InterviewManager:
    def __init__(self, user_email, company_name, interview_type):
        """
        persona_info: Dict containing company, role, and interview style.
        user_resume: String containing the text of the user's resume.
        interview_type: 
        """
        # company_name = 'google'
        # interview_type = 'behavorial'
        # user_email = 'liamm24@vt.edu'
        # Configuration for the Gemini API
        self.client = genai.Client(os.getenv("GEMINI_API_KEY"))
        print('Got gemini running')

        
        self.current_session_reports = []
        
        persona_prompt, additional_info = get_persona_data(company_name, interview_type)
        user_data = get_user_info(user_email)
        print(user_data)
        self.personal_info = user_data['personal_info']
        self.user_resume = self.personal_info['resume']
        
        print(f"This is your resume\n{self.user_resume}")
                
        # 1. Define the System Instruction (The Persona)
        formatted_topics = additional_info.replace('|', '\n- ')
    # Current Session (Short-term)
        current_session_report = self.current_session_reports[-1] if self.current_session_reports else "No previous rounds yet. This is the start of the interview."
        system_instruction = (
    f"### IDENTITY AND GOALS ###\n"
    f"{persona_prompt}\n\n"
    
    f"### SESSION PROGRESSION (PREVIOUS MINI-REPORT) ###\n"
    f"Use these to maintain consistency, track what has already been asked, and avoid repetition:\n"
    f"{current_session_report}\n\n"

    f"### INTERVIEW TOPIC POOL ###\n"
    f"Use these as your primary areas of inquiry, but pivot based on the resume and user answers:\n"
    f"{formatted_topics}\n\n"
    
    f"### CANDIDATE CONTEXT (RESUME) ###\n"
    f"{self.user_resume}\n\n"
    
    f"### OPERATIONAL RULES ###\n"
    "1. START: If this is Round 1, introduce yourself as a Google engineer. If not, acknowledge the previous point and pivot.\n"
    "2. PROBING: If they miss a 'Result' (the R in STAR), you MUST ask for metrics, data, or the final impact.\n"
    "3. ADAPTIVE FLOW: Use the 'SESSION PROGRESSION' to build on previous answers. If they mentioned a struggle in Round 1, you can probe their resilience in Round 2.\n"
    "4. TRANSITIONS: Use natural bridges like 'Building on that...' or 'Moving to a different area...'.\n"
    "5. NO FEEDBACK: Maintain a neutral, professional demeanor. Do not say 'Great' or 'Correct'.\n"
    "6. DYNAMICS: If they use 'I' too much, ask how their team contributed or reacted."
)
    # 2. Initialize the model with the System Instruction. Creates the chat
        self.chat_session = self.client.chats.create(
    model="gemini-1.5-flash",
    config=types.GenerateContentConfig(
        system_instruction=system_instruction
    )
)
    

    def get_next_question(self, user_transcript):
        """
        Forces Gemini to analyze the transcript for weaknesses/strengths 
        and then generate the next question based on that analysis.
        """
        prompt = (
            f"USER RESPONSE: '{user_transcript}'\n\n"
            "TASKS:\n"
            "1. Analyze the response for STAR method gaps and strengths.\n"
            "2. Generate a 2-3 sentence internal feedback summary.\n"
            "3. Ask the next relevant follow-up or pivot to a new topic."
        )

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
interview = InterviewManager('liamm24@vt.edu', 'google', 'behavioral') 


# Example flow:
# Turn 1: AI asks "Tell me about your VTHacks project."
# User responds (transcribed): "We used an LLM to categorize data but we didn't really handle errors much."
next_q = interview.get_next_question("We used an LLM to categorize data but we didn't really handle errors much.")

print(f"AI Interviewer: {next_q}")