/* global Zotero, document */

var LlmSummarizerPrefs = {
  PREF_PREFIX: 'extensions.zotero-llm-summarizer.',

  providers: {
    claude: { name: 'Claude (Anthropic)', icon: '🟠' },
    openai: { name: 'OpenAI', icon: '🟢' },
    grok: { name: 'Grok (xAI)', icon: '⚡' },
    gemini: { name: 'Gemini (Google)', icon: '🔵' },
    ollama: { name: 'Ollama (Local)', icon: '🦙' },
    openrouter: { name: 'OpenRouter', icon: '🟣' }
  },

  providerList: ['claude', 'openai', 'grok', 'gemini', 'ollama', 'openrouter'],

  models: {
    claude: [
      { id: 'claude-sonnet-4-5-20241022', name: 'Claude Sonnet 4.5 (Latest)' },
      { id: 'claude-opus-4-5-20241022', name: 'Claude Opus 4.5' },
      { id: 'claude-haiku-4-5-20241022', name: 'Claude Haiku 4.5 (Fast)' },
      { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4' },
      { id: 'claude-opus-4-20250514', name: 'Claude Opus 4' }
    ],
    openai: [
      { id: 'gpt-4.1', name: 'GPT-4.1 (Latest)' },
      { id: 'gpt-4.1-mini', name: 'GPT-4.1 Mini' },
      { id: 'gpt-4.1-nano', name: 'GPT-4.1 Nano (Fast)' },
      { id: 'gpt-4o', name: 'GPT-4o' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini' }
    ],
    grok: [
      { id: 'grok-3', name: 'Grok 3 (Latest)' },
      { id: 'grok-3-mini', name: 'Grok 3 Mini (Fast)' },
      { id: 'grok-4', name: 'Grok 4' },
      { id: 'grok-4-fast', name: 'Grok 4 Fast' }
    ],
    gemini: [
      { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash (Latest)' },
      { id: 'gemini-2.0-flash-lite', name: 'Gemini 2.0 Flash Lite (Fast)' },
      { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite' }
    ],
    ollama: [
      { id: 'llama3.3', name: 'Llama 3.3 (Default)' },
      { id: 'llama3.2', name: 'Llama 3.2' },
      { id: 'mistral', name: 'Mistral' },
      { id: 'mixtral', name: 'Mixtral' },
      { id: 'qwen2.5', name: 'Qwen 2.5' },
      { id: 'deepseek-r1', name: 'DeepSeek R1' },
      { id: 'phi4', name: 'Phi-4' },
      { id: 'gemma2', name: 'Gemma 2' },
      { id: 'codellama', name: 'Code Llama' }
    ],
    openrouter: [
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
      { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Llama 3.3 70B' }
    ]
  },

  init: function() {
    Zotero.debug('LLM Summarizer Prefs: initializing...');

    this.loadAllPreferences();
    this.setupAllEventListeners();
    this.populateAllModelDropdowns();
    this.buildProviderChainList();
    this.updateProviderStatuses();

    Zotero.debug('LLM Summarizer Prefs: initialized');
  },

  // ==================== Preference Helpers ====================

  getPref: function(key) {
    return Zotero.Prefs.get(this.PREF_PREFIX + key, true);
  },

  setPref: function(key, value) {
    Zotero.Prefs.set(this.PREF_PREFIX + key, value, true);
  },

  // ==================== Load Preferences ====================

  loadAllPreferences: function() {
    // Load API keys
    this.providerList.forEach(provider => {
      const input = document.getElementById('apikey-' + provider);
      if (input) {
        input.value = this.getPref('apiKey.' + provider) || '';
      }
    });

    // Load fallback setting
    const fallbackCheckbox = document.getElementById('enable-fallback');
    if (fallbackCheckbox) {
      fallbackCheckbox.checked = this.getPref('enableFallback') !== false;
    }

    // Load output format
    const outputFormat = this.getPref('outputFormat') || 'markdown';
    const outputRadio = document.getElementById('output-format');
    if (outputRadio) {
      outputRadio.value = outputFormat;
    }

    // Load custom prompt
    const customPrompt = document.getElementById('custom-prompt');
    if (customPrompt) {
      customPrompt.value = this.getPref('customPrompt') || '';
    }
  },

  // ==================== Event Listeners ====================

  setupAllEventListeners: function() {
    // API key inputs
    this.providerList.forEach(provider => {
      const input = document.getElementById('apikey-' + provider);
      if (input) {
        input.addEventListener('change', () => {
          this.setPref('apiKey.' + provider, input.value);
          this.updateProviderStatuses();
        });
      }

      // Model dropdowns
      const modelList = document.getElementById('model-' + provider);
      if (modelList) {
        modelList.addEventListener('command', () => {
          this.setPref('model.' + provider, modelList.value);
        });
      }
    });

    // Output format
    const outputRadio = document.getElementById('output-format');
    if (outputRadio) {
      outputRadio.addEventListener('command', () => {
        this.setPref('outputFormat', outputRadio.value);
      });
    }

    // Custom prompt
    const customPrompt = document.getElementById('custom-prompt');
    if (customPrompt) {
      customPrompt.addEventListener('change', () => {
        this.setPref('customPrompt', customPrompt.value);
      });
    }
  },

  // ==================== Model Dropdowns ====================

  populateAllModelDropdowns: function() {
    this.providerList.forEach(provider => {
      this.populateModelDropdown(provider);
    });
  },

  populateModelDropdown: function(provider) {
    const popup = document.getElementById('model-' + provider + '-popup');
    const menulist = document.getElementById('model-' + provider);
    if (!popup || !menulist) return;

    // Clear existing
    while (popup.firstChild) {
      popup.removeChild(popup.firstChild);
    }

    // Add models
    const models = this.models[provider] || [];
    models.forEach(model => {
      const item = document.createXULElement('menuitem');
      item.setAttribute('value', model.id);
      item.setAttribute('label', model.name);
      popup.appendChild(item);
    });

    // Select current
    const currentModel = this.getPref('model.' + provider);
    if (currentModel && models.some(m => m.id === currentModel)) {
      menulist.value = currentModel;
    } else if (models.length > 0) {
      menulist.value = models[0].id;
      this.setPref('model.' + provider, models[0].id);
    }
  },

  // ==================== Provider Chain (Arrow Buttons) ====================

  buildProviderChainList: function() {
    const container = document.getElementById('provider-chain-list');
    if (!container) return;

    // Clear existing
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    // Get chain order
    const chainStr = this.getPref('providerChain') || this.providerList.join(',');
    const chain = chainStr.split(',').filter(p => this.providers[p]);

    // Build list items
    chain.forEach((providerId, index) => {
      const provider = this.providers[providerId];
      const hasKey = !!this.getPref('apiKey.' + providerId);
      const isFirst = index === 0;
      const isLast = index === chain.length - 1;

      const row = document.createXULElement('hbox');
      row.setAttribute('id', 'chain-item-' + providerId);
      row.setAttribute('data-provider', providerId);
      row.setAttribute('align', 'center');
      row.style.cssText = 'padding: 6px 8px; margin: 2px 0; background: ' + (hasKey ? '#e8f5e9' : '#fff3e0') + '; border-radius: 4px;';

      // Up button
      const upBtn = document.createXULElement('button');
      upBtn.setAttribute('label', '▲');
      upBtn.setAttribute('tooltiptext', 'Move up');
      upBtn.disabled = isFirst;
      upBtn.style.cssText = 'min-width: 28px; padding: 2px 6px; margin-right: 4px;';
      upBtn.addEventListener('command', () => this.moveProvider(providerId, -1));
      row.appendChild(upBtn);

      // Down button
      const downBtn = document.createXULElement('button');
      downBtn.setAttribute('label', '▼');
      downBtn.setAttribute('tooltiptext', 'Move down');
      downBtn.disabled = isLast;
      downBtn.style.cssText = 'min-width: 28px; padding: 2px 6px; margin-right: 8px;';
      downBtn.addEventListener('command', () => this.moveProvider(providerId, 1));
      row.appendChild(downBtn);

      // Priority number
      const numLabel = document.createXULElement('label');
      numLabel.setAttribute('value', (index + 1) + '.');
      numLabel.style.cssText = 'width: 24px; font-weight: bold;';
      row.appendChild(numLabel);

      // Icon + Name
      const nameLabel = document.createXULElement('label');
      nameLabel.setAttribute('value', provider.icon + ' ' + provider.name);
      nameLabel.style.cssText = 'flex: 1;';
      row.appendChild(nameLabel);

      // Status indicator
      const statusLabel = document.createXULElement('label');
      statusLabel.setAttribute('id', 'chain-status-' + providerId);
      // For Ollama, show different status text
      const statusText = providerId === 'ollama'
        ? (hasKey ? '✓ Enabled' : '○ Disabled')
        : (hasKey ? '✓ Key set' : '○ No key');
      statusLabel.setAttribute('value', statusText);
      statusLabel.style.cssText = 'color: ' + (hasKey ? 'green' : '#999') + ';';
      row.appendChild(statusLabel);

      container.appendChild(row);
    });
  },

  moveProvider: function(providerId, direction) {
    // Get current chain
    const chainStr = this.getPref('providerChain') || this.providerList.join(',');
    const chain = chainStr.split(',');

    // Find current index
    const currentIndex = chain.indexOf(providerId);
    if (currentIndex === -1) return;

    // Calculate new index
    const newIndex = currentIndex + direction;
    if (newIndex < 0 || newIndex >= chain.length) return;

    // Swap positions
    const temp = chain[newIndex];
    chain[newIndex] = chain[currentIndex];
    chain[currentIndex] = temp;

    // Save and rebuild
    this.setPref('providerChain', chain.join(','));
    this.buildProviderChainList();
  },

  // ==================== Status Updates ====================

  updateProviderStatuses: function() {
    this.providerList.forEach(provider => {
      const hasKey = !!this.getPref('apiKey.' + provider);
      const statusEl = document.getElementById('chain-status-' + provider);
      if (statusEl) {
        const statusText = provider === 'ollama'
          ? (hasKey ? '✓ Enabled' : '○ Disabled')
          : (hasKey ? '✓ Key set' : '○ No key');
        statusEl.setAttribute('value', statusText);
        statusEl.style.color = hasKey ? 'green' : '#999';
      }

      // Update row background
      const row = document.getElementById('chain-item-' + provider);
      if (row) {
        row.style.background = hasKey ? '#e8f5e9' : '#fff3e0';
      }
    });
  },

  // ==================== Fallback Setting ====================

  onFallbackChange: function() {
    const checkbox = document.getElementById('enable-fallback');
    if (checkbox) {
      this.setPref('enableFallback', checkbox.checked);
    }
  },

  // ==================== Test Provider ====================

  testProvider: async function(provider) {
    const button = document.getElementById('test-' + provider);
    const statusEl = document.getElementById('status-' + provider);
    const apiKeyInput = document.getElementById('apikey-' + provider);
    const apiKey = apiKeyInput ? apiKeyInput.value : '';

    // Ollama doesn't need a real API key, just needs to be enabled
    if (!apiKey && provider !== 'ollama') {
      if (statusEl) {
        statusEl.textContent = 'Please enter an API key first.';
        statusEl.style.color = 'red';
      }
      return;
    }

    // For Ollama, check if it's enabled
    if (provider === 'ollama' && !apiKey) {
      if (statusEl) {
        statusEl.textContent = 'Enter "enabled" or any text to enable Ollama.';
        statusEl.style.color = 'red';
      }
      return;
    }

    // Save key first
    this.setPref('apiKey.' + provider, apiKey);

    // Disable button
    if (button) button.disabled = true;
    if (statusEl) {
      statusEl.textContent = 'Testing...';
      statusEl.style.color = 'orange';
    }

    try {
      const result = await Zotero.LlmSummarizer.testProvider(provider);
      if (statusEl) {
        statusEl.textContent = result.success ? '✓ Connection successful!' : '✗ ' + result.message;
        statusEl.style.color = result.success ? 'green' : 'red';
      }
    } catch (e) {
      if (statusEl) {
        statusEl.textContent = '✗ Error: ' + e.message;
        statusEl.style.color = 'red';
      }
    } finally {
      if (button) button.disabled = false;
      this.updateProviderStatuses();
      this.buildProviderChainList();
    }
  }
};
