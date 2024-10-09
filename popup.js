chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (['fail', 'success'].includes(message.status)) {
        Swal.fire({
            title: message.status,
            text: message.message,
            icon: message.status
        });
    }
});


document.getElementById('saveButton').addEventListener('click', () => {
    const filename = document.getElementById('filename').value
    const filepath = document.getElementById('filepath').value
    const commitmsg = document.getElementById('commitmsg').value
    const needdraw = document.getElementById('draw').checked



    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentUrl = tabs[0].url;
        const finalCommitMsg = `info: ${commitmsg}\nurl:${currentUrl}`;
        chrome.runtime.sendMessage({ action: 'capturePage', filepath, filename, commitmsg: finalCommitMsg, needdraw });
    });
})


document.getElementById('config').addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'openConfig' })
})

