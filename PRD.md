# Zotero LLM Summarizer - Product Requirements Document

## Overview

A Zotero 7 plugin that adds AI-powered summarization capabilities to the reference management workflow. Users can right-click on any source item with attached notes and generate an AI summary using their preferred LLM provider.

## Problem Statement

Researchers often accumulate extensive notes on sources but lack quick ways to synthesize key insights. Manual summarization is time-consuming, and existing tools do not integrate directly with Zotero's workflow.

## Solution

Integrate LLM summarization directly into Zotero via a context menu action, allowing users to:
- Select a source item with text notes
- Trigger AI summarization with a single click
- Receive a structured summary as a new note attachment

---

## Functional Requirements

### FR1: Context Menu Integration
- Add "Summarize with AI" menu item to item context menu (right-click)
- Menu item appears when exactly one item is selected
- Menu item is disabled/hidden if the selected item has no text notes

### FR2: Note Content Extraction
- Retrieve all child notes attached to the selected item
- Extract plain text content from notes (strip HTML)
- Concatenate multiple notes with clear separators
- Handle edge cases: empty notes, very long notes

### FR3: LLM Provider Configuration
- Support multiple providers via settings:
  - **Claude** (Anthropic API)
  - **Gemini** (Google AI)
  - **OpenAI** (GPT models)
  - **OpenRouter** (multi-model gateway)
- Each provider requires:
  - API key (stored securely in preferences)
  - Model selection (dropdown of available models)
  - Optional: custom endpoint URL (for OpenRouter/proxies)

### FR4: Settings/Preferences Pane
- Accessible via Zotero Preferences > LLM Summarizer
- Provider selection (radio/dropdown)
- API key input (password field, masked)
- Model selection per provider
- Output format preference (Markdown/Plain text)
- Custom system prompt (optional, advanced)

### FR5: Summary Generation
- Send note content to selected LLM with appropriate prompt
- Default prompt: "Summarize the following research notes, highlighting key findings, methodology, and relevance:"
- Handle API errors gracefully (invalid key, rate limits, network)
- Show progress indicator during generation

### FR6: Output as Note
- Create new child note attached to the source item
- Note title: "AI Summary - [Date]"
- Content format: Markdown or plain text (per user preference)
- Include metadata footer: provider used, model, timestamp

---

## Non-Functional Requirements

### NFR1: Security
- API keys stored in Zotero preferences (not exported)
- Keys transmitted only over HTTPS
- No telemetry or data collection

### NFR2: Performance
- Timeout handling for LLM requests (30s default)
- Non-blocking UI during API calls

### NFR3: Compatibility
- Zotero 7.0.x (bootstrap plugin model)
- Windows, macOS, Linux

---

## User Interface

### Context Menu
```
[Right-click on item]
├── ...existing menu items...
├── Summarize with AI          (enabled if notes exist)
└── ...
```

### Preferences Pane
```
┌─────────────────────────────────────────────┐
│ LLM Summarizer Settings                     │
├─────────────────────────────────────────────┤
│ Provider:  ○ Claude  ○ Gemini  ○ OpenAI    │
│            ○ OpenRouter                     │
│                                             │
│ API Key:   [••••••••••••••]  [Test]        │
│                                             │
│ Model:     [claude-3-sonnet ▼]             │
│                                             │
│ Output:    ○ Markdown  ○ Plain text        │
│                                             │
│ [Advanced ▼]                                │
│   Custom prompt: [........................] │
│   Endpoint URL:  [........................] │
└─────────────────────────────────────────────┘
```

---

## Technical Architecture

### File Structure (Extended)
```
zotero-llm-summarizer/
├── bootstrap.ts          # Plugin lifecycle, context menu registration
├── lib.ts               # Main plugin class (LlmSummarizer)
├── client/
│   ├── manifest.json    # Plugin metadata
│   ├── prefs.js         # Default preference values
│   ├── prefs.xhtml      # Preferences UI (NEW)
│   ├── prefs-script.js  # Preferences logic (NEW)
│   ├── style.css        # Styles
│   └── locale/en-US/
│       └── zotero-llm-summarizer.ftl  # Strings
├── src/                 # (NEW) TypeScript modules
│   ├── llm/
│   │   ├── base.ts      # BaseLLMProvider interface
│   │   ├── claude.ts    # Claude implementation
│   │   ├── gemini.ts    # Gemini implementation
│   │   ├── openai.ts    # OpenAI implementation
│   │   └── openrouter.ts # OpenRouter implementation
│   ├── notes.ts         # Note extraction utilities
│   └── summarizer.ts    # Orchestration logic
└── ...
```

### Key Zotero APIs Used
- `Zotero.getActiveZoteroPane().getSelectedItems()` - Get selected items
- `item.getNotes()` - Get note IDs for an item
- `Zotero.Items.get(noteId)` - Retrieve note item
- `note.getNote()` - Get note HTML content
- `new Zotero.Item('note')` - Create new note
- `item.saveTx()` - Save item to database
- `Zotero.PreferencePanes.register()` - Register settings pane
- `Zotero.Prefs.get/set()` - Read/write preferences

---

## API Specifications

### Claude (Anthropic)
- Endpoint: `https://api.anthropic.com/v1/messages`
- Auth: `x-api-key` header
- Models: claude-3-opus, claude-3-sonnet, claude-3-haiku

### Gemini (Google)
- Endpoint: `https://generativelanguage.googleapis.com/v1/models/{model}:generateContent`
- Auth: `?key=` query param
- Models: gemini-pro, gemini-1.5-pro

### OpenAI
- Endpoint: `https://api.openai.com/v1/chat/completions`
- Auth: `Authorization: Bearer` header
- Models: gpt-4o, gpt-4-turbo, gpt-3.5-turbo

### OpenRouter
- Endpoint: `https://openrouter.ai/api/v1/chat/completions`
- Auth: `Authorization: Bearer` header
- Models: Various (user-specified)

---

## Success Metrics

1. User can configure API key and test connection
2. Right-click menu appears on items with notes
3. Summary is generated and saved as child note
4. Errors display meaningful messages

---

## Out of Scope (v1)

- PDF text extraction (only existing notes)
- Batch summarization of multiple items
- Summary editing/refinement
- Citation extraction from summaries
- Local LLM support (Ollama, etc.)
