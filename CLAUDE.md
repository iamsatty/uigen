# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server with Turbopack
npm run build        # Production build
npm run test         # Run all Vitest tests
npm run setup        # Install deps, generate Prisma client, run migrations
npm run db:reset     # Reset database
```

Run a single test file:
```bash
npx vitest run src/lib/__tests__/file-system.test.ts
```

## Environment Setup

Requires a `.env` file with `ANTHROPIC_API_KEY`. Without it, the app falls back to `MockLanguageModel` (defined in `src/lib/provider.ts`) which returns canned responses.

Database is SQLite via Prisma. Schema is at `prisma/schema.prisma` — always reference it to understand stored data structures. Two models: `User` (id, email, password) and `Project` (id, name, userId FK, messages as JSON string, data as JSON string).

## Architecture

UIGen is an AI-powered React component generator. Users describe components in a chat interface; Claude generates code that is stored in a **virtual file system** (in-memory, never written to disk) and rendered live in a sandboxed iframe.

### Request Flow

```
Chat input → /api/chat (route.ts) → Claude AI (streamText)
  → tool calls (str_replace_editor / file_manager)
  → FileSystemContext (client state updates)
  → PreviewFrame (Babel JSX transform → iframe)
```

### Key Abstractions

**Virtual File System** (`src/lib/file-system.ts`): In-memory file store. All AI tool operations (create, update, replace, delete) target this FS. Serialized to JSON for database persistence.

**FileSystemContext** (`src/lib/contexts/file-system-context.tsx`): Client-side React context wrapping the virtual FS. Receives tool call results from the AI stream and updates state. Auto-selects `App.jsx` or the first available file for preview.

**ChatContext** (`src/lib/contexts/chat-context.tsx`): Wraps Vercel AI SDK's `useChat` hook, connects to `FileSystemContext` for tool handling, and tracks anonymous user work limits.

**AI Tools** (`src/lib/tools/`):
- `str_replace_editor` — view/create/str_replace/insert/undo on virtual files
- `file_manager` — create/read/list/delete/rename operations

**JSX Transformer** (`src/lib/transform/jsx-transformer.ts`): Uses `@babel/standalone` in the browser to transform JSX/TSX → JS, builds import maps, and generates preview iframe HTML. Handles missing imports with placeholders.

**Language Model Provider** (`src/lib/provider.ts`): Exports `getModel()` returning an Anthropic Claude model (`claude-haiku-4-5` by default) or `MockLanguageModel` when no API key is set.

### UI Layout

Three-panel layout in `src/app/main-content.tsx` using `react-resizable-panels`:
- Left (35%): Chat interface
- Right top: Preview iframe / Code toggle tabs
- Right bottom (code view): FileTree + Monaco editor

### Auth

JWT sessions via `jose` (7-day expiry, HttpOnly cookies). `src/lib/auth.ts` handles token creation/verification. `src/middleware.ts` protects `/api/projects` and `/api/filesystem` routes. Server actions in `src/actions/index.ts` handle sign-up, sign-in, sign-out, and project CRUD.

### System Prompt

The AI generation prompt lives in `src/lib/prompts/generation.tsx`. Key constraints it enforces: root entry point must be `/App.jsx`, use `@/` aliases for local imports, React + Tailwind CSS only.

## Code Style

Only comment code that is non-obvious or complex. Self-explanatory code should not have comments.

## Testing

Tests live alongside source in `__tests__/` subdirectories. Uses Vitest with jsdom environment and `@testing-library/react`. Uses `vi.mock()` for dependencies.
