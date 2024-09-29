
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.action === 'capturePage') {
        captureVisibleTab(message, sendResponse)
    }

    if (message.action === 'openConfig') {
        chrome.tabs.create({ url: 'config.html' });
    }

});

async function captureVisibleTab(message, sendResponse) {
    const items = await chrome.storage.local.get(['githubUrl', 'githubToken'])
    const { githubUrl, githubToken } = items

    if (!githubUrl || !githubToken) {
        chrome.runtime.sendMessage({ status: 'fail', message: 'please config github url and token' })
        return;
    }

    const dataUrl = await chrome.tabs.captureVisibleTab(null, { format: 'png' })
    const filename = message.filename
    const commitmsg = message.commitmsg
    const filepath = message.filepath
    const file = dataUrl.split(',')[1]
    const res = await upload({ file, filepath, filename, commitmsg, githubToken, githubUrl })
    chrome.runtime.sendMessage(res);
}


async function upload({ file, filepath, filename, commitmsg, githubToken, githubUrl }) {
    // https://github.com/GitHubJiKe/screenshots
    const urlObj = new URL(githubUrl)
    const [_, REPO_OWNER, REPO_NAME] = urlObj.pathname.split('/')

    if (!REPO_OWNER || !REPO_NAME) {
        return 'fail'
    }
    // 配置
    const GITHUB_TOKEN = githubToken;
    const UPLOAD_PATH = filepath ? `${filepath}/${filename}.png` : `${filename}.png`;
    const COMMIT_MESSAGE = commitmsg;

    // 读取文件并进行 Base64 编码
    const content = file;
    // 构建请求 URL
    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${UPLOAD_PATH}`;

    // 构建请求头
    const headers = {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json'
    };

    // 构建请求体
    const data = {
        'message': COMMIT_MESSAGE,
        'content': content
    };

    // 发送请求
    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: headers,
            body: JSON.stringify(data)
        });

        if (response.status === 201) {
            return { status: 'success', message: 'upload success' }
        } else {
            const responseData = await response.json();
            return { status: 'fail', message: responseData.message };
        }
    } catch (error) {
        console.error('Error:', error);
        return { status: 'fail', message: error.message };
    }

}