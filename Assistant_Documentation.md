# The Information Index Assistant - Documentation

This document outlines the architecture, logic, and features of the custom "simulated AI" chatbot built for this portfolio. 

## 1. The Core Concept
Instead of using an expensive and unpredictable real LLM (like OpenAI or Gemini), this assistant is built using **Fuse.js**, a powerful, lightweight fuzzy-search library. It provides the "magic" of an AI chatbot by parsing natural language and matching it against a pre-written JSON knowledge base. This guarantees 100% accurate, perfectly formatted answers every time, while serving as a massive technical flex of frontend logic.

## 2. The Data Layer (`app/data/assistantKnowledge.json`)
The knowledge base is structured as an array of JSON objects. Each object represents a potential answer and contains:
- `projectId`: Used to categorize if the question is for a specific project or "general" info about Sreeja.
- `question`: A human-readable version of what the entry answers.
- `tags`: An array of keywords, phrases, and synonyms that trigger this answer.
- `answer`: The markdown-formatted response the bot will output.

## 3. The Search Engine Logic
The `InfoIndexAssistant.tsx` component handles the logic. 
- **Weights:** The search engine prioritizes matches found in the `tags` array (Weight: 2) over the `question` string (Weight: 1). 
- **Leniency:** The matching threshold is set to `0.6` to allow for typos and natural conversational phrasing. If the best match has a score worse than 0.6, it triggers a custom Fallback message.

## 4. Advanced Features & "Magic"

### The Vague Question Trap
Because Fuse.js doesn't understand context, asking a generic question like *"What were the challenges?"* could accidentally return the challenges for a random project.
- **Solution:** A specific "Vague Project Question Catcher" entry was added to the top of the JSON. It listens for generic keywords (`"problems"`, `"tech stack"`).
- When triggered, the bot replies: *"Which project are you curious about? Please include the project name..."*

### Conversational Memory (Contextual Concatenation)
Simulated bots usually have zero memory of previous messages. We faked memory using React state:
- If the bot just triggered the "Vague Trap" (asking the user to specify a project), and the user replies with a single word (e.g., *"Photobooth"*)...
- The code secretly grabs the user's *previous* question (*"What were the challenges?"*) and concatenates it with their new input (*"Photobooth"*). 
- The search engine quietly searches for *"What were the challenges? Photobooth"*, flawlessly delivering the correct project-specific answer.

### Tag Isolation & Collision Prevention
When user inputs are long, tags can cross-contaminate (e.g., *"Why did you build this?"* accidentally matching the word "build" in the "Tech Stack" tags). 
- **Solution:** Tags are strictly isolated. Process questions use `["how did you build", "architecture"]`, while Tech Stack questions use `["stack", "framework"]`. 

### Pure Keyword Summaries
If a user just types a project name (e.g., *"Photobooth"*) out of the blue, the bot has a dedicated summary entry whose tags are strictly the project name. This ensures it doesn't randomly pick a feature or challenge to display, but rather a curated elevator pitch.

## 5. UI/UX Design
- **The Button:** A floating pill button styled using hyper-realistic CSS linear gradients and inner bevels to mimic Y2K physical chrome metal, complete with a recessed dark lens for the icon.
- **Markdown Parsing:** The chat window includes a custom lightweight text parser that converts `**bold text**` into strong tags and `[links](url)` into clickable anchor tags.
- **Staggered Delays:** The bot waits `400ms` before responding to simulate "thinking" time, making it feel more like a real AI.
