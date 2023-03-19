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
if (searchButton == null || searchInput == null || resultContainer == null) {
    throw new Error("Document not loaded");
}
let currentArticle = "";
searchButton.onclick = searchArticle;
searchInput.onkeydown = checkForSubmit;
function checkForSubmit(event) {
    console.log(event);
    if (event.key === "Enter") {
        searchArticle();
    }
}
function searchArticle() {
    return __awaiter(this, void 0, void 0, function* () {
        currentArticle = searchInput.value;
        const response = yield fetch(`/api/search/${currentArticle}`);
        if (!response.ok) {
            // TODO Handle Error
            return Promise.reject(response.statusText);
        }
        let files = (yield response.json());
        renderFiles(files);
    });
}
function renderFiles(files) {
    resultContainer.innerHTML = "";
    let fragment = document.createDocumentFragment();
    files.forEach((file) => {
        const fileButton = document.createElement("button");
        fileButton.classList.add("file");
        fileButton.onclick = () => openFile(file);
        fileButton.innerText = file;
        fragment.appendChild(fileButton);
    });
    resultContainer === null || resultContainer === void 0 ? void 0 : resultContainer.appendChild(fragment);
}
function openFile(file) {
    return __awaiter(this, void 0, void 0, function* () {
        const path = `/api/file/${currentArticle}/${file}`;
        window.open(path, "_blank");
    });
}
