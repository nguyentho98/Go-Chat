const electron = require("electron");
const { ipcRenderer } = electron;

const { shopee } = require("./shopee");
const { sapo } = require("./sapo");
const { lazada } = require("./lazada");
const { sendo } = require("./sendo");
const { tiki } = require("./tiki");

document.addEventListener("DOMContentLoaded", (e) => {
    const currentUrl = window.location.href;
    if (currentUrl.indexOf("shopee") >= 0) {
        shopee();
    } else if (currentUrl.indexOf("mysapo") >= 0) {
        sapo();
    } else if (currentUrl.indexOf("lazada") >= 0) {
        lazada();
    } else if (currentUrl.indexOf("sendo") >= 0) {
        sendo();
    } else if (currentUrl.indexOf("tiki") >= 0) {
        tiki();
    }
    document.addEventListener("click", function(e){
        ipcRenderer.sendToHost("click_element");
    });
});

