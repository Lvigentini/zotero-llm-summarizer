/* global Zotero, document */

var LlmSummarizerPrefs = {
  PREF_PREFIX: 'extensions.zotero-llm-summarizer.',

  providers: {
    claude: { name: 'Claude (Anthropic)', icon: '🟠' },
    openai: { name: 'OpenAI', icon: '🟢' },
    gemini: { name: 'Gemini (Google)', icon: '🔵' },
    openrouter: { name: 'OpenRouter', icon: '🟣' }
  },

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
    gemini: [
      { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash (Latest)' },
      { id: 'gemini-2.0-flash-lite', name: 'Gemini 2.0 Flash Lite (Fast)' },
      { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite' }
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
      // Grok
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

  draggedItem: null,

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
    ['claude', 'openai', 'gemini', 'openrouter'].forEach(provider => {
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
    ['claude', 'openai', 'gemini', 'openrouter'].forEach(provider => {
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
    ['claude', 'openai', 'gemini', 'openrouter'].forEach(provider => {
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

  // ==================== Provider Chain (Drag & Drop) ====================

  buildProviderChainList: function() {
    const container = document.getElementById('provider-chain-list');
    if (!container) return;

    // Clear existing
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    // Get chain order
    const chainStr = this.getPref('providerChain') || 'claude,openai,gemini,openrouter';
    const chain = chainStr.split(',').filter(p => this.providers[p]);

    // Build list items
    chain.forEach((providerId, index) => {
      const provider = this.providers[providerId];
      const hasKey = !!this.getPref('apiKey.' + providerId);

      const row = document.createXULElement('hbox');
      row.setAttribute('id', 'chain-item-' + providerId);
      row.setAttribute('data-provider', providerId);
      row.setAttribute('align', 'center');
      row.setAttribute('draggable', 'true');
      row.style.cssText = 'padding: 6px 8px; margin: 2px 0; background: ' + (hasKey ? '#e8f5e9' : '#fff3e0') + '; border-radius: 4px; cursor: grab;';

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
      statusLabel.setAttribute('value', hasKey ? '✓ Key set' : '○ No key');
      statusLabel.style.cssText = 'color: ' + (hasKey ? 'green' : '#999') + ';';
      row.appendChild(statusLabel);

      // Drag events
      row.addEventListener('dragstart', (e) => this.onDragStart(e, providerId));
      row.addEventListener('dragover', (e) => this.onDragOver(e));
      row.addEventListener('drop', (e) => this.onDrop(e, providerId));
      row.addEventListener('dragend', () => this.onDragEnd());

      container.appendChild(row);
    });
  },

  onDragStart: function(e, providerId) {
    this.draggedItem = providerId;
    e.target.style.opacity = '0.5';
  },

  onDragOver: function(e) {
    e.preventDefault();
  },

  onDrop: function(e, targetProviderId) {
    e.preventDefault();
    if (!this.draggedItem || this.draggedItem === targetProviderId) return;

    // Get current chain
    const chainStr = this.getPref('providerChain') || 'claude,openai,gemini,openrouter';
    const chain = chainStr.split(',');

    // Remove dragged item
    const draggedIndex = chain.indexOf(this.draggedItem);
    if (draggedIndex > -1) {
      chain.splice(draggedIndex, 1);
    }

    // Insert at new position
    const targetIndex = chain.indexOf(targetProviderId);
    chain.splice(targetIndex, 0, this.draggedItem);

    // Save and rebuild
    this.setPref('providerChain', chain.join(','));
    this.buildProviderChainList();
  },

  onDragEnd: function() {
    this.draggedItem = null;
    // Reset all opacities
    ['claude', 'openai', 'gemini', 'openrouter'].forEach(p => {
      const row = document.getElementById('chain-item-' + p);
      if (row) row.style.opacity = '1';
    });
  },

  // ==================== Status Updates ====================

  updateProviderStatuses: function() {
    ['claude', 'openai', 'gemini', 'openrouter'].forEach(provider => {
      const hasKey = !!this.getPref('apiKey.' + provider);
      const statusEl = document.getElementById('chain-status-' + provider);
      if (statusEl) {
        statusEl.setAttribute('value', hasKey ? '✓ Key set' : '○ No key');
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

    if (!apiKey) {
      if (statusEl) {
        statusEl.textContent = 'Please enter an API key first.';
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
