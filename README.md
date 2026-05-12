

A university course planning tool that imports IULMS data, tracks academic progress, and helps generate optimized semester schedules.

Getting Started

Open index.html directly in any modern web browser. No build process, installation, or server setup required.

Optional Local Server (for testing features)

To test advanced features locally, you can run a simple server:

python3 -m http.server 8000

Then open: http://localhost:8000

Project Structure
coursemap/
├── index.html         Application entry point
├── styles.css         Global styles
├── README.md          Documentation
└── js/
    ├── constants.js   Static data (days, grades, icons)
    ├── parser.js      IULMS data parsing logic
    ├── analytics.js   GPA, progress, and scheduling logic
    ├── ai.js          AI provider integration layer
    ├── views.js       UI rendering functions
    └── app.js         Core state management and events
Core Features

Free Features include importing IULMS data via text or file upload, automatic parsing of semesters, courses, grades, and credits, academic progress tracking including GPA and completion stats, course filtering and status management, semester planning with conflict detection, and rule based schedule suggestions.

Advanced Features (API enabled) include image input support for course extraction, AI generated academic summaries, AI based course recommendations, and support for user provided OpenAI or Claude API keys.

Technology Stack

Pure HTML, CSS, and JavaScript with no frameworks, no external dependencies, and no build tools.

Architecture includes a centralized application state object, full UI re-rendering on state updates, event delegation for interactions, modular file separation by responsibility, and a unified AI request layer.

System Design Notes

State management is handled through a single source of truth using a global state object. Rendering is fully regenerated after each state change. Parsing uses regex and structured splitting for IULMS format handling. Scheduling logic is constraint based for conflict detection and optimization. AI integration is abstracted to support multiple providers through a single interface.

Privacy

All processing runs locally in the browser by default. External requests occur only when AI features are enabled and explicitly used. No data is stored or transmitted unless required for AI processing.

License

Private or internal project, update as required.
