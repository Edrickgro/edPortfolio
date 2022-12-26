"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
let VOICE_SYNTH;
VOICE_SYNTH = window.speechSynthesis;
let VOICE_RATE = 1;
let voiceIncrement = 1.1;
let voiceDecrement = 0.9;
let ELEMENT_HANDLERS = {};
let current = 0;
let interactive = false;
let currCol = 0;
let currRow = 0;
let rowCount = 0;
let started = false;
let paused = false;
let ELEMENT_IDS;
/**
 * Speaks out text.
 * @param text the text to speak
 */
function speak(text, id) {
    return __awaiter(this, void 0, void 0, function* () {
        if (VOICE_SYNTH) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = VOICE_RATE;
            utterance.voice = speechSynthesis.getVoices()[33];
            const currElem = document.getElementById(id);
            if (currElem != null) {
                const originalColor = currElem.style.backgroundColor;
                const originalBorder = currElem.style.backgroundColor;
                return new Promise((resolve) => {
                    utterance.onstart = () => {
                        currElem.focus();
                        if (currElem.tagName == "IMG") {
                            currElem.style.border = "5px solid yellow";
                        }
                        currElem.style.backgroundColor = "yellow";
                    };
                    utterance.onend = () => {
                        currElem.style.backgroundColor = originalColor;
                        currElem.style.border = originalBorder;
                        currElem.blur();
                        resolve();
                    };
                    VOICE_SYNTH.speak(utterance);
                });
            }
            else {
                return new Promise((resolve) => {
                    utterance.onend = () => resolve();
                    VOICE_SYNTH.speak(utterance);
                });
            }
        }
    });
}
/**
 * Methods called when loading the HTML window.
 */
window.onload = () => {
    giveIDs();
    generateHandlers();
    VOICE_SYNTH = window.speechSynthesis;
    VOICE_RATE = 1;
    document.body.innerHTML = `
        <div id="screenReader">
            <button onclick = "start()">Start [Space]</button>
            <button onclick = "if (!paused) {pause();} else {resume();}">Pause/Resume [P]</button>
            <button onclick = "changeVoiceRate(voiceIncrement);">Speed Up [Right Arrow]</button>
            <button onclick = "changeVoiceRate(voiceDecrement);">Slow Down [Left Arrow]</button>
            <button onclick = "next();">Next [Down Arrow]</button>
            <button onclick = "previous();">Previous [Up Arrow]</button>
        </div>
    ` + document.body.innerHTML;
    document.addEventListener("keydown", globalKeystrokes);
};
/**
 * Generates handler functions for each HTMLElement
 */
function generateHandlers() {
    const elements = document.getElementsByTagName("*");
    ELEMENT_IDS = [];
    for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        if (importantEntry(element)) {
            let id = element.id;
            console.log(id);
            ELEMENT_IDS.push(id);
            const handler = setHandler(element);
            ELEMENT_HANDLERS[id] = { element, handler };
            if (element.tagName === "TABLE") {
                let numChildren = element.getElementsByTagName("*").length;
                i += numChildren;
            }
        }
    }
}
/**
 * Gives element ID in HTMl.
 */
function giveIDs() {
    const elements = document.getElementsByTagName("*");
    for (let i = 0; i < elements.length; i++) {
        if (importantEntry(elements[i])) {
            let id = "";
            if (!elements[i].hasAttribute("id")) {
                id = String(i);
            }
            else {
                id = elements[i].id;
            }
            elements[i].id = id;
        }
    }
}
/**
 * Determines whether element has an relevant tag
 * @param element input element
 */
function importantEntry(element) {
    let importantEntries = ["TITLE", "H1", "H2", "H3", "H4", "H5", "H6", "P", "IMG", "A", "INPUT", "BUTTON", "TABLE", "CAPTION",
        "TFOOT", "TH", "TR", "TD"];
    return importantEntries.includes(element.tagName);
}
/**
 * Sets handler functions for each tag type
 * @param elt input element
 */
function setHandler(elt) {
    let tag = elt.tagName.toLowerCase();
    switch (tag) {
        case "title":
            return (elt) => __awaiter(this, void 0, void 0, function* () {
                interactive = false;
                yield speak("Page title: " + elt.textContent, elt.id);
            });
        case "h1":
        case "h2":
        case "h3":
        case "h4":
        case "h5":
        case "h6":
            return (elt) => __awaiter(this, void 0, void 0, function* () {
                interactive = false;
                yield speak("Header: " + elt.textContent, elt.id);
            });
        case "p":
            return (elt) => __awaiter(this, void 0, void 0, function* () {
                interactive = false;
                yield speak("Paragraph: " + elt.textContent, elt.id);
            });
        case "img":
            return (elt) => __awaiter(this, void 0, void 0, function* () {
                interactive = false;
                yield speak("Image", elt.id);
                if (elt.hasAttribute("alt")) {
                    yield speak(elt.getAttribute("alt") || "", elt.id);
                }
            });
        case "a":
            return (elt) => __awaiter(this, void 0, void 0, function* () {
                interactive = true;
                yield speak("link: " + elt.innerHTML, elt.id);
                if (elt.hasAttribute("href")) {
                    yield speak("links to: " + elt.getAttribute("href"), elt.id);
                }
                function linkHandler() {
                    return new Promise((resolve) => {
                        document.addEventListener('keydown', enterEscapeHandler);
                        function enterEscapeHandler(e) {
                            const link = elt.getAttribute("href");
                            if (e.key === "Enter" && link != null) {
                                e.preventDefault();
                                window.open(link);
                                resolve();
                            }
                            else if (e.key === "Escape") {
                                e.preventDefault();
                                resolve();
                            }
                        }
                    });
                }
                document.addEventListener("keydown", linkHandler);
                yield speak("Press the enter key to access this link or escape to continue.", elt.id);
                yield linkHandler();
                document.removeEventListener("keydown", linkHandler);
                elt.blur();
            });
        case "input":
            return (elt) => __awaiter(this, void 0, void 0, function* () {
                interactive = true;
                function buttonHandler() {
                    return new Promise((resolve) => {
                        document.addEventListener('keydown', enterOrEscButtonFinder);
                        elt.focus();
                        function enterOrEscButtonFinder(e) {
                            if (e.key === "Enter") {
                                elt.click();
                                resolve();
                            }
                            else if (e.key === "Escape") {
                                e.preventDefault();
                                resolve();
                            }
                        }
                    });
                }
                function inputTextHandler() {
                    return new Promise((resolve) => {
                        document.addEventListener('keydown', enterOrEscButtonFinder);
                        function enterOrEscButtonFinder(e) {
                            const elt1 = elt;
                            if (e.key === "Enter" || e.key === "Escape") {
                                e.preventDefault();
                                resolve();
                            }
                        }
                    });
                }
                if (elt.hasAttribute("type")) {
                    var type = elt.getAttribute("type");
                    if (type === "submit") {
                        yield speak("button", elt.id);
                        if (elt.hasAttribute("value")) {
                            yield speak(elt.getAttribute("value") || "", elt.id);
                        }
                        document.addEventListener("keydown", buttonHandler);
                        yield speak("Please press the enter key to press this button, or escape to continue.", elt.id);
                        yield buttonHandler();
                        document.removeEventListener("keydown", buttonHandler);
                    }
                    else if (type === "text") {
                        yield speak("input text:" + getLabel(elt), elt.id);
                        document.addEventListener("keydown", inputTextHandler);
                        yield speak("Please enter input text, then press the enter key to continue. " +
                            "Press escape if you would like to skip this input box.", elt.id);
                        yield inputTextHandler();
                        document.removeEventListener("keydown", inputTextHandler);
                    }
                    else {
                        yield speak("input: " + elt.getAttribute("type") + getLabel(elt), elt.id);
                    }
                }
                else {
                    yield speak("input: " + getLabel(elt), elt.id);
                }
                elt.blur();
            });
        case "button":
            return (elt) => __awaiter(this, void 0, void 0, function* () {
                interactive = false;
                yield speak("button: " + elt.innerHTML, elt.id);
            });
        case "table":
            return (elt) => __awaiter(this, void 0, void 0, function* () {
                interactive = false;
                let table = document.getElementById(elt.id);
                loadTable(table);
                yield speak("Table with " + numRows + " rows and " + numCols + " columns. "
                    + "Use the arrow keys to navigate the table, press c to hear the current location in the table, and press n to exit the table.", elt.id);
                document.removeEventListener("keydown", globalKeystrokes);
                currRow = 1;
                currCol = 1;
                speakLocation(currRow, currCol);
                yield tableNavigation();
                document.addEventListener("keydown", globalKeystrokes);
            });
        case "caption":
            return (elt) => __awaiter(this, void 0, void 0, function* () {
                interactive = false;
                yield speak("Caption: " + elt.textContent, elt.id);
            });
        case "td":
            return (elt) => __awaiter(this, void 0, void 0, function* () {
                interactive = false;
                yield speak("Column " + currCol + " " + elt.textContent, elt.id);
                currCol++;
            });
        case "tfoot":
            return (elt) => __awaiter(this, void 0, void 0, function* () {
                interactive = false;
                yield speak("Table Footer:" + elt.innerHTML, elt.id);
            });
        case "th":
            return (elt) => __awaiter(this, void 0, void 0, function* () {
                interactive = false;
                yield speak("Table Header:" + elt.innerHTML, elt.id);
            });
        case "tr":
            return (elt) => __awaiter(this, void 0, void 0, function* () {
                interactive = false;
                currRow++;
                currCol = 1;
                yield speak("Row" + currRow + "of " + rowCount, elt.id);
            });
        case "text":
            return (elt) => __awaiter(this, void 0, void 0, function* () {
                yield speak(elt.innerHTML, elt.id);
            });
        default:
            return () => __awaiter(this, void 0, void 0, function* () { return undefined; });
    }
}
/**
 * Gets the label for an element in the DOM
 * @param element HTMLElement where label is to be searched
 */
function getLabel(element) {
    const labels = document.getElementsByTagName('label');
    for (let i = 0; i < labels.length; i++) {
        console.log(labels[i].innerHTML);
        if (labels[i].htmlFor === element.id) {
            return labels[i].innerText;
        }
    }
    return "";
}
/**
 * Changes the speaking rate.
 * @param multiplier on the speaking rate
 */
function changeVoiceRate(multiplier) {
    VOICE_RATE *= multiplier;
    //sets limits on how fast/slow screen reader can be
    if (VOICE_RATE > 4) {
        VOICE_RATE = 4;
    }
    else if (VOICE_RATE < 0.25) {
        VOICE_RATE = 0.25;
    }
}
/**
 * Moves to the next HTML element.
 */
function next() {
    VOICE_SYNTH.cancel();
}
/**
 * Moves to the previous HTML element.
 */
function previous() {
    VOICE_SYNTH.cancel();
    if (current > 2) {
        current -= 2;
    }
    else {
        current = 0;
    }
}
/**
 * Starts reading the page continuously.
 */
function start() {
    return __awaiter(this, void 0, void 0, function* () {
        for (let i = 0; i < ELEMENT_IDS.length; i++) {
            i = current;
            const id = ELEMENT_IDS[i];
            let currElem = ELEMENT_HANDLERS[id];
            current++;
            yield currElem.handler(currElem.element);
        }
        yield speak("Reached the end of page. Please refresh page to begin screen reader again.", "");
    });
}
/**
 * Pauses the reading.
 */
function pause() {
    paused = true;
    VOICE_SYNTH.pause();
}
/**
 * Resumes the reading.
 */
function resume() {
    paused = false;
    VOICE_SYNTH.resume();
}
/**
 * Listens for keydown events.
 * @param event keydown event
 */
function globalKeystrokes(event) {
    if (event.key === " " && !interactive) {
        event.preventDefault();
        if (!started) {
            start();
        }
        started = true;
    }
    else if (event.key === "p" && !interactive) {
        event.preventDefault();
        if (paused) {
            resume();
        }
        else {
            pause();
        }
    }
    else if (event.key === "ArrowRight") {
        event.preventDefault();
        changeVoiceRate(voiceIncrement);
    }
    else if (event.key === "ArrowLeft") {
        event.preventDefault();
        changeVoiceRate(voiceDecrement);
    }
    else if (event.key === "ArrowUp") {
        event.preventDefault();
        previous();
    }
    else if (event.key === "ArrowDown") {
        event.preventDefault();
        next();
    }
}
let loadedTable = [];
let numRows = 0;
let numCols = 0;
/**
 * Loads the table element into table.
 * @param table - table element
 */
function loadTable(table) {
    loadedTable = [];
    for (let i = 0; i < table.rows.length; i++) {
        loadedTable.push([]);
        for (let j = 0; j < table.rows[i].children.length; j++) {
            loadedTable[i].push(table.rows[i].children[j]);
        }
    }
    numRows = loadedTable.length;
    numCols = loadedTable[0].length;
}
/**
 * Handles table navigation.
 * @returns Promise indicating when we have left the table.
 */
function tableNavigation() {
    return new Promise((resolve) => {
        document.addEventListener("keydown", navigationHandler);
        function navigationHandler(event) {
            if (event.key === "c") {
                event.preventDefault();
                VOICE_SYNTH.cancel();
                speak("Current table location: row " + currRow + ", column " + currCol, "");
            }
            else if (event.key === "n") {
                event.preventDefault();
                VOICE_SYNTH.cancel();
                speak("You are exiting the table.", "");
                document.removeEventListener("keydown", navigationHandler);
                resolve();
            }
            else if (event.key === "ArrowRight" && currCol < numCols) {
                event.preventDefault();
                currCol++;
                speakLocation(currRow, currCol);
            }
            else if (event.key === "ArrowLeft" && currCol > 1) {
                event.preventDefault();
                currCol--;
                speakLocation(currRow, currCol);
            }
            else if (event.key === "ArrowUp" && currRow > 1) {
                event.preventDefault();
                currRow--;
                speakLocation(currRow, currCol);
            }
            else if (event.key === "ArrowDown" && currRow < numRows) {
                event.preventDefault();
                currRow++;
                speakLocation(currRow, currCol);
            }
        }
    });
}
/**
 * Function to speak a specified location in the table.
 * @param row - row (1-indexed)
 * @param col - column (1-indexed)
 */
function speakLocation(row, col) {
    return __awaiter(this, void 0, void 0, function* () {
        let element = loadedTable[row - 1][col - 1];
        VOICE_SYNTH.cancel();
        if (element.firstElementChild == null) {
            if (element.innerHTML.length == 0) {
                speak("Empty element at row " + row + " column " + col, element.id);
            }
            else {
                speak("Text at " + row + " column " + col + " : " + element.innerHTML, element.id);
            }
        }
        else {
            const innerHandler = setHandler(element.firstElementChild);
            yield innerHandler(element.firstElementChild);
        }
    });
}
