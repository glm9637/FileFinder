const searchButton = document.getElementById("search-button");
const searchInput = document.getElementById("search-input") as HTMLInputElement;
const resultContainer = document.getElementById("results");
const result = document.getElementById("result");
const resultDisplay = document.getElementById("result-display");
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
  console.log(event);
  if (event.key === "Enter") {
    searchArticle();
  }
}

async function searchArticle() {
  currentArticle = searchInput.value;
  const response = await fetch(`/api/search/${currentArticle}`);
  if (!response.ok) {
    resultContainer!.innerText = "Es wurde keine Dateien gefunden";
    return Promise.reject(response.statusText);
  }
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
  const path = `/api/file/${currentArticle}/${encodeURIComponent(file.Path)}`;
  window.open(path, "_blank");
}
