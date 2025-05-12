let files = [];

function saveFilesToStorage() {
    localStorage.setItem("markdownFiles", JSON.stringify(files));
}

function loadFilesFromStorage() {
    const saved = localStorage.getItem("markdownFiles");
    if (saved) {
        files = JSON.parse(saved);
    }
}

function createFile() {
    files.push("");
    saveFilesToStorage();
    renderFiles("files");
}

function updateFile(value, index) {
    if (files[index] !== undefined) {
        files[index] = value;
        saveFilesToStorage();
        renderFiles("files");
    }
}

function deleteFile(index) {
    if (files[index] !== undefined) {
        files.splice(index, 1);
        saveFilesToStorage();
        renderFiles("files");
    }
}

function deleteAllFiles(){
    files = [];
    saveFilesToStorage();
    renderFiles("files");
}

function importFile() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".md, text/markdown, text/plain";
    input.onchange = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            files.push(reader.result);
            saveFilesToStorage();
            renderFiles("files");
        };
        reader.readAsText(file);
    };
    input.click();
}

function exportFile(index) {
    if (files[index] === undefined) return;

    const blob = new Blob([files[index]], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${getFileTitle(index)}.md`;
    a.click();

    URL.revokeObjectURL(url);
}

function getFileText(index) {
    return files[index] || null;
}

function getFileAverageReadingTime(index) {
    const text = getFileText(index);
    if (!text) return "0 s";

    const words = text.trim().split(/\s+/).length;
    const totalSeconds = Math.ceil((words / 200) * 60);

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    let result = "";
    if (hours > 0) result += `${hours} h `;
    if (minutes > 0) result += `${minutes} min `;
    if (hours === 0 && seconds > 0) result += `${seconds} s`;

    return result.trim();
}

function getFileTitle(index) {
    const text = getFileText(index);
    if (!text) return null;

    const lines = text.split(/\r?\n/);

    for (let line of lines) {
        if (line.startsWith("# ")) {
            let title = line.substring(2).trim();
            if (title.length > 32) {
                title = title.substring(0, 31) + '…';
            }
            return title;
        }
    }

    for (let line of lines) {
        if (line.startsWith("#")) {
            let title = line.replace(/^#+/, "").trim();
            if (title.length > 32) {
                title = title.substring(0, 31) + '…';
            }
            return title;
        }
    }

    for (let line of lines) {
        if (line.trim()) {
            let title = line.trim();
            if (title.length > 32) {
                title = title.substring(0, 31) + '…';
            }
            return title;
        }
    }

    return null;
}

function renderFiles(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = "";

    files.forEach((_, i) => {
        const fileButton = document.createElement("button");
        fileButton.className = "file";

        const infoDiv = document.createElement("div");
        infoDiv.style.width = "90%"
        const h3 = document.createElement("h3");
        h3.textContent = getFileTitle(i) || "Untitled";
        const p = document.createElement("p");
        p.textContent = getFileAverageReadingTime(i);
        infoDiv.appendChild(h3);
        infoDiv.appendChild(p);

        const dropdownDiv = document.createElement("div");
        dropdownDiv.className = "dropdown";

        const dropdownButton = document.createElement("button");
        dropdownButton.className = "icon-button";
        dropdownButton.setAttribute("translate", "no");
        dropdownButton.setAttribute("title", "More options");
        dropdownButton.innerText = "more_horiz";
        dropdownButton.onclick = (event) => {
            event.stopPropagation();
            toggleDropdown(`file-menu-${i}`);
        };

        const dropdownContent = document.createElement("div");
        dropdownContent.className = "dropdown-content menu";
        dropdownContent.id = `file-menu-${i}`;

        const downloadBtn = document.createElement("button");
        downloadBtn.className = "text-button";
        downloadBtn.textContent = "Download";
        downloadBtn.onclick = () => exportFile(i);

        const hr = document.createElement("hr");

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "text-button";
        deleteBtn.textContent = "Delete";
        deleteBtn.onclick = () => {deleteFile(i); saveFilesToStorage(); renderFiles(containerId);};

        dropdownContent.appendChild(downloadBtn);
        dropdownContent.appendChild(hr);
        dropdownContent.appendChild(deleteBtn);

        dropdownDiv.appendChild(dropdownButton);
        dropdownDiv.appendChild(dropdownContent);

        fileButton.appendChild(infoDiv);
        fileButton.appendChild(dropdownDiv);

        fileButton.onclick = () => {
            index = i;
            renderEditor();
        };

        container.appendChild(fileButton);
    });
}

