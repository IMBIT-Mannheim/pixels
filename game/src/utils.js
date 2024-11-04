import {scaleFactor} from "./constants.js";

export function displayDialogue(text, onDisplayEnd) {
    const dialogueUI = document.getElementById("textbox-container");
    const dialogue = document.getElementById("dialogue");

    dialogueUI.style.display = "block";
    let index = 0;
    let currentText = "";
    const intervalRef = setInterval(() => {
        if (index < text.length) {
            currentText += text[index];
            dialogue.innerHTML = currentText;
            index++;
            return;
        }

        clearInterval(intervalRef);
    }, 1);

    const closeBtn = document.getElementById("close");

    function onCloseBtnClick() {
        onDisplayEnd();
        dialogueUI.style.display = "none";
        dialogue.innerHTML = "";
        clearInterval(intervalRef);
        closeBtn.removeEventListener("click", onCloseBtnClick);
    }

    closeBtn.addEventListener("click", onCloseBtnClick);

    addEventListener("keypress", (key) => {
        if (key.code === "Enter") {
            closeBtn.click();
        }
    });
}

export function setCamScale(k) {
    const resizeFactor = k.width() / k.height();
    if (resizeFactor < 1) {
        k.camScale(k.vec2(1));
    } else {
        k.camScale(k.vec2(1.5));
    }
}

export function enableFullMapView(k, map) {
    const screenWidth = k.width();
    const screenHeight = k.height();
    const mapWidth = map.width * scaleFactor;
    const mapHeight = map.height * scaleFactor;

    const marginFactor = 0.1;  // 10% margin on each side
    const scaleX = screenWidth / (mapWidth * (1 + marginFactor));
    const scaleY = screenHeight / (mapHeight * (1 + marginFactor));
    const fitScale = Math.min(scaleX, scaleY);

    k.camPos(mapWidth / 2, mapHeight / 2);
    k.camScale(fitScale);
    document.getElementsByClassName("note")[0].style.display = "none";
}

export function disableFullMapView(k) {
    document.getElementsByClassName("note")[0].style.display = "block";
    setCamScale(k);
}