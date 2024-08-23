const classNames = ["food-texture", "food-texture-dark"];
const parallaxClass = "parallax-bg";
let parallaxElements;

function onContentLoad() {
    offsetFoodTexture();
    setParallax();
}

function offsetFoodTexture() {
    for(const className of classNames) {
        const elements = document.getElementsByClassName(className);

        for(const element of elements) {
            const x = getRandomInt(140);
            const y = getRandomInt(140);
            element.style.backgroundPosition = `${x}px ${y}px`;
            element.setAttribute("x", x);
            element.setAttribute("y", y);
        }
    }
}

function setParallax() {
    parallaxElements = document.getElementsByClassName("parallax-bg");
    document.addEventListener("scroll", scrollParallax);
}
function scrollParallax() {
    const distance = window.scrollY;
    const offset = distance/3;
    for(const element of parallaxElements) {
        const [ x, y ] = readPosition(element);
        element.style.backgroundPosition = `${x}px ${y + offset}px`;
    }
}
function readPosition(element) {
    const x = parseInt(element.getAttribute("x"));
    const y = parseInt(element.getAttribute("y"));
    return [ x, y ];
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

document.addEventListener("DOMContentLoaded", onContentLoad);