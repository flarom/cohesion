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
    index = files.length; 
    files.push("");
    saveFilesToStorage();
    renderFiles("files");
    renderEditor()
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
            index = files.lenght -1;
            renderEditor();
            editor.focus();
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
    if (!text) return "0s";

    const words = text.trim().split(/\s+/).length;
    const totalSeconds = Math.ceil((words / 200) * 60);

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    let result = "";
    if (hours > 0) result += `${hours}h `;
    if (minutes > 0) result += `${minutes}min `;
    if (hours === 0 && seconds > 0) result += `${seconds}s`;

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
        if (i === index) {
            fileButton.classList.add("selected");
        }

        const infoDiv = document.createElement("div");
        infoDiv.style.width = "90%";
        const h3 = document.createElement("h3");
        h3.textContent = getFileTitle(i) || "New document";
        const p = document.createElement("p");
        p.innerHTML = `<span class=icon>schedule</span>${getFileAverageReadingTime(i)} to read`;
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

        const shareBtn = document.createElement("button");
        shareBtn.className = "text-button";
        shareBtn.textContent = "Share";
        shareBtn.onclick = (event) => {
            event.stopPropagation();
            generateCompressedLink(i);
        }

        const downloadBtn = document.createElement("button");
        downloadBtn.className = "text-button";
        downloadBtn.textContent = "Download";
        downloadBtn.onclick = (event) => {
            event.stopPropagation();
            exportFile(i);
        };

        const hr = document.createElement("hr");

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "text-button";
        deleteBtn.textContent = "Delete";
        deleteBtn.onclick = (event) => {
            event.stopPropagation();
            deleteFile(i);
            saveFilesToStorage();
            if (files.length === 0) {
                createFile();
            }
            index = files.length - 1;
            renderFiles(containerId);
            renderEditor();
            editor.focus();
            showToast('Deleted', 'delete')
        };

        dropdownContent.appendChild(shareBtn);
        dropdownContent.appendChild(downloadBtn);
        dropdownContent.appendChild(hr);
        dropdownContent.appendChild(deleteBtn);

        dropdownDiv.appendChild(dropdownButton);
        dropdownDiv.appendChild(dropdownContent);

        fileButton.appendChild(infoDiv);
        fileButton.appendChild(dropdownDiv);

        fileButton.onclick = () => {
            index = i;
            renderFiles(containerId);
            renderEditor();
            editor.focus();
            if(isMobile()) { hideAllSidebars(); }
        };

        container.appendChild(fileButton);
    });
}

function generateCompressedLink(id) {
    const markdownText = getFileText(id);
    const compressed = LZString.compressToEncodedURIComponent(markdownText);
    const link = `https://flarom.github.io/cohesion/read?c=${compressed}`;

    console.log(link);

    navigator.clipboard.writeText(link).then(() => {
        showToast("copied", "content_copy");
    }).catch(err => {
        console.error(err);
        showToast("failed copying", "error");
    });
}