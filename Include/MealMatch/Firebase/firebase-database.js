import { getDatabase, ref, get, set, update, onValue, remove } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js";
import { getCookie } from "/Include/Miscellaneous/cookies.js";
let auth = null;

function checkAuth() {
    if(auth === null) {
        auth = getAuth();
    }    
}

function getUID(otherUID) {
    if(otherUID) {
        return otherUID;
    }
    return getCookie("uid");
}
function getReference(uid, dataType) {
    checkAuth();
    const db = getDatabase();
    const path = `users/${uid}/${dataType}`;
    return ref(db, path);
}
async function hasUser(otherUID=null) {
    const data = await getUserData("readonly", otherUID);
    return data != null && data.hasOwnProperty("display_name");
}
async function getUserData(dataType, otherUID=null) {
    const uid = getUID(otherUID);
    const reference = getReference(uid, dataType);
    const snapshot = await get(reference);
    return snapshot.val();
}
async function setUserData(dataType, data, otherUID=null) {
    const uid = getUID(otherUID);
    const reference = getReference(uid, dataType);
    set(reference, data);
}
async function updateUserData(dataType, data, otherUID=null) {
    const uid = getUID(otherUID);
    const reference = getReference(uid, dataType);
    update(reference, data);
}
async function onUserData(dataType, callback, otherUID=null) {
    const uid = getUID(otherUID);
    const reference = getReference(uid, dataType);
    onValue(reference, callback);
}
function removeUserData(dataType, otherUID=null) {
    const uid = getUID(otherUID);
    const reference = getReference(uid, dataType);
    remove(reference);
}

async function getDisplayName(otherUID=null) {
    const uid = getUID(otherUID);
    return await getUserData("readonly/display_name", uid);
}


export { hasUser, getUserData, setUserData, updateUserData,
    onUserData, removeUserData, getDisplayName }
