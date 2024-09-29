
const getGithubUrl = () => document.getElementById('githubUrl').value
const getGithubToken = () => document.getElementById('githubToken').value


document.getElementById('saveConfig').addEventListener('click', () => {
    const githubUrl = getGithubUrl()
    const githubToken = getGithubToken()
    if (!githubUrl || !githubToken) {
        alert('please input github url and token')
        return
    }

    const config = {
        githubUrl,
        githubToken
    }

    chrome.storage.local.set(config).then(() => {
        alert('save config success')
        window.close()
    });
})