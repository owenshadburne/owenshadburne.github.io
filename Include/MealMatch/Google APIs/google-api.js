//#region data
import gak from "/Include/MealMatch/Firebase/firebase-initialize.js";

const masks = {
    "basic": {
        "places.id": true,
        "places.displayName": true,
        "places.primaryTypeDisplayName": true,
        "places.types": true,
        "places.photos": true
    },
    "all": {
        "places.displayName": true,
        "places.googleMapsUri": true,
        "places.websiteUri": true,
        "places.formattedAddress": true,
        "places.businessStatus": true,
        "places.id": true,
        "places.location": true,
        "places.photos": true,
        "places.primaryTypeDisplayName": true,
        "places.currentOpeningHours": true,
        "places.nationalPhoneNumber": true,
        "places.priceLevel": true,
        "places.rating": true
    }
};

const filters = {
    "Store Type": {
        "Bar": "bar",
        "Cafe": "cafe",
        "Coffee Shop": "coffee_shop",
        "Takeout Only": "meal_delivery",
    },
    "Food Type": {
        "Variety": {
            "Bakery": "bakery",
            "Barbecue": "barbecue_restaurant",
            "Breakfast": "breakfast_restaurant",
            "Brunch": "brunch_restaurant",
            "Fast Food": "fast_food_restaurant",
            "Seafood": "seafood_restaurant",
            "Vegan": "vegan_restaurant",
            "Vegitarian": "vegetarian_restaurant"
        },
        "Specific": {
            "Hamburger": "hamburger_restaurant",
            "Ice Cream Shop": "ice_cream_shop",
            "Pizza": "pizza_restaurant",
            "Ramen": "ramen_restaurant",
            "Sandwich Shop": "sandwich_shop",
            "Steak House": "steak_house",
            "Sushi": "sushi_restaurant"
        }
    },
    "Cultural": {
        "Americas": {
            "American": "american_restaurant",
            "Mexican": "mexican_restaurant",
            "Brazilian": "brazilian_restaurant"
        },
        "Europe": {
            "French": "french_restaurant",
            "Greek": "greek_restaurant",
            "Italian": "italian_restaurant",
            "Mediterranean": "mediterranean_restaurant",
            "Spanish": "spanish_restaurant"
        },
        "Middle East": {
            "Lebanese": "lebanese_restaurant",
            "Middle Eastern": "middle_eastern_restaurant"
        },
        "Asia": {
            "Chinese": "chinese_restaurant",
            "Indian":  "indian_restaurant",
            "Indonesian": "indonesian_restaurant",
            "Japanese": "japanese_restaurant",
            "Korean": "korean_restaurant",
            "Thai": "thai_restaurant",
            "Turkish": "turkish_restaurant",
            "Vietnamese": "vietnamese_restaurant"
        }
    }
};
//#endregion
//#region helpers
function asString(obj) {
    let result = "";
    for(const o in obj) {
        result += (result == "") ? o : `,${o}`;
    }

    return result;
}

function getReadableFilters() {
    let result = {};
    for(const filterCategory in filters) {
        for(const filter in filterCategory) {
            const name = `${filter.substring(0, 1).toUpperCase()}${filter.substring(1).replace("_", " ")}`;
            result[name ]
        }
    }

    return result;
}
//#endregion
//#region login
const REFRESH_TOKEN_URL = `https://securetoken.googleapis.com/v1/token?key=${gak}`;

const refreshHeader = {
    "Content-Type": "application/json"
}

function getRefreshParameters(refreshToken) {
    return {
        "grant_type": "refresh_token",
        "refresh_token": refreshToken
    };
}
//#endregion
//#region geocode
const REVERSE_GEOCODE_URL = "https://maps.googleapis.com/maps/api/geocode/json";

const geolocationOptions = {
    maximumAge: 10000,
    timeout: 5000,
    enableHighAccuracy: true
};

function getGeocodeParameters(latlng) {
    return { 
        "latlng": latlng, 
        "location_type": "ROOFTOP",
        "key": gak 
    };
}
//#endregion
//#region validation
const ADDRESS_VALIDATION_URL = `https://addressvalidation.googleapis.com/v1:validateAddress?key=${gak}`;

const validationHeader = {
    "Content-Type": "application/json"
};

function getValidationBody(address, city, state, zip) {
    return {
        "address": {
            "regionCode": "US",
            "locality": city,
            "administrativeArea": state,
            "postalCode": zip,
            "addressLines": [address]
        },
        "enableUspsCass": true
    };
}
//#endregion
//#region nearby
const NEARBY_SEARCH_URL = "https://places.googleapis.com/v1/places:searchNearby";
const basicMasks = asString(masks["basic"]), allMasks = asString(masks["all"]);
const readableFilters = getReadableFilters();

function getNearbyHeader(useAllMasks=true) {
    return {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': gak,
        'X-Goog-FieldMask': useAllMasks ? allMasks : basicMasks
    };
}

function getNearbyBody(latlng, rad, filters) {
    const [ lat, lng ] = latlng.split(",");
    const { include, exclude } = filters;

    return {
        includedPrimaryTypes: include,
        includedTypes: ["restaurant"],
        excludedTypes: exclude,
        maxResultCount: 20,
        rankPreference: "POPULARITY",
        locationRestriction: {
            circle: {
                center: {
                    latitude: lat,
                    longitude: lng
                },
                radius: rad
            }
        }
    };
}
//#endregion
//#region photos
function getPhotoUrl(name, maxWidth, maxHeight=null) {
    if(maxHeight) {
        return `https://places.googleapis.com/v1/${name}/media?maxHeightPx=${maxHeight}&maxWidthPx=${maxWidth}&key=${gak}`;
    }

    return `https://places.googleapis.com/v1/${name}/media?maxWidthPx=${maxWidth}&key=${gak}`;
}
//#endregion

export { 
    REFRESH_TOKEN_URL, refreshHeader, getRefreshParameters,
    REVERSE_GEOCODE_URL, geolocationOptions, getGeocodeParameters,
    ADDRESS_VALIDATION_URL, validationHeader, getValidationBody,
    NEARBY_SEARCH_URL, filters, readableFilters, 
    getNearbyHeader, getNearbyBody, getPhotoUrl
};