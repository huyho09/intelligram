import subprocess
import os
from pathlib import Path
import uuid


RESULTS_DIR = Path(__file__).parent / "results"
RESULTS_DIR.mkdir(parents=True, exist_ok=True)
PLANTUML_JAR = "plantuml-mit-1.2025.2.jar"


def generate_unique_name() -> list:
    unique_id = uuid.uuid4()
    return (
        RESULTS_DIR / f"diagram_{unique_id}.puml",
        RESULTS_DIR / f"diagram_{unique_id}.png",
    )


def generate_diagram(plantuml_code: str) -> str:
    """
    Generates a diagram image from PlantUML code.
    """
    file_path, image_path = generate_unique_name()

    with open(file_path, "w") as file:
        file.write(plantuml_code)

    plantuml_path = os.path.join(Path(__file__).parent, PLANTUML_JAR)

    if not os.path.exists(plantuml_path):
        print(
            f"PlantUML JAR/Executable not found at: {plantuml_path}. Please check the path in plantuml_converter.py or set PLANTUML_JAR environment variable."
        )
        return None

    command = []
    if plantuml_path.endswith(".jar"):
        command = ["java", "-jar", plantuml_path, str(file_path)]
    else:
        command = [plantuml_path, str(file_path)]

    try:
        print(f"Running PlantUML with command: {' '.join(command)}")
        subprocess.run(command + ["-tpng"], check=True, capture_output=True, text=True)

        if not image_path.exists():
            raise FileNotFoundError(
                f"Generated image file not found at {image_path}. Check PlantUML output/errors."
            )

        print(f"Diagram generated successfully: {image_path}")
        return str(image_path)

    except FileNotFoundError as e:
        print(
            f"Error: 'java' command not found. Is Java installed and in your PATH? {e}"
        )
        return None
    
    except subprocess.CalledProcessError as e:
        print(f"Error running PlantUML: {e}")
        print(f"Stderr: {e.stderr}")
        print(f"Stdout: {e.stdout}")
        return None
    
    finally:
        if file_path.exists():
            pass
