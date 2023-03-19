const searchButton = document.getElementById("search-button");
const searchInput = document.getElementById("search-input") as HTMLInputElement;
const resultContainer = document.getElementById("results");
const result = document.getElementById("result");
const resultDisplay = document.getElementById("result-display");
if (searchButton == null || searchInput == null || resultContainer == null) {
  throw new Error("Document not loaded");
}
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
  let files = (await response.json()) as string[];
  renderFiles(files);
}

function renderFiles(files: string[]) {
  resultContainer!.innerHTML = "";
  let fragment = document.createDocumentFragment();

  files.forEach((file) => {
    const fileButton = document.createElement("button");
    fileButton.classList.add("file");
    fileButton.onclick = () => openFile(file);
    fileButton.innerText = file;
    fragment.appendChild(fileButton);
  });
  resultContainer?.appendChild(fragment);
}

async function openFile(file: string) {
  const path = `/api/file/${currentArticle}/${file}`;
  window.open(path, "_blank");
}
