import QRCode from "/Packages/qrcodejs/qrcode.js";
let qrcode;

function onDocumentLoad() {
    alert("hello");
    qrcode = new QRCode(document.getElementById("qrcode"), {
        text: "http://cubetures.github.io",
        width: 100,
        height: 100,
        colorDark : "#000000",
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.H
    });
}

document.addEventListener("DOMContentLoaded", onDocumentLoad);