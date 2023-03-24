export {} // dummy

declare const browser: any

type Details = {
    tabId: number,
    url: string,
    processId: number,
    frameId: number,
    timeStamp: number,
    transitionType: string
}

type OnClickData = {
    checked?: boolean,
    frameId?: number,
    menuItemId: string | number
    pageUrl?: string,
    parentMenuItemId?: string | number,
    linkText?: string,
    linkUrl?: string
}

const menuIdToValueMap = new Map<string, string>()

browser.webNavigation.onCommitted.addListener(async (details: Details) => {

    // ignore iframes
    if (details.transitionType === "auto_subframe" || details.transitionType === "manual_subframe") {
        return
    }

    // cleanup
    await browser.menus.removeAll()
    menuIdToValueMap.clear()

    const url = new URL(details.url)
    console.log(url)
    console.log(url.searchParams)

    if (!url.searchParams.values().next()) { // maybe there's a better way?
        console.log("query param is empty")
        browser.menus.create({
            id: "empty",
            contexts: ["all"],
            title: `The URL does not have any query parameters.`,
            enabled: false
        })
    } else {
        url.searchParams.forEach((value, key) => {
            const id = Math.random().toString()
            console.log(`id: ${id}`)
            menuIdToValueMap.set(id, value)
            browser.menus.create({
                id,
                contexts: ["all"],
                title: `( ${key} = ${value} )`
            })
        })
    }
})

browser.menus.onClicked.addListener(async (info: OnClickData) => {
    console.log("onclick")
    const value = menuIdToValueMap.get(info.menuItemId.toString())
    if (value) {
        await navigator.clipboard.writeText(value)
    }
})


const linkMenuIdToValueMap = new Map<string, string>()

browser.menus.onShown.addListener(async (info: OnClickData) => {
    console.log("onShown")
    console.log(info)

    if (!info.linkUrl) {
        return
    }

    const url = new URL(info.linkUrl)
    console.log(url)
    console.log(url.searchParams)

    if (!url.searchParams.values().next()) { // maybe there's a better way?
        console.log("query param is empty")
        browser.menus.create({
            id: "empty-link",
            contexts: ["link"],
            title: `The link does not have any query parameters.`,
            enabled: false
        })
    } else {
        url.searchParams.forEach((value, key) => {
            const id = Math.random().toString()
            console.log(`id: ${id}`)
            linkMenuIdToValueMap.set(id, value)
            browser.menus.create({
                id,
                contexts: ["link"],
                title: `[ ${key} = ${value} ]`
            })
        })
    }

    browser.menus.refresh()
})

browser.menus.onClicked.addListener(async (info: OnClickData) => {
    console.log("onclick")
    const value = linkMenuIdToValueMap.get(info.menuItemId.toString())
    if (value) {
        await navigator.clipboard.writeText(value)
    }
})

browser.menus.onHidden.addListener(() => {
    linkMenuIdToValueMap.clear()
})
