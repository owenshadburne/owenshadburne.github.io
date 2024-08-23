import { getUserData, updateUserData, onUserData } from "/Include/MealMatch/Firebase/firebase-database.js";
import { getCookie } from "/Include/Miscellaneous/cookies.js";
import { getNested } from "/Include/Miscellaneous/object-commands.js";
import MatchTile from "/Include/MealMatch/Page Scripts/match-tile.js";
let matchID, userID, slot, template;
let decidedBox, decidedText, failedText, decidedModal;
const confettiOptions = {
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    shapes: ["square"],
    zIndex: 1060
}

function onDocumentLoad() {
    setID();
    setDecision();
    setTile();
}

function setID() {
    const search = window.location.search;
    matchID = getID(search);
    userID = getCookie("uid");
}
function getID(search) {
    const parameters = search.substring(1).split("&");
    for(const parameter of parameters) {
        const split = parameter.split("=");
        if(split[0] == "id") {
            return split[1];
        }
    }
    return "";
}

function setTile() {
    slot = document.getElementById("slot");
    template = document.getElementById("template");
    
    createTiles();
}

async function createTiles() {
    const locationsUnclean = await getUserData("public/match/locations", matchID);
    const locations = removeResponded(locationsUnclean);


    const len = Object.keys(locations).length;
    let count = 0;
    for(const [ id, location ] of Object.entries(locations)) {
        const active = (len - 2) <= count++;
        createTile(id, location, active);
    }

    hidePlaceholder();
}
function removeResponded(locationsUnclean) {
    let locations = {};
    for(const [ id, location ] of Object.entries(locationsUnclean)) {
        const response = getNested(location, "responses", userID);
        if(response == "U") {
            locations[id] = location;
        }
    }
    return locations;
}
function createTile(id, location, active) {
    const clone = template.content.cloneNode(true);
    new MatchTile(clone, id, location, decision, active);
    slot.append(clone);
}
function hidePlaceholder() {
    const placeholder = document.getElementById("placeholder");
    placeholder.classList.add("visually-hidden");
}

function setDecision() {
    decidedBox = document.getElementById("decided-box");
    decidedText = document.getElementById("decided-text");
    failedText = document.getElementById("failed-text");
    decidedModal = getModal("decidedModal");

    const path = getDecidedPath();
    onUserData(path, displayDecided);
}

async function decision(id, isYes) {
    const path = getResponsesPath(id);
    let response = {};
    response[userID] = isYes ? "Y" : "N";

    updateUserData(path, response, matchID);
    awaitDecisionUpdate(path, id);
}
function awaitDecisionUpdate(path, id) {
    const userPath = `${path}/${userID}`;
    onUserData(userPath, () => {
        checkPlaceDecision(id);
    });
}
async function checkPlaceDecision(id) {
    const decidedPath = `${getDecidedPath()}/${id}`;
    const isDecided = await getUserData(decidedPath, matchID);

    if(!isDecided) {
        const path = getResponsesPath(id);
        const responses = await getUserData(path, matchID);
        const decisionPath = `${getLocationPath(id)}/decision`;
        const decision = await getUserData(decisionPath, matchID);

        let yes = 0, responded = 0, total = 0;
        for(const [ id, decision ] of Object.entries(responses)) {
            if(decision == "Y") { yes++; }
            if(decision != "U") { responded++; }
            total++;
        }
        let leniency = Math.max(Math.floor(Math.sqrt(total - 1) - 1), 0);
        const yesVote = yes + leniency >= total;
        const allResponded = responded == total;

        if(yesVote) {
            placeDecided(id);
        }
        if(!decision && allResponded) {
            setIndividualDecision(id, yesVote);
            awaitIndividualDecision(id);
        }
    }
}

function placeDecided(id) {
    const path = getDecidedPath();
    let data = {};
    data[id] = true;

    updateUserData(path, data, matchID);
    displayDecided();
}
async function displayDecided() {
    const decidedPath = getDecidedPath();
    const decided = await getUserData(decidedPath, matchID);

    const failedPath = "public/match/failed";
    const failed = await getUserData(failedPath, matchID);

    if(decided) {
        const html = await getDecidedHTML(decided);
        decidedModal.show();
        decidedText.innerHTML = html;
        decidedBox.innerHTML = html;
        confetti(confettiOptions);
    }
    else if(failed) {
        failedText.classList.remove("visually-hidden");
    }
}
async function getDecidedHTML(decided) {
    const locationPath = `public/match/locations`;
    const locations = await getUserData(locationPath, matchID);

    let html = "";
    for(const id in decided) {
        const location = locations[id];
        const name = location["name"];
        const address = location["address"];
        const maps = location["maps"];
        const category = location["category"];

        html += `
        <h1>${name}</h1>
        <ul class="opacity-1">
            <li> ${category} </li>
            <li> <a class="text-white" href="${maps}">${address}</a> </li>
        </ul>
        `;
    }

    return `${html}`;    
}

function setIndividualDecision(id, yesVote) {
    const locationPath = getLocationPath(id);
    let data = {};
    data["decision"] = yesVote ? "Y" : "N";
    updateUserData(locationPath, data, matchID);
}
function awaitIndividualDecision(id) {
    const decisionPath = `${getLocationPath(id)}/decision`;
    onUserData(decisionPath, checkFailedMatch);
}
async function checkFailedMatch() {
    const decidedPath = getDecidedPath();
    const hasDecided = await getUserData(decidedPath, matchID);

    if(!hasDecided) {
        const path = "public/match/locations";
        const locations = await getUserData(path, matchID);

        let haveDecision = 0, total = 0;
        for(const [ id, location ] of Object.entries(locations)) {
            if(location["decision"]) { haveDecision++; }
            total++;
        }

        if(haveDecision == total) {
            setFailedMatch();
        }
    }
}
function setFailedMatch() {
    const path = "public/match";
    let data = {};
    data["failed"] = true;
    updateUserData(path, data, matchID);
}

function getLocationPath(id) {
    return `public/match/locations/${id}`;
}
function getResponsesPath(id) {
    return `${getLocationPath(id)}/responses`;
}
function getDecidedPath() {
    return "public/match/decided";
}

function getModal(elementID) {
    return new bootstrap.Modal(document.getElementById(elementID));
}

document.addEventListener("DOMContentLoaded", onDocumentLoad);
