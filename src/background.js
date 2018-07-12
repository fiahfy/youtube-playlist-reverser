
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
// const urls = {}
// const redirected = {}

// const getIndex = (url) => {
//   let matches = url.match(/index=(\d+)/)
//   if (!matches) {
//     return 0
//   }
//   let [, index] = matches
//   return Number(index)
// }

// chrome.webRequest.onBeforeRequest.addListener((details) => {
//   Logger.log('chrome.webRequest.onBeforeRequest', details)

//   const { tabId, url } = details
//   Logger.log(enabled)
//   if (!enabled[tabId]) {
//     return
//   }
//   if (redirected[tabId]) {
//     return
//   }

//   const currentIndex = getIndex(urls[tabId])
//   const index = getIndex(url)

//   let newIndex = 0
//   if (index === currentIndex - 1) {
//     newIndex = currentIndex + 1
//   } else if (index === currentIndex + 1) {
//     newIndex = currentIndex - 1
//   } else if (currentIndex === 1) {
//     Logger.log('cancel')
//     return { cancel: true }
//   }
//   // return { cancel: true }

//   Logger.log(newIndex)

//   if (!newIndex) {
//     return
//   }

//   redirected[tabId] = true

//   let redirectUrl = url.replace(/(index=)(\d+)/, '$1' + newIndex)
//   Logger.log(redirectUrl)
//   redirectUrl = redirectUrl.replace(/[?&]pbj=1/, '')
//   Logger.log(redirectUrl)

//   // chrome.tabs.sendMessage(tabId, { id: 'urlChanged', data: { url: 'https://www.youtube.com/watch?v=8ThWNLpvgho&list=PL7LdRPp7xCkM3ZWVsViz2vHTx0YQPiN10&index=7' } })

//   // return
//   return { cancel: true }

//   // return {
//   //   redirectUrl: 'https://www.google.com/#q=' + q
//   // }
// }, { urls: ['https://www.youtube.com/watch?v=*&index=*'] }, ['blocking'])

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  Logger.log('chrome.runtime.onMessage', message, sender, sendResponse)

  const { id } = message
  const { tab } = sender
  switch (id) {
    case 'contentLoaded':
      // urls[tab.id] = data.url
      // redirected[tab.id] = false
      // enabled[tab.id] = false
      chrome.tabs.insertCSS(tab.id, { code })
      chrome.tabs.sendMessage(tab.id, { id: 'stateChanged', data: { enabled: enabled[tab.id] } })
      break
    case 'stateChanged':
      // urls[tab.id] = data.url
      // redirected[tab.id] = false
      enabled[tab.id] = !enabled[tab.id]
      chrome.tabs.sendMessage(tab.id, { id: 'stateChanged', data: { enabled: enabled[tab.id] } })
      break
    case 'buttonRemoved':
      // urls[tab.id] = data.url
      // redirected[tab.id] = false
      chrome.tabs.sendMessage(tab.id, { id: 'stateChanged', data: { enabled: enabled[tab.id] } })
      break
  }
})

;(() => {
  Logger.log('background script loaded')
})()
