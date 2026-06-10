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

### Persistent Conversational Memory (Project Context Tracking)
Simulated bots usually have zero memory of previous messages. We created true context awareness using React state:
- When a user types a project name (e.g., "SpiceVault" or "Photobooth"), the code detects it via a `projectKeywords` list and saves it to an `activeProject` state variable.
- For all subsequent follow-up questions (like "What were the challenges?"), the assistant pre-filters its entire brain, permanently isolating the search to *only* that specific project's data.
- If a project context is known, the "Vague Question Trap" is automatically disabled, allowing users to ask natural, generic follow-up questions seamlessly.

### Semantic Routing & 100% Accuracy Bypasses
To guarantee that the core questions and UI suggestion buttons work with absolute reliability, the assistant utilizes a custom **Semantic Router** that sits in front of the fuzzy matcher.
- **Meaning Extraction:** Rather than relying solely on lexical fuzzy matching, the router analyzes the user's string for intent. For example, if a user asks *"What was it made for?"* or *"What was the purpose?"*, the router explicitly overrides the search query to the semantic concept `"why"`.
- **Absolute Bypasses:** If the router detects one of the core semantic concepts (`tech stack`, `challenge`, `process`, `why`, `role`) while a project is actively selected, it **completely bypasses Fuse.js**. Instead, it performs a strict equality check (`===`) to directly pull the exact programmed answer. This guarantees a 100% mathematical match score, entirely eliminating the risk of fuzzy-search hallucinations caused by long query strings comparing against short tag arrays.

### Pure Keyword Summaries & Blank Queries
If a user just types a project name (e.g., *"Photobooth"*) out of the blue, the project name is detected and stripped from the search query to prevent search-weight skewing. This leaves an empty `""` query.
- **Solution:** The code detects the empty query and automatically forces the search string to `"summary"`. This guarantees that typing a project name instantly serves up its curated elevator pitch instead of throwing a blank error.

## 5. UI/UX Design
- **The Button:** A floating pill button styled using hyper-realistic CSS linear gradients and inner bevels to mimic Y2K physical chrome metal, complete with a recessed dark lens for the icon.
- **Markdown Parsing:** The chat window includes a custom lightweight text parser that converts `**bold text**` into strong tags and `[links](url)` into clickable anchor tags.
- **Staggered Delays:** The bot waits `400ms` before responding to simulate "thinking" time, making it feel more like a real AI.
