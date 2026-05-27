# Sermon Preparation Assistant

A standalone Next.js + TypeScript web application that helps pastors prepare sermon packs with outlines, illustrations, discussion questions, and more.

## Features

- **Sermon Pack Generation** — Produces a comprehensive preparation pack including title, big idea, pastoral aim, introduction hook, full outline with transitions, scripture references, historical/cultural background, theological themes, illustration suggestions, application steps, discussion questions, small group teaching notes, prayer points, and closing challenge.
- **Tone Presets** — Choose from six preaching styles: Expository, Topical, Evangelistic, Youth, Bible Study, and Pastoral Care. Each preset adjusts the tone, emphasis, and approach of the generated content.
- **History** — Save sermon packs to your browser's localStorage. Reload and delete saved packs at any time.
- **Export** — Copy as Markdown, download as a `.md` file, or print/save as PDF via your browser's built-in print dialog.
- **No Backend Required** — All generation happens locally in your browser. No database, no API keys, no external services.

## Quick Start

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

The app will be available at [http://localhost:3000](http://localhost:3000).

## Environment Variables

No environment variables are required. The app works fully offline with a built-in deterministic sermon generator.

## How to Use

1. **Enter sermon details** — Fill in the topic/theme, scripture passage, audience context, sermon length, and tone preset. Optionally add notes or emphasis areas.
2. **Generate** — Click "Generate Sermon Pack" to produce a full preparation pack.
3. **Review and edit** — Read through the generated content. Use it as a starting point for your own prayerful study and preparation.
4. **Save** — Click "Save to History" to store the pack in your browser for later access.
5. **Export** — Use the export buttons to copy Markdown, download a `.md` file, or print/save as PDF.
6. **History** — Click "History" in the header to view, reload, or delete previously saved sermon packs.

## Project Structure

```
sermon-preparation-assistant/
├── app/
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main application page (client component)
├── lib/
│   ├── sermon-generator.ts # Deterministic sermon pack generator
│   ├── storage.ts          # localStorage CRUD operations
│   └── types.ts            # TypeScript type definitions
├── next.config.js
├── package.json
├── tsconfig.json
└── README.md
```

## Disclaimer

This tool generates sermon preparation material as a **starting point** for prayerful study and preparation. Pastors and teachers should:

- Prayerfully review all generated content
- Verify all scripture references against their own Bible
- Adapt material to fit their congregation's specific needs, context, and doctrinal convictions
- Recognize that this tool assists preparation but does not replace the leading of the Holy Spirit or the authority of Scripture

No AI-generated or algorithmically generated biblical/theological content should be considered authoritative. The Word of God, as revealed in Scripture, remains the sole authority for faith and practice.

## Tech Stack

- **Next.js 14** — React framework with App Router
- **TypeScript** — Type-safe development
- **No external UI libraries** — Clean, custom CSS for a polished but lightweight experience
- **localStorage** — Client-side persistence (no database needed)

## License

This project is provided as-is for ministry use. Adapt freely for your church's needs.
