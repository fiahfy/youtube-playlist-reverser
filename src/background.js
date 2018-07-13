
import Logger from './utils/logger'
import './assets/icon16.png'
import './assets/icon48.png'
import './assets/icon128.png'

const code = `
.ypr-renderer svg {
  fill: var(--iron-icon-fill-color, currentcolor);
  stroke: none;
}
`

const enabled = {}

const sendMessage = (tabId) => {
  chrome.tabs.sendMessage(tabId, { id: 'stateChanged', data: { enabled: enabled[tabId] } })
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  Logger.log('chrome.runtime.onMessage', message, sender, sendResponse)

  const { id } = message
  const { tab } = sender
  switch (id) {
    case 'contentLoaded':
      chrome.tabs.insertCSS(tab.id, { code })
      sendMessage(tab.id)
      break
    case 'stateChanged':
      enabled[tab.id] = !enabled[tab.id]
      sendMessage(tab.id)
      break
    case 'buttonRemoved':
      sendMessage(tab.id)
      break
  }
})

;(() => {
  Logger.log('background script loaded')
})()
