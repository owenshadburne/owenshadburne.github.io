import Enumerate from "/Include/Miscellaneous/enumerate.js";
import { Types, TypeList } from "/Include/RPS/types.js";
import Canvas from "/Include/RPS/canvas.js";
import ai from "/Include/RPS/ai.js";
let canvas, canvasEnumerate;
let playerDisplay, aiDisplay;
let scoreDisplay, scoreEnumerate;
const playerColor = "#2d84fc", aiColor = "#fc2d50";

function onDocumentLoad() {
    playerDisplay = getElement("playerDisplay");
    aiDisplay = getElement("aiDisplay");
    scoreDisplay = getElement("scoreDisplay");
    
    setCanvas();
    setOnClicks();
}

function setCanvas() {
    canvas = new Canvas(getElement("canvas"));
    canvas.newBubble("Rock");
    canvas.newBubble("Paper");
    canvas.newBubble("Scissors");

    canvas.connectBubble("Rock", "Scissors");
    canvas.connectBubble("Paper", "Rock");
    canvas.connectBubble("Scissors", "Paper");
    update();
}
function update() {
    canvasEnumerate = new Enumerate(() => {
        canvas.update();
    });
}

function setOnClicks() {
    for(const name of TypeList) {
        const type = Types[name];
        setOnClick(name, () => makeMove(type));
    }
}
function setOnClick(id, callback) {
    document.getElementById(id)?.
        addEventListener("click", callback);
}

function makeMove(playerType) {
    const aiType = ai.getMove();
    const score = playerType.attack(aiType);

    setBubbleColors(playerType, aiType, score);
    updateScore(score);
    updateDisplay(playerType, aiType);
}
function setBubbleColors(playerType, aiType, score) {
    const playerWin = score > 0;
    const tie = score == 0;
    const aiWin = score < 0;

    canvas.resetBubbleColors();

    if(playerWin) {
        canvas.colorBubble(playerType, playerColor, aiType.name);
        canvas.colorBubble(aiType, aiColor);
    }
    else if(tie) {
        canvas.colorBubble(playerType, playerColor);
        canvas.colorBubble(aiType, playerColor);
    }
    else if(aiWin) {
        canvas.colorBubble(playerType, playerColor);
        canvas.colorBubble(aiType, aiColor, playerType.name);
    }
    
}
function updateScore(score) {
    const prevScore = parseInt(scoreDisplay.textContent);
    scoreDisplay.textContent = prevScore + score;
    
    if(score != 0) {
        if(scoreEnumerate) { 
            scoreEnumerate.stop();
        }
        
        scoreEnumerate = new Enumerate(popDisplay, { 
            "element": scoreDisplay,
            "size": 3,
            "minSize": 1
        });
    }
}
function updateDisplay(playerType, aiType) {
    playerDisplay.textContent = playerType.name;
    aiDisplay.textContent = aiType.name;
}

function popDisplay(options) {
    const { element, size, minSize } = options;

    if(size <= minSize) { 
        element.style.fontSize = `${minSize}rem`;
        return { "exit": true };
    }
    
    element.style.fontSize = `${size}rem`;

    return {
        "element": element,
        "size": size - 1/10,
        "minSize": minSize
    };
}

function getElement(id) {
    return document.getElementById(id);
}

document.addEventListener("DOMContentLoaded", onDocumentLoad);