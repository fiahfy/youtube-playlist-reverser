import Logger from './utils/logger'

let index = 0
let list = []

const querySelectorAsync = async (selector) => {
  return new Promise((resolve) => {
    const expire = Date.now() + 5000
    const interval = setInterval(() => {
      const dom = document.querySelector(selector)
      if (dom) {
        clearInterval(interval)
        resolve(dom)
      }
      if (Date.now() > expire) {
        clearInterval(interval)
        resolve(null)
      }
    }, 100)
  })
}

const setupButton = (enabled) => {
  const buttons = document.querySelector('ytd-playlist-panel-renderer ytd-menu-renderer #top-level-buttons')
  const container = document.querySelector('ytd-playlist-panel-renderer iron-list #items')
  if (!buttons || !container) {
    return
  }
  let renderer = document.querySelector('.ypr-renderer')
  if (!renderer) {
    renderer = document.createElement('ytd-toggle-button-renderer')
    renderer.setAttribute('class', 'ypr-renderer style-scope ytd-menu-renderer style-grey-text')
    renderer.setAttribute('is-icon-button', '')
    renderer.setAttribute('has-no-text', '')
    renderer.innerHTML += `
      <a class="yt-simple-endpoint style-scope ytd-toggle-button-renderer" tabindex="-1">
        <yt-icon-button id="button" class="style-scope ytd-toggle-button-renderer style-grey-text" aria-pressed="false">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path d="M16 17.01V10h-2v7.01h-3L15 21l4-3.99h-3zM9 3L5 6.99h3V14h2V6.99h3L9 3z"/>
          </svg>
        </yt-icon-button>
      </a>
    `
    renderer.onclick = () => {
      chrome.runtime.sendMessage({ id: 'stateChanged' })
    }
    buttons.append(renderer)
  }
  if (enabled) {
    renderer.classList.add('style-default-active')
  } else {
    renderer.classList.remove('style-default-active')
  }
}

const sortList = (enabled) => {
  const items = Array.from(document.querySelectorAll('ytd-playlist-panel-video-renderer'))
  items.forEach((item, i) => {
    const newIndex = enabled ? items.length - i : i + 1
    const top = 64 * (newIndex - 1)
    // Logger.log(i, top)
    item.style.transform = `translate3d(0px, ${top}px, 0px)`
    // Logger.log(item.querySelector('#index'))
    if (item.querySelector('#index').innerText.match(/\d+/)) {
      item.querySelector('#index').innerText = newIndex
    } else {
      index = i
    }
  })
  list = items.map((item) => {
    return item.querySelector('#wc-endpoint').getAttribute('href')
  })
}

const timeupdate = ({ target }) => {
  // Logger.log(target.duration, target.currentTime)
  if (target.currentTime > target.duration - 60) {
    Logger.log('redirect')
    if (index) {
      location.href = list[index - 1]
    } else {
      target.pause()
    }
  }
}

const setupVideo = (enabled) => {
  const video = document.querySelector('video')
  video.removeEventListener('timeupdate', timeupdate)
  if (enabled) {
    video.addEventListener('timeupdate', timeupdate)
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  Logger.log('chrome.runtime.onMessage', message, sender, sendResponse)

  const { id, data } = message
  switch (id) {
    case 'stateChanged':
      setupButton(data.enabled)
      sortList(data.enabled)
      setupVideo(data.enabled)
      break
  }
})

;(async () => {
  Logger.log('content script loaded')

  const observer = new MutationObserver(async (mutations) => {
    const [mutation] = mutations
    if (mutation.removedNodes.length) {
      chrome.runtime.sendMessage({ id: 'buttonRemoved' })
    }
  })
  const item = await querySelectorAsync('#top-level-buttons')
  observer.observe(item, { childList: true })

  chrome.runtime.sendMessage({ id: 'contentLoaded' })
})()
