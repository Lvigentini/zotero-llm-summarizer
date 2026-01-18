/* eslint-disable prefer-arrow/prefer-arrow-functions, no-var, @typescript-eslint/no-unused-vars, no-caller, @typescript-eslint/explicit-module-boundary-types */

declare const Zotero: any
declare const Services: any

var stylesheetID = 'zotero-llm-summarizer-stylesheet'
var ftlID = 'zotero-llm-summarizer-ftl'
var menuID = 'zotero-llm-summarizer-menu'
var submenuID = 'zotero-llm-summarizer-submenu'
var separatorID = 'zotero-llm-summarizer-separator'
var collectionMenuID = 'zotero-llm-summarizer-collection-menu'
var collectionSubmenuID = 'zotero-llm-summarizer-collection-submenu'
var collectionSeparatorID = 'zotero-llm-summarizer-collection-separator'
var addedElementIDs = [stylesheetID, ftlID, menuID, submenuID, separatorID, collectionMenuID, collectionSubmenuID, collectionSeparatorID]
var pluginRootURI = ''

function log(msg: string) {
  Zotero.debug(`LLM Summarizer: ${msg}`)
}

export function install() {
  log('Installed')
}

export async function startup({ id, version, rootURI }: { id: string, version: string, rootURI: string }) {
  log(`Starting - id: ${id}, version: ${version}, rootURI: ${rootURI}`)
  pluginRootURI = rootURI

  // Register preferences pane
  try {
    Zotero.PreferencePanes.register({
      pluginID: id,
      src: `${rootURI}prefs.xhtml`,
      label: 'LLM Summarizer',
      image: `${rootURI}icon.svg`,
      scripts: [`${rootURI}prefs-script.js`],
      helpURL: 'https://github.com/lvigentini/zotero-llm-summarizer',
    })
    log('Preferences pane registered successfully')
  }
  catch (e) {
    log(`Error registering preferences pane: ${e}`)
  }

  // Load the main library
  await Services.scriptloader.loadSubScript(`${rootURI}lib.js`)

  // Add stylesheet and localization to the main Zotero pane
  var zp = Zotero.getActiveZoteroPane()
  if (zp) {
    initUI(zp.document as Document, rootURI)
  }
}

function initUI(doc: Document, rootURI: string) {
  // Add stylesheet
  const link1 = doc.createElement('link')
  link1.id = stylesheetID
  link1.type = 'text/css'
  link1.rel = 'stylesheet'
  link1.href = `${rootURI}style.css`
  doc.documentElement.appendChild(link1)

  // Add localization
  const link2 = doc.createElement('link')
  link2.id = ftlID
  link2.rel = 'localization'
  link2.href = 'zotero-llm-summarizer.ftl'
  doc.documentElement.appendChild(link2)

  // Add context menu to item menu (right-click on items)
  const itemMenu = doc.getElementById('zotero-itemmenu')
  if (itemMenu) {
    // Add separator before our menu
    const separator = (doc as any).createXULElement('menuseparator')
    separator.id = separatorID
    itemMenu.appendChild(separator)

    // Create main menu with submenu
    const menu = (doc as any).createXULElement('menu')
    menu.id = menuID
    menu.setAttribute('label', 'Summarize with AI')
    menu.setAttribute('image', `${rootURI}icon.svg`)
    menu.classList.add('menuitem-iconic')
    itemMenu.appendChild(menu)

    // Create menupopup for submenu items
    const menupopup = (doc as any).createXULElement('menupopup')
    menupopup.id = submenuID
    menu.appendChild(menupopup)

    // Add popup showing listener to build dynamic menu
    itemMenu.addEventListener('popupshowing', updateItemMenuState)
  }

  // Add context menu to collection menu (right-click on collections)
  const collectionMenu = doc.getElementById('zotero-collectionmenu')
  if (collectionMenu) {
    // Add separator
    const separator = (doc as any).createXULElement('menuseparator')
    separator.id = collectionSeparatorID
    collectionMenu.appendChild(separator)

    // Create main menu with submenu
    const menu = (doc as any).createXULElement('menu')
    menu.id = collectionMenuID
    menu.setAttribute('label', 'Summarize with AI')
    menu.setAttribute('image', `${rootURI}icon.svg`)
    menu.classList.add('menuitem-iconic')
    collectionMenu.appendChild(menu)

    // Create menupopup for submenu items
    const menupopup = (doc as any).createXULElement('menupopup')
    menupopup.id = collectionSubmenuID
    menu.appendChild(menupopup)

    // Add popup showing listener
    collectionMenu.addEventListener('popupshowing', updateCollectionMenuState)
  }

  log('UI initialized')
}

function updateItemMenuState(event: Event) {
  const doc = (event.target as Element).ownerDocument
  const menu = doc.getElementById(menuID)
  const menupopup = doc.getElementById(submenuID)
  if (!menu || !menupopup) return

  const zp = Zotero.getActiveZoteroPane()
  const items = zp.getSelectedItems()

  // Filter to regular items only (not notes or attachments)
  const regularItems: any[] = items.filter((item: any) => !item.isNote() && !item.isAttachment())

  if (regularItems.length === 0) {
    menu.setAttribute('disabled', 'true')
    return
  }

  menu.removeAttribute('disabled')

  if (regularItems.length === 1) {
    // Single item - show provider submenu
    buildSingleItemMenu(doc, menupopup)
  }
  else {
    // Multiple items - show batch/digest options
    buildMultiItemMenu(doc, menupopup, regularItems.length)
  }
}

function updateCollectionMenuState(event: Event) {
  const doc = (event.target as Element).ownerDocument
  const menu = doc.getElementById(collectionMenuID)
  const menupopup = doc.getElementById(collectionSubmenuID)
  if (!menu || !menupopup) return

  const zp = Zotero.getActiveZoteroPane()
  const collection = zp.getSelectedCollection()

  if (!collection) {
    menu.setAttribute('disabled', 'true')
    return
  }

  menu.removeAttribute('disabled')
  buildCollectionMenu(doc, menupopup, collection)
}

function clearMenu(menupopup: Element) {
  while (menupopup.firstChild) {
    menupopup.removeChild(menupopup.firstChild)
  }
}

function addSettingsMenuItem(doc: Document, menupopup: Element) {
  const sep = (doc as any).createXULElement('menuseparator')
  menupopup.appendChild(sep)

  const settingsItem = (doc as any).createXULElement('menuitem')
  settingsItem.setAttribute('label', 'Settings...')
  settingsItem.addEventListener('command', () => {
    Zotero.Utilities.Internal.openPreferences('zotero-llm-summarizer-prefpane')
  })
  menupopup.appendChild(settingsItem)
}

function buildSingleItemMenu(doc: Document, menupopup: Element) {
  clearMenu(menupopup)

  const providers = Zotero.LlmSummarizer.getProviders()
  const availableProviders = Zotero.LlmSummarizer.getAvailableProviders()
  const chain = Zotero.LlmSummarizer.getProviderChain()

  // Add "Default (use chain)" option at top
  const defaultItem = (doc as any).createXULElement('menuitem')
  defaultItem.setAttribute('label', 'Use Default Chain')
  const chainNames = availableProviders.map((p: string) => (providers[p]?.name || p) as string).join(' > ')
  defaultItem.setAttribute('tooltiptext', `Priority: ${chainNames}`)
  defaultItem.addEventListener('command', () => {
    Zotero.LlmSummarizer.summarizeSelected()
  })
  menupopup.appendChild(defaultItem)

  // Add separator
  const sep = (doc as any).createXULElement('menuseparator')
  menupopup.appendChild(sep)

  // Add available providers (those with API keys)
  if (availableProviders.length > 0) {
    for (const providerId of chain) {
      const provider = providers[providerId]
      if (!provider) continue

      const hasKey = availableProviders.includes(providerId)
      const model = Zotero.LlmSummarizer.getProviderModel(providerId)

      const menuitem = (doc as any).createXULElement('menuitem')
      menuitem.setAttribute('label', `${provider.icon} ${provider.name}`)
      menuitem.setAttribute('tooltiptext', `Model: ${model}`)

      if (hasKey) {
        menuitem.addEventListener('command', () => {
          Zotero.LlmSummarizer.summarizeSelected(providerId)
        })
      }
      else {
        menuitem.setAttribute('disabled', 'true')
        menuitem.setAttribute('tooltiptext', 'No API key configured')
      }

      menupopup.appendChild(menuitem)
    }
  }
  else {
    // No providers configured
    const noProviderItem = (doc as any).createXULElement('menuitem')
    noProviderItem.setAttribute('label', 'No providers configured')
    noProviderItem.setAttribute('disabled', 'true')
    menupopup.appendChild(noProviderItem)
  }

  addSettingsMenuItem(doc, menupopup)
}

function buildMultiItemMenu(doc: Document, menupopup: Element, itemCount: number) {
  clearMenu(menupopup)

  const availableProviders = Zotero.LlmSummarizer.getAvailableProviders()

  if (availableProviders.length === 0) {
    const noProviderItem = (doc as any).createXULElement('menuitem')
    noProviderItem.setAttribute('label', 'No providers configured')
    noProviderItem.setAttribute('disabled', 'true')
    menupopup.appendChild(noProviderItem)
    addSettingsMenuItem(doc, menupopup)
    return
  }

  // Batch Individual option
  const batchItem = (doc as any).createXULElement('menuitem')
  batchItem.setAttribute('label', `📑 Batch Individual (${itemCount} items)`)
  batchItem.setAttribute('tooltiptext', 'Create a separate summary note for each selected item')
  batchItem.addEventListener('command', () => {
    Zotero.LlmSummarizer.summarizeBatch()
  })
  menupopup.appendChild(batchItem)

  // Simple Digest option
  const digestItem = (doc as any).createXULElement('menuitem')
  digestItem.setAttribute('label', `📋 Simple Digest (${itemCount} items)`)
  digestItem.setAttribute('tooltiptext', 'Combine all notes into a single digest summary')
  digestItem.addEventListener('command', () => {
    Zotero.LlmSummarizer.summarizeDigest()
  })
  menupopup.appendChild(digestItem)

  addSettingsMenuItem(doc, menupopup)
}

function buildCollectionMenu(doc: Document, menupopup: Element, collection: any) {
  clearMenu(menupopup)

  const availableProviders = Zotero.LlmSummarizer.getAvailableProviders()

  if (availableProviders.length === 0) {
    const noProviderItem = (doc as any).createXULElement('menuitem')
    noProviderItem.setAttribute('label', 'No providers configured')
    noProviderItem.setAttribute('disabled', 'true')
    menupopup.appendChild(noProviderItem)
    addSettingsMenuItem(doc, menupopup)
    return
  }

  const collectionName = collection.name || 'Collection'

  // Batch Individual option
  const batchItem = (doc as any).createXULElement('menuitem')
  batchItem.setAttribute('label', '📑 Batch Individual')
  batchItem.setAttribute('tooltiptext', `Create a separate summary note for each item in "${collectionName}"`)
  batchItem.addEventListener('command', () => {
    Zotero.LlmSummarizer.summarizeCollectionBatch(collection.id)
  })
  menupopup.appendChild(batchItem)

  // Simple Digest option
  const digestItem = (doc as any).createXULElement('menuitem')
  digestItem.setAttribute('label', '📋 Collection Digest')
  digestItem.setAttribute('tooltiptext', `Combine all notes in "${collectionName}" into a single digest`)
  digestItem.addEventListener('command', () => {
    Zotero.LlmSummarizer.summarizeCollectionDigest(collection.id)
  })
  menupopup.appendChild(digestItem)

  addSettingsMenuItem(doc, menupopup)
}

export function shutdown() {
  log('Shutting down')

  // Remove UI elements
  var zp = Zotero.getActiveZoteroPane()
  if (zp) {
    const doc = zp.document
    const itemMenu = doc.getElementById('zotero-itemmenu')
    if (itemMenu) {
      itemMenu.removeEventListener('popupshowing', updateItemMenuState)
    }

    const collectionMenu = doc.getElementById('zotero-collectionmenu')
    if (collectionMenu) {
      collectionMenu.removeEventListener('popupshowing', updateCollectionMenuState)
    }

    for (const id of addedElementIDs) {
      doc.getElementById(id)?.remove()
    }
  }

  // Clean up global
  Zotero.LlmSummarizer = undefined
}

export function uninstall() {
  log('Uninstalled')
}
