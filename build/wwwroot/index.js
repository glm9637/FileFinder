"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const searchButton = document.getElementById("search-button");
const searchInput = document.getElementById("search-input");
const resultContainer = document.getElementById("results");
const result = document.getElementById("result");
const resultDisplay = document.getElementById("result-display");
const uploadWrapper = document.querySelector(".wrapper");
const uploadButton = document.querySelector("#file-upload");
const toast = document.querySelector("#toast");
let toastTimeout;
uploadWrapper.style.display = "none";
if (searchButton == null || searchInput == null || resultContainer == null) {
    throw new Error("Document not loaded");
}
let currentArticle = "";
searchButton.onclick = searchArticle;
searchInput.onkeydown = checkForSubmit;
function checkForSubmit(event) {
    if (event.key === "Enter") {
        searchArticle();
    }
}
function searchArticle() {
    return __awaiter(this, void 0, void 0, function* () {
        currentArticle = searchInput.value;
        const response = yield fetch(`/api/search/${currentArticle}`);
        if (!response.ok) {
            uploadWrapper.style.display = "none";
            resultContainer.innerText = "Es wurde keine Dateien gefunden";
            return Promise.reject(response.statusText);
        }
        uploadWrapper.style.display = "";
        let directory = (yield response.json());
        renderDirectory(directory);
    });
}
function renderDirectory(directory) {
    resultContainer.innerHTML = "";
    let fragment = document.createDocumentFragment();
    renderNestedDirectory(directory, fragment);
    resultContainer === null || resultContainer === void 0 ? void 0 : resultContainer.appendChild(fragment);
}
function renderNestedDirectory(directory, parent) {
    var _a, _b;
    const list = document.createElement("ul");
    const header = document.createElement("li");
    header.innerText = directory.Name;
    header.classList.add("header");
    list.appendChild(header);
    (_a = directory.Files) === null || _a === void 0 ? void 0 : _a.forEach((file) => {
        const fileButton = document.createElement("li");
        fileButton.classList.add("file");
        fileButton.onclick = () => openFile(file);
        fileButton.innerText = file.Name;
        list.appendChild(fileButton);
    });
    (_b = directory.Children) === null || _b === void 0 ? void 0 : _b.forEach((child) => {
        const listItem = document.createElement("li");
        renderNestedDirectory(child, listItem);
        list.appendChild(listItem);
    });
    parent.appendChild(list);
}
function openFile(file) {
    return __awaiter(this, void 0, void 0, function* () {
        const path = `/api/file/${currentArticle}/${new Date().getTime()}/${encodeURIComponent(file.Path)}`;
        window.open(path, "_blank");
    });
}
uploadButton === null || uploadButton === void 0 ? void 0 : uploadButton.addEventListener("change", uploadFile);
function uploadFile() {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const file = (_a = uploadButton === null || uploadButton === void 0 ? void 0 : uploadButton.files) === null || _a === void 0 ? void 0 : _a.item(0);
        if (file == null) {
            return;
        }
        let formData = new FormData();
        formData.append("photo", file);
        const result = yield fetch(`/api/file/${currentArticle}`, {
            method: "POST",
            body: formData,
        });
        if (result.ok) {
            showToast("Datei erfolgreich hochgeladen");
            return;
        }
        showToast("Es gabe einen Fehler beim Hochladen der Datei. Die Datei konnte nicht gespeichert werden!");
    });
}
function showToast(message) {
    if (toastTimeout != null) {
        window.clearTimeout(toastTimeout);
    }
    toast.innerText = message;
    toast.style.display = "inherit";
    toastTimeout = window.setTimeout(() => (toast.style.display = "none"), 10000);
}
