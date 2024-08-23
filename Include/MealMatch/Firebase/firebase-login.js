import { getAuth, setPersistence, browserLocalPersistence, GoogleAuthProvider,
    signInWithPopup, browserPopupRedirectResolver } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js";
import { hasUser, updateUserData } from "/Include/MealMatch/Firebase/firebase-database.js";
import { setCookie, getCookie } from "/Include/Miscellaneous/cookies.js";
import { REFRESH_TOKEN_URL, refreshHeader, getRefreshParameters } from "/Include/MealMatch/Google APIs/google-api.js";
import { postRequest } from "/Include/Miscellaneous/api-commands.js";
const homepagePath = "/Pages/MealMatch/home.html";
let onAuthStateUnsubscribe, loginStatus = null;

function onContentLoad() {
    checkRelogin();
}
async function checkRelogin() {
    const auth = await getAuth();
    onAuthStateUnsubscribe = auth.onAuthStateChanged((user) => {
        if(!user) {
            tryRelogin();
        }
        else {
            console.log("User still logged in.");
            setCookie("uid", user.uid);
            setCookie("refreshToken", user.refreshToken);
            loginStatus = true;
        }
    });
}
async function tryRelogin() {
    onAuthStateUnsubscribe();

    const refreshToken = getCookie("refreshToken");
    if(refreshToken) {
        const result = await postRequest(REFRESH_TOKEN_URL, refreshHeader, getRefreshParameters(refreshToken));
        if(result.hasOwnProperty("auth")) {
            console.log("User re-logged in.");
            loginStatus = true;
            return;
        }
    }

    loginStatus = false;
    if(window.location.pathname != homepagePath) {
        console.log("Cannot log in user. Redirecting.");
        window.location.replace(`${window.location.origin}${homepagePath}`);
    }
}

function login(successCallback, errorCallback) {
    const auth = getAuth();
    const googleProvider = new GoogleAuthProvider();
    try {
        setPersistence(auth, browserLocalPersistence)
        .then(() => {
            signInWithPopup(auth, googleProvider, browserPopupRedirectResolver)
                .then((result) => {
                    loginUser(result.user, successCallback);
                });
        });
    }
    catch(error) {
        errorCallback(error);
    }
}

async function loginUser(user, successCallback) {
    setCookie("uid", user.uid);
    setCookie("refreshToken", user.refreshToken);

    const existing = await hasUser(user.uid);
    if(!existing) {
        newLogin(user);
    }

    successCallback();
}
function newLogin(user) {
    setDisplayName(user);
}
function setDisplayName(user) {
    let data = {};
    data["display_name"] = user.displayName;
    updateUserData("readonly", data);
}

function logout(successCallback, errorCallback) {
    getAuth().signOut()
        .then(() => {
            successCallback();
        })
        .catch((error) => {
            errorCallback(error);
        });
}


document.addEventListener("DOMContentLoaded", onContentLoad);
export { login, logout, loginStatus };