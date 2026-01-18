/* eslint-disable prefer-arrow/prefer-arrow-functions, no-var, @typescript-eslint/no-unused-vars, no-caller, @typescript-eslint/explicit-module-boundary-types */

declare const Zotero: any
declare const Services: any

var stylesheetID = 'zotero-llm-summarizer-stylesheet'
var ftlID = 'zotero-llm-summarizer-ftl'
var menuID = 'zotero-llm-summarizer-menu'
var submenuID = 'zotero-llm-summarizer-submenu'
var separatorID = 'zotero-llm-summarizer-separator'
var addedElementIDs = [stylesheetID, ftlID, menuID, submenuID, separatorID]

function log(msg: string) {
  Zotero.debug(`LLM Summarizer: ${msg}`)
}

export function install() {
  log('Installed')
}

export async function startup({ id, version, rootURI }: { id: string, version: string, rootURI: string }) {
  log(`Starting - id: ${id}, version: ${version}, rootURI: ${rootURI}`)

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
    itemMenu.appendChild(menu)

    // Create menupopup for submenu items
    const menupopup = (doc as any).createXULElement('menupopup')
    menupopup.id = submenuID
    menu.appendChild(menupopup)

    // Add popup showing listener to build dynamic menu
    itemMenu.addEventListener('popupshowing', updateMenuState)
  }

  log('UI initialized')
}

function updateMenuState(event: Event) {
  const doc = (event.target as Element).ownerDocument
  const menu = doc.getElementById(menuID)
  const menupopup = doc.getElementById(submenuID)
  if (!menu || !menupopup) return

  const zp = Zotero.getActiveZoteroPane()
  const items = zp.getSelectedItems()

  // Enable only if exactly one regular item is selected
  if (items.length === 1 && !items[0].isNote() && !items[0].isAttachment()) {
    menu.removeAttribute('disabled')
    buildProviderSubmenu(doc, menupopup)
  }
  else {
    menu.setAttribute('disabled', 'true')
  }
}

function buildProviderSubmenu(doc: Document, menupopup: Element) {
  // Clear existing items
  while (menupopup.firstChild) {
    menupopup.removeChild(menupopup.firstChild)
  }

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

  // Add separator before settings link
  const sep2 = (doc as any).createXULElement('menuseparator')
  menupopup.appendChild(sep2)

  // Add "Settings..." option
  const settingsItem = (doc as any).createXULElement('menuitem')
  settingsItem.setAttribute('label', 'Settings...')
  settingsItem.addEventListener('command', () => {
    Zotero.Utilities.Internal.openPreferences('zotero-llm-summarizer-prefpane')
  })
  menupopup.appendChild(settingsItem)
}

export function shutdown() {
  log('Shutting down')

  // Remove UI elements
  var zp = Zotero.getActiveZoteroPane()
  if (zp) {
    const doc = zp.document
    const itemMenu = doc.getElementById('zotero-itemmenu')
    if (itemMenu) {
      itemMenu.removeEventListener('popupshowing', updateMenuState)
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
