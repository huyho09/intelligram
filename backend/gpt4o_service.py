import openai
import os
import re
from dotenv import load_dotenv
from constants import SYSTEM_PROMPT, PLANTUML_SCRIPT_PATTERN

load_dotenv()


def extract_plantuml_code(response: str) -> str | None:
    match = re.search(PLANTUML_SCRIPT_PATTERN, response, re.DOTALL | re.IGNORECASE)
    if not match:
        return None

    snippet = match.group(1).strip()
    if not snippet.startswith("@startuml"):
        snippet = f"@startuml\n{snippet}"
    if not snippet.endswith("@enduml"):
        snippet += "\n@enduml"

    return snippet

def generate_plantuml_from_chat(message_history: str, prompt=SYSTEM_PROMPT) -> str:
    openai.api_key = os.getenv("OPENAI_API_KEY")
    if not openai.api_key:
        raise ValueError("OpenAI API key is missing. Please check your .env file.")

    system_prompt = {"role": "system", "content": prompt}

    messages = [system_prompt] + message_history

    try:
        response = openai.chat.completions.create(model="gpt-4o", messages=messages)

        full_response = response.choices[0].message.content
        extracted_plantuml_code = extract_plantuml_code(full_response)

        if extracted_plantuml_code is not None:
            return extracted_plantuml_code, "valid"
        else:
            return full_response.strip(), "no_uml_found"

    except Exception as e:
        print(f"Error calling OpenAI: {e}")
        return "Error: Could not connect to AI service.", "error"
