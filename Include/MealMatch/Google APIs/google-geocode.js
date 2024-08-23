import { httpRequest, postRequest } from "/Include/Miscellaneous/api-commands.js";
import { REVERSE_GEOCODE_URL, geolocationOptions, getGeocodeParameters,
    ADDRESS_VALIDATION_URL, validationHeader, getValidationBody } from "/Include/MealMatch/Google APIs/google-api.js";
import { getNested } from "/Include/Miscellaneous/object-commands.js";

const importantComponents = ["street_number", "route", "locality", "administrative_area_level_1", "postal_code"];

async function getCurrentLocation(errorCallback) {
    try {
        const position = await getGeolocation(errorCallback);

        if(position) {
            const latlng = `${position.coords.latitude},${position.coords.longitude}`; 
            const address = await reverseGeocode(latlng);

            if(address) {
                return {
                    "address": address,
                    "latlng": latlng
                }
            }
        }
    }
    catch(error) {
        console.error(`Error in Getting Current Location:\n${error}`);
    }

    return null;
}
function getGeolocation(errorCallback) {
    return new Promise(resolve => {
        navigator.geolocation.getCurrentPosition(position => 
            resolve(position), error => 
                errorCallback(error.code), geolocationOptions);
    });
}

async function reverseGeocode(latlng) {
    const data = await httpRequest(REVERSE_GEOCODE_URL, getGeocodeParameters(latlng));

    if(data && data["status"] == "OK") {
        return getAddressData(data["results"][0]);
    }

    return null;
}
function getAddressData(data) {
    let addressData = {};

    for(const [index, component] of Object.entries(data["address_components"])) {
        const dataType = component["types"][0];
        const name = component["short_name"];
        addressData[dataType] = name;
    }

    return addressData;
}

async function validateAddress(address, city, state, zip) {
    try {
        const body = getValidationBody(address, city, state, zip);
        const data = await postRequest(ADDRESS_VALIDATION_URL, validationHeader, body);

        const addressComplete = getNested(data, "result", "verdict", "addressComplete");
        const unconfirmed = getNested(data, "result", "verdict", "hasUnconfirmedComponents");
        if(addressComplete && !unconfirmed) {
            const lat = getNested(data, "result", "geocode", "location", "latitude");
            const lng = getNested(data, "result", "geocode", "location", "longitude");
            const [ inferred, components ] = isInferred(data);

            return {
                "address": components["address"],
                "city": components["city"],
                "state": components["state"],
                "zip": components["zip"],
                "latlng": `${lat},${lng}`,
                "inferred": inferred
            };
        }
    }
    catch(error) {
        console.error(`Error in Address Validation:\n${error}`);
    }

    return null;
}

function isInferred(data) {
    const components = getAddressComponents(data);
    const renamedComponents = getRenamedComponents(components);

    const replaced = getNested(data, "result", "verdict", "hasReplacedComponents");
    const issue = hasComponentIssue(data);
    const verdict = replaced || issue;
    return [ verdict , renamedComponents ];
}
function getAddressComponents(data) {
    let components = {};
    const componentData = getNested(data, "result", "address", "addressComponents");
    if(componentData) {
        for(const [index, component] of Object.entries(componentData)) {
            const name = getNested(component, "componentType");
            const value = getNested(component, "componentName", "text");
            components[name] = value;
        }
    }

    return components;
}
function getRenamedComponents(components) {
    let renamed = {};
    renamed["address"] = `${components?.street_number} ${components?.route}`;
    renamed["city"] = components?.locality;
    renamed["state"] = components?.administrative_area_level_1;
    renamed["zip"] = components?.postal_code;
    return renamed;
}   
function hasComponentIssue(data) {
    const components = getNested(data, "result", "address", "addressComponents");
    if(components) {
        for(const [index, component] of Object.entries(components)) {
            if(hasIssue(component)) {
                return true;
            }
        }

        return false;
    }

    return true;
}
function hasIssue(component) {
    const name = getNested(component, "componentType");
    if(importantComponents.includes(name)) {
        const inferred = component["inferred"];
        const spellCorrected = component["spellCorrected"];
        return inferred || spellCorrected;
    }

    return false;
}

export { getCurrentLocation, validateAddress };