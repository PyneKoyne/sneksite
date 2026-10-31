const form = document.getElementById("editor-form");
const editor = document.getElementById("editor");
const filenameLabel = document.getElementById("filename");
const statusText = document.getElementById("status");
const saveButton = document.getElementById("save");
const backLink = document.getElementById("back");
const apikey = document.getElementById("apikey");
const URL = "http://localhost:3000";
const MAX_SIZE = 1024 * 1024;
const params = new URLSearchParams(window.location.search);
const dirPath = (params.get("path") || "").replace(/^\/+|\/+$/g, "");
const fileName = params.get("edit") || "";
const filePath = [dirPath, fileName].filter(Boolean).join("/");
const fileURL = URL + "/files/" + filePath;

backLink.href = URL + "/upload/" + (dirPath.length > 0 ? dirPath + "/" : "");

form.addEventListener("submit", saveFile);

window.onload = function () {
    loadFile();
};

function loadFile() {
    filenameLabel.innerText = filePath || "Invalid file";

    if (!fileName || !/\.(txt|md)$/i.test(fileName)) {
        showLoadError("Only .txt and .md files can be edited");
        return;
    }

    statusText.innerText = "Loading...";

    fetch(fileURL, {
        method: 'GET'
    })
        .then(res => {
            if (!res.ok) {
                throw new Error("Unable to load file (" + res.status + ")");
            }
            const contentType = res.headers.get("content-type") || "";
            if (contentType.includes("application/json")) {
                return res.text().then(text => {
                    throw new Error(readError(text));
                });
            }
            const contentLength = Number(res.headers.get("content-length"));
            if (contentLength > MAX_SIZE) {
                showTooLarge();
                return null;
            }
            return res.arrayBuffer().then(buffer => {
                if (buffer.byteLength > MAX_SIZE) {
                    showTooLarge();
                    return;
                }
                editor.value = new TextDecoder("utf-8").decode(buffer);
                editor.disabled = false;
                saveButton.disabled = false;
                statusText.innerText = "";
            });
        })
        .catch(err => showLoadError("Unable to load file: " + err.message));
}

function saveFile(e) {
    e.preventDefault();
    if (editor.disabled) {
        return;
    }

    saveButton.disabled = true;
    statusText.innerText = "Saving...";

    fetch(fileURL, {
        method: "PUT",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify([{content: editor.value}, {
            "apikey": apikey.value
        }])
    })
        .then(res => res.text().then(text => {
            if (!res.ok) {
                throw new Error(readError(text));
            }
            statusText.innerText = "Saved";
        }))
        .catch(err => {
            statusText.innerText = "Unable to save file: " + err.message;
        })
        .finally(() => {
            saveButton.disabled = false;
        });
}

function readError(text) {
    try {
        const parsed = JSON.parse(text);
        if (typeof parsed === "string") {
            return parsed;
        }
        if (Array.isArray(parsed)) {
            if (typeof parsed[0] === "number") {
                return parsed[1] || "Request failed";
            }
            return "This path is not a file";
        }
        if (parsed && parsed.message) {
            return parsed.message;
        }
        return text;
    } catch (e) {
        return text || "Unknown error";
    }
}

function showLoadError(message) {
    statusText.innerText = message;
    editor.disabled = true;
    saveButton.disabled = true;
}

function showTooLarge() {
    editor.disabled = true;
    saveButton.disabled = true;
    statusText.innerText = "File is larger than 1 MB. ";
    const link = document.createElement("a");
    link.href = fileURL;
    link.innerText = "Open raw file";
    statusText.appendChild(link);
}
