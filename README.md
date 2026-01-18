# 🤖 Zotero LLM Summarizer

[![Version](https://img.shields.io/badge/version-1.2.1-blue.svg)](https://github.com/Lvigentini/zotero-llm-summarizer/releases)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Zotero](https://img.shields.io/badge/Zotero-7.0+-red.svg)](https://www.zotero.org/)

> **AI-powered research note summarisation for Zotero 7** — Transform your research notes into structured academic summaries using multiple LLM providers.

> 🔑 **BYO Key Philosophy**: This plugin uses your own API keys — no middleman, no subscription fees, no data collection. You pay only for what you use, directly to your chosen provider. And if you are lucky enough to have your own setup, we strongly support open source, so you will be able to connect your favorite model via OLLAMA.

---

## ✨ Features at a Glance

| Feature | Description |
|---------|-------------|
| 🔄 **Multi-Provider** | 6 LLM providers with automatic fallback |
| 📑 **Batch Processing** | Summarise multiple items at once |
| 📋 **Digest Mode** | Combine notes from multiple sources |
| 🏷️ **Smart Tagging** | Auto-tag summaries for easy filtering |
| 🎯 **Research-Focused** | Academic prompt optimised for synthesis |
| ⚙️ **Customisable** | Custom prompts for your workflow |

---

## 🔌 Supported Providers

| Provider | Icon | Type | Models |
|----------|------|------|--------|
| **Claude** | 🟠 | Direct API | Sonnet 4.5, Opus 4.5, Haiku 4.5 |
| **OpenAI** | 🟢 | Direct API | GPT-4.1, GPT-4.1 Mini, GPT-4o |
| **Grok** | ⚡ | Direct API | Grok 3, Grok 3 Mini, Grok 4 |
| **Gemini** | 🔵 | Direct API | Gemini 2.0 Flash, 2.5 Flash Lite |
| **OpenRouter** | 🟣 | Gateway | 15+ models from multiple providers |
| **Ollama** | 🦙 | Local | Llama 3.3, Mistral, Qwen, DeepSeek |


---

## 🚀 Quick Start

```
1. Download  →  2. Install  →  3. Configure API Key  →  4. Right-click & Summarise!
```

### Installation

1. 📥 Download the latest `.xpi` from [**Releases**](https://github.com/Lvigentini/zotero-llm-summarizer/releases)
2. 🔧 In Zotero: **Tools** → **Add-ons** → ⚙️ → **Install Add-on From File...**
3. 🔄 Restart Zotero

### First-time Setup

1. Go to **Edit** → **Settings** → **LLM Summarizer**
2. Enter your API key for at least one provider
3. Click **Test** to verify connection

---

## 📖 How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                        SINGLE ITEM                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   📄 Zotero Item    →    📝 Notes    →    🤖 LLM    →    📋 Summary Note   │
│   (with notes)           (extracted)      (process)     [LLM-note] tagged  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      MULTIPLE ITEMS                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   📑 Batch Individual:                                           │
│   Item 1 → Summary 1                                             │
│   Item 2 → Summary 2                                             │
│   Item 3 → Summary 3                                             │
│                                                                  │
│   📋 Simple Digest:                                              │
│   Items 1,2,3 notes → Combined Digest Note                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

> ⚠️ **Note on PDF Text:** This plugin summarises **notes**, not PDF files directly. To summarise PDF content, you first need to extract the text into a note. We recommend using [zotero-ocr](https://github.com/UB-Mannheim/zotero-ocr) for this. Built-in PDF text extraction is on our [roadmap](docs/ROADMAP.md).

---

## 🎯 Usage

### Single Item Summary
1. Select an item with notes attached
2. **Right-click** → **Summarize with AI**
3. Choose provider or use default chain

### Multi-Item Processing
1. Select multiple items (Ctrl/Cmd + click)
2. **Right-click** → **Summarize with AI**
3. Choose:
   - 📑 **Batch Individual** — One summary per item
   - 📋 **Simple Digest** — All notes combined

### Collection Summary
1. **Right-click** on a collection
2. **Summarize with AI** → Choose batch or digest

---

## 🏷️ Note Identification

All generated notes are easy to find:

| Element | Format | Example |
|---------|--------|---------|
| **Title** | `[LLM-note] Author_Year_Model_summary` | `[LLM-note] Smith_2024_gpt-4.1_summary` |
| **Tags** | `LLM-note`, `AI`, `summary`, `{model}` | Filter by any tag in Zotero |

**Finding your summaries:**
- 🏷️ Click `LLM-note` tag in Tags pane
- 🔍 Search for `[LLM-note]` in search bar
- 📁 Create a Saved Search for permanent collection

---

## ⚙️ Configuration

### Provider Priority (Drag & Drop)

```
┌──────────────────────────────────────┐
│  Provider Priority                    │
├──────────────────────────────────────┤
│  1. 🟠 Claude        ✓ Key set       │  ← Primary
│  2. 🟢 OpenAI        ✓ Key set       │  ← Fallback 1
│  3. ⚡ Grok          ○ No key        │
│  4. 🔵 Gemini        ✓ Key set       │  ← Fallback 2
│  5. 🦙 Ollama        ○ Disabled      │
│  6. 🟣 OpenRouter    ○ No key        │
└──────────────────────────────────────┘
         ↕ Drag to reorder
```

### API Key Sources

| Provider | Get API Key |
|----------|-------------|
| 🟠 Claude | [console.anthropic.com](https://console.anthropic.com/) |
| 🟢 OpenAI | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |
| ⚡ Grok | [console.x.ai](https://console.x.ai/) |
| 🔵 Gemini | [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) |
| 🦙 Ollama | [ollama.ai](https://ollama.ai/) — Type `enabled` to activate |
| 🟣 OpenRouter | [openrouter.ai/keys](https://openrouter.ai/keys) |

---

## 📝 Research Prompt

The default prompt is optimised for academic research synthesis:

```
┌─────────────────────────────────────────────────────────────┐
│  📚 DEFAULT OUTPUT STRUCTURE                                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Key Findings & Main Arguments                            │
│     └─ Central thesis, claims, empirical vs theoretical      │
│                                                              │
│  2. Methodology                                              │
│     └─ Design, sample, validity, generalisability            │
│                                                              │
│  3. Important Concepts & Definitions                         │
│     └─ Key terminology, theoretical frameworks               │
│                                                              │
│  4. Relevance & Implications                                 │
│     └─ Significance, applications, open questions            │
│                                                              │
│  5. Citation Network Analysis                                │
│     └─ Foundational works, intellectual lineages             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Custom Prompts

Override in **Settings → Advanced**. 
Bear in mind that LLM models are different, so consider what you want to achieve. These are general tips to ensure you get what you want from the LLM in the most efficient way


| Tip | Example |
|-----|---------|
| 🎯 Be specific | "Create exactly 5 bullet points" |
| 👤 Set persona | "You are a systematic review expert" |
| 👥 Define audience | "Write for undergraduate students" |
| 📋 Specify format | "Use markdown tables for comparison" |
| ⛔ Set constraints | "Maximum 200 words" |

<details>
<summary><b>📄 Example Custom Prompts</b></summary>

**Literature Review Style:**
```
Summarise these notes as a literature review paragraph suitable for a thesis chapter.
Focus on how the studies relate to each other and identify gaps in the research.
Use formal academic language and include in-text citations where authors are mentioned.
```

**Structured Summary:**
```
Create a structured summary with these exact sections:
- Research Question
- Key Finding (one sentence)
- Method (brief)
- Limitations
- How this relates to [your specific research topic]
```

**Journal Club:**
```
You are a research assistant helping prepare for a journal club presentation.
Summarise the key points that would generate discussion, highlight methodological
choices that could be debated, and suggest 3 discussion questions for the group.
```

</details>

---

## 📊 Available Models

<details>
<summary><b>🟠 Claude (Anthropic)</b></summary>

| Model | Speed | Use Case |
|-------|-------|----------|
| Claude Sonnet 4.5 | ⚡⚡ | Best balance (default) |
| Claude Opus 4.5 | ⚡ | Highest quality |
| Claude Haiku 4.5 | ⚡⚡⚡ | Fastest, budget-friendly |
| Claude Sonnet 4 | ⚡⚡ | Previous generation |
| Claude Opus 4 | ⚡ | Previous generation |

</details>

<details>
<summary><b>🟢 OpenAI</b></summary>

| Model | Speed | Use Case |
|-------|-------|----------|
| GPT-4.1 | ⚡⚡ | Latest, best quality |
| GPT-4.1 Mini | ⚡⚡⚡ | Fast & affordable |
| GPT-4.1 Nano | ⚡⚡⚡⚡ | Fastest |
| GPT-4o | ⚡⚡ | Multimodal |
| GPT-4o Mini | ⚡⚡⚡ | Compact multimodal |

</details>

<details>
<summary><b>⚡ Grok (xAI)</b></summary>

| Model | Speed | Use Case |
|-------|-------|----------|
| Grok 3 | ⚡⚡ | Latest |
| Grok 3 Mini | ⚡⚡⚡ | Fast |
| Grok 4 | ⚡⚡ | Newest |
| Grok 4 Fast | ⚡⚡⚡ | Speed optimised |

</details>

<details>
<summary><b>🔵 Gemini (Google)</b></summary>

| Model | Speed | Use Case |
|-------|-------|----------|
| Gemini 2.0 Flash | ⚡⚡⚡ | Fast, capable |
| Gemini 2.0 Flash Lite | ⚡⚡⚡⚡ | Fastest |
| Gemini 2.5 Flash Lite | ⚡⚡⚡ | Latest lite |

</details>

<details>
<summary><b>🦙 Ollama (Local)</b></summary>

| Model | Size | Use Case |
|-------|------|----------|
| Llama 3.3 | 70B | Best local quality |
| Llama 3.2 | 3B | Lightweight |
| Mistral | 7B | Fast, efficient |
| Mixtral | 8x7B | MoE, powerful |
| Qwen 2.5 | Various | Multilingual |
| DeepSeek R1 | Various | Reasoning |
| Phi-4 | 14B | Microsoft |
| Gemma 2 | 9B | Google |

</details>

<details>
<summary><b>🟣 OpenRouter (Gateway)</b></summary>

OpenRouter acts as a unified gateway to multiple AI providers with a single API key. This is useful when you want access to many models without managing separate accounts.

| Model | Provider | Use Case |
|-------|----------|----------|
| DeepSeek R1 | DeepSeek | Advanced reasoning |
| DeepSeek V3.1 Chat | DeepSeek | Fast chat |
| Qwen 3 235B | Alibaba | Largest open model |
| Qwen 3 32B/14B | Alibaba | Balanced options |
| Mistral Large | Mistral | Enterprise quality |
| Mistral Small | Mistral | Cost-effective |
| Codestral | Mistral | Code-focused |
| Grok 3 | xAI | Via gateway |
| Claude, GPT, Gemini | Various | Alternative access |
| Llama 3.3 70B | Meta | Open source |

**How it works:**
1. Get one API key from [openrouter.ai/keys](https://openrouter.ai/keys)
2. Select OpenRouter as your provider in settings
3. Choose any model from the dropdown — all accessible with the same key
4. OpenRouter routes your request to the appropriate provider

**Pricing:** Pay-per-use, often cheaper than direct API access for some models.

</details>

---

## 🛠️ Development
This section is only relevant to understand how the plugin is developed and how to contribute.

### Prerequisites

- Node.js 18+
- npm

### Quick Start

```bash
git clone https://github.com/Lvigentini/zotero-llm-summarizer.git
cd zotero-llm-summarizer
npm install
npm run build
```

### Project Structure

```
zotero-llm-summarizer/
├── 📄 bootstrap.ts       # Plugin lifecycle & menus
├── 📄 lib.ts             # Core LLM logic
├── 📁 client/
│   ├── prefs.xhtml       # Settings UI
│   ├── prefs-script.js   # Settings logic
│   ├── prefs.js          # Default values
│   └── icon.svg          # Plugin icon
├── 📁 docs/
│   └── ROADMAP.md        # Future plans
└── 📁 xpi/               # Built plugin
```

### Commands

| Command | Description |
|---------|-------------|
| `npm run build` | Build plugin |
| `npm run lint` | Check code |
| `npm run lint -- --fix` | Auto-fix issues |

---

## ❓ Troubleshooting

| Issue | Solution |
|-------|----------|
| Menu doesn't appear | Ensure item has child notes |
| API error | Check API key in Settings |
| Slow response | Try a faster model (Mini/Lite) |
| Wrong formatting | Check "Output Format" setting |

**Debug logs:** Help → Debug Output Logging

---

## 📜 License

MIT License — see [LICENSE](LICENSE)

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 🙏 Acknowledgments

- [generator-zotero-plugin](https://github.com/nickmcintyre/generator-zotero-plugin)
- [Zotero Plugin Template](https://github.com/windingwind/zotero-plugin-template)
- Zotero development community
- 🤖 [Claude](https://claude.ai) — AI pair programmer for code review and repository management

---

<p align="center">
  <b>Questions or issues?</b><br>
  <a href="https://github.com/Lvigentini/zotero-llm-summarizer/issues">Open an Issue</a>
</p>
