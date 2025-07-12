from flask import Flask, request, jsonify, send_file, abort
from flask_cors import CORS
from flasgger import Swagger, swag_from
from gpt4o_service import generate_plantuml_from_chat
from plantuml_converter import generate_diagram
import os
from pathlib import Path

from constants import DEFAULT_PACKAGE_PROMPT, ERROR_PUML

# Proxy Setup for Bosch network. This shit need to run on PX by BD
# os.environ["http_proxy"] = "http://127.0.0.1:3128"
# os.environ["https_proxy"] = "http://127.0.0.1:3128"

app = Flask(__name__)
# TODO: Enable CORS for all routes. This CORS need Tuan Anh to review and limit the resource. Huy just leave allow all for now
CORS(app)

# --- Swagger Configuration ---
app.config["SWAGGER"] = {
    "title": "ChatUML Diagram Generator API",
    "uiversion": 3,
    "openapi": "3.0.2",
    "specs_route": "/api/docs/",
}
swagger = Swagger(app)

# Define the results directory relative to this script
RESULTS_DIR = Path(__file__).parent / "results"


@app.route("/chat", methods=["POST"])
@swag_from(
    {
        "tags": ["Diagram Generation"],
        "summary": "Process a chat message to generate/update a PlantUML diagram.",
        "requestBody": {
            "description": "Chat message history.",
            "required": True,
            "content": {
                "application/json": {
                    "schema": {
                        "type": "object",
                        "properties": {
                            "history": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "role": {"type": "string", "example": "user"},
                                        "content": {
                                            "type": "string",
                                            "example": "Create a simple login flow.",
                                        },
                                    },
                                },
                            }
                        },
                        "required": ["history"],
                    }
                }
            },
        },
        "responses": {
            "200": {
                "description": "AI response and diagram URL.",
                "content": {
                    "application/json": {
                        "schema": {
                            "type": "object",
                            "properties": {
                                "ai_response": {"type": "string"},
                                "diagram_url": {"type": "string"},
                                "plantuml_code": {"type": "string"},
                            },
                        }
                    }
                },
            },
            "400": {"description": "Bad request (e.g., no history)."},
            "500": {
                "description": "Internal server error (AI or diagram generation failed)."
            },
        },
    }
)
def chat_handler():
    """
    Handles chat interactions for diagram generation.
    """
    data = request.json
    if not data or "history" not in data:
        return jsonify({"Error": "No chat history provided"}), 400

    history = data.get("history")

    try:
        ai_response_text = "Here is the updated diagram based on your request."

        plantuml_or_text, status = generate_plantuml_from_chat(history)
        if status != "valid":
            return jsonify(
                {
                    "ai_response": plantuml_or_text,
                    "diagram_url ": None,
                    "plantuml_code": None,
                }
            )

        # TODO: Redundant call => function to handle this traversing around prompt list
        image_path_str = generate_diagram(plantuml_or_text)
        if not image_path_str:
            plantuml_or_text, status = generate_plantuml_from_chat(
                history, prompt=DEFAULT_PACKAGE_PROMPT
            )
            image_path_str = generate_diagram(plantuml_or_text)

        if not image_path_str:
            plantuml_or_text = ERROR_PUML
            image_path_str = generate_diagram(plantuml_or_text)
            ai_response_text = (
                "Seems like there are some issues while processing your request."
            )

        image_path = Path(image_path_str)
        diagram_filename = image_path.name
        diagram_url = f"/diagram/{diagram_filename}"

        return jsonify(
            {
                "ai_response": ai_response_text,
                "diagram_url": diagram_url,
                "plantuml_code": plantuml_or_text,
            }
        )

    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400  # e.g., Missing API key
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return jsonify({"error": "An internal server error occurred."}), 500


@app.route("/diagram/<filename>")
@swag_from(
    {
        "tags": ["Diagram Retrieval"],
        "summary": "Serve a generated diagram image.",
        "parameters": [
            {
                "name": "filename",
                "in": "path",
                "required": True,
                "description": "The filename of the diagram image.",
                "schema": {"type": "string"},
            }
        ],
        "responses": {
            "200": {
                "description": "The diagram image.",
                "content": {
                    "image/png": {"schema": {"type": "string", "format": "binary"}}
                },
            },
            "404": {"description": "Diagram not found."},
        },
    }
)
def serve_diagram(filename):
    """
    Serves the generated diagram images.
    """
    try:
        # Security: Ensure filename is safe (e.g., no '..')
        safe_path = RESULTS_DIR.joinpath(filename).resolve()
        # Check if the resolved path is still within the RESULTS_DIR
        if RESULTS_DIR in safe_path.parents:
            return send_file(str(safe_path), mimetype="image/png")
        else:
            abort(404)  # Or return a specific error
    except FileNotFoundError:
        abort(404)


@app.route("/update_diagram", methods=["POST"])
@swag_from(
    {
        "tags": ["Diagram Update"],
        "summary": "Update an existing PlantUML diagram directly from code.",
        "requestBody": {
            "description": "PlantUML code to generate the diagram.",
            "required": True,
            "content": {
                "application/json": {
                    "schema": {
                        "type": "object",
                        "properties": {
                            "code": {
                                "type": "string",
                                "example": "@startuml\nAlice -> Bob: Authentication Request\nBob --> Alice: Authentication Response\n@enduml",
                            }
                        },
                        "required": ["code"],
                    }
                }
            },
        },
        "responses": {
            "200": {
                "description": "Diagram updated successfully.",
                "content": {
                    "application/json": {
                        "schema": {
                            "type": "object",
                            "properties": {
                                "diagram_url": {"type": "string"},
                                "plantuml_code": {"type": "string"},
                            },
                        }
                    }
                },
            },
            "400": {"description": "Bad request (e.g., no code provided)."},
            "500": {
                "description": "Internal server error (diagram generation failed)."
            },
        },
    }
)
def update_diagram_handler():
    """
    Handles direct updates to a diagram from PlantUML code.
    """
    data = request.json
    if not data or "code" not in data:
        return jsonify({"error": "No PlantUML code provided"}), 400

    plantuml_code = data.get("code")

    try:
        image_path_str = generate_diagram(plantuml_code)
        if not image_path_str:
            return jsonify({"error": "Failed to generate diagram image"}), 500

        image_path = Path(image_path_str)
        diagram_filename = image_path.name
        diagram_url = f"/diagram/{diagram_filename}"

        return jsonify({"diagram_url": diagram_url, "plantuml_code": plantuml_code})

    except Exception as e:
        print(f"An unexpected error occurred during diagram update: {e}")
        return jsonify(
            {"error": "An internal server error occurred during diagram update."}
        ), 500


if __name__ == "__main__":
    # Make sure 'results' directory exists
    RESULTS_DIR.mkdir(parents=True, exist_ok=True)
    app.run(debug=True, port=5001)
