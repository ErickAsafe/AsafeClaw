<div align="center">
  <img src="https://img.shields.io/badge/Status-Active-success?style=for-the-badge" alt="Status" />
  <img src="https://img.shields.io/badge/Architecture-Agentic-blue?style=for-the-badge" alt="Architecture" />
  <img src="https://img.shields.io/badge/Telegram-Bot-blue?style=for-the-badge&logo=telegram" alt="Telegram" />
  <h1>🤖 AsafeClaw</h1>
  <p><b>Advanced Autonomous AI Assistant for Telegram</b></p>
</div>

<br/>

**AsafeClaw** is a next-generation Telegram bot powered by an advanced Agentic Loop architecture. It dynamically utilizes Tools, Skills, and the Model Context Protocol (MCP) to seamlessly interact with the operating system, external APIs, and the user's daily workflows.

---

## ✨ Features

- **🧠 Vector-Powered Memory**: Uses SQLite (`better-sqlite3`) and VSS (Vector Search) for long-term memory, sliding context windows, and precise skill routing.
- **🛡️ Human-in-the-Loop Security**: All mutable OS or API actions require explicit human approval via Telegram Inline Buttons, guaranteeing zero destructive autonomous actions.
- **🔄 Hot-Plug MCPs**: Seamlessly integrates with multiple Model Context Protocols (e.g., Google Drive, Calendar, Gmail) to expand its capabilities on the fly.
- **🎙️ Audio & Transcription Ready**: Built-in `TelegramInputHandler` ready to ingest audio files and integrate with advanced transcription services (like Transcreva.ai).
- **⏱️ Self-Healing Execution**: Robust dynamic timeouts (60s/180s) and AbortControllers ensure the agent loop never gets stuck in infinite generation.

## 🏗️ Architecture

The system is rigorously documented under the **Reversa Framework** methodology (100% architectural confidence). The core structure relies on:
- **`AgentLoop`**: The heart of AsafeClaw, managing state, tools, and LLM communication.
- **`Handlers`**: Decoupled interface adapters (e.g., Telegram integration).
- **`Tools` & `Skills`**: Extensible modules strictly typed and validated via Zod schemas.

## 🛠️ Tech Stack

- **Runtime**: Node.js / TypeScript (executed via `tsx`)
- **Database**: SQLite (`better-sqlite3`) in WAL mode for high concurrency
- **Bot Framework**: grammY
- **Testing**: Vitest (TDD / Fail-fast approach)
- **AI/LLM**: Google GenAI / Groq SDKs

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Telegram Bot Token
- API Keys (Google GenAI, Groq, etc.)

### Installation

1. Clone the repository and install dependencies:
```bash
npm install
```

2. Configure your environment variables in `.env`:
```env
TELEGRAM_BOT_TOKEN=your_token
GEMINI_API_KEY=your_key
# ... other required keys
```

3. Run the development server:
```bash
npm run dev
```

---
<div align="center">
  <i>Developed by Erick Asafe & AsafeClaw AI</i>
</div>
