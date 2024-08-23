import { Stack } from "/Include/Miscellaneous/data-collections.js";
const primaryRGB = "251,70,112", borderRGB = "249,190,203";
const stack = new Stack();
let yesBtn, noBtn, maxDist, tolerance;
const weekdayAbrv = { 
    "Monday": "M",
    "Tuesday": "T",
    "Wednesday": "W",
    "Thursday": "R",
    "Friday": "F",
    "Saturday": "S",
    "Sunday": "U"
};

function onDocumentLoad() {
    setWidths();
}
function setWidths() {
    const width = window.innerWidth ||
                document.documentElement.clientWidth ||
                document.body.clientWidth;
    maxDist = width / 3;
    tolerance = width / 9;
}

export default class MatchTile {
    constructor(clone, id, location, decisionCallback, initiallyActive) {
        this.setVariables(clone, id, decisionCallback, initiallyActive);
        this.addToStack();
        this.setInfo(clone, location);
        this.setExtra(clone, location);
        this.setPhotos(location);
        this.setActions(clone);
    }

    setVariables(clone, id, decisionCallback, initiallyActive) {
        this.tile = clone.querySelector("#tile");
        this.tile.style.zIndex = stack.size + 1;
        clone.querySelector("#extra").style.zIndex = stack.size + 2;

        this.id = id;
        this.decisionCallback = decisionCallback;
        this.initiallyActive = initiallyActive;
        this.postStack = false;
        this.photoDiv = clone.getElementById("photos");
        this.photoList = [];
        this.onPop = () => { this.onStackPop(); }
        if(!this.initiallyActive) { 
            stack.onPopSub(this.onPop); 
        }        

        this.startDragAnon = (e) => this.startDrag(e);
        this.dragTileAnon = (e) => this.dragTile(e);
        this.stopDragAnon = (e) => this.stopDrag(e);
        this.yesDecision = () => { 
            if(this.isTopOfStack()) {
                this.endDecision(true);
            }
        }
        this.noDecision = () => { 
            if(this.isTopOfStack()) {
                this.endDecision(false); 
            }
        }

        if(!yesBtn) {
           yesBtn = document.getElementById("yes");
        }
        if(!noBtn) {
            noBtn = document.getElementById("no");
        }
    }
    setInfo(clone, location) {
        const outermost = clone.querySelector("#tile");
        outermost.id = this.id;
        if(!this.initiallyActive) {
            outermost.setAttribute("hidden", true);
        }

        const name = clone.querySelector("#name");
        const nm = location["name"];
        name.textContent = nm ? nm : "Unknown";
    
        const category = clone.querySelector("#category");
        const cat = location["category"];
        category.textContent = cat ? cat : "Unknown";
    
        const price = clone.querySelector("#price");
        const pr = location["price"];
        price.textContent = pr ? this.parsePriceLevel(pr) : "?";
    
        const distance = clone.querySelector("#distance");
        const dst = location["distance"];
        distance.textContent = dst ? this.formatDistance(dst) : "? Miles Away";
    }
    setExtra(clone, location) {
        const name = clone.querySelector("#name-backup");
        const nm = location["name"];
        name.textContent = nm ? nm : "Unknown";

        const address = clone.querySelector("#address");
        const adr = location["address"];
        const mp = location["maps"];
        address.textContent = adr ? adr : "Unknown";
        address.setAttribute("href", mp ? mp : "#");
    
        const website = clone.querySelector("#website");
        const wb = location["website"];
        const wbt = wb ? this.getWebsiteText(wb) : "Unknown";
        website.textContent = wbt ? wbt : "Unknown";
        website.setAttribute("href", wb ? wb : "#");
    
        const phone = clone.querySelector("#phone");
        const pn = location["phone"];
        const pnh = pn ? this.getPhoneHref(pn) : "#";
        phone.textContent = pn ? pn : "Unknown";
        phone.setAttribute("href", pnh ? pnh : "#");
    
        const rating = clone.querySelector("#rating");
        const rt = location["rating"];
        const rtt = rt ? this.formatRating(rt): "Unknown";
        rating.textContent = rtt ? rtt : "Unknown";
    
        const hours = clone.querySelector("#hours");
        const hr = location["hours"];
        const hoursArray = hr ? hr.split(",") : null;
        hours.innerHTML = hoursArray ? this.getHoursTable(hoursArray) : "";

        this.setVotes(clone, location);
    }
    
    setPhotos(location) {
        const classes = "class='match-image rounded bordered'";
    
        const photos = location["photos"];
        if(photos) {
            let html = "";
            for(const photo in photos) {
                let url = photo.replaceAll(",", ".");
                url = url.replaceAll("|", "/");
                const img = `<img ${classes} src=${url} alt="photo">`;
                this.photoList.push(img);
                html += img;
            }
            
            this.photoDiv.innerHTML = html;
        }
    }

    parsePriceLevel(price) {
        const head = "PRICE_LEVEL_";
        const index = price.indexOf(head);
        const value = price.substring(index + head.length);
    
        switch(value) {
            case "FREE":
                return "Free";
            case "INEXPENSIVE":
                return "Cheap";
            case "MODERATE":
                return "Affordable";
            case "EXPENSIVE":
                return "Pricy";
            case "VERY_EXPENSIVE":
                return "Expensive";
        }
    
        return "NaN";
    }
    formatDistance(distance) {
        const number = parseFloat(distance);
        const rounded = number.toFixed(1);
        const s = (rounded == "1.0") ? "" : "s";
        return `${rounded} Mile${s} Away`;
    }
    
    getWebsiteText(urlStr) {
        const url = new URL(urlStr);
        return url.hostname;
    }
    getPhoneHref(phone) {
        return `tel:${phone.replace(/[^0-9]+/g, '')}`;
    }
    formatRating(rating) {
        return `${rating}/5`;
    }
    
    getHoursTable(hoursArray) {
        const head = this.getHoursHead();
        
        let body = "";
        for(const hour of hoursArray) {
            body += this.getHoursBody(hour);
        }
    
        return ""+
            `<table class="table table-dark table-borderless no-margin">
                ${head}
                <tbody class="table-top-border">${body}</tbody>
            </table>`;
    }
    getHoursHead() {
        return ""+
        `<thead>
            <tr>
                <th scope="col">Day</th>
                <th scope="col">Open</th>
                <th scope="col">Close</th>
            </tr>
        </thead>`;
    }
    getHoursBody(hour) {
        const parse = this.parseHour(hour);
        const { day, open, close } = parse;
    
        if(close) {
            return ""+
            `<tr>
                <td scope="row">${day}</td>
                <td>${open}</td>
                <td>${close}</td>
            </tr>`;
        }
        else {
            return ""+
            `<tr>
                <td scope="row">${day}</td>
                <td colspan="2">${open}</td>
            </tr>`;
        }
        
    }
    parseHour(hour) {
        const firstColon = hour.indexOf(":");
        const day = hour.substring(0, firstColon);
        const times = hour.substring(firstColon + 1).trim();
        const [ open, close ] = this.parseTime(times);
    
        return {
            "day": weekdayAbrv[day],
            "open": open,
            "close": close
        };
    }
    parseTime(times) {
        const cleaned = times.replace(/\s+/g, '');
        const [ openFull, closeFull ] = cleaned.split("–");
    
        if(!closeFull) {
            if(openFull == "Open24hours") {
                return [ "Open 24 Hours", null ];
            } 
    
            return [ openFull, null ];
        }
    
        let open = "-", close = "-";
        if(openFull && this.isNumeric(openFull.substring(0, 1))) {
            open = this.get24Hour(openFull);
        }
        if(closeFull && this.isNumeric(closeFull.substring(0, 1))) {
            close = this.get24Hour(closeFull);
        }
    
        return [ open, close ]; 
    }
    isNumeric(str) {
        if (typeof str != "string") return false;
        return !isNaN(str) && !isNaN(parseFloat(str));
    }
    get24Hour(time) {
        const num = time.substring(0, time.length - 2);
        const colon = time.indexOf(":");
        const alt = time.substring(time.length - 2);
    
        if(alt == "AM" && num.substring(0, colon) == "12") {
            return `00${num.substring(colon)}`;
        }
        else if(alt == "PM") {
            const toInt = parseInt(num.substring(0, colon));
            return `${toInt + 12}${num.substring(colon)}`;
        }
    
        return num;
    }

    setVotes(clone, location) {
        const yes = clone.querySelector("#yes-votes");
        const no = clone.querySelector("#no-votes");
        const und = clone.querySelector("#undecided-votes");
        const tot = clone.querySelector("#total-votes");

        const [ y, n, u, t ] = this.getVoteCounts(location);
        yes.textContent = y;
        no.textContent = n;
        und.textContent = u;
        tot.textContent = t;
    }
    getVoteCounts(location) {
        let y = 0, n = 0, u = 0, t = 0;
        for(const [ id, response ] in Object.entries(location["responses"])) {
            if(response == "Y") { y++; }
            else if(response == "N") { n++; }
            else { u++; }
            t++;
        }

        return [ y, n, u, t ];
    }

    setActions(clone) {
        this.setSwitch(clone);
        this.setButtonClicks(true);
        this.setStartDrag(true);
    }

    setSwitch(clone) {
        const info = clone.querySelector("#info");
        this.extra = clone.querySelector("#extra");
        info.addEventListener("click", () => { 
            this.switchDisplay(this.extra);
        });
    }
    switchDisplay(extra) {
        if(extra.classList.contains("extra-box-alt")) {
            extra.classList.remove("extra-box-alt");
        }
        else {
            extra.classList.add("extra-box-alt");
        }
    }

    setStartDrag(state) {
        if(state) {
            this.tile.addEventListener("mousedown", this.startDragAnon);
            this.tile.addEventListener("touchstart", this.startDragAnon);
        }
        else {
            this.tile.removeEventListener("mousedown", this.startDragAnon);
            this.tile.removeEventListener("touchstart", this.startDragAnon);
        }        
    }

    setButtonClicks(state) {
        if(state) {
            yesBtn.addEventListener("click", this.yesDecision);
            noBtn.addEventListener("click", this.noDecision);
        }
        else {
            yesBtn.removeEventListener("click", this.yesDecision);
            noBtn.removeEventListener("click", this.noDecision);
        }
    }

    startDrag(e) {
        if(this.isTopOfStack()) {
            const { x } = this.getPosition(e);
            this.startX = x;
            this.setTransitions(false);
            
            document.addEventListener("mousemove", this.dragTileAnon);
            document.addEventListener("touchmove", this.dragTileAnon);
            document.addEventListener("mouseup", this.stopDragAnon);
            document.addEventListener("touchend", this.stopDragAnon);
            document.addEventListener("touchcancel", this.stopDragAnon);
        }
        else {
            this.setStartDrag(false);
        }
    }
    dragTile(e) {
        if(!this.startX) { return; }
        const { x } = this.getPosition(e);
        const offsetX = x - this.startX;
    
        if(offsetX > tolerance || offsetX < -tolerance) {
            let movement = (offsetX - (offsetX > 0 ? tolerance : -tolerance));
            this.highlightButton(movement);
            this.tile.style.transform = `translate(${movement}px, 0px)`;
        }
    }
    stopDrag(e) {
        const [ complete, decision ] = this.decisionMade(e);
        if(complete) {
            this.endDecision(decision);
        }

        this.startX = null;
        document.removeEventListener("mousemove", this.dragTileAnon);
        document.removeEventListener("touchmove", this.dragTileAnon);
        document.removeEventListener("mouseup", this.stopDragAnon);
        document.removeEventListener("touchend", this.stopDragAnon);
        document.removeEventListener("touchcancel", this.stopDragAnon);
        this.setTransitions(true);
        this.resetActors();
    }
    decisionMade(e) {
        const { x } = this.getPosition(e);
        const offsetX = x - this.startX;
        const trueOffset = Math.abs(offsetX) - tolerance;
        return [ trueOffset > maxDist, offsetX > 0 ]; 
    }   
    endDecision(decision) {
        const direction = decision ? "right" : "left";
        this.tile.classList.add(`offscreen-${direction}`);
        this.removeFromStack();
        this.decisionCallback(this.id, decision);
    }
    
    setTransitions(state) {
        const transition = "all .3s ease-out";
        this.tile.style.transition = state ? transition : "none";
        noBtn.style.transition = state ? transition : "none";
        yesBtn.style.transition = state ? transition : "none";
    }
    resetActors() {
        this.tile.style.transform = "translate(0px)";
        noBtn.style.backgroundColor = null;
        noBtn.style.border = null;
        yesBtn.style.backgroundColor = null;
        yesBtn.style.border = null;
    }
    highlightButton(movement) {
        const percent = Math.abs(movement / maxDist);
        const button = (movement > 0) ? yesBtn : noBtn;
        button.style.backgroundColor = `rgba(${primaryRGB},${percent})`;
        button.style.border = `1px solid rgba(${borderRGB},${percent})`;
    }
    
    getPosition(e) {
        let x, y = null;
        if(e.type == 'touchstart' || e.type == 'touchmove' || e.type == 'touchend' || e.type == 'touchcancel'){
            let touch = e.touches[0] || e.changedTouches[0];
            x = touch.pageX;
            y = touch.pageY;
        } else if (e.type == 'mousedown' || e.type == 'mouseup' || e.type == 'mousemove' || e.type == 'mouseover'|| e.type=='mouseout' || e.type=='mouseenter' || e.type=='mouseleave') {
            x = e.clientX;
            y = e.clientY;
        }
    
        return { "x": x, "y": y };
    }

    addToStack() {
        stack.push(this.id);
    }
    isTopOfStack() {
        return this.id == stack.peek();
    }
    removeFromStack() {
        if(this.isTopOfStack()) {
            stack.pop();
        }
    }
    onStackPop() {
        if(this.postStack) {
            const outermost = document.getElementById(this.id);
            outermost.setAttribute("hidden");
        }

        if(this.id == stack.next()) {
            const outermost = document.getElementById(this.id);
            outermost.removeAttribute("hidden");

            let html = "";
            for(const img of this.photoList) {
                const replaced = img.replace("hold", "src");
                html += replaced;
            }

            this.photoDiv.innerHTML = html;
            stack.onPopUnsub(this.onPop);

            this.postStack = true;
        }
    }
}

document.addEventListener("DOMContentLoaded", onDocumentLoad);