import { dialogueData } from "./constants";

export function displayDialogue(text, onDisplayEnd, dialogue_name) {
    const dialogueUI = document.getElementById("textbox-container");
    const dialogue = document.getElementById("dialogue");
    dialogueUI.style.display = "block";
    let answered = false;
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
        } else if (key.code === "Digit1") {
            onQuestionAwnser('1');
        } else if (key.code === "Digit2") {
            onQuestionAwnser('2');
        } else if (key.code === "Digit3") {
            onQuestionAwnser('3');
        } else if (key.code === "Digit4") {
            onQuestionAwnser('4');
        }
    });

    function onQuestionAwnser(number) {
        if (dialogueData[dialogue_name+"_answer"] !== undefined && !answered) {
            if (dialogueData[dialogue_name+"_answer"] === number) {
                console.log("correct");
                dialogue.innerHTML = dialogueData[dialogue_name+"_right"];
                answered = true;
            } else {
                console.log("wrong");
                dialogue.innerHTML = dialogueData[dialogue_name+"_wrong"];
                answered = true;
            }
        } else {
            return;
        }
    }
}

export function setCamScale(k) {
    const resizeFactor = k.width() / k.height();
    if (resizeFactor < 1) {
        k.camScale(k.vec2(1));
    } else {
        k.camScale(k.vec2(1.5));
    }
}
