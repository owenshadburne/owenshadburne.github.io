async function httpRequest(url, parameters=null) {
    const parameterString = getParameterString(parameters);
    const completeUrl = `${url}${parameterString}`;
    const response = await fetch(completeUrl);
    return response.json();
}
async function httpRequestJson(url, parameters=null) {
    const parameterString = getParameterString(parameters);
    const completeUrl = `${url}${parameterString}`;
    const response = await fetch(completeUrl);
    return response;
}
function getParameterString(parameters) {
    let paramString = "";
    if(parameters) {
        for(const [key, value] of Object.entries(parameters)) {
            const modifier = paramString.length > 0 ? "&" : "?";
            paramString = `${paramString}${modifier}${key}=${value}`; 
        }
    }
        
    return paramString;
}

async function postRequest(url, header, body) {
    const response = await fetch(url, {
        method: "POST",
        headers: header,
        body: JSON.stringify(body)
    });

    return response.json();
}

export { httpRequest, httpRequestJson, postRequest };