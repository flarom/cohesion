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
function createFile(text = "") {
    index = 0;
    localStorage.setItem('lastIndex', index);
    files.unshift(text);
    saveFilesToStorage();
    renderFiles("files");
    renderEditor();
    if (Settings.getSetting('editorAutoMeta', 'false') === 'true' && text === "") {insertSnippetAtTop(getMeta() + "\n\n", '~');};
}

/**
 * Updates the value of a certain file
 * @param {string} value The new value of the file
 * @param {int} index The file to be updated
 */
function updateFile(value, index) {
    if (files[index] !== undefined) {
        files[index] = value;
        saveFilesToStorage();
        renderFiles("files");
    }
}

async function shareFile(index) {
    const text = files[index];
    const resp = await fetch("https://tempfiles.flarowom.workers.dev/upload", {
        method: "POST",
        body: text,
    });

    const json = await resp.json();

    const id = json.url.split("/").pop();

    return id;
}

function createQRCode(link, size = 200) {
    const encoded = encodeURIComponent(link);
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}`;
}

/**
 * Deletes a file
 * @param {int} index The file to be deleted
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
    renderEditor();
}

function importFile() {
    return new Promise((resolve) => {
        const html = `
            <div id="drop-area" class="drop-area">
                <div class="drop-area-text">
                    <p data-locale="dialogs.import-file.title">Drag & Drop a file here</p>
                    <p class="subtitle" data-locale="dialogs.import-file.subtitle">Or click to choose a file</p>
                </div>
            </div>
        `;

        promptMessage(html, true, false).then(resolve);

        const dropArea = document.getElementById("drop-area");

        translateWithin(dropArea);

        function handleFile(file) {
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => {
                files.unshift(reader.result);
                saveFilesToStorage();
                renderFiles("files");
                index = 0;
                localStorage.setItem('lastIndex', index);
                renderEditor();
                editor.focus();
            };
            reader.readAsText(file);
            closeAllDialogs();
        }

        dropArea.addEventListener("dragover", (e) => {
            e.preventDefault();
            dropArea.classList.add("dragover");
        });

        dropArea.addEventListener("dragleave", () => {
            dropArea.classList.remove("dragover");
        });

        dropArea.addEventListener("drop", (e) => {
            e.preventDefault();
            dropArea.classList.remove("dragover");
            const file = e.dataTransfer.files[0];
            handleFile(file);
        });

        dropArea.addEventListener("click", () => {
            const input = document.createElement("input");
            input.type = "file";
            input.onchange = (event) => {
                handleFile(event.target.files[0]);
            };
            input.click();
        });
    });
}

/**
 * Exports a file as a .md markdown document
 * @param {int} index The file to be exported
 * @param {string} fileName File name
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
 * Exports all files as a .zip file
 */
async function exportBook() {
    const zip = new JSZip();

    files.forEach((file, index) => {
        let title = getFileTitle(index) || `untitled-${index + 1}`;
        title = title.replace(/[<>:"/\\|?*\x00-\x1F]/g, "").trim(); 
        zip.file(`${title}.md`, file);
    });

    const fsFiles = await Resources.getFSFiles();
    const resourcesFolder = zip.folder("resources");

    fsFiles.forEach(file => {
        const base64Content = file.content.split(',')[1];
        resourcesFolder.file(file.name, base64Content, { base64: true });
    });

    zip.generateAsync({ type: "blob" }).then(content => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(content);
        a.download = `${new Date().toISOString().split('T')[0]}-cohesion.zip`;
        a.click();
        URL.revokeObjectURL(a.href);
    });
}


/**
 * Imports a .zip file, tries to unshift into files
 */
function importBook() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".zip";
    input.onchange = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async () => {
            const zip = await JSZip.loadAsync(reader.result);
            const newFiles = [];

            const entries = Object.values(zip.files);
            for (const entry of entries) {
                if (!entry.dir) {
                    if (entry.name.startsWith("resources/")) {
                        const base64 = await entry.async("base64");
                        await Resources.setFSFile({
                            name: entry.name.replace("resources/", ""),
                            content: `data:application/octet-stream;base64,${base64}`
                        });
                    } else {
                        const content = await entry.async("string");
                        newFiles.unshift(content);
                    }
                }
            }

            files = [...newFiles, ...files];
            saveFilesToStorage();
            renderFiles("files");
            renderEditor();
        };
        reader.readAsArrayBuffer(file);
    };
    input.click();
}

/**
 * Imports a .zip file, replaces files[] with contents
 */
function importDeleteBook() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".zip";
    input.onchange = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async () => {
            const zip = await JSZip.loadAsync(reader.result);
            const newFiles = [];

            await Resources.deleteAllFS();

            const entries = Object.values(zip.files);
            for (const entry of entries) {
                if (!entry.dir) {
                    if (entry.name.startsWith("resources/")) {
                        const base64 = await entry.async("base64");
                        await Resources.setFSFile({
                            name: entry.name.replace("resources/", ""),
                            content: `data:application/octet-stream;base64,${base64}`
                        });
                    } else {
                        const content = await entry.async("string");
                        newFiles.unshift(content);
                    }
                }
            }

            files = newFiles;
            saveFilesToStorage();
            renderFiles("files");
            renderEditor();
        };
        reader.readAsArrayBuffer(file);
    };
    input.click();
}

/**
 * Gets the text of a file
 * @param {int} index The file to be returned
 * @returns The text content of a file || null if id doesn't exists
 */
function getFileText(index) {
    return files[index] || null;
}

/**
 * Gets statistics of a file
 * @param {int} index The file to be returned
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
 * Gets an adequate title from a file index
 * @param {number} index The file ID
 * @returns {string|null} a title
 */
function getFileTitle(index) {
    const text = getFileText(index);
    if (!text) return null;

    return getFileTitleFromText(text);
}

/**
 * Gets an adequate title from raw text
 * @param {string} text
 * @returns {string|null} a title
 */
function getFileTitleFromText(text) {
    const conv = new showdown.Converter({ metadata: true });

    conv.makeHtml(text);

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
 * @param {int} index The file to be returned
 * @param {int} lenght lenght of returned text
 * @returns file snippet
 */
function getFileSnippet(index, lenght) {
    return files[index].substring(0, lenght) || null;
}

/**
 * Gets all tags from a file
 * @param {int} index The file to have tags returned
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

/**
 * Gets a metadata value with fallback alternatives
 * @param {Object} metadata The metadata object
 * @param {Array} fieldNames Array of field names to check in order
 * @returns {string|undefined} The first available value or undefined
 */
function getMetadataValue(metadata, fieldNames) {
    for (const field of fieldNames) {
        if (metadata[field]) {
            return metadata[field];
        }
    }
    return undefined;
}

/**
 * Gets the file group from metadata
 * @param {*} metadata The metadata object 
 * @returns {string} The project or folder name, or null if neither exists
 */
function getFileGroup(metadata) {
    return (
        metadata.project ||
        metadata.folder ||
        null
    );
}

const groupState = JSON.parse(
    localStorage.getItem("fileGroupState") || "{}"
);

function saveGroupState() {
    localStorage.setItem(
        "fileGroupState",
        JSON.stringify(groupState)
    );
}

function createGroupContainer(name) {
    let iconName = "folder";
    let iconColor = "currentColor";
    let displayName = name;

    // Only parse metadata if name is a string (not null, which is the default group)
    if (typeof name === "string") {
        const metaMatch = name.match(/^\[([^:\]]+):([^\]]+)\](.*)$/);
        if (metaMatch) {
            iconName = metaMatch[1].trim();
            iconColor = metaMatch[2].trim();
            displayName = metaMatch[3].trim();
        }
    } else if (name === null) {
        iconName = "";
        displayName = null; // Keep null as is for default group
    }

    // changing spaces to underscores, makes it a bit more clean for icon names and avoids a DOMException
    const normalizedIconName = iconName
        .toLowerCase()
        .replace(/\s+/g, "_");

    const key = displayName === null ? "__default__" : displayName.toLowerCase().trim();
    const isCollapsed = groupState[key] === true;

    // wrapper
    const wrapper = document.createElement("div");
    wrapper.className = "file-group";
    wrapper.classList.toggle("collapsed", isCollapsed);
    wrapper.classList.toggle("expanded", !isCollapsed);

    // header
    const header = document.createElement("div");
    header.className = "file-group-header";

    const iconAndTitleContainer = document.createElement("div");
    iconAndTitleContainer.style.display = "flex";
    iconAndTitleContainer.style.alignItems = "center";
    iconAndTitleContainer.style.gap = "6px";

    // icon
    const icon = document.createElement("span");
    icon.className = "icon file-group-icon material-symbols-rounded";
    icon.textContent = normalizedIconName;
    icon.style.color = iconColor;

    // complementary classes
    icon.classList.add(
        `icon-${normalizedIconName}`,
        iconColor.startsWith("#")
            ? `color-hex-${iconColor.slice(1).toLowerCase()}`
            : `color-${iconColor.toLowerCase().replace(/[^a-z0-9_-]/g, "")}`
    );

    // title
    const title = document.createElement("strong");
    title.textContent = displayName === null ? "Your Documents" : displayName;

    iconAndTitleContainer.append(icon, title);

    // menu
    const menuWrap = document.createElement("div");
    menuWrap.className = "dropdown";

    const menuButton = document.createElement("button");
    menuButton.className = "icon-button";
    menuButton.textContent = "more_horiz";

    menuButton.onclick = (e) => {
        e.stopPropagation();
        toggleDropdown(`group-menu-${key}`);
    };

    const menu = document.createElement("div");
    menu.className = "dropdown-content menu";
    menu.id = `group-menu-${key}`;

    // Only show menu for non-null groups (string groups, not the default group)
    const shouldShowMenu = name !== null;

    const exportBtn = document.createElement("button");
    exportBtn.className = "text-button";
    exportBtn.dataset.locale = "app.sidebar.project-menu.export"
    exportBtn.textContent = "Export project";
    exportBtn.onclick = async (e) => {
        e.stopPropagation();
        exportGroup(name);
    }

    const renameBtn = document.createElement("button");
    renameBtn.className = "text-button";
    renameBtn.dataset.locale = "app.sidebar.project-menu.rename"
    renameBtn.textContent = "Rename project";
    renameBtn.onclick = async (e) => {
        e.stopPropagation();

        // can't rename default group (null, not string "null")
        if (name === null) {
            showToast("Default group can't be renamed", "error");
            return;
        }

        const newName = await promptRenameProject(
            name
        );

        if (!newName) return;

        renameGroup(name, newName);
        renderFiles("files");
    };

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "text-button danger";
    deleteBtn.textContent = "Delete project";
    deleteBtn.dataset.locale = "app.sidebar.project-menu.delete"
    deleteBtn.onclick = async (e) => {
        e.stopPropagation();

        const ok = await promptConfirm(
            `Delete all documents in "${displayName}"?`,
            true
        );

        if (!ok) return;

        deleteGroup(name);
        renderFiles("files");
    };

    menu.append(
        exportBtn,
        renameBtn,
        document.createElement("hr"),
        deleteBtn
    );

    // Only append menu if this is not the default group
    if (shouldShowMenu) {
        menuWrap.append(menuButton, menu);
    }

    // content
    const content = document.createElement("div");
    content.className = "file-group-content";
    content.classList.toggle("collapsed", isCollapsed);
    if(iconColor !== "currentColor") content.style.borderLeftColor = iconColor;

    // complementary classes
    content.classList.add(
        `icon-${normalizedIconName}`,
        iconColor.startsWith("#")
            ? `color-hex-${iconColor.slice(1).toLowerCase()}`
            : `color-${iconColor.toLowerCase().replace(/[^a-z0-9_-]/g, "")}`
    );

    // toggle
    header.onclick = () => {
        const collapsed = content.classList.toggle("collapsed");
        
        wrapper.classList.toggle("collapsed", collapsed);
        wrapper.classList.toggle("expanded", !collapsed);
        
        groupState[key] = collapsed;
        saveGroupState();
    };

    // rename on double click (if not default group)
    if (shouldShowMenu) {
        header.ondblclick = async (e) => {
            e.stopPropagation();
            const newName = await promptRenameProject(
                name
            );
            
            if (newName && newName !== name) {
                renameGroup(name, newName);
                renderFiles("files");
            }
        };
    }

    header.append(iconAndTitleContainer, menuWrap);
    wrapper.append(header, content);
    return { wrapper, content };
}

function renderFiles(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = "";

    const groups = {};

    files.forEach((_, i) => {
        const text = getFileText(i);
        let metadata = {};

        if (text) {
            const conv = new showdown.Converter({ metadata: true });
            conv.makeHtml(text);
            metadata = conv.getMetadata();
        }

        let groupName = getFileGroup(metadata);
        // Use special key for default group to avoid collision with "null" string
        const groupKey = groupName === null ? "__default__" : groupName.toLowerCase().trim();

        if (!groups[groupKey]) {
            groups[groupKey] = [];
        }

        groups[groupKey].push({ index: i, metadata });
    });

    Object.entries(groups).forEach(([groupKey, items]) => {
        // Convert special key back to null for default group
        const groupName = groupKey === "__default__" ? null : groupKey;
        const { wrapper, content } = createGroupContainer(groupName);

        items.forEach(({ index: i, metadata }) => {
            const fileButton = document.createElement("button");
            fileButton.className = "file";
            fileButton.dataset.index = i;
            fileButton.setAttribute("draggable", "true");
            fileButton.setAttribute("translate", "no");

            if (i === index) {
                fileButton.classList.add("selected");
            }

            const infoDiv = document.createElement("div");
            infoDiv.style.width = "90%";

            const h3 = document.createElement("h3");
            h3.textContent = getFileTitle(i) || "Empty file";
            // h3.style.color = metadata.color || "var(--title-color)";

            const stats = getFileStats(i);

            const readTime = document.createElement("p");
            readTime.innerHTML = `${stats.readTime} to read`;
            readTime.dataset.localeVars = `{"readTime":"${stats.readTime}"}`
            readTime.dataset.locale = "app.sidebar.file.readtime"

            /*
            const authorValue = getMetadataValue(metadata, ["author", "authors"]);
            const tagsValue = getMetadataValue(metadata, ["tags", "keywords"]);
            const dateValue = getMetadataValue(metadata, ["date", "created date"]);
            const descriptionValue = getMetadataValue(metadata, ["description", "subject", "comment"]);
            */

            infoDiv.appendChild(h3);
            infoDiv.appendChild(readTime);

            /*
            if (authorValue) {
                const author = document.createElement("p");
                author.innerHTML = `<span class="icon">person</span>${authorValue}`;
                infoDiv.appendChild(author);
            }

            if (tagsValue) {
                const tags = document.createElement("p");
                tags.innerHTML = `<span class="icon">sell</span>${tagsValue}`;
                infoDiv.appendChild(tags);
            }

            if (dateValue) {
                const date = document.createElement("p");
                date.innerHTML = `<span class="icon">event</span>${dateValue}`;
                infoDiv.appendChild(date);
            }

            if (descriptionValue) {
                const desc = document.createElement("p");
                desc.innerText = descriptionValue;
                desc.style.marginTop = "5px";
                infoDiv.appendChild(desc);
            }
            */

            const dropdownDiv = document.createElement("div");
            dropdownDiv.className = "dropdown";

            const dropdownButton = document.createElement("button");
            dropdownButton.className = "icon-button";
            dropdownButton.innerText = "more_horiz";
            dropdownButton.onclick = (e) => {
                e.stopPropagation();
                toggleDropdown(`file-menu-${i}`);
            };

            const dropdownContent = document.createElement("div");
            dropdownContent.className = "dropdown-content menu";
            dropdownContent.id = `file-menu-${i}`;

            const duplicateBtn = document.createElement("button");
            duplicateBtn.className = "text-button";
            duplicateBtn.textContent = "Duplicate";
            duplicateBtn.dataset.locale = "app.sidebar.file-menu.duplicate";
            duplicateBtn.onclick = (e) => {
                e.stopPropagation();
                createFile(getFileText(i));
            };

            const downloadBtn = document.createElement("button");
            downloadBtn.className = "text-button";
            downloadBtn.textContent = "Save";
            downloadBtn.dataset.locale = "app.sidebar.file-menu.download";
            downloadBtn.onclick = (e) => {
                e.stopPropagation();
                promptSaveFile(i);
            };

            const deleteBtn = document.createElement("button");
            deleteBtn.className = "text-button danger";
            deleteBtn.textContent = "Delete";
            deleteBtn.dataset.locale = "app.sidebar.file-menu.delete";
            deleteBtn.onclick = (e) => {
                e.stopPropagation();
                deleteFile(i);
                if (files.length === 0) createFile();
                index = 0;
                localStorage.setItem("lastIndex", index);
                renderFiles(containerId);
                renderEditor();
                showToast("File deleted", "delete");
            };

            dropdownContent.append(duplicateBtn, downloadBtn, document.createElement("hr"), deleteBtn);
            dropdownDiv.append(dropdownButton, dropdownContent);

            fileButton.append(infoDiv, dropdownDiv);

            fileButton.onclick = () => {
                index = i;
                localStorage.setItem("lastIndex", index);
                renderFiles(containerId);
                renderEditor();
                editor.focus();
                if (isMobile()) hideAllSidebars();
            };

            fileButton.oncontextmenu = (e) => {
                e.preventDefault();
                toggleDropdown(`file-menu-${i}`);
            };

            fileButton.ondragstart = (e) => {
                e.dataTransfer.setData("text/plain", i);
                e.dataTransfer.effectAllowed = "move";
            };

            fileButton.ondragover = (e) => {
                e.preventDefault();
            };

            fileButton.ondrop = (e) => {
                e.preventDefault();
                const from = +e.dataTransfer.getData("text/plain");
                const to = i;
                if (from !== to) {
                    const [moved] = files.splice(from, 1);
                    files.splice(to, 0, moved);
                    saveFilesToStorage();
                    index = to;
                    renderFiles(containerId);
                    renderEditor();
                }
            };

            content.appendChild(fileButton);
        });

        container.appendChild(wrapper);
    });

    translateWithin()
}

function renameGroup(oldName, newNewName) {
    // Can't rename the default group (null)
    if (oldName === null) return;

    files = files.map(text => {
        if (!text) return text;

        const conv = new showdown.Converter({ metadata: true });
        conv.makeHtml(text);
        const metadata = conv.getMetadata();

        const field = metadata.project ? "project" : metadata.folder ? "folder" : null;
        if (!field) return text;

        if ((metadata[field] || "").toLowerCase() !== oldName.toLowerCase()) {
            return text;
        }

        // replace only the metadata line
        return text.replace(
            new RegExp(`^(${field}\\s*:\\s*).*$`, "mi"),
            `$1${newNewName}`
        );
    });

    saveFilesToStorage();
    renderFiles("files");
    renderEditor();
}

function deleteGroup(groupName) {
    // Can't delete the default group (null)
    if (groupName === null) return;

    files = files.filter(text => {
        // if (!text) return true;

        const conv = new showdown.Converter({ metadata: true });
        conv.makeHtml(text);
        const metadata = conv.getMetadata();

        const group = getFileGroup(metadata);
        // Delete files that belong to this named group
        // Use strict comparison to differentiate "null" string from null
        if (group === null) return true; // keep default group files
        return group.toLowerCase() !== groupName.toLowerCase();
    });

    saveFilesToStorage();
    renderFiles("files");
    renderEditor();
}

function exportGroup(groupName) {
    // Can't export the default group (null)
    if (groupName === null) return;

    const zip = new JSZip();
    files.forEach((file, index) => {
        const text = getFileText(index);
        if (!text) return;
        const conv = new showdown.Converter({ metadata: true });
        conv.makeHtml(text);
        const metadata = conv.getMetadata();
        const group = getFileGroup(metadata);
        // Use strict comparison to handle "null" string group
        if (group !== null && group.toLowerCase() === groupName.toLowerCase()) {
            let title = getFileTitle(index) || `untitled-${index + 1}`;
            title = title.replace(/[<>:"/\\|?*\x00-\x1F]/g, "").trim();
            zip.file(`${title}.md`, file);
        }
    });

    zip.generateAsync({ type: "blob" }).then(content => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(content);
        a.download = `${groupName}.zip`;
        a.click();
        URL.revokeObjectURL(a.href);
    });
}