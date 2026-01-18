# Zotero LLM Summarizer

A Zotero 7 plugin that generates AI-powered summaries of research notes using multiple LLM providers.

## Features

- **Multi-Provider Support**: Configure and use multiple LLM providers simultaneously
  - Claude (Anthropic)
  - OpenAI (GPT-4.1)
  - Grok (xAI)
  - Google Gemini
  - Ollama (Local LLMs)
  - OpenRouter (access to DeepSeek, Qwen, Mistral, and more)

- **Smart Provider Selection**: Right-click context menu shows available providers with API keys configured

- **Fallback Chain**: Configure provider priority order with automatic fallback on errors

- **Drag-and-Drop Priority**: Easily reorder provider priority in settings

- **Research-Focused Prompt**: Built-in prompt optimized for academic research synthesis including:
  - Key findings and main arguments
  - Methodology assessment
  - Important concepts and definitions
  - Relevance and implications
  - Citation network analysis

- **Flexible Output**: Choose between Markdown or plain text formatting

- **Intelligent Note Naming**: Generated notes are prefixed with `[LLM-note]` and named `[LLM-note] Author_Year_Model_summary`

- **Easy Filtering**: All summary notes are automatically tagged with `LLM-note`, `AI`, `summary`, and the model name (e.g., `gpt-4.1`) for flexible filtering in Zotero's Tags pane

## Installation

1. Download the latest `.xpi` file from the [Releases](https://github.com/Lvigentini/zotero-llm-summarizer/releases) page
2. In Zotero, go to **Tools** → **Add-ons**
3. Click the gear icon and select **Install Add-on From File...**
4. Select the downloaded `.xpi` file
5. Restart Zotero when prompted

## Configuration

1. Go to **Edit** → **Settings** (Windows/Linux) or **Zotero** → **Settings** (macOS)
2. Click on **LLM Summarizer** in the sidebar
3. Configure your API keys for the providers you want to use:
   - **Claude**: Get your API key from [Anthropic Console](https://console.anthropic.com/)
   - **OpenAI**: Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
   - **Grok**: Get your API key from [xAI Console](https://console.x.ai/)
   - **Google Gemini**: Get your API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
   - **Ollama**: Install [Ollama](https://ollama.ai/) locally and type "enabled" in the field
   - **OpenRouter**: Get your API key from [OpenRouter](https://openrouter.ai/keys)

4. Select your preferred model for each provider
5. Drag providers in the **Provider Priority** section to set fallback order
6. Enable/disable **Auto-fallback** as needed

## Usage

1. Select an item in your Zotero library that has child notes attached
2. Right-click on the item
3. Choose **Summarize with AI** → Select a provider or use the default chain
4. Wait for the summary to be generated
5. A new note will be created as a child of the selected item

## Available Models

### Claude (Direct)
- Claude Sonnet 4.5 (Latest)
- Claude Opus 4.5
- Claude Haiku 4.5 (Fast)
- Claude Sonnet 4
- Claude Opus 4

### OpenAI (Direct)
- GPT-4.1 (Latest)
- GPT-4.1 Mini
- GPT-4.1 Nano (Fast)
- GPT-4o
- GPT-4o Mini

### Grok (xAI Direct)
- Grok 3 (Latest)
- Grok 3 Mini (Fast)
- Grok 4
- Grok 4 Fast

### Google Gemini (Direct)
- Gemini 2.0 Flash (Latest)
- Gemini 2.0 Flash Lite (Fast)
- Gemini 2.5 Flash Lite

### Ollama (Local)
Run LLMs locally on your machine:
- Llama 3.3 (Default)
- Llama 3.2
- Mistral
- Mixtral
- Qwen 2.5
- DeepSeek R1
- Phi-4
- Gemma 2
- Code Llama

### OpenRouter (Access to Many Providers)
- DeepSeek R1, V3.1 Chat, Chat
- Qwen 3 (235B, 32B, 14B)
- Mistral Large, Small 3.1, Codestral
- Grok 3, Grok 3 Mini
- Claude, GPT, Gemini, Llama via OpenRouter

## Development

### Prerequisites

- Node.js 18+
- npm or pnpm

### Setup

```bash
# Clone the repository
git clone https://github.com/Lvigentini/zotero-llm-summarizer.git
cd zotero-llm-summarizer

# Install dependencies
npm install

# Build the plugin
npm run build
```

### Project Structure

```
zotero-llm-summarizer/
├── bootstrap.ts          # Plugin lifecycle and context menu
├── lib.ts                # Core logic: LLM API calls, note handling
├── client/
│   ├── prefs.xhtml       # Preferences UI layout
│   ├── prefs-script.js   # Preferences UI logic
│   ├── prefs.js          # Default preference values
│   ├── manifest.json     # Plugin manifest
│   ├── icon.svg          # Plugin icon
│   ├── style.css         # Custom styles
│   └── locale/           # Localization files
├── build/                # Build output (git-ignored)
├── xpi/                  # Packaged plugin (git-ignored)
├── esbuild.js            # Build configuration
├── tsconfig.json         # TypeScript configuration
└── package.json          # Project configuration
```

### Build Commands

```bash
npm run build    # Full build with linting
npm run lint     # Run ESLint
npm run lint:fix # Fix linting issues
```

### Creating Releases

1. Update the version in `package.json`
2. Build the plugin: `npm run build`
3. Commit changes: `git add -A && git commit -m "Release vX.Y.Z"`
4. Create a tag: `git tag -a vX.Y.Z -m "Version X.Y.Z"`
5. Push: `git push && git push --tags`
6. Go to GitHub → Releases → "Draft a new release"
7. Select the tag, write release notes, and attach the XPI file from `xpi/` folder
   - Rename to `zotero-llm-summarizer-X.Y.Z.xpi` before uploading

### Testing

1. Build the plugin: `npm run build`
2. Install the XPI from `xpi/` folder into Zotero
3. To reload changes, disable and re-enable the plugin in Zotero's Add-ons manager

## Prompts and Customisation

### Default Prompt

The built-in prompt is designed for academic research synthesis. It instructs the LLM to act as a senior research scientist with strengths in big-picture thinking, pattern recognition, and citation network analysis. The default output structure includes:

1. **Key Findings and Main Arguments** — Central thesis, primary claims, empirical vs theoretical distinctions
2. **Methodology** — Research design, sample characteristics, validity concerns, generalisability
3. **Important Concepts and Definitions** — Key terminology and theoretical frameworks
4. **Relevance and Implications** — Significance for theory and practice, open questions
5. **Citation Network Analysis** — Foundational works, intellectual lineages, interdisciplinary bridges

The prompt emphasises epistemic honesty (hedged language like "suggests" rather than "proves"), synthesis over summary, and actionable insights.

### Custom Prompts

You can override the default prompt in **Settings → LLM Summarizer → Advanced**. Leave empty to use the built-in prompt.

**Tips for effective custom prompts:**

- **Be specific about output structure** — Tell the LLM exactly what sections or headings you want
- **Define the persona** — "You are a [role] skilled at [task]" helps set appropriate tone and expertise
- **Specify the audience** — "Write for graduate students" vs "Write for domain experts" yields different results
- **Include formatting instructions** — Request bullet points, numbered lists, tables, or specific markdown formatting
- **Set constraints** — Word limits, required sections, or things to avoid (e.g., "Do not include recommendations")

**Example custom prompts:**

```
Summarise these notes as a literature review paragraph suitable for a thesis chapter.
Focus on how the studies relate to each other and identify gaps in the research.
Use formal academic language and include in-text citations where authors are mentioned.
```

```
Create a structured summary with these exact sections:
- Research Question
- Key Finding (one sentence)
- Method (brief)
- Limitations
- How this relates to [your specific research topic]
```

```
You are a research assistant helping prepare for a journal club presentation.
Summarise the key points that would generate discussion, highlight methodological
choices that could be debated, and suggest 3 discussion questions for the group.
```

## Error Handling

- Errors are logged to Zotero's debug output (Help → Debug Output Logging)
- When fallback is enabled, the plugin will automatically try the next provider in the chain if an error occurs
- The success message shows which provider and model was actually used

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Acknowledgments

- Built using the [generator-zotero-plugin](https://github.com/nickmcintyre/generator-zotero-plugin) scaffold
- Inspired by the [Zotero Plugin Template](https://github.com/windingwind/zotero-plugin-template)
- Thanks to the Zotero development community

## Support

If you encounter issues or have feature requests, please [open an issue](https://github.com/Lvigentini/zotero-llm-summarizer/issues) on GitHub.
