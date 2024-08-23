function hasCookie(cookieName) {
    return document.cookie.split(';').some(c => {
        return c.trim().startsWith(cookieName + '=');
    });
}
function getCookie(cookieName) {
    let cookieList = document.cookie.split(" ");
    for(let cookie of cookieList) {
        let spl = cookie.split("=");
        if(spl[0] == cookieName) {
            if(spl[1].indexOf(";") >= 0) {
                return spl[1].substring(0, spl[1].indexOf(";"));
            }
            return spl[1];
        }
    }

    console.log(`${cookieName} not found in cookies`);
    return null;
}
function setCookie(cookieName, value, days) {
    let expires = "";
    if (days) {
        let date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = cookieName + "=" + (value || "")  + expires + "; path=/";
}
function removeCookie(cookieName) {
    if(hasCookie(cookieName)) {
        document.cookie = `${cookieName}=;path=/;domain=${location.hostname};expires=Thu, 01 Jan 1970 00:00:01 GMT`;
    }
}

export { hasCookie, getCookie, setCookie, removeCookie };
