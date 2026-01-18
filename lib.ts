/* eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument */
declare const Zotero: any

const PREF_PREFIX = 'extensions.zotero-llm-summarizer.'

const DEFAULT_PROMPT = `You are a senior research scientist skilled at synthesizing scholarly work and extracting meaningful insights. Your particular strength is 'big picture' thinking—drawing connections across papers, uncovering patterns, and tracing how ideas propagate through citation networks. Your typical task is to analyze research papers, create research notes, synthesize findings across multiple sources, identify patterns in academic literature, or extract key insights from scholarly work. This includes tasks like literature reviews, research summaries, identifying citation networks, and connecting ideas across disciplines.

## Core Capabilities
- Critical Analysis: Distinguish strong from weak evidence; identify methodological strengths and limitations
- Pattern Recognition: Identify thematic connections and theoretical threads spanning multiple papers
- Citation Network Analysis: Trace intellectual influence and how ideas build upon each other
- Interdisciplinary Integration: Recognize when concepts from one field illuminate findings in another

## Research Note Structure
1. Key Findings and Main Arguments
   Central thesis, primary claims, surprising findings. Distinguish empirical findings from theoretical arguments.
2. Methodology
   Research design, sample characteristics, analytical approaches, validity concerns, generalizability limitations.
3. Important Concepts and Definitions
   Key terminology, theoretical frameworks, conceptual innovations.
4. Relevance and Implications
   Significance for theory and practice, practical applications, open questions for future research.
5. Citation Network Analysis
   Foundational works, intellectual lineages, citation clusters, interdisciplinary bridges, notable gaps.

## Working Principles
- Epistemic Honesty: Use hedged language—"suggests" not "proves," "points to" not "demonstrates"
- Synthesis Over Summary: Articulate how papers relate and what collective picture emerges
- Balanced Critique: Acknowledge strengths and limitations fairly
- Actionable Insights: End with concrete observations—gaps to address, methods to adopt, connections to explore

## Output Format
Provide a clear, structured summary that would help a researcher quickly understand the content.
Use clear headings, extended points for discrete findings, numbered lists for sequential arguments, brief direct quotes for pivotal formulations, and tables when comparing multiple papers. Always include a synthesis section drawing together the big picture.`

// LLM Provider configurations
const PROVIDERS: Record<string, { name: string, icon: string, endpoint: string, models: { id: string, name: string }[] }> = {
  claude: {
    name: 'Claude (Anthropic)',
    icon: '🟠',
    endpoint: 'https://api.anthropic.com/v1/messages',
    models: [
      { id: 'claude-sonnet-4-5-20241022', name: 'Claude Sonnet 4.5 (Latest)' },
      { id: 'claude-opus-4-5-20241022', name: 'Claude Opus 4.5' },
      { id: 'claude-haiku-4-5-20241022', name: 'Claude Haiku 4.5 (Fast)' },
      { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4' },
      { id: 'claude-opus-4-20250514', name: 'Claude Opus 4' },
    ],
  },
  openai: {
    name: 'OpenAI',
    icon: '🟢',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    models: [
      { id: 'gpt-4.1', name: 'GPT-4.1 (Latest)' },
      { id: 'gpt-4.1-mini', name: 'GPT-4.1 Mini' },
      { id: 'gpt-4.1-nano', name: 'GPT-4.1 Nano (Fast)' },
      { id: 'gpt-4o', name: 'GPT-4o' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
    ],
  },
  grok: {
    name: 'Grok (xAI)',
    icon: '⚡',
    endpoint: 'https://api.x.ai/v1/chat/completions',
    models: [
      { id: 'grok-3', name: 'Grok 3 (Latest)' },
      { id: 'grok-3-mini', name: 'Grok 3 Mini (Fast)' },
      { id: 'grok-4', name: 'Grok 4' },
      { id: 'grok-4-fast', name: 'Grok 4 Fast' },
    ],
  },
  gemini: {
    name: 'Gemini (Google)',
    icon: '🔵',
    endpoint: 'https://generativelanguage.googleapis.com/v1/models/',
    models: [
      { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash (Latest)' },
      { id: 'gemini-2.0-flash-lite', name: 'Gemini 2.0 Flash Lite (Fast)' },
      { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite' },
    ],
  },
  ollama: {
    name: 'Ollama (Local)',
    icon: '🦙',
    endpoint: 'http://localhost:11434/v1/chat/completions',
    models: [
      { id: 'llama3.3', name: 'Llama 3.3 (Default)' },
      { id: 'llama3.2', name: 'Llama 3.2' },
      { id: 'mistral', name: 'Mistral' },
      { id: 'mixtral', name: 'Mixtral' },
      { id: 'qwen2.5', name: 'Qwen 2.5' },
      { id: 'deepseek-r1', name: 'DeepSeek R1' },
      { id: 'phi4', name: 'Phi-4' },
      { id: 'gemma2', name: 'Gemma 2' },
      { id: 'codellama', name: 'Code Llama' },
    ],
  },
  openrouter: {
    name: 'OpenRouter',
    icon: '🟣',
    endpoint: 'https://openrouter.ai/api/v1/chat/completions',
    models: [
      // DeepSeek
      { id: 'deepseek/deepseek-r1', name: 'DeepSeek R1 (Reasoning)' },
      { id: 'deepseek/deepseek-chat-v3.1', name: 'DeepSeek V3.1 Chat' },
      { id: 'deepseek/deepseek-chat', name: 'DeepSeek Chat' },
      // Qwen
      { id: 'qwen/qwen3-235b-a22b', name: 'Qwen 3 235B' },
      { id: 'qwen/qwen3-32b', name: 'Qwen 3 32B' },
      { id: 'qwen/qwen3-14b', name: 'Qwen 3 14B (Fast)' },
      // Mistral
      { id: 'mistralai/mistral-large-2411', name: 'Mistral Large' },
      { id: 'mistralai/mistral-small-3.1-24b-instruct', name: 'Mistral Small 3.1' },
      { id: 'mistralai/codestral-2508', name: 'Codestral' },
      // Grok via OpenRouter
      { id: 'x-ai/grok-3', name: 'Grok 3' },
      { id: 'x-ai/grok-3-mini', name: 'Grok 3 Mini (Fast)' },
      // Claude via OpenRouter
      { id: 'anthropic/claude-sonnet-4', name: 'Claude Sonnet 4' },
      { id: 'anthropic/claude-haiku-4', name: 'Claude Haiku 4 (Fast)' },
      // OpenAI via OpenRouter
      { id: 'openai/gpt-4.1', name: 'GPT-4.1' },
      { id: 'openai/gpt-4.1-mini', name: 'GPT-4.1 Mini' },
      // Google via OpenRouter
      { id: 'google/gemini-2.0-flash-001', name: 'Gemini 2.0 Flash' },
      // Llama
      { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Llama 3.3 70B' },
    ],
  },
}

Zotero.LlmSummarizer = new class {
  // Store last used provider and model for UI indicator
  lastUsedProvider: string | null = null
  lastUsedModel: string | null = null

  // =====================
  // Utility Methods
  // =====================

  log(msg: string) {
    Zotero.debug(`LLM Summarizer: ${msg}`)
  }

  logError(msg: string, error?: any) {
    const errorMsg = `LLM Summarizer ERROR: ${msg}${error ? ` - ${error.message || error}` : ''}`
    Zotero.debug(errorMsg)
    // Also log to Zotero's error reporter
    Zotero.logError(errorMsg)
  }

  getPref(key: string) {
    return Zotero.Prefs.get(PREF_PREFIX + key, true)
  }

  setPref(key: string, value: any) {
    Zotero.Prefs.set(PREF_PREFIX + key, value, true)
  }

  // =====================
  // Provider Management
  // =====================

  getProviderChain(): string[] {
    const chainStr = (this.getPref('providerChain') || 'claude,openai,gemini,openrouter') as string
    return chainStr.split(',').filter(p => PROVIDERS[p])
  }

  getProviderApiKey(provider: string): string {
    return (this.getPref(`apiKey.${provider}`) || '') as string
  }

  getProviderModel(provider: string): string {
    const savedModel = this.getPref(`model.${provider}`) as string
    if (savedModel) return savedModel
    // Return first model as default
    const providerConfig = PROVIDERS[provider]
    return providerConfig?.models[0]?.id || ''
  }

  getProviderEndpoint(provider: string): string {
    const customEndpoint = this.getPref(`endpoint.${provider}`) as string
    if (customEndpoint) return customEndpoint
    return PROVIDERS[provider]?.endpoint || ''
  }

  getAvailableProviders(): string[] {
    return this.getProviderChain().filter(p => {
      // Ollama doesn't need an API key - check if endpoint is configured (use "enabled" as placeholder)
      if (p === 'ollama') {
        const ollamaKey = this.getProviderApiKey(p)
        // User can put anything in the key field to enable Ollama (e.g., "enabled" or "local")
        return !!ollamaKey
      }
      return !!this.getProviderApiKey(p)
    })
  }

  getFirstAvailableProvider(): string | null {
    const available = this.getAvailableProviders()
    return available.length > 0 ? available[0] : null
  }

  isFallbackEnabled(): boolean {
    return this.getPref('enableFallback') !== false
  }

  // =====================
  // Note Extraction
  // =====================

  stripHtml(html: string): string {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    return doc.body?.textContent?.trim() || ''
  }

  async getNotesContent(item: any): Promise<string | null> {
    const noteIds = item.getNotes()
    this.log(`Found ${noteIds.length} notes for item ${item.id}`)

    if (!noteIds.length) {
      return null
    }

    const contents: string[] = []

    for (const noteId of noteIds) {
      try {
        const note = await Zotero.Items.getAsync(noteId)
        if (note) {
          const html = note.getNote()
          const text = this.stripHtml(html)
          if (text) {
            contents.push(text)
          }
        }
      }
      catch (e) {
        this.log(`Error getting note ${noteId}: ${e}`)
      }
    }

    if (!contents.length) {
      return null
    }

    return contents.join('\n\n---\n\n')
  }

  // =====================
  // LLM API Calls
  // =====================

  async callClaude(content: string, apiKey: string, model: string, endpoint: string, prompt: string): Promise<string> {
    this.log(`Calling Claude API with model ${model}`)

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 4096,
        messages: [{
          role: 'user',
          content: `${prompt}\n\n---\n\nNotes to summarize:\n\n${content}`,
        }],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Claude API error (${response.status}): ${errorText}`)
    }

    const data = await response.json()
    return data.content[0].text
  }

  async callOpenAI(content: string, apiKey: string, model: string, endpoint: string, prompt: string): Promise<string> {
    this.log(`Calling OpenAI API with model ${model}`)

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        max_tokens: 4096,
        messages: [
          {
            role: 'system',
            content: prompt,
          },
          {
            role: 'user',
            content: `Notes to summarize:\n\n${content}`,
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`OpenAI API error (${response.status}): ${errorText}`)
    }

    const data = await response.json()
    return data.choices[0].message.content
  }

  async callGemini(content: string, apiKey: string, model: string, baseEndpoint: string, prompt: string): Promise<string> {
    const endpoint = `${baseEndpoint}${model}:generateContent?key=${apiKey}`
    this.log(`Calling Gemini API with model ${model}`)

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${prompt}\n\n---\n\nNotes to summarize:\n\n${content}`,
          }],
        }],
        generationConfig: {
          maxOutputTokens: 4096,
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Gemini API error (${response.status}): ${errorText}`)
    }

    const data = await response.json()
    return data.candidates[0].content.parts[0].text
  }

  async callOpenRouter(content: string, apiKey: string, model: string, endpoint: string, prompt: string): Promise<string> {
    this.log(`Calling OpenRouter API with model ${model}`)

    // Build headers explicitly - Zotero's fetch may handle Authorization differently
    const headers = new Headers()
    headers.set('Content-Type', 'application/json')
    headers.set('Authorization', `Bearer ${apiKey}`)
    headers.set('HTTP-Referer', 'https://github.com/lvigentini/zotero-llm-summarizer')
    headers.set('X-Title', 'Zotero LLM Summarizer')

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model,
        max_tokens: 4096,
        messages: [
          {
            role: 'system',
            content: prompt,
          },
          {
            role: 'user',
            content: `Notes to summarize:\n\n${content}`,
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`OpenRouter API error (${response.status}): ${errorText}`)
    }

    const data = await response.json()
    return data.choices[0].message.content
  }

  async callGrok(content: string, apiKey: string, model: string, endpoint: string, prompt: string): Promise<string> {
    this.log(`Calling Grok (xAI) API with model ${model}`)

    // Grok uses OpenAI-compatible API format
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        max_tokens: 4096,
        messages: [
          {
            role: 'system',
            content: prompt,
          },
          {
            role: 'user',
            content: `Notes to summarize:\n\n${content}`,
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Grok API error (${response.status}): ${errorText}`)
    }

    const data = await response.json()
    return data.choices[0].message.content
  }

  async callOllama(content: string, _apiKey: string, model: string, endpoint: string, prompt: string): Promise<string> {
    this.log(`Calling Ollama (local) with model ${model}`)

    // Ollama uses OpenAI-compatible API format, no auth required
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: prompt,
          },
          {
            role: 'user',
            content: `Notes to summarize:\n\n${content}`,
          },
        ],
        stream: false,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Ollama error (${response.status}): ${errorText}`)
    }

    const data = await response.json()
    return data.choices[0].message.content
  }

  async callProvider(provider: string, content: string, prompt: string): Promise<string> {
    const apiKey = this.getProviderApiKey(provider)
    const model = this.getProviderModel(provider)
    const endpoint = this.getProviderEndpoint(provider)

    // Ollama doesn't require API key, others do
    if (!apiKey && provider !== 'ollama') {
      throw new Error(`No API key configured for ${provider}`)
    }

    // Store for UI indicator
    this.lastUsedProvider = provider
    this.lastUsedModel = model

    switch (provider) {
      case 'claude':
        return this.callClaude(content, apiKey, model, endpoint, prompt)
      case 'openai':
        return this.callOpenAI(content, apiKey, model, endpoint, prompt)
      case 'grok':
        return this.callGrok(content, apiKey, model, endpoint, prompt)
      case 'gemini':
        return this.callGemini(content, apiKey, model, endpoint, prompt)
      case 'ollama':
        return this.callOllama(content, apiKey, model, endpoint, prompt)
      case 'openrouter':
        return this.callOpenRouter(content, apiKey, model, endpoint, prompt)
      default:
        throw new Error(`Unknown provider: ${provider}`)
    }
  }

  async generateSummary(content: string, specificProvider?: string): Promise<string> {
    const customPrompt = this.getPref('customPrompt') as string
    const prompt = customPrompt || DEFAULT_PROMPT
    const enableFallback = this.isFallbackEnabled()

    // If specific provider requested, use only that
    if (specificProvider) {
      this.log(`Generating summary with specific provider: ${specificProvider}`)
      return this.callProvider(specificProvider, content, prompt)
    }

    // Otherwise, use chain with optional fallback
    const chain = this.getAvailableProviders()
    if (chain.length === 0) {
      throw new Error('No providers configured. Please add an API key in Preferences > LLM Summarizer.')
    }

    const errors: string[] = []

    for (let i = 0; i < chain.length; i++) {
      const provider = chain[i]
      const model = this.getProviderModel(provider)

      this.log(`Attempting summary with ${provider} (${model})${i > 0 ? ' [fallback]' : ''}`)

      try {
        return await this.callProvider(provider, content, prompt)
      }
      catch (e: any) {
        const errorMsg = `${provider}: ${e.message}`
        errors.push(errorMsg)
        this.logError(`Provider ${provider} failed`, e)

        // If fallback disabled or last provider, throw
        if (!enableFallback || i === chain.length - 1) {
          if (errors.length > 1) {
            throw new Error(`All providers failed:\n${errors.join('\n')}`)
          }
          throw e
        }

        this.log('Falling back to next provider...')
      }
    }

    throw new Error('No providers available')
  }

  // =====================
  // Test Provider
  // =====================

  async testProvider(provider: string): Promise<{ success: boolean, message: string }> {
    const apiKey = this.getProviderApiKey(provider)
    if (!apiKey) {
      return { success: false, message: 'No API key configured' }
    }

    try {
      const prompt = 'Reply with exactly: Connection successful'
      await this.callProvider(provider, 'Test connection.', prompt)
      return { success: true, message: 'Connection successful!' }
    }
    catch (e: any) {
      this.logError(`Test failed for ${provider}`, e)
      return { success: false, message: e.message || 'Connection failed' }
    }
  }

  // =====================
  // Summary Note Creation
  // =====================

  buildNoteTitle(item: any, model: string): string {
    // Get first author's last name
    const creators = item.getCreators()
    let author = 'Unknown'
    if (creators && creators.length > 0) {
      const firstCreator = creators[0]
      author = firstCreator.lastName || firstCreator.name || 'Unknown'
      author = author.replace(/[^a-zA-Z0-9]/g, '')
    }

    // Get year from date
    let year = 'nd'
    const dateField = item.getField('date')
    if (dateField) {
      const yearMatch = dateField.match(/\d{4}/)
      if (yearMatch) {
        year = yearMatch[0]
      }
    }

    // Get short model name
    const shortModel = model
      .replace(/^(anthropic\/|openai\/|google\/|meta-llama\/)/, '')
      .replace(/-\d{8}$/, '')
      .replace(/[^a-zA-Z0-9.-]/g, '')

    return `${author}_${year}_${shortModel}_summary`
  }

  async createSummaryNote(parentItem: any, summary: string, provider: string, model: string): Promise<any> {
    const providerConfig = PROVIDERS[provider]
    const outputFormat = this.getPref('outputFormat') || 'markdown'
    const date = new Date().toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })

    const noteTitle = this.buildNoteTitle(parentItem, model)
    const note = new Zotero.Item('note')
    note.parentItemID = parentItem.id
    note.libraryID = parentItem.libraryID

    let noteContent: string

    if (outputFormat === 'markdown') {
      noteContent = `<h1>${noteTitle}</h1>
<div class="llm-summary">
${this.markdownToHtml(summary)}
</div>
<hr/>
<p><em>Generated by ${providerConfig?.name || provider} (${model}) on ${date}</em></p>`
    }
    else {
      const paragraphs = summary.split('\n\n').map(p => `<p>${p.replace(/\n/g, '<br/>')}</p>`).join('')
      noteContent = `<h1>${noteTitle}</h1>
${paragraphs}
<hr/>
<p><em>Generated by ${providerConfig?.name || provider} (${model}) on ${date}</em></p>`
    }

    note.setNote(noteContent)
    await note.saveTx()

    this.log(`Created summary note ${note.id} for item ${parentItem.id}`)
    return note
  }

  markdownToHtml(markdown: string): string {
    let html = markdown
      .replace(/^### (.*$)/gm, '<h4>$1</h4>')
      .replace(/^## (.*$)/gm, '<h3>$1</h3>')
      .replace(/^# (.*$)/gm, '<h2>$1</h2>')
      .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^\s*[-*]\s+(.*$)/gm, '<li>$1</li>')
      .replace(/^\s*\d+\.\s+(.*$)/gm, '<li>$1</li>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br/>')

    html = `<p>${html}</p>`
    html = html.replace(/(<li>.*?<\/li>)+/gs, '<ul>$&</ul>')

    return html
  }

  // =====================
  // Main Orchestration
  // =====================

  async summarizeSelected(specificProvider?: string) {
    const zp = Zotero.getActiveZoteroPane()
    const items = zp.getSelectedItems()

    if (items.length !== 1) {
      this.showAlert('Please select exactly one item to summarize.')
      return
    }

    const item = items[0]

    if (item.isNote() || item.isAttachment()) {
      this.showAlert('Please select a regular item (not a note or attachment).')
      return
    }

    // Check for at least one API key
    const availableProviders = this.getAvailableProviders()
    if (availableProviders.length === 0) {
      this.showAlert('Please configure at least one API key in Zotero Preferences > LLM Summarizer.')
      return
    }

    // If specific provider requested, verify it has a key
    if (specificProvider && !this.getProviderApiKey(specificProvider)) {
      this.showAlert(`No API key configured for ${PROVIDERS[specificProvider]?.name || specificProvider}.`)
      return
    }

    const content = await this.getNotesContent(item)
    if (!content) {
      this.showAlert('No notes found for this item. Please add notes before summarizing.')
      return
    }

    const providerToUse = specificProvider || this.getFirstAvailableProvider() || 'claude'
    const providerName = PROVIDERS[providerToUse]?.name || providerToUse
    this.showProgress(`Generating summary with ${providerName}...`)

    try {
      const summary = await this.generateSummary(content, specificProvider)
      const usedProvider = this.lastUsedProvider || providerToUse
      const usedModel = this.lastUsedModel || this.getProviderModel(usedProvider)

      await this.createSummaryNote(item, summary, usedProvider, usedModel)

      this.hideProgress()
      this.showAlert(`Summary created with ${PROVIDERS[usedProvider]?.name || usedProvider} (${usedModel})!`, 'success')
    }
    catch (e: any) {
      this.hideProgress()
      this.logError('Error generating summary', e)
      this.showAlert(`Error generating summary: ${e.message}`)
    }
  }

  // =====================
  // UI Helpers
  // =====================

  showAlert(message: string, type = 'error') {
    if (type === 'success') {
      Zotero.alert(null, 'LLM Summarizer', message)
    }
    else {
      Zotero.alert(null, 'LLM Summarizer - Error', message)
    }
  }

  showProgress(message: string) {
    try {
      Zotero.showZoteroPaneProgressMeter(message)
    }
    catch (e) {
      this.log(`Progress: ${message}`)
    }
  }

  hideProgress() {
    try {
      Zotero.hideZoteroPaneOverlays()
    }
    catch (e) {
      // Ignore
    }
  }

  // =====================
  // Provider Metadata (for prefs UI and context menu)
  // =====================

  getProviders() {
    return PROVIDERS
  }

  getModelsForProvider(providerId: string) {
    const provider = PROVIDERS[providerId]
    return provider ? provider.models : []
  }
}
