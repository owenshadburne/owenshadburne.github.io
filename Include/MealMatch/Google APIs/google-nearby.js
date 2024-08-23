import { httpRequestJson, postRequest } from "/Include/Miscellaneous/api-commands.js";
import { NEARBY_SEARCH_URL, getNearbyHeader, getNearbyBody,
    getPhotoUrl } from "/Include/MealMatch/Google APIs/google-api.js";
import { getCookie } from "/Include/Miscellaneous/cookies.js";
import { getNested } from "/Include/Miscellaneous/object-commands.js";
const EARTH_RADIUS = 3958.8, getPhotos = true, maxPhotoCount = 5;
export let status = { "abort": false };

async function createNewMatch(inputData, matchLoadCallback, matchErrorCallback) {
    status["abort"] = false;

    try {
        const body = getNearbyBody(inputData["locationData"]["latlng"], inputData["radius"], inputData["filters"]);
        const locations = await postRequest(NEARBY_SEARCH_URL, getNearbyHeader(), body);
        return await getMatchData(inputData, locations, matchLoadCallback);
    }  
    catch(error) {
        matchErrorCallback(error);
    }    

    return null;
}

async function getMatchData(inputData, locations, matchLoadCallback) {
    let result = getBasicMatchData(inputData);
    result["locations"] = await getLocationData(inputData, locations, matchLoadCallback);
    return result;
}
function getBasicMatchData(inputData) {
    let result = {};
    const location = inputData["locationData"];
    const date = new Date();

    result["address"] = `${location["address"]}, ${location["city"]}, ${location["state"]} ${location["zip"]}`;
    result["date"] = date.toLocaleDateString();
    result["time"] = date.toLocaleTimeString();
    result["people"] = inputData["people"];

    return result;
}
async function getLocationData(inputData, locations, matchLoadCallback) {
    let result = {};
    let resultCount = 0;
    let resultLength = Object.keys(locations["places"]).length;
    let loadPercent = 100 / resultLength;
    const latlng = inputData["locationData"]["latlng"];
    const people = inputData["people"];

    for(const location of locations["places"]) {
        if(status["abort"]) { break; }
        const id = location["id"];
        let loc = getBasicLocationData(location);
        loc["distance"] = getDistanceData(location, latlng);
        loc["hours"] = getHourData(location);
        loc["responses"] = getResponseData(people);
        loc["photos"] = await getPhotoData(inputData, location, matchLoadCallback, loadPercent);
        result[id] = loc;

        matchLoadCallback(++resultCount * loadPercent, true);
    }

    console.log(result);

    return result;
}
function getBasicLocationData(location) {
    return {
        "name": getNested(location, "displayName", "text"),
        "category": getNested(location, "primaryTypeDisplayName", "text"),
        "price": getNested(location, "priceLevel"),

        "rating": getNested(location, "rating"),
        "website": getNested(location, "websiteUri"),
        "phone": getNested(location, "nationalPhoneNumber"),
        "address": getNested(location, "formattedAddress"),
        "maps": getNested(location, "googleMapsUri"),
        "status": getNested(location, "businessStatus")
    };
}
function getDistanceData(location, fromlatlng) {
    const lat = getNested(location, "location", "latitude");
    const lng = getNested(location, "location", "longitude");
    if(lat === null || lng === null) { return "Unknown"; }
    const tolatlng = `${lat},${lng}`;
    return latlngDistance(fromlatlng, tolatlng);
}
async function getPhotoData(inputData, location, matchLoadCallback, loadPercent) {
    let photos = {};
    let count = 0;

    if(getPhotos) {
        const { width } = inputData;
        const phts = getNested(location, "photos");
        if(phts === null) { return photos; }

        for(const photo of location["photos"]) {
            if(status["abort"]) { break; }
            if(++count > maxPhotoCount) { break; }
            const name = photo["name"];
            const response = await httpRequestJson(getPhotoUrl(name, width));
            let url = response["url"];
            url = url.replaceAll("/", "|");
            url = url.replaceAll(".", ",");
            photos[url] = true;

            matchLoadCallback(count * loadPercent / maxPhotoCount);
        }
    }
    else {
        photos["empty"] = true;
    }

    return photos;
}
function getHourData(location) {
    const hours = getNested(location, "currentOpeningHours", "weekdayDescriptions");
    if(hours === null) { return ""; }
    return hours.join(",");
}
function getResponseData(people) {
    let result = {};
    for(const id in people) {
        result[id] = "U";
    }

    const uid = getCookie("uid");
    result[uid] = "U";

    return result;
}

function latlngDistance(fromlatlng, tolatlng) {
    const [ flat, flng ] = latlngFloat(fromlatlng);
    const [ tlat, tlng ] = latlngFloat(tolatlng);

    const radFromLat = toRadians(flat);
    const radFromLng = toRadians(flng);
    const radToLat = toRadians(tlat);
    const radToLng = toRadians(tlng);

    return (
        2 * EARTH_RADIUS *
        Math.asin(
            Math.sqrt(
                Math.pow(Math.sin((radFromLat - radToLat) / 2), 2) +
                Math.cos(radFromLat) *
                Math.cos(radToLat) *
                Math.pow(Math.sin((radFromLng - radToLng) / 2), 2)
            )
        ) 
    );
}
function latlngFloat(latlng) {
    const split = latlng.split(",");
    return [ parseFloat(split[0]), parseFloat(split[1]) ];
}
function toRadians(angleDegrees) {
    return (angleDegrees * Math.PI) / 180.0;
}

export { createNewMatch };