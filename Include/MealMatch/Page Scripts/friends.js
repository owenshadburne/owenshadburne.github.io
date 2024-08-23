import { getUserData, updateUserData, removeUserData, getDisplayName } from "/Include/MealMatch/Firebase/firebase-database.js";
import { getCookie } from "/Include/Miscellaneous/cookies.js";
let thisUserDisplayName;
let friendcode, sendRequestInput;
let requestDiv, requestAmount, requestDropdown, requestTemplate;
let requestBreak, requestDisclaimer;
let friendDiv, friendAmount, friendDropdown, friendTemplate;
let friendBreak, friendDisclaimer;
let toastBootstrap;

function onDocumentLoad() {
    setDisplayName();
    setFriendCode();
    setSendFriendRequest();
    setFriendRequests();
    setFriends();
    setToast();
}

async function setDisplayName() {
    thisUserDisplayName = await getDisplayName();
}

function setFriendCode() {
    friendcode = document.getElementById("friendcode");
    friendcode.textContent = getCookie("uid");

    document.getElementById("friend-code-container")
        .addEventListener("click", copyToClipboard);
}
function copyToClipboard() {
    const uid = friendcode.textContent;
    navigator.clipboard.writeText(uid);
    showToast("Copied to Clipboard!");
}

function setSendFriendRequest() {
    sendRequestInput = document.getElementById("friend-request-input");
    document.getElementById("send-request")
        .addEventListener("click", sendFriendRequest);
}
async function sendFriendRequest() {
    const uid = sendRequestInput.value;
    if(uid) {
        let isValidUser = await validUser(uid);
        let thisUser = isThisUser(uid);
        let alreadFriend = await alreadyFriend(uid)
        if(isValidUser && !thisUser && !alreadFriend) {
            sendRequest(uid);
            sendRequestInput.value = "";
            showToast("Friend Request Sent!");
            return;
        }
        else if(!isValidUser) {
            showToast("Invalid Friend Code.");
        }
        else if(thisUser) {
            showToast("Cannot use own Friend Code.");
        }
        else if(alreadFriend) {
            showToast("User is already your Friend.");
        }
    }
    else {
        showToast("No Friend Code was input.");
    }
}
async function sendRequest(uid) {
    let data = {};
    data[getCookie("uid")] = thisUserDisplayName;
    updateUserData("writeonly/friend_requests", data, uid);
}
async function validUser(uid) {
    const userData = await getUserData("readonly", uid);
    if(userData) { return true; }
    return false;
}
function isThisUser(uid) {
    const thisUID = getCookie("uid");
    return thisUID == uid;
}
async function alreadyFriend(uid) {
    const friends = await getUserData("writeonly/friends");
    if(friends && uid in friends) {
        return true;
    }
    return false;
}

async function setFriendRequests() {
    requestDiv = document.getElementById("request-div");
    requestAmount = document.getElementById("request-amount");
    requestDropdown = document.getElementById("request-dropdown");
    requestTemplate = document.getElementById("request-template");

    requestBreak = document.getElementById("request-break");
    requestDisclaimer = document.getElementById("request-disclaimer");
    
    let requestCount = await populateFriendRequests();
    if(requestCount > 0) {
        toggleDisclaimer(requestDisclaimer, requestBreak, false);
    }
}
async function populateFriendRequests() {
    const requests = await getUserData("writeonly/friend_requests");

    let requestCount = 0;
    if(requests) {
        for(const [uid, displayName] of Object.entries(requests)) {
            addRequest(uid, displayName);
            requestCount++;
        }
    }

    requestAmount.textContent = `(${requestCount})`;
    return requestCount;
}
function addRequest(uid, displayName) {
    const clone = requestTemplate.content.cloneNode(true);
    
    const displayNameText = clone.querySelector("#display-name");
    displayNameText.textContent = displayName;

    const decline = clone.querySelector("#decline");
    decline.addEventListener("click", (event) => { 
        const wrapper = event.target.closest("#request-wrapper");
        answerRequest(wrapper, uid, displayName, false);
    });

    const accept = clone.querySelector("#accept");
    accept.addEventListener("click", (event) => { 
        const wrapper = event.target.closest("#request-wrapper");
        answerRequest(wrapper, uid, displayName, true);
    });

    requestDropdown.append(clone);
}
async function answerRequest(wrapper, uid, displayName, isYes) {
    wrapper.remove();
    
    let requestCount = decrementRequestAmount();
    if(requestCount <= 0) {
        toggleDisclaimer(requestDisclaimer, requestBreak, true);
    }

    removeUserData(`writeonly/friend_requests/${uid}`);

    if(isYes) {
        const thisFriendList = {};
        thisFriendList[uid] = displayName;
        updateUserData("writeonly/friends", thisFriendList);
        
        const otherFriendList = {};
        otherFriendList[getCookie("uid")] = thisUserDisplayName;
        updateUserData("writeonly/friends", otherFriendList, uid);

        showToast("Friend Request Accepted.");
    }
    else {
        showToast("Friend Request Declined.");
    }
}
function decrementRequestAmount() {
    const textContent = requestAmount.textContent;
    const stringAmount = textContent.substring(1, textContent.length - 1);
    let intAmount = parseInt(stringAmount) - 1;
    requestAmount.textContent = `(${intAmount})`;
    return intAmount;
}

async function setFriends() {
    friendDiv = document.getElementById("friend-div");
    friendAmount = document.getElementById("friend-amount");
    friendDropdown = document.getElementById("friend-dropdown");
    friendTemplate = document.getElementById("friend-template");

    friendBreak = document.getElementById("friend-break");
    friendDisclaimer = document.getElementById("friend-disclaimer");
    
    let friendCount = await populateFriends();
    if(friendCount > 0) {
        toggleDisclaimer(friendDisclaimer, friendBreak, false);
    }
}
async function populateFriends() {
    const friends = await getUserData("writeonly/friends");

    let friendCount = 0;
    if(friends) {
        for(const [uid, displayName] of Object.entries(friends)) {
            addFriend(uid, displayName);
            friendCount++;
        }
    }
    
    friendAmount.textContent = `(${friendCount})`;
    return friendCount;
}
function addFriend(uid, displayName) {
    const clone = friendTemplate.content.cloneNode(true);
    
    const displayNameText = clone.querySelector("#display-name");
    displayNameText.textContent = displayName;

    const remove = clone.querySelector("#remove");
    remove.addEventListener("click", (event) => { 
        const wrapper = event.target.closest("#friend-wrapper");
        removeFriend(wrapper, uid);
    });

    friendDropdown.append(clone);
}
function removeFriend(wrapper, uid) {
    wrapper.remove();

    let friendCount = decrementFriendAmount();
    console.log(friendCount);
    if(friendCount <= 0) {
        toggleDisclaimer(friendDisclaimer, friendBreak, true);
    }

    const thisUID = getCookie("uid");
    removeUserData(`writeonly/friends/${uid}`);
    removeUserData(`writeonly/friends/${thisUID}`, uid);
    showToast("Friend Removed.");
}
function decrementFriendAmount() {
    const textContent = friendAmount.textContent;
    const stringAmount = textContent.substring(1, textContent.length - 1);
    let intAmount = parseInt(stringAmount) - 1;
    friendAmount.textContent = `(${intAmount})`;
    return intAmount;
}

function setToast() {
    const toast = document.getElementById('liveToast');
    toastBootstrap = bootstrap.Toast.getOrCreateInstance(toast);
}
function showToast(message) {
    const toastText = document.getElementById("toast-text");
    toastText.textContent = message;
    toastBootstrap.show();
}

function setVisible(asset, isVisible) {
    if(isVisible) {
        asset.classList.remove("visually-hidden");
    }
    else {
        asset.classList.add("visually-hidden");
    }
}
function toggleDisclaimer(disclaimer, breakpoint, isVisible) {
    if(isVisible) {
        disclaimer.classList.remove("visually-hidden");
        breakpoint.classList.add("visually-hidden");
    }
    else {
        disclaimer.classList.add("visually-hidden");
        breakpoint.classList.remove("visually-hidden");
    }
}

document.addEventListener("DOMContentLoaded", onDocumentLoad);