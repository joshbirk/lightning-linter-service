chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (tab.url.indexOf('ApexCSI') > 0) {
        if (changeInfo.status === 'complete') { // Or 'loading'
            chrome.tabs.executeScript(tabId, {'file':'jquery-1.12.4.min.js'});
            chrome.tabs.executeScript(tabId, {'file':'LLC.js'});
            chrome.pageAction.show(tabId);
        }
    } else {
        chrome.pageAction.hide(tabId);
    }
});
