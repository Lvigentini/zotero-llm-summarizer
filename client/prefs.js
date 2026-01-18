// API Keys - one per provider
pref("extensions.zotero-llm-summarizer.apiKey.claude", "");
pref("extensions.zotero-llm-summarizer.apiKey.openai", "");
pref("extensions.zotero-llm-summarizer.apiKey.gemini", "");
pref("extensions.zotero-llm-summarizer.apiKey.openrouter", "");

// Provider chain order (comma-separated, first = default)
pref("extensions.zotero-llm-summarizer.providerChain", "claude,openai,gemini,openrouter");

// Default model per provider
pref("extensions.zotero-llm-summarizer.model.claude", "claude-sonnet-4-5-20241022");
pref("extensions.zotero-llm-summarizer.model.openai", "gpt-4.1");
pref("extensions.zotero-llm-summarizer.model.gemini", "gemini-2.0-flash");
pref("extensions.zotero-llm-summarizer.model.openrouter", "deepseek/deepseek-r1");

// Output settings
pref("extensions.zotero-llm-summarizer.outputFormat", "markdown");
pref("extensions.zotero-llm-summarizer.customPrompt", "");

// Provider-specific endpoints (for custom/proxy setups)
pref("extensions.zotero-llm-summarizer.endpoint.claude", "");
pref("extensions.zotero-llm-summarizer.endpoint.openai", "");
pref("extensions.zotero-llm-summarizer.endpoint.gemini", "");
pref("extensions.zotero-llm-summarizer.endpoint.openrouter", "");

// Enable fallback on error
pref("extensions.zotero-llm-summarizer.enableFallback", true);
