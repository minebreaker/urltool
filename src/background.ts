import _ from "lodash"

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
    parentMenuItemId?: string | number
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
    console.log(url.searchParams.values())

    if (!url.searchParams.values().next()) { // maybe there's a better way?
        console.log("query param is empty")
        browser.menus.create({
            id: "empty",
            contexts: ["all"],
            title: `The URL does not have any query parameters.`,
            enabled: false
        })
    } else {
        console.log(url.searchParams)
        url.searchParams.forEach((value, key) => {
            const id = Math.random().toString()
            console.log(`id: ${id}`)
            menuIdToValueMap.set(id, value)
            browser.menus.create({
                id,
                contexts: ["all"],
                title: `${key} = ${value}`
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
