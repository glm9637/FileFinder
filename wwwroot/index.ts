const searchButton = document.getElementById("search-button");
const searchInput = document.getElementById("search-input") as HTMLInputElement;
const resultContainer = document.getElementById("results");
const result = document.getElementById("result");
const resultDisplay = document.getElementById("result-display");
const uploadWrapper = document.querySelector<HTMLDivElement>(".wrapper")!;
const uploadButton = document.querySelector<HTMLInputElement>("#file-upload");
const toast = document.querySelector<HTMLDivElement>("#toast")!;
let toastTimeout: number | undefined;
uploadWrapper.style.display = "none";
if (searchButton == null || searchInput == null || resultContainer == null) {
  throw new Error("Document not loaded");
}
type FileResult = {
  Path: string;
  Name: string;
};

type Directory = {
  Name: string;
  Children?: Directory[];
  Files?: FileResult[];
};

let currentArticle = "";
searchButton.onclick = searchArticle;
searchInput.onkeydown = checkForSubmit;

function checkForSubmit(event: KeyboardEvent) {
  if (event.key === "Enter") {
    searchArticle();
  }
}

async function searchArticle() {
  currentArticle = searchInput.value;
  const response = await fetch(`/api/search/${currentArticle}`);
  if (!response.ok) {
    uploadWrapper.style.display = "none";
    resultContainer!.innerText = "Es wurde keine Dateien gefunden";
    return Promise.reject(response.statusText);
  }
  uploadWrapper.style.display = "";
  let directory = (await response.json()) as Directory;
  renderDirectory(directory);
}

function renderDirectory(directory: Directory) {
  resultContainer!.innerHTML = "";
  let fragment = document.createDocumentFragment();
  renderNestedDirectory(directory, fragment);
  resultContainer?.appendChild(fragment);
}

function renderNestedDirectory(
  directory: Directory,
  parent: { appendChild<T extends Node>(child: T): T }
) {
  const list = document.createElement("ul");
  const header = document.createElement("li");
  header.innerText = directory.Name;
  header.classList.add("header");
  list.appendChild(header);
  directory.Files?.forEach((file) => {
    const fileButton = document.createElement("li");
    fileButton.classList.add("file");
    fileButton.onclick = () => openFile(file);
    fileButton.innerText = file.Name;
    list.appendChild(fileButton);
  });
  directory.Children?.forEach((child) => {
    const listItem = document.createElement("li");
    renderNestedDirectory(child, listItem);
    list.appendChild(listItem);
  });
  parent.appendChild(list);
}

async function openFile(file: FileResult) {
  const path = `/api/file/${currentArticle}/${new Date().getTime()}/${encodeURIComponent(
    file.Path
  )}`;
  window.open(path, "_blank");
}

uploadButton?.addEventListener("change", uploadFile);
async function uploadFile() {
  const file = uploadButton?.files?.item(0);
  if (file == null) {
    return;
  }
  let formData = new FormData();

  formData.append("photo", file);
  const result = await fetch(`/api/file/${currentArticle}`, {
    method: "POST",
    body: formData,
  });
  if (result.ok) {
    showToast("Datei erfolgreich hochgeladen");
    return;
  }
  showToast(
    "Es gabe einen Fehler beim Hochladen der Datei. Die Datei konnte nicht gespeichert werden!"
  );
}

function showToast(message: string) {
  if (toastTimeout != null) {
    window.clearTimeout(toastTimeout);
  }
  toast.innerText = message;
  toast.style.display = "inherit";
  toastTimeout = window.setTimeout(() => (toast.style.display = "none"), 10000);
}
