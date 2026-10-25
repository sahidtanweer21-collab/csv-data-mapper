const fileInput = document.getElementById("fileInput");
const chooseFile = document.getElementById("chooseFile");
const dropZone = document.getElementById("dropZone");
const fileName = document.getElementById("fileName");
const message = document.getElementById("message");

const rowCount = document.getElementById("rowCount");
const columnCount = document.getElementById("columnCount");
const missingCount = document.getElementById("missingCount");

const dataTable = document.getElementById("dataTable");
const emptyState = document.getElementById("emptyState");
const searchInput = document.getElementById("searchInput");
const columnSelect = document.getElementById("columnSelect");
const renameInput = document.getElementById("renameInput");

const renameButton = document.getElementById("renameButton");
const removeDuplicates = document.getElementById("removeDuplicates");
const fillMissing = document.getElementById("fillMissing");
const downloadButton = document.getElementById("downloadButton");

let headers = [];
let rows = [];
let filteredRows = [];

function showMessage(text, type = "success") {
    message.textContent = text;
    message.className = `message visible ${type}`;
}

function setControlsEnabled(enabled) {
    searchInput.disabled = !enabled;
    columnSelect.disabled = !enabled;
    renameInput.disabled = !enabled;
    renameButton.disabled = !enabled;
    removeDuplicates.disabled = !enabled;
    fillMissing.disabled = !enabled;
    downloadButton.disabled = !enabled;
}

chooseFile.addEventListener("click", () => fileInput.click());

fileInput.addEventListener("change", () => {
    if (fileInput.files.length) {
        uploadFile(fileInput.files[0]);
    }
});

["dragenter", "dragover"].forEach(eventName => {
    dropZone.addEventListener(eventName, event => {
        event.preventDefault();
        dropZone.style.borderColor = "var(--lime)";
    });
});

["dragleave", "drop"].forEach(eventName => {
    dropZone.addEventListener(eventName, event => {
        event.preventDefault();
        dropZone.style.borderColor = "#48533d";
    });
});

dropZone.addEventListener("drop", event => {
    const file = event.dataTransfer.files[0];
    if (file) uploadFile(file);
});

async function uploadFile(file) {
    if (!file.name.toLowerCase().endsWith(".csv")) {
        showMessage("Please select a CSV file.", "error");
        return;
    }

    if (file.size > 10 * 1024 * 1024) {
        showMessage("The file is too large. Maximum size is 10 MB.", "error");
        return;
    }

    const formData = new FormData();
    formData.append("file", file);

    fileName.textContent = `Uploading: ${file.name}`;
    chooseFile.disabled = true;

    try {
        const response = await fetch("/upload", {
            method: "POST",
            body: formData
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Upload failed.");
        }

        headers = result.headers;
        rows = result.rows;
        filteredRows = rows.slice();

        fileName.textContent = file.name;

        updateStats(result.stats);
        populateColumnSelect();
        renderTable();
        setControlsEnabled(true);

        showMessage(`Successfully imported ${file.name}.`, "success");
    } catch (error) {
        showMessage(error.message || "Something went wrong while uploading.", "error");
        fileName.textContent = "No file selected";
    } finally {
        chooseFile.disabled = false;
    }
}

function updateStats(stats) {
    rowCount.textContent = stats.rows.toLocaleString();
    columnCount.textContent = stats.columns.toLocaleString();
    missingCount.textContent = stats.missing.toLocaleString();
}

function populateColumnSelect() {
    columnSelect.innerHTML = "";

    headers.forEach(header => {
        const option = document.createElement("option");
        option.value = header;
        option.textContent = header;
        columnSelect.appendChild(option);
    });
}

function renderTable() {
    const thead = dataTable.querySelector("thead");
    const tbody = dataTable.querySelector("tbody");

    thead.replaceChildren();
    tbody.replaceChildren();

    if (!headers.length) {
        dataTable.hidden = true;
        emptyState.hidden = false;
        emptyState.textContent = "No columns available.";
        return;
    }

    const headerRow = document.createElement("tr");

    headers.forEach(header => {
        const th = document.createElement("th");
        th.textContent = header;
        headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);

    filteredRows.slice(0, 100).forEach(row => {
        const tr = document.createElement("tr");

        headers.forEach(header => {
            const td = document.createElement("td");
            td.textContent = row[header] ?? "";
            tr.appendChild(td);
        });

        tbody.appendChild(tr);
    });

    dataTable.hidden = false;
    emptyState.hidden = true;

    if (filteredRows.length > 100) {
        showMessage("Showing the first 100 matching rows in the preview.", "success");
    }
}

searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase();

    filteredRows = rows.filter(row =>
        headers.some(header =>
            String(row[header] ?? "").toLowerCase().includes(query)
        )
    );

    renderTable();
});

renameButton.addEventListener("click", async () => {
    const oldName = columnSelect.value;
    const newName = renameInput.value.trim();

    if (!oldName || !newName) {
        showMessage("Choose a column and enter its new name.", "error");
        return;
    }

    if (headers.includes(newName) && newName !== oldName) {
        showMessage("A column with that name already exists.", "error");
        return;
    }

    try {
        const result = await postAction("/rename", {
            old_name: oldName,
            new_name: newName
        });

        headers = result.headers;
        rows = result.rows;
        filteredRows = rows.slice();

        searchInput.value = "";
        renameInput.value = "";

        updateStats(result.stats);
        populateColumnSelect();
        renderTable();

        showMessage("Column renamed successfully.", "success");
    } catch (error) {
        showMessage(error.message, "error");
    }
});

removeDuplicates.addEventListener("click", async () => {
    try {
        const result = await postAction("/remove-duplicates", {});

        headers = result.headers;
        rows = result.rows;
        filteredRows = rows.slice();

        updateStats(result.stats);
        renderTable();

        showMessage(`Removed ${result.removed} duplicate row(s).`, "success");
    } catch (error) {
        showMessage(error.message, "error");
    }
});

fillMissing.addEventListener("click", async () => {
    try {
        const result = await postAction("/fill-missing", {});

        headers = result.headers;
        rows = result.rows;
        filteredRows = rows.slice();

        updateStats(result.stats);
        renderTable();

        showMessage(`Filled ${result.filled} empty cell(s).`, "success");
    } catch (error) {
        showMessage(error.message, "error");
    }
});

async function postAction(url, payload) {
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.error || "The operation failed.");
    }

    return result;
}

downloadButton.addEventListener("click", () => {
    window.location.href = "/download";
});