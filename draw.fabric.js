(async () => {
    let isEditingText = false;
    let contextMenuShow = false

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (['fail', 'success'].includes(message.status)) {
            Swal.fire({
                title: message.status,
                text: message.message,
                icon: message.status
            });
        }
    });

    const data = await chrome.storage.local.get()
    const width = window.innerWidth;
    const height = window.innerHeight;
    const previewCanvas = document.getElementById('previewCanvas')

    const canvas = new fabric.Canvas(previewCanvas, {
        width,
        height,
    })



    fabric.Image.fromURL(data.dataUrl, function (img) {
        // 获取画布宽度和高度
        const canvasWidth = canvas.getWidth();
        const canvasHeight = canvas.getHeight();

        // 获取图片的原始宽度和高度
        const imgWidth = img.width;
        const imgHeight = img.height;

        // 计算比例，以确保图片内容完全展示
        const scale = Math.min(canvasWidth / imgWidth, canvasHeight / imgHeight);

        // 按比例缩放图片
        img.scale(scale);

        // 将图片居中放置
        img.set({
            left: (canvasWidth - imgWidth * scale) / 2,
            top: (canvasHeight - imgHeight * scale) / 2,
            selectable: false
        });

        // 添加图片到画布中
        canvas.add(img);
        canvas.sendToBack(img);
    });

    const canvasContainer = document.querySelector('.canvas-container')
    const contextMenu = document.getElementById('contextMenu');

    canvasContainer.addEventListener('contextmenu', (event) => {
        event.preventDefault();
        if (contextMenuShow) {
            hideContextMenu()
        } else {
            showContextMenu(event, contextMenu);
        }
    });


    function showContextMenu(event, contextMenu) {
        const { clientX: mouseX, clientY: mouseY } = event;
        contextMenu.style.top = `${mouseY}px`;
        contextMenu.style.left = `${mouseX}px`;
        contextMenu.style.display = 'block';
        contextMenuShow = true
    }

    document.getElementById('menus').addEventListener('click', (e) => {
        const { clientX, clientY } = e
        switch (e.target.id) {
            case 'arrow':
                drawArrow(clientX, clientY);
                break;
            case 'rect':
                drawRect(clientX, clientY);
                break;
            case 'text':
                drawEditableText(clientX, clientY);
                break;
            case 'freeline':
                drawFreeline();
                break;
            case 'circle':
                drawCircle(clientX, clientY);
                break;
            case 'push':
                const dataUrl = canvas.toDataURL({
                    format: 'png',
                    quality: 1.0
                });
                const { filepath, filename, commitmsg, } = data
                chrome.runtime.sendMessage({ action: 'push', filepath, filename, commitmsg, dataUrl });
                break;

            case 'download':
                downloadImage();
                break;

            default:
                break;
        }

        hideContextMenu();
    });

    function hideContextMenu() {
        contextMenu.style.display = 'none';
        contextMenuShow = false;
    }

    function downloadImage() {
        const dataURL = canvas.toDataURL({
            format: 'png',
            quality: 1.0
        });
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = 'image.png';
        link.click();
    }

    // function drawLine(x, y) {
    //     let isDrawing = false;
    //     let line;

    //     // 监听画布的鼠标按下事件
    //     canvas.on('mouse:down', function (o) {
    //         isDrawing = true;
    //         const pointer = canvas.getPointer(o.e);
    //         const points = [pointer.x, pointer.y, pointer.x, pointer.y];
    //         line = new fabric.Line(points, {
    //             strokeWidth: 2,
    //             fill: 'red',
    //             stroke: 'red',
    //             originX: 'center',
    //             originY: 'center'
    //         });
    //         canvas.add(line);
    //         canvas.bringToFront(line)
    //     });

    //     // 监听画布的鼠标移动事件
    //     canvas.on('mouse:move', function (o) {
    //         if (!isDrawing) return;
    //         const pointer = canvas.getPointer(o.e);
    //         line.set({ x2: pointer.x, y2: pointer.y });
    //         canvas.renderAll();
    //     });

    //     // 监听画布的鼠标松开事件
    //     canvas.on('mouse:up', function (o) {
    //         isDrawing = false;
    //     });
    // }

    function drawFreeline() {
        if (canvas.isDrawingMode) {
            canvas.isDrawingMode = false
            document.querySelector('#freeline').classList.remove('freeline-active')
        } else {

            canvas.isDrawingMode = true
            document.querySelector('#freeline').classList.add('freeline-active')
            if (canvas.freeDrawingBrush) {
                canvas.freeDrawingBrush.color = 'red'
                canvas.freeDrawingBrush.width = 5
            }
        }
    }

    function drawCircle(x, y) {
        const circle = new fabric.Circle({
            left: x,
            top: y,
            radius: 50,
            fill: 'rgba(0,0,0,0)',
            stroke: 'red',
            strokeWidth: 2,
            selectable: true,
            hasControls: true, // 允许调整大小和旋转
            hasBorders: true,
            lockScalingFlip: true, // 锁定缩放翻转
            strokeUniform: true
        })
        canvas.add(circle)
        canvas.bringToFront(circle)
    }

    class Arrow extends fabric.Path {
        constructor(options) {
            const arrowPathString = 'M 0 0 L 100 0 M 100 0 L 80 -10 M 100 0 L 80 10';
            super(arrowPathString, options);
        }
    }


    function drawArrow(x, y) {
        const arrow = new Arrow({
            left: x,
            top: y,
            fill: '',
            stroke: 'red',
            strokeWidth: 3,
            selectable: true,
            hasControls: true,
            hasBorders: true
        });
        canvas.add(arrow);
        canvas.bringToFront(arrow);
    }


    function drawRect(x, y) {
        const rect = new fabric.Rect({
            left: x,
            top: y,
            width: 200,
            height: 100,
            fill: 'rgba(0,0,0,0)',
            stroke: 'red',
            strokeWidth: 2,
            selectable: true,
            hasControls: true, // 允许调整大小和旋转
            hasBorders: true,
            lockScalingFlip: true, // 锁定缩放翻转
            strokeUniform: true
        });
        canvas.add(rect);
        canvas.bringToFront(rect);
    }

    function drawEditableText(x, y) {
        const text = new fabric.Textbox('Tips', {
            left: x,
            top: y,
            fill: 'red',
            fontSize: 80,          // 字体大小，初始为30
            originX: 'center',     // 以中心对齐
            originY: 'center',     // 以中心对齐
            selectable: true,
            hasControls: true,
            hasBorders: true,
        });
        canvas.add(text);
        canvas.bringToFront(text);



        // 监听文本进入编辑模式事件
        text.on('editing:entered', function () {
            isEditingText = true;
        });

        // 监听文本退出编辑模式事件
        text.on('editing:exited', function () {
            isEditingText = false;
        });


    }

    // 监听键盘事件
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Delete' || e.key === 'Backspace') {
            if (!isEditingText) {
                const activeObjects = canvas.getActiveObjects();
                if (activeObjects.length > 0) {
                    activeObjects.forEach((obj) => canvas.remove(obj));
                    // 清除选中对象
                    canvas.discardActiveObject();
                    // 重新渲染画布
                    canvas.renderAll();
                }
            }
        }
    });
})()