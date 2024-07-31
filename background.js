const setupPath = 'lightning/setup/SetupOneHome/home'
const consolePath = '_ui/common/apex/debug/ApexCSIPage'
const objectManagerPath = 'lightning/setup/ObjectManager'
const objectManagerRedirectPath = '/lookupRedirect?lookup=entityByApiName&apiName='

async function getCurrentTabUrlAndIndex() {
    const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true})
    const {url} = tab
    const matches = url.match(/^https?:\/\/(.+?\.)*force\.com(?:[/?#]|$)/i)

    if (!matches) {
        return null
    }

    return [matches[0], tab.index]
}

async function getCurrentObjectApiName() {
    const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true})
    const {url} = tab
    const matches = url.match(/^https?:\/\/(?:.+?\.)*force\.com\/lightning\/[or]\/([^/?#]+)?/i)

    if (!matches || matches.length < 2) {
        return null
    }

    return matches[1]
}

chrome.action.onClicked.addListener(async () => {
    const urlAndIndex = await getCurrentTabUrlAndIndex()
    if (!urlAndIndex) {
        return
    }

    let [url, index] = urlAndIndex
    index++
    url += consolePath

    return chrome.tabs.create({index, url})
})

chrome.commands.onCommand.addListener(async command => {
    const urlAndIndex = await getCurrentTabUrlAndIndex()
    if (!urlAndIndex) {
        return
    }

    let [url, index] = urlAndIndex
    index++

    const currentObjectApiName = await getCurrentObjectApiName()
    let currentObjectManagerPath = objectManagerPath
    if (currentObjectApiName) {
        currentObjectManagerPath += objectManagerRedirectPath + currentObjectApiName
    } else {
        currentObjectManagerPath += '/home'
    }

    switch (command) {
        case 'open_setup_action':
            url += setupPath
            break
        case 'open_console_action':
            url += consolePath
            break
        case 'open_object_manager_action':
            url += currentObjectManagerPath
            break
        default:
            break
    }

    return chrome.tabs.create({index, url})
})
