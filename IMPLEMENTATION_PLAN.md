# Implementation Plan - Zotero LLM Summarizer

## Phase 1: Foundation (Context Menu + Note Extraction)

### 1.1 Update Preferences Schema
**File:** `client/prefs.js`

Add default preferences:
```javascript
pref("extensions.zotero-llm-summarizer.provider", "claude");
pref("extensions.zotero-llm-summarizer.apiKey", "");
pref("extensions.zotero-llm-summarizer.model", "claude-3-sonnet-20240229");
pref("extensions.zotero-llm-summarizer.outputFormat", "markdown");
pref("extensions.zotero-llm-summarizer.customPrompt", "");
pref("extensions.zotero-llm-summarizer.customEndpoint", "");
```

### 1.2 Add Context Menu Item
**File:** `bootstrap.ts`

Replace the View menu item with an item context menu entry:
- Hook into `onMainWindowLoad()`
- Register context menu item via DOM manipulation
- Add event listener for showing/hiding based on selection

Key code pattern:
```typescript
const menuitem = doc.createXULElement('menuitem')
menuitem.id = 'llm-summarizer-menu'
menuitem.setAttribute('data-l10n-id', 'summarize-with-ai')
menuitem.addEventListener('command', () => Zotero.LlmSummarizer.summarizeSelected())
doc.getElementById('zotero-itemmenu').appendChild(menuitem)
```

### 1.3 Note Extraction Logic
**File:** `lib.ts`

Implement in `Zotero.LlmSummarizer`:
```typescript
async getNotesContent(item) {
  const noteIds = item.getNotes()
  if (!noteIds.length) return null

  let content = []
  for (const noteId of noteIds) {
    const note = await Zotero.Items.getAsync(noteId)
    const html = note.getNote()
    const text = this.stripHtml(html)
    content.push(text)
  }
  return content.join('\n\n---\n\n')
}

stripHtml(html) {
  // Use DOMParser to extract text
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  return doc.body.textContent || ''
}
```

### 1.4 Update Localization
**File:** `client/locale/en-US/zotero-llm-summarizer.ftl`

```ftl
summarize-with-ai =
    .label = Summarize with AI

no-notes-warning = No notes found for this item
summarizing = Generating AI summary...
summary-complete = Summary created successfully
summary-error = Error generating summary: { $error }
api-key-missing = Please configure your API key in preferences
```

---

## Phase 2: LLM Integration

### 2.1 Create LLM Provider Interface
**File:** `src/llm/base.ts` (or inline in lib.ts for simplicity)

```typescript
interface LLMProvider {
  name: string
  generateSummary(content: string, options: SummaryOptions): Promise<string>
  testConnection(): Promise<boolean>
}

interface SummaryOptions {
  model: string
  customPrompt?: string
}
```

### 2.2 Implement Claude Provider
**File:** `src/llm/claude.ts` (or inline)

```typescript
async generateSummary(content, options) {
  const apiKey = Zotero.Prefs.get('extensions.zotero-llm-summarizer.apiKey')
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: options.model,
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `${options.customPrompt || DEFAULT_PROMPT}\n\n${content}`
      }]
    })
  })
  const data = await response.json()
  return data.content[0].text
}
```

### 2.3 Implement OpenAI Provider
Similar structure, different endpoint and headers:
- Endpoint: `https://api.openai.com/v1/chat/completions`
- Auth: `Authorization: Bearer ${apiKey}`

### 2.4 Implement Gemini Provider
- Endpoint: `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`
- Different request body structure

### 2.5 Implement OpenRouter Provider
- Same as OpenAI format
- Endpoint: `https://openrouter.ai/api/v1/chat/completions`
- Additional header: `HTTP-Referer` and `X-Title`

---

## Phase 3: Preferences UI

### 3.1 Create Preferences Pane
**File:** `client/prefs.xhtml`

```xhtml
<?xml version="1.0"?>
<vbox xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul">
  <groupbox>
    <label value="LLM Provider"/>
    <radiogroup preference="extensions.zotero-llm-summarizer.provider">
      <radio value="claude" label="Claude (Anthropic)"/>
      <radio value="openai" label="OpenAI"/>
      <radio value="gemini" label="Gemini (Google)"/>
      <radio value="openrouter" label="OpenRouter"/>
    </radiogroup>
  </groupbox>

  <groupbox>
    <label value="API Key"/>
    <textbox type="password" preference="extensions.zotero-llm-summarizer.apiKey"/>
    <button label="Test Connection" oncommand="testConnection()"/>
  </groupbox>

  <groupbox>
    <label value="Model"/>
    <menulist preference="extensions.zotero-llm-summarizer.model">
      <!-- Populated dynamically based on provider -->
    </menulist>
  </groupbox>

  <groupbox>
    <label value="Output Format"/>
    <radiogroup preference="extensions.zotero-llm-summarizer.outputFormat">
      <radio value="markdown" label="Markdown"/>
      <radio value="plain" label="Plain Text"/>
    </radiogroup>
  </groupbox>
</vbox>
```

### 3.2 Register Preferences Pane
**File:** `bootstrap.ts` (in startup)

```typescript
Zotero.PreferencePanes.register({
  pluginID: 'zotero-llm-summarizer@cogentixai.com',
  src: rootURI + 'prefs.xhtml',
  label: 'LLM Summarizer',
  image: rootURI + 'icon.png'
})
```

---

## Phase 4: Summary Output

### 4.1 Create Summary Note
**File:** `lib.ts`

```typescript
async createSummaryNote(parentItem, summary, provider, model) {
  const note = new Zotero.Item('note')
  note.parentItemID = parentItem.id

  const format = Zotero.Prefs.get('extensions.zotero-llm-summarizer.outputFormat')
  const date = new Date().toISOString().split('T')[0]

  let content = `<h1>AI Summary - ${date}</h1>\n`
  if (format === 'markdown') {
    content += `<pre>${summary}</pre>`
  } else {
    content += `<p>${summary.replace(/\n/g, '</p><p>')}</p>`
  }
  content += `<hr/><p><em>Generated by ${provider} (${model})</em></p>`

  note.setNote(content)
  await note.saveTx()
  return note
}
```

### 4.2 Main Orchestration
**File:** `lib.ts`

```typescript
async summarizeSelected() {
  const zp = Zotero.getActiveZoteroPane()
  const items = zp.getSelectedItems()

  if (items.length !== 1) {
    zp.displayAlert('Please select exactly one item')
    return
  }

  const item = items[0]
  const content = await this.getNotesContent(item)

  if (!content) {
    zp.displayAlert('No notes found for this item')
    return
  }

  const apiKey = Zotero.Prefs.get('extensions.zotero-llm-summarizer.apiKey')
  if (!apiKey) {
    zp.displayAlert('Please configure your API key in preferences')
    return
  }

  try {
    // Show progress
    Zotero.showZoteroPaneProgressMeter('Generating summary...')

    const provider = this.getProvider()
    const summary = await provider.generateSummary(content, {
      model: Zotero.Prefs.get('extensions.zotero-llm-summarizer.model'),
      customPrompt: Zotero.Prefs.get('extensions.zotero-llm-summarizer.customPrompt')
    })

    await this.createSummaryNote(item, summary, provider.name,
      Zotero.Prefs.get('extensions.zotero-llm-summarizer.model'))

    Zotero.hideZoteroPaneOverlay()
  } catch (e) {
    Zotero.hideZoteroPaneOverlay()
    zp.displayAlert(`Error: ${e.message}`)
  }
}
```

---

## Implementation Order

| Step | Task | Files | Complexity |
|------|------|-------|------------|
| 1 | Update prefs.js with all settings | `client/prefs.js` | Low |
| 2 | Add context menu to item menu | `bootstrap.ts` | Medium |
| 3 | Implement note extraction | `lib.ts` | Low |
| 4 | Add localization strings | `*.ftl` | Low |
| 5 | Implement Claude provider | `lib.ts` | Medium |
| 6 | Implement summary note creation | `lib.ts` | Low |
| 7 | Wire up orchestration | `lib.ts` | Medium |
| 8 | Create preferences UI | `client/prefs.xhtml` | Medium |
| 9 | Register preferences pane | `bootstrap.ts` | Low |
| 10 | Add remaining providers | `lib.ts` | Medium |
| 11 | Error handling & edge cases | All | Medium |
| 12 | Testing & polish | - | Medium |

---

## Testing Checklist

- [ ] Plugin loads without errors
- [ ] Context menu appears on right-click
- [ ] Menu disabled when no notes present
- [ ] Preferences pane opens and saves values
- [ ] API key test works for each provider
- [ ] Summary generates correctly
- [ ] Summary note appears as child of item
- [ ] Error messages display appropriately
- [ ] Plugin unloads cleanly (no memory leaks)

---

## Build & Test Commands

```bash
# Build the plugin
npm run build

# Output: build/zotero-llm-summarizer-0.0.1.xpi

# Install in Zotero 7:
# Tools > Add-ons > Install Add-on From File
```

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Zotero API changes | Pin to Zotero 7.0.x, monitor forums |
| LLM API rate limits | Add retry logic with exponential backoff |
| Large note content | Truncate to model context limits |
| API key security | Use Zotero's built-in prefs (not exported) |
