# ChatUML: AI-Powered Diagram Generator

## Project Description

ChatUML is a web application that allows users to generate and refine diagrams (specifically PlantUML activity diagrams) through a conversational chat interface. Leveraging the power of OpenAI's GPT-4o, users can describe their workflows or system interactions in natural language, and the application will produce and update a visual diagram in real-time. This project is inspired by ChatUML and aims to provide a similar, intuitive experience for rapid diagram creation.

### Core Features

1.  **Conversational Interface**: Interact with an AI via a chat panel to describe, create, and modify diagrams.
2.  **Real-Time Diagram Generation**: See your diagram appear and update in the adjacent panel as you chat.
3.  **GPT-4o Powered**: Utilizes OpenAI's GPT-4o to understand natural language and generate PlantUML code.
4.  **PlantUML Rendering**: Converts the generated PlantUML code into PNG diagram images.
5.  **Code & Image Export**: Download the generated PlantUML source code (`.puml`) or the diagram image (`.png`).
6.  **Swagger API Documentation**: Includes an interactive API documentation endpoint.

---

## Project Architecture

The application follows a client-server architecture:

* **Frontend**:
    * **Framework**: Angular (v19+)
    * **UI**: Bootstrap 5
    * **Structure**: A two-panel layout with a Chat Panel (for user interaction) and a Diagram Panel (for displaying results).
    * **Communication**: Makes HTTP requests to the backend API.
* **Backend**:
    * **Framework**: Python with Flask
    * **AI Integration**: Uses the `openai` library to communicate with GPT-4o.
    * **Diagramming**: Uses `plantuml.jar` via a subprocess call to convert PlantUML code to images.
    * **API**: Provides a RESTful API for chat processing and diagram retrieval.
    * **API Docs**: Uses `flasgger` to provide a Swagger UI.

---

## Folder Structure

```text
user-story-2-diagram/
├── backend/
│   ├── results/                # Stores generated .puml and .png files
│   ├── .env                    # (To be created) Stores API keys and configs
│   ├── gpt4o_service.py        # Handles interaction with OpenAI API
│   ├── main.py                 # Flask application - API endpoints & Swagger
│   ├── plantuml_converter.py   # Converts PlantUML code to images
│   └── requirements.txt        # Python dependencies
├── frontend/
│   ├── node_modules/           # (Generated) Angular dependencies
│   ├── src/                    # Angular application source code
│   │   ├── app/                # Core application module & components
│   │   │   ├── components/     # Reusable UI components
│   │   │   │   ├── chat-panel/ # Chat interface component
│   │   │   │   └── diagram-panel/ # Diagram display component
│   │   │   ├── services/       # Angular services (e.g., ApiService)
│   │   │   ├── app.component.* # Root application component
│   │   │   ├── app.config.ts   # Application configuration
│   │   │   └── app.routes.ts   # Application routes
│   │   ├── assets/             # Static assets (images, etc.)
│   │   ├── index.html          # Main HTML entry point
│   │   ├── main.ts             # Main application bootstrap
│   │   └── styles.css          # Global CSS styles
│   ├── angular.json            # Angular CLI configuration
│   ├── package.json            # Frontend dependencies and scripts
│   ├── README.md               # Original Angular README
│   └── tsconfig.*.json         # TypeScript configurations
├── frontend-old/               # (Legacy) Original static HTML/JS/CSS version
│   ├── index.html
│   ├── script.js
│   └── style.css
├── .vscode/                    # VS Code editor settings (optional)
│   └── settings.json
├── chatUML.jpg                 # Reference image for the UI design
└── README.md                   # This file - Project overview and instructions
```

---

## Getting Started

### Prerequisites

* **Python**: 3.8 or higher.
* **Node.js & npm/yarn**: Latest LTS version recommended (for frontend).
* **Java**: Required to run `plantuml.jar`. Ensure Java is installed and accessible via the `java` command in your terminal.
* **PlantUML JAR**: Download the `plantuml.jar` file (or `plantuml-mit.jar`) from the [official PlantUML website](https://plantuml.com/download).
* **OpenAI API Key**: You need an API key from [OpenAI](https://platform.openai.com/).
* **Note**: This project is hosted on Render's free tier, which provides 0.1 CPU and 512 MB of RAM, so response times may be a bit slower.

### Installation & Setup

1.  **Clone the Repository**:
    ```bash
    git clone <your-repository-url>
    cd <your-repository-directory>
    ```

2.  **Backend Setup**:
    * Navigate to the `backend` directory:
        ```bash
        cd backend
        ```
    * Create a virtual environment (recommended):
        ```bash
        python -m venv venv
        source venv/bin/activate  # On Windows use `venv\Scripts\activate`
        ```
    * Install Python dependencies:
        ```bash
        pip install -r requirements.txt
        ```
    * Create a `.env` file in the `backend` directory and add your OpenAI API key:
        ```env
        OPENAI_API_KEY=your_openai_api_key_here
        ```
    * **Crucially**, update `backend/plantuml_converter.py`. Find the `plantuml_path` variable and set it to the **absolute or user-relative path** where you saved your `plantuml.jar` file. Alternatively, set the `PLANTUML_JAR` environment variable.

3.  **Frontend Setup**:
    * Navigate to the `frontend` directory:
        ```bash
        cd ../frontend
        ```
    * Install Node.js dependencies:
        ```bash
        npm install
        ```

### Running the Application

1.  **Start the Backend Server**:
    * Open a terminal in the `backend` directory (ensure your virtual environment is active).
    * Run the Flask application:
        ```bash
        python main.py
        ```
    * The backend will typically run on `http://127.0.0.1:5000`.

2.  **Start the Frontend Development Server**:
    * Open a *separate* terminal in the `frontend` directory.
    * Run the Angular development server:
        ```bash
        ng serve
        ```
    * The frontend will typically run on `http://localhost:4200/`.

3.  **Access the Application**:
    * Open your web browser and navigate to `http://localhost:4200/`.

4.  **Access API Documentation (Swagger)**:
    * While the backend is running, navigate to `http://127.0.0.1:5000/api/docs/`.

---

## How to Use

1.  Open the application in your browser.
2.  if it ask for login: email: admin@gmail.com; pass: Password@123
3.  Type your request in the chat input area on the left (e.g., "Show a user login process", "Add a step for password reset", "Change 'User' to 'Customer'").
4.  Press Enter or click "Send".
5.  The AI will process your request, and the diagram on the right will update.
6.  Use the buttons above the diagram to view the PlantUML code or download the code/image.

---

Example Prompt:
```
Draw for me an activity diagram follow step bellow:
Main steps
1. Start — The user opens the registration page.
2. Display form — The system displays the registration form.
3. Enter details — The user enters their name, email, and password.
4. Validate input — The system checks whether the input is valid.
   - No: The user corrects the information.
   - Yes: The system creates the account.
5. Verify email — The user confirms their email address, if required.
6. Complete registration — The system completes the registration process.
7. End — The activity finishes.
```
---

## Future Improvements / To-Do

* Implement SVG and PDF export options.
* Improve GPT-4o prompting for more complex diagram refinements and state management.
* Add user authentication and diagram saving/loading.
* Enhance error handling and visual feedback.
* Implement a 'Tab' based system like ChatUML for multiple diagrams.
* Add support for other diagram types (Sequence, Class, etc.).
* Deploy to a cloud platform.
