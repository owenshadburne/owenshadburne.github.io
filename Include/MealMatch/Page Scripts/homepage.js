import { getUserData, getDisplayName } from "/Include/MealMatch/Firebase/firebase-database.js";
import { getCookie, removeCookie } from "/Include/Miscellaneous/cookies.js";
import { login, logout, loginStatus } from "/Include/MealMatch/Firebase/firebase-login.js";
import { goToMatch } from "/Include/MealMatch/Page Scripts/redirect.js";
let toolbar, loginBtn, logoutBtn, disclaimer;
let matchContainer, matchTemplate, noMatchDisclaimer, spinner;
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const decidedImage = "/Images/MealMatch/Favorite.svg", failedImage = "/Images/MealMatch/Broken_heart.svg";

function onDocumentLoad() {
    setLogging();
    setMatches();
    checkLoginStatus();
}

function setLogging() {
    toolbar = document.getElementById("toolbar");
    loginBtn = document.getElementById("login");
    logoutBtn = document.getElementById("logout");
    disclaimer = document.getElementById("login_disclaimer");

    loginBtn.addEventListener("click", tryLogin);
    logoutBtn.addEventListener("click", tryLogout);
}
function checkLoginStatus() {
    setTimeout(waitForLoginStatus, 500);
}
function waitForLoginStatus() {
    if(loginStatus === null) {
        waitForLoginStatus();
    }
    else {
        computeLoginStatus();
    }
}
function computeLoginStatus() {
    if(loginStatus) {
        onLogin();
    }
}

function tryLogin() {
    login(onLogin, loginFailure);
}
function onLogin() {
    console.log(`Log in success.`);
    toggleAssetVisibilty(true);
    populateHomepage();
}
function loginFailure(error) {
    console.error(`Log in error: ${error}`);
}

function tryLogout() {
    logout(onLogout, logoutFailure);
}
function onLogout() {
    console.log("Log out success.");

    toggleAssetVisibilty(false);
    toggleSpinner(false);
    depopulateHomepage();
    removeAllCookies();
}
function logoutFailure(error) {
    console.error(`Log out error: ${error}`);
}

function setMatches() {
    matchContainer = document.getElementById("match-container");
    matchTemplate = document.getElementById("match-template");
    noMatchDisclaimer = document.getElementById("no-matches-disclaimer");
    spinner = document.getElementById("spinner");
}

async function populateHomepage() {
    toggleSpinner(true);
    setVisible(noMatchDisclaimer, false);
    let hasMatch = await populateMatches();
    setVisible(noMatchDisclaimer, !hasMatch);
    toggleSpinner(false);
}
async function populateMatches() {
    let matches = [];

    const personal = await populatePersonalMatch();
    if(personal) { matches.push(personal); }
    const requests = await populateMatchRequests();
    if(requests.length > 0) { matches = matches.concat(requests); }

    matches.sort(sortByDate);
    const uid = getCookie("uid");
    for(const match of matches) {
        addToHomepage(match["match"], match["creator"], match["id"], uid);
    }

    return matches.length != 0;
}
async function populatePersonalMatch() {
    const match = await getUserData("public/match");
    if(match) {
        const uid = getCookie("uid");
        return { 
            "match": match,
            "creator": "You",
            "id": uid
        };
    }

    return null;
}
async function populateMatchRequests() {
    let reqArray = [];
    const requests = await getUserData("writeonly/match_requests");
    if(requests) {
        for(const uid in requests) {
            const match = await getUserData("public/match", uid);
            const displayName = await getDisplayName(uid);
            reqArray.push({
                "match": match,
                "creator": displayName,
                "id": uid
            })
        }
    }

    return reqArray;
}
function addToHomepage(match, creator, id, uid) {    
    const clone = matchTemplate.content.cloneNode(true);

    const matchElement = clone.querySelector("#match-element");
    matchElement.classList.add("match-element");

    const creatorText = clone.querySelector("#creator");
    creatorText.textContent = creator;

    const date = clone.querySelector("#date");
    date.textContent = getDate(match);

    const address = clone.querySelector("#address");
    address.textContent = match["address"];

    const people = clone.querySelector("#people");
    people.textContent = `With ${getPeople(match, uid)}`;

    const image = clone.querySelector("#match-image");
    if(match["decided"]) { image.src = decidedImage; }
    else if(match["failed"]) { image.src = failedImage; }

    matchElement.addEventListener("click", () => goToMatch(id));

    matchContainer.append(clone);
}
function getDate(match) {
    const dateSplit = match["date"].split("/");
    const timeSplit = match["time"].split(" ");
    const timeNum = timeSplit[0].split(":");

    const month = months[dateSplit[0] - 1];
    const newDate = `${month} ${dateSplit[1]}`;
    const newTime = `${timeNum[0]}:${timeNum[1]} ${timeSplit[1]}`;
    return `${newDate} at ${newTime}`;
}
function getPeople(match, uid) {
    let people = "";
    for(const [ id, person ] of Object.entries(match["people"])) {
        people += (people == "" ? "" : ", ");
        if(id == uid) { people += "You"; }
        else { people += person; }
    }
    
    return people;
}

function sortByDate(a, b) {
    const dA = `${a["match"]["date"]} ${a["match"]["time"]}`;
    const dB = `${b["match"]["date"]} ${b["match"]["time"]}`;
    const dateA = new Date(dA);
    const dateB = new Date(dB);
    return dateB - dateA;
}

function depopulateHomepage() {
    const elements = document.getElementsByClassName("match-element");
    for(let i = elements.length - 1; i >= 0; i--) {
        elements.item(i).remove();
    }
}

function toggleAssetVisibilty(isVisible) {  
    if(isVisible) {
        setVisible(toolbar, true);
        setVisible(logoutBtn, true);
        setVisible(loginBtn, false);
        setVisible(disclaimer, false);
    }
    else {
        setVisible(toolbar, false);
        setVisible(logoutBtn, false);
        setVisible(loginBtn, true);
        setVisible(disclaimer, true);
        setVisible(noMatchDisclaimer, false);
    }
}
function setVisible(asset, isVisible) {
    if(isVisible) {
        asset.classList.remove("visually-hidden");
    }
    else {
        asset.classList.add("visually-hidden");
    }
}
function toggleSpinner(isVisible) {
    if(isVisible) {
        spinner.classList.remove("visually-hidden");
    }
    else {
        spinner.classList.add("visually-hidden");
    }
}   

function removeAllCookies() {
    removeCookie("uid");
    removeCookie("refreshToken");
}

function setOnClick(elementID, callback) {
    document.getElementById(elementID)
        .addEventListener("click", callback);
}

document.addEventListener("DOMContentLoaded", onDocumentLoad);