let files = [];

/**
 * Saves the current files array to localStorage
 */
function saveFilesToStorage() {
    localStorage.setItem("markdownFiles", JSON.stringify(files));
}

/**
 * Gets the value on the localStorage to files
 */
function loadFilesFromStorage() {
    const saved = localStorage.getItem("markdownFiles");
    if (saved) {
        files = JSON.parse(saved);
    }
}

/**
 * Creates a empty file to files
 */
function createFile() {
    index = 0;
    localStorage.setItem('lastIndex', index);
    files.unshift("");
    saveFilesToStorage();
    renderFiles("files");
    renderEditor()
}

/**
 * Updates the value of a certain file
 * @param {The new value of the file} value 
 * @param {The file to be updated} index 
 */
function updateFile(value, index) {
    if (files[index] !== undefined) {
        files[index] = value;
        saveFilesToStorage();
        renderFiles("files");
    }
}

/**
 * Deletes a file
 * @param {The file to be deleted} index 
 */
function deleteFile(index) {
    if (files[index] !== undefined) {
        files.splice(index, 1);
        saveFilesToStorage();
        renderFiles("files");
    }
}

/**
 * Deletes all files
 */
function deleteAllFiles() {
    files = [];
    saveFilesToStorage();
    renderFiles("files");
}

/**
 * Deletes all files without any text
 */
function deleteEmptyFiles() {
    files = files.filter(file => file.trim() !== "");
    if (files.length == 0) createFile();
    saveFilesToStorage();
    renderFiles("files");
}

/**
 * Shows a open file dialog, adds the context of a file into the fileList
 */
function importFile() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".md, text/markdown, text/plain";
    input.onchange = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            files.unshift(reader.result);
            saveFilesToStorage();
            renderFiles("files");
            index = files.lenght - 1;
            localStorage.setItem('lastIndex', index);
            renderEditor();
            editor.focus();
        };
        reader.readAsText(file);
    };
    input.click();
}

/**
 * Exports a file as a .md markdown document
 * @param {The file to be exported} index 
 * @returns null if the file doesn't exists
 */
function exportFile(index, fileName = getFileTitle(index)) {
    if (files[index] === undefined) return;

    const blob = new Blob([files[index]], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName}.md`;
    a.click();

    URL.revokeObjectURL(url);
}

/**
 * Gets the text of a file
 * @param {The file to be returned} index 
 * @returns The text content of a file || null if id doesn't exists
 */
function getFileText(index) {
    return files[index] || null;
}

/**
 * Gets statistics of a file
 * @param {The file to be returned} index 
 * @returns Object containing: read time string, paragraphs qtd, sentences qtd, words qtd, characters qtd, aprox. file size string
 */
function getFileStats(index) {
    const text = getFileText(index);
    if (!text) {
        return {
            readTime: "0s",
            paragraphs: 0,
            sentences: 0,
            words: 0,
            characters: 0,
            size: "0 B"
        };
    }

    const trimmedText = text.trim();

    const paragraphs = trimmedText.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
    const sentences = trimmedText.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const words = trimmedText.split(/\s+/).filter(w => w.trim().length > 0).length;
    const characters = trimmedText.length;

    const byteSize = new TextEncoder().encode(text).length;

    function formatSize(bytes) {
        if (bytes < 1024) return `${bytes} B`;
        else if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        else return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }

    const totalSeconds = Math.ceil((words / 200) * 60);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    let readTime = "";
    if (hours > 0) readTime += `${hours}h `;
    if (minutes > 0) readTime += `${minutes}min `;
    if (hours === 0 && seconds > 0) readTime += `${seconds}s`;

    return {
        readTime: readTime.trim(),
        paragraphs,
        sentences,
        words,
        characters,
        size: formatSize(byteSize)
    };
}

/**
 * Gets an adequate title to a file
 * @param {The file to be returned} index 
 * @returns a title
 */
function getFileTitle(index) {
    const text = getFileText(index);
    if (!text) return null;

    const conv = new showdown.Converter({metadata: true});
    const html = conv.makeHtml(text);
    const metadata = conv.getMetadata();
    if (metadata.title) return metadata.title;

    const lines = text.split(/\r?\n/);

    for (let i = 1; i <= 6; i++) {
        const prefix = '#'.repeat(i) + ' ';
        for (let line of lines) {
            if (line.startsWith(prefix)) {
                return formatTitle(line.replace(/^#+/, '').trim());
            }
        }
    }

    for (let line of lines) {
        if (line.trim()) {
            return formatTitle(line.trim());
        }
    }

    return null;
}


function formatTitle(title) {
    return title.length > 32 ? title.substring(0, 31) + '…' : title;
}

/**
 * Gets a tiny text snippet of a file
 * @param {The file to be returned} index 
 * @param {lenght of returned text} lenght
 * @returns file snippet
 */
function getFileSnippet(index, lenght) {
    return files[index].substring(0, lenght) || null;
}

/**
 * Gets all tags from a file
 * @param {The file to have tags returned} index 
 * @returns Array of strings with all tags
 */
function getFileTags(index) {
    const text = getFileText(index);
    if (!text) return [];

    const conv = new showdown.Converter({ metadata: true });
    conv.makeHtml(text);
    const metadata = conv.getMetadata();

    if (!metadata.tags) return [];

    return metadata.tags.split(', ').map(tag => tag.trim()).filter(Boolean);
}


function renderFiles(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = "";

    files.forEach((_, i) => {
        const text = getFileText(i);
        let metadata = {};
        if (text) {
            const conv = new showdown.Converter({ metadata: true });
            conv.makeHtml(text);
            metadata = conv.getMetadata();
        }

        const fileButton = document.createElement("button");
        fileButton.className = "file";
        fileButton.setAttribute("draggable", "true");
        fileButton.dataset.index = i;

        if (i === index) {
            fileButton.classList.add("selected");
        }

        const infoDiv = document.createElement("div");
        infoDiv.style.width = "90%";
        const h3 = document.createElement("h3");
        h3.textContent = getFileTitle(i) || "New document";
        h3.style.color = metadata.color || 'var(--title-color)';
        const p = document.createElement("p");
        p.innerHTML = `<span class=icon>schedule</span>${getFileStats(i).readTime} to read`;
        p.title = `${getFileStats(i).paragraphs} Paragraphs`;
        const authors = document.createElement("p");
        authors.innerHTML = `<span class=icon>group</span>${metadata.authors}`;
        authors.title = "Authors";
        const tags = document.createElement("p");
        tags.innerHTML = `<span class=icon>sell</span>${metadata.tags}`
        tags.title = "Tags";
        const date = document.createElement("p");
        date.innerHTML = `<span class=icon>calendar_month</span>${metadata.date}`;
        const description = document.createElement("p");
        description.innerText =  metadata.description || "";
        description.style.marginTop = "5px";
        description.style.opacity = "100%";
        infoDiv.appendChild(h3);
        infoDiv.appendChild(p);
        if(metadata.authors) infoDiv.appendChild(authors);
        if(metadata.tags) infoDiv.appendChild(tags);
        if(metadata.date) infoDiv.appendChild(date);
        if(metadata.description) infoDiv.appendChild(description);

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
        };

        const downloadBtn = document.createElement("button");
        downloadBtn.className = "text-button";
        downloadBtn.textContent = "Download";
        downloadBtn.onclick = (event) => {
            event.stopPropagation();
            hideAllMenus();
            promptSaveFile(i);
        };

        const hr = document.createElement("hr");

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "text-button danger";
        deleteBtn.textContent = "Delete";
        deleteBtn.onclick = (event) => {
            event.stopPropagation();
            deleteFile(i);
            saveFilesToStorage();
            if (files.length === 0) {
                createFile();
            }
            index = 0;
            localStorage.setItem('lastIndex', index);
            renderFiles(containerId);
            renderEditor();
            editor.focus();
            showToast('Deleted', 'delete');
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
            localStorage.setItem('lastIndex', index);
            renderFiles(containerId);
            renderEditor();
            editor.focus();
            if (isMobile()) { hideAllSidebars(); }
        };

        fileButton.ondragstart = (e) => {
            e.dataTransfer.setData("text/plain", i);
            e.dataTransfer.effectAllowed = "move";
        };

        fileButton.ondragover = (e) => {
            e.preventDefault();
            fileButton.classList.add("drag-over");

            index = i;
            localStorage.setItem('lastIndex', index);
            renderFiles(containerId);
            renderEditor();
            editor.focus();
            if (isMobile()) { hideAllSidebars(); }
        };

        fileButton.ondragleave = () => {
            fileButton.classList.remove("drag-over");
        };

        fileButton.ondrop = (e) => {
            e.preventDefault();
            const fromIndex = parseInt(e.dataTransfer.getData("text/plain"));
            const toIndex = i;
            if (fromIndex !== toIndex) {
                const [movedFile] = files.splice(fromIndex, 1);
                files.splice(toIndex, 0, movedFile);
                saveFilesToStorage();
                renderFiles(containerId);
                if (index === fromIndex) index = toIndex;
                else if (index > fromIndex && index <= toIndex) index--;
                else if (index < fromIndex && index >= toIndex) index++;
                renderEditor();

                index = i;
                localStorage.setItem('lastIndex', index);
                renderFiles(containerId);
                renderEditor();
                editor.focus();
                if (isMobile()) { hideAllSidebars(); }
            }
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