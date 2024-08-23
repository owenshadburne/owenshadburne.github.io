import { getUserData, setUserData, updateUserData, removeUserData } from "/Include/MealMatch/Firebase/firebase-database.js"
import { getCookie } from "/Include/Miscellaneous/cookies.js";
import { getCurrentLocation, validateAddress } from "/Include/MealMatch/Google APIs/google-geocode.js";
import { createNewMatch, status } from "/Include/MealMatch/Google APIs/google-nearby.js";
import { populateFilters, getAllFilterIDs } from "/Include/MealMatch/Page Scripts/filters.js";
import { goToMatch } from "/Include/MealMatch/Page Scripts/redirect.js";

let addressInput, cityInput, stateInput, zipInput, latlngInput;
let addressHidden, cityHidden, stateHidden, zipHidden;
let locationSpinner, locationErrorModal, locationErrorText;
let locationValidationModal, formattedAddressText, correctedAddress;
let peopleContainer, peopleTemplate, peopleDisclaimer, peopleSpinner, peopleErrorModal;
let filterCheckboxes;
let radiusRange, radiusValue;
let loadValue, loadBar, matchLoadDOM, matchLoadModal, matchErrorModal, matchCancelModal;

function onDocumentLoad() {
    setLocation();
    setPeople();
    setFilters();
    setAdvanced();
    setMatch();
}

function setLocation() {
    addressInput = document.getElementById("address-input");
    cityInput = document.getElementById("city-input");
    stateInput = document.getElementById("state-input");
    zipInput = document.getElementById("zip-input");
    latlngInput = document.getElementById("latlng-input");

    addressHidden = document.getElementById("address-hidden");
    cityHidden = document.getElementById("city-hidden");
    stateHidden = document.getElementById("state-hidden");
    zipHidden = document.getElementById("zip-hidden");

    locationSpinner = document.getElementById("location-spinner");
    locationErrorModal = getModal("locationErrorModal");
    locationErrorText = document.getElementById("location-error-text");

    locationValidationModal = getModal("locationValidationModal");
    formattedAddressText = document.getElementById("formatted-address");
    setOnClick("location-validation-button", correctInferredError);

    setOnClick("current-location", setCurrentLocation);
}
async function setCurrentLocation() {
    locationSpinner.classList.remove("visually-hidden");
    const locationData = await getCurrentLocation(locationError);
    locationSpinner.classList.add("visually-hidden");

    if(locationData) {
        const address = locationData["address"];
        setInputs(`${address["street_number"]} ${address["route"]}`, address["locality"],
            address["administrative_area_level_1"], address["postal_code"], locationData["latlng"]);
    }
    else {
        locationError(0);
    }
}
function locationError(errorCode=0) {
    locationSpinner.classList.add("visually-hidden");
    console.warn("Location Error");
    
    if(errorCode == 1) {
        locationErrorText.innerHMTL = "MealMatch could not access your location. " +
            "Please change your location permissions or type the address manually.";
    }
    else if(errorCode == 4) {
        locationErrorText.innerHTML = "The address you entered could not be identified. " +
            "Please fix any mistakes in the address and try again " +
            "or click <img src='/Images/MealMatch/Pin_alt.svg'> to automatically get your location.";
    }
    else {
        locationErrorText.innerHTML = "There was an error in getting your location. " +
            "Please type the address manually.";
    }

    locationErrorModal.show();
}
function inferredError(locationData) {
    console.warn(`Inferred\n${JSON.stringify(locationData, null, 2)}`);
    correctedAddress = locationData;
    const { address, city, state, zip } = correctedAddress;
    const formattedAddress = `${address}, ${city}, ${state} ${zip}`;
    formattedAddressText.textContent = formattedAddress;
    locationValidationModal.show();
}
function correctInferredError() {
    setInputs(correctedAddress["address"], correctedAddress["city"], correctedAddress["state"],
        correctedAddress["zip"], correctedAddress["latlng"]);
    tryMatch();
}

function setPeople() {
    peopleContainer = document.getElementById("people-container");
    peopleTemplate = document.getElementById("people-template");
    peopleDisclaimer = document.getElementById("people-disclaimer");
    peopleSpinner = document.getElementById("people-spinner");
    peopleErrorModal = new bootstrap.Modal(document.getElementById("peopleErrorModal"), {});

    populatePeople();
}
async function populatePeople() {
    peopleDisclaimer.classList.add("visually-hidden");
    peopleSpinner.classList.remove("visually-hidden");
    const friends = await getUserData("writeonly/friends");
    peopleSpinner.classList.add("visually-hidden");

    if(friends) {
        for(const [uid, displayName] of Object.entries(friends)) {
            addPerson(uid, displayName);
        }
    }
    else {
        peopleDisclaimer.classList.remove("visually-hidden");
    }
}
function addPerson(uid, displayName) {
    const clone = peopleTemplate.content.cloneNode(true);
    
    const input = clone.querySelector("#input");
    input.classList.add("people-element");
    input.setAttribute("id", uid);
    input.setAttribute("displayName", displayName);

    const label = clone.querySelector("#label");
    label.textContent = displayName;
    label.setAttribute("for", uid);

    peopleContainer.append(clone);
}
function peopleError() {
    console.warn("People Error");
    peopleErrorModal.show();
}

function setFilters() {
    populateFilters();
    setCheckboxes();
}
function setCheckboxes() {
    filterCheckboxes = [];

    const allFilterIDs = getAllFilterIDs();
    for(const filterID of allFilterIDs) {
        const checkbox = document.getElementById(filterID);
        filterCheckboxes.push(checkbox);
    }
}

function setAdvanced() {
    radiusRange = document.getElementById("radius-range");
    radiusValue = document.getElementById("radius-value");
    radiusRange.oninput = setRadiusValue;
}
function setRadiusValue() {
    radiusValue.value = radiusRange.value;
}

function setMatch() {
    loadBar = document.getElementById("load-bar");
    matchLoadDOM = document.getElementById("matchLoadModal");
    matchLoadDOM.addEventListener("hide.bs.modal", () => {
        matchLoadDOM.removeEventListener("shown.bs.modal", hideMatchLoad);
    })
    matchLoadModal = getModal("matchLoadModal");
    matchErrorModal = getModal("matchErrorModal");
    matchCancelModal = getModal("matchCancelModal");


    setOnClick("match", tryMatch);
    setOnClick("cancel-match", cancelMatch);
}
async function tryMatch() {
    const inputData = await tryGetInputs();
    console.log(inputData);
    if(inputData) {
        console.log("No errors, creating search.");
        document.getElementById("matchLoadModal").addEventListener("show.bs.modal", ()=>console.log("show"));
        resetMatchLoad();
        matchLoadModal.show();
        const data = await createNewMatch(inputData, matchLoad, matchError);

        if(data && !status["abort"]) {
            await updateMatchData(data);
            goToMatch(getCookie("uid"));
        }
    }
}
async function updateMatchData(data) {
    const uid = getCookie("uid");

    await removeOldMatchRequests(uid);
    await setUserData("public/match", data);    
    for(const id in data["people"]) {
        let request = {};
        request[uid] = true;
        await updateUserData("writeonly/match_requests", request, id);
    }
}
async function removeOldMatchRequests(uid, oldMatch) {
    oldMatch = await getUserData("public/match");

    if(oldMatch) {
        const people = oldMatch["people"];
        for(const otherUID in people) {
            const dataType = `writeonly/match_requests/${uid}`;
            removeUserData(dataType, otherUID);
        }
    }
}
function resetMatchLoad() {
    loadValue = 0;
    loadBar.style.width = 0;
}
function matchLoad(updateValue, locationUpdate=false) {
    let percent = "";
    if(locationUpdate) {
        loadValue = updateValue;
        percent = `${Math.round(loadValue)}%`;
    }
    else {
        percent = `${Math.floor(loadValue + updateValue)}%`;
    }

    loadBar.style.width = percent;
}
function hideMatchLoad() {
    matchLoadModal.hide();
    matchLoadDOM.removeEventListener("shown.bs.modal", hideMatchLoad);
}
function matchError(error) {
    matchLoadModal.hide();
    matchLoadDOM.addEventListener("shown.bs.modal", hideMatchLoad);
    console.warn("Match Error");
    console.error(error);
    matchErrorModal.show();
}

function cancelMatch() {
    status["abort"] = true;
    matchCancelModal.show();
}

async function tryGetInputs() {
    const locationData = await tryGetLocation();
    if(locationData == null) { 
        locationError(4); 
        return;
    }
    else if(locationData["inferred"]) {
        inferredError(locationData);
        return;
    }

    const people = await tryGetPeople();
    if(people == null) { 
        peopleError(); 
        return;
    }

    const filters = getFilters();
    const [ radius ] = getAdvanced();
    const [ width, height ] = getDeviceData();

    return {
        "locationData": locationData,
        "people": people,
        "radius": radius,
        "filters": filters,
        "width": width,
        "height": height
    };
}
async function tryGetLocation() {
    const address = addressInput.value;
    const city = cityInput.value;
    const state = stateInput.value;
    const zip = zipInput.value;
    const latlng = latlngInput.value;

    let data = await getLocationData(address, city, state, zip, latlng);
    return data;
}
async function getLocationData(address, city, state, zip, latlng) {
    if(inputsEdited()) {
        return await validateAddress(address, city, state, zip);
    }

    console.log("Inputs were not edited. Using verified information.");
    return {
        "address": address,
        "city": city,
        "state": state,
        "zip": zip,
        "latlng": latlng
    }
}
async function tryGetPeople() {
    let people = {};
    let isEmpty = true;

    const inputs = document.getElementsByClassName("people-element");
    for(let i = 0; i < inputs.length; i++) {
        const input = inputs.item(i);
        if(input.checked) {
            people[input.getAttribute("id")] = input.getAttribute("displayName");
            isEmpty = false;
        }
    }

    if(isEmpty) {
        return null;
    }

    return people;
}
function getFilters() {
    let include = [];
    let exclude = [];

    for(const checkbox of filterCheckboxes) {
        if(checkbox.indeterminate) {
            exclude.push(checkbox.getAttribute("filter"));
        }
        else if(checkbox.checked) {
            include.push(checkbox.getAttribute("filter"));
        }
    }

    return {
        "include": include,
        "exclude": exclude
    };
}
function getAdvanced() {
    const radius = parseFloat(radiusValue.value) * 1609;
    return [ radius ];
}
function getDeviceData() {
    let screenWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width;
    let screenHeight = (window.innerHeight > 0) ? window.innerHeight : screen.height;
    return [ screenWidth, screenHeight ];
}

function setInputs(address, city, state, zip, latlng) {
    addressInput.value = address;
    cityInput.value = city;
    stateInput.value = state;
    zipInput.value = zip;
    latlngInput.value = latlng;

    addressHidden.value = address;
    cityHidden.value = city;
    stateHidden.value = state;
    zipHidden.value = zip;
}
function inputsEdited() {
    return !(addressInput.value === addressHidden.value &&
            cityInput.value === cityHidden.value &&
            stateInput.value === stateHidden.value &&
            zipInput.value === zipHidden.value);
}

function setOnClick(elementID, callback) {
    document.getElementById(elementID)
        .addEventListener("click", callback);
}
function getModal(elementID) {
    return new bootstrap.Modal(document.getElementById(elementID));
}

document.addEventListener("DOMContentLoaded", onDocumentLoad);