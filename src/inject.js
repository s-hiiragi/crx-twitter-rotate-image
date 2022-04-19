// TODO 画像の両脇の矢印ボタンを押して画像を切り替えた際にも回転ボタンを表示する
// TODO ボタンが一度表示された後に消えることがある
// TODO ボタンが表示された状態でウィンドウサイズを変えると正しく動作しない
// TODO 画像をクリックすると閉じてしまう

//console.log('inject');

let lastNumContainers = 0;

let retryCount = 5 * 10;  // 10秒程度リトライする
setTimeout(preMain, 200);

function preMain() {
    const targetNode = document.querySelector('#layers');

    // #layers要素が読み込まれるまでリトライする
    if (!targetNode) {
        if (retryCount > 0) {
            setTimeout(preMain, 200);
        } else {
            console.log('ERROR: preMain(): retry count exceeded');
        }
        retryCount--;
        return;
    }

    observeMain(targetNode);
}

function observeMain(targetNode) {
    const config = { attributes: false, childList: true, subtree: false };
    const observer = new MutationObserver((mutationList, observer) => {
        if (mutationList[0].removedNodes.length >= 1) {
            return;
        }
        if (targetNode.children.length == 2) {
            retryCount = 5 * 10;  // 10秒ほどリトライする
            setTimeout(preAddButton, 200);
        }
    });
    observer.observe(targetNode, config);
};

function preAddButton() {
    const numContainers = document.querySelectorAll('[aria-label="画像"]').length;

    // 要素数が変化しなくなるまでリトライする
    if (numContainers !== lastNumContainers) {
        lastNumContainers = numContainers;
        if (retryCount > 0) {
            setTimeout(preAddButton, 200);
        } else {
            console.log('ERROR: preAddButton(): retry count exceeded');
        }
        retryCount--;
        return;
    }

    addRotateButton();
}

function addRotateButton() {
    if (!/^\/\w+\/status\/\d+\/photo\/\d$/.test(location.pathname)) {
        return;
    }

    const imgNumber = Number(location.pathname.match(/\d$/)[0]);
    const imgContainer = document.querySelectorAll('[aria-label="画像"]').item(imgNumber - 1);

    imgContainer.dataset.deg = 0;

    const sizeDiv = imgContainer.parentNode.parentNode;
    sizeDiv.style.width = window.getComputedStyle(sizeDiv.parentNode).width;

    const closeDiv = sizeDiv.parentNode.parentNode.parentNode;
    imgContainer.addEventListener('click', (event) => {
        closeDiv.click();
    });

    const rotateButton = document.createElement('button');
    rotateButton.textContent = '左90°回転';
    rotateButton.style.cssText = `
        width: 6em;
        position: absolute;
        right: 0px;
        bottom: 0px;
    `;
    rotateButton.onclick = (event) => {
        event.stopPropagation();

        const newDeg = Number(imgContainer.dataset.deg) - 90;
        imgContainer.dataset.deg = newDeg;
        imgContainer.children[0].style.transform = `rotateZ(${newDeg}deg)`;
    };
    sizeDiv.parentNode.appendChild(rotateButton);
}
