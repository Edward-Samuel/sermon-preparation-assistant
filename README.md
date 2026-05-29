# Sermon Preparation Assistant

A sermon preparation tool for pastors and teachers. Generates comprehensive sermon preparation packs using an LLM or a built-in deterministic template engine — no external Bible data required.

## Features

- **AI-Powered Sermon Generation** — Uses an LLM to draft sermons based on your topic and scripture passage.
- **Offline/Deterministic Mode** — Built-in template engine that works with no AI, no API key, and no network connection.
- **Tone Presets** — Six preaching styles: Expository, Topical, Evangelistic, Youth, Bible Study, and Pastoral Care.
- **Full Sermon Pack** — title, big idea, pastoral aim, introduction hook, outline with transitions, key/references, historical/cultural background, theological themes, illustrations, application steps, discussion questions, small group teaching notes, prayer points, closing challenge.
- **History & Export** — Save sermon packs to localStorage, export as Markdown or PDF.

## Tech Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Custom CSS** — No UI library; clean, lightweight styling
- **OpenAI-compatible API** — For AI-powered sermon generation
- **localStorage** — Client-side sermon history persistence

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables
cp .env.example .env.local
# Edit .env.local and fill in your OpenAI-compatible API key

# 3. Start the development server
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

For production:

```bash
npm run build
npm start
```

## Environment Variables

Create a `.env.local` file (copy from `.env.example`):

```
OPENAI_API_KEY=your-key
OPENAI_BASE_URL=https://your-provider/v1
CHAT_MODEL=gpt-4o-mini
```

| Variable | Description |
|---|---|
| `OPENAI_API_KEY` | API key for your OpenAI-compatible provider |
| `OPENAI_BASE_URL` | Base URL for the provider (e.g., `https://api.openai.com/v1`) |
| `CHAT_MODEL` | Model used for sermon generation (default: `gpt-4o-mini`) |

## Project Structure

```
sermon-preparation-assistant/
├── app/
│   ├── api/
│   │   └── generate/          # AI sermon generation endpoint
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   ├── llm.ts                 # LLM auth and chat helpers
│   ├── sermon-generator.ts    # Deterministic (offline) generator
│   ├── storage.ts
│   └── types.ts
├── package.json
└── README.md
```

## API Endpoints

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/generate` | Generate a sermon pack using AI |

## Disclaimer

This tool generates sermon preparation material as a **starting point** for prayerful study and preparation. Pastors and teachers should:

- Prayerfully review all generated content
- Verify all scripture references against their own Bible
- Adapt material to fit their congregation's specific needs, context, and doctrinal convictions
- Recognize that this tool assists preparation but does not replace the leading of the Holy Spirit or the authority of Scripture

When AI-powered generation is used, the output is produced by a language model — it is a tool, not an authority. The Word of God, as revealed in Scripture, remains the sole authority for faith and practice. The offline/deterministic mode requires no AI and no API key.

## License

This project is provided as-is for ministry use. Adapt freely for your church's needs.
