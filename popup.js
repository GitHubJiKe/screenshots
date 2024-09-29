chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (['fail', 'success'].includes(message.status)) {
        alert(message.message)
    }
});

document.getElementById('saveButton').addEventListener('click', () => {
    const filename = document.getElementById('filename').value
    const filepath = document.getElementById('filepath').value
    const commitmsg = document.getElementById('commitmsg').value
    chrome.tabs.query({ active: true, currentWindow: true }, () => {
        chrome.runtime.sendMessage({ action: 'capturePage', filepath, filename, commitmsg });
    });
})


document.getElementById('config').addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'openConfig' })
})

