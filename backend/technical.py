import random
import json
import google.generativeai as genai
from behavioral import MockInterviewCore
from firebase import db, get_persona_data, get_user_info

class TechnicalInterview(MockInterviewCore):
    def __init__(self, user_email, company_name, interview_level):
        # 1. Initialize parent attributes
        self.interview_type = "technical"
        super().__init__(user_email, company_name, interview_level, self.interview_type)

        # 2. Fetch the Technical Coding Problem
        self.coding_problem = self._get_random_technical_question()

    def _get_random_technical_question(self):
        """
        Fetches the array of questions from the 'technical' collection 
        based on the level (easy/medium/hard) and selects one at random.
        """
        try:
            # Document ID is the company name
            doc_ref = db.collection("technical").document(self.company_name)
            doc = doc_ref.get()
            
            if doc.exists:
                data = doc.to_dict()
                # Field name format: "medium-google" or "hard-meta"
                field_name = f"{self.interview_level.lower()}-{self.company_name.lower()}"
                questions_array = data.get(field_name, [])

                if questions_array:
                    return random.choice(questions_array)
            
            return "Design an LRU Cache with O(1) operations." # Fallback
        except Exception as e:
            print(f"Error fetching technical question: {e}")
            return "Reverse a Linked List."

    def _build_interviewer_system_prompt(self, persona_prompt):
        """
        Overrides the parent prompt to include the specific Coding Problem.
        """
        return f"""
        ### ROLE
        {persona_prompt}

        ### ASSIGNED CODING PROBLEM
        {self.coding_problem}

        ### INTERVIEW CONTEXT
        - **Company:** {self.company_name}
        - **Level:** {self.interview_level}
        - **Candidate:** {self.personal_info['name']} ({self.personal_info['major']})
        - **Resume Context:** {self.user_resume}

        ### EVALUATION PHASES (CRITICAL)
        1. **Phase 1: Clarification:** Do NOT let them code immediately. Ensure they ask about edge cases and bounds.
        2. **Phase 2: Flow:** Monitor for silences > 45s. Be collaborative but neutral.
        3. **Phase 3: Review:** If they write suboptimal code ($O(n^2)$), probe for $O(n)$ or $O(log n)$ alternatives.
        4. **Phase 4: Pivot:** Ask how this solution scales to 10M users or distributed systems.

        ### OUTPUT
        Output ONLY the next question/nudge. Output "Ends" only when the scaling pivot is completed.
        """.strip()

    def _build_feedback_system_prompt(self):
        """
        Technical Feedback focusing on Code Quality and Algorithmic Complexity.
        """
        return """
        ### ROLE
        Technical Evaluator. 
        Analyze for: Algorithmic Efficiency (Big O), Edge Case handling, and Clean Coding.
        
        ### OUTPUT FORMAT
        JSON ONLY:
        {
          "complexity_analysis": "Time: O(?), Space: O(?)",
          "star_score": { "Logic": 1-5, "Communication": 1-5 },
          "identified_weakness": "Description of the technical gap",
          "suggested_drill_down": "Technical follow-up (e.g., hash maps, binary search)"
        }
        """.strip()