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

// const wait = async () => {
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       resolve()
//     }, 1000)
//   })
// }

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

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  Logger.log('onMessage', message, sender, sendResponse)

  const { id, data } = message
  switch (id) {
    case 'stateChanged':
      await setupButton(data.enabled)
      await sortList(data.enabled)
      await setupVideo(data.enabled)
      break
    case 'urlChanged':
      // setTimeout(() => {
      // location.href = url
    // }, 1000)
      break
  }
})

;(async () => {
  Logger.log('content script loaded')

  const observer = new MutationObserver(async (mutations) => {
    const [mutation] = mutations
    if (mutation.removedNodes.length) {
      chrome.runtime.sendMessage({ id: 'buttonRemoved', data: { url: location.href } })
    }
  })
  const item = await querySelectorAsync('#top-level-buttons')
  observer.observe(item, { childList: true })

  // const video = document.querySelector('video')
  // Logger.log(getEventListeners(video))
  // getEventListeners(video).ended.forEach((e) => { e.remove() })

  chrome.runtime.sendMessage({ id: 'contentLoaded', data: { url: location.href } })

  // return

  // const items = Array.from(container.querySelectorAll('ytd-playlist-panel-video-renderer'))
  // Logger.log(items)
  // Logger.log(items.reverse())
  // // .forEach(async (item) => {
  // //   Logger.log(item)
  // //   container.append(item)
  // //   await wait()
  // // })
  // for (let item of items) {
  //   // item.remove()
  //   // document.body.append(item)
  //   container.append(item)
  //   Logger.log(item)
  //   Logger.log(1)
  //   // await wait()
  // }
  // await wait()
  // for (let item of items) {
  //   // item.remove()
  //   // document.body.append(item)
  //   // container.append(item)
  //   // Logger.log(item)
  //   // Logger.log(1)
  //   // await wait()
  // }
  // buttons.append = buttons.innerHTML + `
  // <ytd-toggle-button-renderer button-renderer="" class="style-scope ytd-menu-renderer style-grey-text" is-icon-button="" has-no-text=""><a class="yt-simple-endpoint style-scope ytd-toggle-button-renderer" tabindex="-1"><yt-icon-button id="button" class="style-scope ytd-toggle-button-renderer style-grey-text" aria-pressed="false"><button id="button" class="style-scope yt-icon-button" aria-label="再生リストをシャッフル"><yt-icon class="style-scope ytd-toggle-button-renderer"><svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" focusable="false" class="style-scope yt-icon" style="pointer-events: none; display: block; width: 100%; height: 100%;"><g class="style-scope yt-icon">
  //       <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" class="style-scope yt-icon"></path>
  //     </g></svg>
  // </yt-icon></button></yt-icon-button></a></ytd-toggle-button-renderer>
  // `
})()
