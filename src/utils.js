const closeBtn = document.getElementById("close");
const dialogueUI = document.getElementById("textbox-container");
const dialogueContainer = document.getElementById("dialogue");
const scoreUI = document.getElementById("score-value");

class Typing {
    textElement;
    texts;
    textIdx;
    index;
    intervalRef;
    res;
    remaining = true;
    promise;

    constructor(textElement, texts) {
        this.textElement = textElement;
        this.texts = texts;
        this.promise = new Promise(res => {
            this.res = res;
        });
        this.startSegment(0);
    }

    startSegment(index) {
        this.textIdx = index;
        this.index = 0;
        this.textElement.innerHTML = "";
        closeBtn.innerHTML = "Ueberspringen";
        this.intervalRef = setInterval(this.type.bind(this), 1);
    }

    type() {
        if (this.index < this.texts[this.textIdx].length) {
            const newText = this.texts[this.textIdx].slice(0, this.index);
            this.textElement.innerHTML = newText;
            this.index++;
        } else {
            this.stop();
        }
    }

    skip() {
        if (this.intervalRef) {
            this.stop();
            this.textElement.innerHTML = this.texts[this.textIdx];
        } else {
            this.startSegment(this.textIdx + 1);
        }
    }

    stop(force = false) {
        closeBtn.innerHTML = "Weiter";
        clearInterval(this.intervalRef);
        this.intervalRef = null;
        if (force || this.textIdx >= this.texts.length - 1) {
            this.remaining = false;
            this.res();
        }
    }
}

class Dialogue {

    _currentDialogue;
    _remainingDialogues = [];
    _typer;

    _score = 0;
    _answeredQuizzes = [];

    constructor() {
        closeBtn.addEventListener("click", this._close_or_next.bind(this));
        document.addEventListener("keydown", (key) => {
            if (!this._currentDialogue) return;
            if (key.code.startsWith("Digit") || key.code.startsWith("Numpad")) {
                const number = key.code.slice(-1) - 0;
                this._questionAnswer(number);
            } else {
                if (key.code === "Enter" || key.code === "Escape" || key.code === "Space") closeBtn.click();
            }
        });
    }

    display(dialogue_options, onDisplayEnd) {
        this._remainingDialogues = [];
        if (Array.isArray(dialogue_options)) {
            this._remainingDialogues = dialogue_options.map(d => Object.assign({}, d, { onDisplayEnd }));
        } else {
            this._remainingDialogues = [Object.assign({}, dialogue_options, { onDisplayEnd })];
        }
        this._display();
    }

    inDialogue() {
        return !!(this._currentDialogue && typeof this._currentDialogue == "object");
    }

    getScore() {
        return this._score;
    }

    resetScore() {
        this._answeredQuizzes = [];
        this._score = 0;
    }

    async _typingEffect(text) {
        if (this._typer) this._typer.stop(true);

        const textSegments = text.split("\n");

        dialogueContainer.innerHTML = "";
        if (this._currentDialogue.title) {
            const headerElement = document.createElement("h2");
            headerElement.innerHTML = this._currentDialogue.title;
            dialogueContainer.appendChild(headerElement);
        }
        const textElement = document.createElement("p");
        dialogueContainer.appendChild(textElement);

        this._typer = new Typing(textElement, textSegments);
        await this._typer.promise;

        closeBtn.innerHTML = "Schliessen";
    }

    _close_or_next() {
        if (this._typer?.remaining)
            return this._typer.skip();
        if (this._typer) this._typer.stop(true);
        if (this._remainingDialogues.length > 0)
            return this._display();
        this._currentDialogue.onDisplayEnd();
        this._currentDialogue = null;
        dialogueUI.style.display = "none";
    }

    async _display() {
        if (this._remainingDialogues.length === 0) return this._close_or_next();
        this._currentDialogue = this._remainingDialogues.shift();
        dialogueUI.style.display = "block";
        await this._typingEffect(this._currentDialogue.text);

        for (let index = 0; index < this._currentDialogue.answers.length; index++) {
            const button = document.createElement("button");
            button.classList.add("button");
            button.classList.add("question-btn");

            button.innerHTML = this._currentDialogue.answers[index];
            button.addEventListener("click", () => {
                this._questionAnswer(index + 1);
            });
            dialogueContainer.appendChild(button);
        }
    }

    _questionAnswer(number) {
        if (!this._currentDialogue) return;
        if (this._currentDialogue.correctAnswer === 0) return;
        if (number === 0) return;
        if (this._currentDialogue.answers.length < number) return;

        if (this._currentDialogue.correctAnswer === number) {
            if (!this._answeredQuizzes.includes(this._currentDialogue.id)) {
                this._score++;
                scoreUI.innerHTML = this._score;
                this._answeredQuizzes.push(this._currentDialogue.id);
            }
            this._typingEffect(this._currentDialogue.correctText);
        } else {
            this._remainingDialogues = []; // Wenn falsch, keine weiteren Dialoge anzeigen
            this._typingEffect(this._currentDialogue.wrongText);
        }
        this._currentDialogue.correctAnswer = 0;
    }
}

export const dialogue = new Dialogue();

export function setCamScale(k) {
    const resizeFactor = k.width() / k.height();
    if (resizeFactor < 1) {
        k.camScale(k.vec2(1));
    } else {
        k.camScale(k.vec2(1.5));
    }
}

export function setCookie(name, value, days) {
    const d = new Date();
    d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + d.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

export function getCookie(name) {
    const nameEQ = name + "=";
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i].trim();
        if (cookie.indexOf(nameEQ) === 0) {
            return cookie.substring(nameEQ.length);
        }
    }
    return null;
}
