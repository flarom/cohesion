/*
Cohesion File System
====================

API used for file management, including saving and loading user projects and documents, using IndexedDB.

This does not include settings, extensions and themes, which are handled separately.
*/
const file = {
    requestToPromise(request) {
        return new Promise((resolve, reject) => {
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    transactionDone(transaction) {
        return new Promise((resolve, reject) => {
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
            transaction.onabort = () => reject(transaction.error || new Error("Transaction aborted"));
        });
    },

    normalizeSegment(name) {
        const value = String(name || "").trim();
        if (!value) {
            throw new Error("Name cannot be empty.");
        }
        return value.toLowerCase();
    },

    normalizePath(path = "") {
        const value = String(path || "").trim();
        if (!value) {
            return "";
        }

        return value
            .split("/")
            .map((part) => part.trim())
            .filter(Boolean)
            .map((part) => part.toLowerCase())
            .join("/");
    },

    buildId(name, parentPath = "") {
        const normalizedName = this.normalizeSegment(name);
        const normalizedParentPath = this.normalizePath(parentPath);
        return normalizedParentPath ? `${normalizedParentPath}/${normalizedName}` : normalizedName;
    },

    getDefaultProjectMetadata(metadata = {}) {
        return {
            icon: typeof metadata.icon === "string" && metadata.icon.trim() ? metadata.icon.trim() : "folder",
            color: typeof metadata.color === "string" && metadata.color.trim() ? metadata.color.trim() : "var(--text-color)",
            date: typeof metadata.date === "string" && metadata.date.trim() ? metadata.date : String(Date.now())
        };
    },

    stripZipExtension(fileName = "") {
        return String(fileName || "").replace(/\.zip$/i, "");
    },

    isTextLikeFile(name = "") {
        return /\.(md|markdown|txt|json|ya?ml|xml|html?|css|js|ts|tsx|jsx|csv|toml|ini|cfg|conf|log|svg)$/i.test(String(name || ""));
    },

    async assertPathAvailable(store, id, name, parentPath = "") {
        const existing = await this.requestToPromise(store.get(id));
        if (existing) {
            const pathLabel = parentPath || "/";
            throw new Error(`Item with name \"${name}\" already exists in \"${pathLabel}\".`);
        }
    },

    makeFileSystem() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open("cohesion-filesystem", 1);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains("files")) {
                    db.createObjectStore("files", { keyPath: "id" });
                }
            };

            request.onsuccess = (event) => {
                resolve(event.target.result);
            };

            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    },

    // MARK: Directory operations
    async createDirectory(name, parentPath = "") {
        const db = await this.makeFileSystem();
        const transaction = db.transaction("files", "readwrite");
        const store = transaction.objectStore("files");
        const id = this.buildId(name, parentPath);
        const normalizedParentPath = this.normalizePath(parentPath);

        await this.assertPathAvailable(store, id, name, normalizedParentPath);

        const directory = {
            id,
            name,
            type: "directory",
            path: normalizedParentPath,
            children: []
        };

        await this.requestToPromise(store.add(directory));
        await this.transactionDone(transaction);
        return directory;
    },

    async listDirectory(path = "", hiddenFiles = false) {
        const db = await this.makeFileSystem();
        const transaction = db.transaction("files", "readonly");
        const store = transaction.objectStore("files");
        const normalizedPath = this.normalizePath(path);
        const allEntries = await this.requestToPromise(store.getAll());

        return allEntries.filter((entry) => {
            const entryPath = entry.path || "";
            const isHidden = entry.name.startsWith(".");
            return entryPath === normalizedPath && (hiddenFiles || !isHidden);
        });
    },

    async getUniqueDirectoryName(baseName, parentPath = "") {
        const normalizedParentPath = this.normalizePath(parentPath);
        const currentEntries = await this.listDirectory(normalizedParentPath, true);
        const usedNames = new Set(
            currentEntries
                .filter((entry) => entry.type === "directory")
                .map((entry) => entry.name.toLowerCase())
        );

        const base = String(baseName || "New project").trim() || "New project";
        if (!usedNames.has(base.toLowerCase())) {
            return base;
        }

        let counter = 1;
        while (true) {
            const candidate = `${base} (${counter})`;
            if (!usedNames.has(candidate.toLowerCase())) {
                return candidate;
            }
            counter += 1;
        }
    },

    async ensureDirectoryExistsById(directoryId) {
        const normalizedId = this.normalizePath(directoryId);
        if (!normalizedId) {
            return;
        }

        const parts = normalizedId.split("/").filter(Boolean);
        let currentPath = "";

        for (const segment of parts) {
            const nextId = currentPath ? `${currentPath}/${segment}` : segment;
            const parentPath = currentPath;
            const existing = await this.readFile(nextId);

            if (!existing) {
                await this.createDirectory(segment, parentPath);
            }

            currentPath = nextId;
        }
    },

    async listProjects() {
        const rootEntries = await this.listDirectory("", true);
        return rootEntries
            .filter((entry) => entry.type === "directory")
            .sort((a, b) => a.name.localeCompare(b.name));
    },

    async removeDirectory(id) {
        const db = await this.makeFileSystem();
        const transaction = db.transaction("files", "readwrite");
        const store = transaction.objectStore("files");
        const normalizedId = this.normalizePath(id);
        const allEntries = await this.requestToPromise(store.getAll());

        const entriesToRemove = allEntries.filter((entry) =>
            entry.id === normalizedId || entry.id.startsWith(`${normalizedId}/`)
        );

        await Promise.all(entriesToRemove.map((entry) => this.requestToPromise(store.delete(entry.id))));
        await this.transactionDone(transaction);
    },

    async renameDirectory(id, newName) {
        const db = await this.makeFileSystem();
        const transaction = db.transaction("files", "readwrite");
        const store = transaction.objectStore("files");
        const normalizedId = this.normalizePath(id);
        const directory = await this.requestToPromise(store.get(normalizedId));

        if (!directory || directory.type !== "directory") {
            throw new Error(`Directory \"${id}\" not found.`);
        }

        const newId = this.buildId(newName, directory.path || "");

        if (newId !== normalizedId) {
            await this.assertPathAvailable(store, newId, newName, directory.path || "");

            const allEntries = await this.requestToPromise(store.getAll());
            const affectedEntries = allEntries.filter((entry) =>
                entry.id === normalizedId || entry.id.startsWith(`${normalizedId}/`)
            );

            await Promise.all(affectedEntries.map(async (entry) => {
                const updated = { ...entry };
                const suffix = entry.id.slice(normalizedId.length);
                updated.id = `${newId}${suffix}`;

                if (entry.id !== normalizedId) {
                    updated.path = this.normalizePath((entry.path || "").replace(normalizedId, newId));
                }

                if (entry.id === normalizedId) {
                    updated.name = String(newName).trim();
                }

                await this.requestToPromise(store.delete(entry.id));
                await this.requestToPromise(store.put(updated));
            }));
        } else {
            directory.name = String(newName).trim();
            await this.requestToPromise(store.put(directory));
        }

        await this.transactionDone(transaction);
    },

    async exportDirectoryZip(id, fileName = null) {
        if (typeof JSZip === "undefined") {
            throw new Error("JSZip is not available.");
        }

        const db = await this.makeFileSystem();
        const transaction = db.transaction("files", "readonly");
        const store = transaction.objectStore("files");
        const normalizedId = this.normalizePath(id);
        const directory = await this.requestToPromise(store.get(normalizedId));

        if (!directory || directory.type !== "directory") {
            throw new Error(`Directory \"${id}\" not found.`);
        }

        const allEntries = await this.requestToPromise(store.getAll());
        const entriesToExport = allEntries.filter((entry) =>
            entry.id === normalizedId || entry.id.startsWith(`${normalizedId}/`)
        );

        const zip = new JSZip();
        const rootFolder = zip.folder(directory.name || normalizedId);

        for (const entry of entriesToExport) {
            if (entry.id === normalizedId) {
                continue;
            }

            const relativePath = entry.id.slice(normalizedId.length + 1);
            if (!relativePath) {
                continue;
            }

            if (entry.type === "directory") {
                rootFolder.folder(relativePath);
                continue;
            }

            rootFolder.file(relativePath, entry.content ?? "");
        }

        const blob = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = fileName || `${directory.name || normalizedId}.zip`;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        URL.revokeObjectURL(url);
    },

    async importDirectoryZip(zipFile, preferredProjectName = null) {
        if (typeof JSZip === "undefined") {
            throw new Error("JSZip is not available.");
        }

        const zip = await JSZip.loadAsync(zipFile);
        const entryNames = Object.keys(zip.files).filter(Boolean);
        const visibleEntries = entryNames.filter((name) => !name.startsWith("__MACOSX/"));

        if (visibleEntries.length === 0) {
            throw new Error("ZIP file is empty.");
        }

        const topLevelNames = new Set(
            visibleEntries.map((name) => name.split("/").filter(Boolean)[0]).filter(Boolean)
        );

        const zipBaseName = this.stripZipExtension(zipFile?.name || "Imported project") || "Imported project";
        const baseProjectName = String(preferredProjectName || (topLevelNames.size === 1 ? [...topLevelNames][0] : zipBaseName)).trim() || "Imported project";
        const uniqueProjectName = await this.getUniqueDirectoryName(baseProjectName);
        const projectDir = await this.createProject(uniqueProjectName);
        const stripRoot = topLevelNames.size === 1;
        const singleRootName = stripRoot ? [...topLevelNames][0] : "";

        for (const entryName of visibleEntries) {
            const zipEntry = zip.files[entryName];
            const rawSegments = entryName.split("/").filter(Boolean);

            if (rawSegments.length === 0) {
                continue;
            }

            const segments = stripRoot && rawSegments[0] === singleRootName ? rawSegments.slice(1) : rawSegments;
            if (segments.length === 0) {
                continue;
            }

            const leafName = segments[segments.length - 1];
            const parentSegments = segments.slice(0, -1);
            const targetParent = parentSegments.length > 0
                ? `${projectDir.id}/${parentSegments.map((segment) => this.normalizeSegment(segment)).join("/")}`
                : projectDir.id;

            await this.ensureDirectoryExistsById(targetParent);

            if (zipEntry.dir) {
                const directoryId = `${targetParent}/${this.normalizeSegment(leafName)}`;
                await this.ensureDirectoryExistsById(directoryId);
                continue;
            }

            const normalizedLeafName = String(leafName || "").trim();
            if (!normalizedLeafName) {
                continue;
            }

            const fileId = this.buildId(normalizedLeafName, targetParent);
            const existing = await this.readFile(fileId);
            const content = this.isTextLikeFile(normalizedLeafName)
                ? await zipEntry.async("text")
                : await zipEntry.async("blob");

            if (existing) {
                await this.writeFile(fileId, content);
            } else {
                await this.createFile(normalizedLeafName, content, targetParent);
            }
        }

        return projectDir;
    },

    // MARK: File operations
    async createFile(name, content = "", parentPath = "") {
        const db = await this.makeFileSystem();
        const transaction = db.transaction("files", "readwrite");
        const store = transaction.objectStore("files");
        const id = this.buildId(name, parentPath);
        const normalizedParentPath = this.normalizePath(parentPath);

        await this.assertPathAvailable(store, id, name, normalizedParentPath);

        const fileEntry = { id, name, type: "file", path: normalizedParentPath, content };
        await this.requestToPromise(store.add(fileEntry));
        await this.transactionDone(transaction);
        return fileEntry;
    },

    async removeFile(id) {
        const db = await this.makeFileSystem();
        const transaction = db.transaction("files", "readwrite");
        const store = transaction.objectStore("files");
        const normalizedId = this.normalizePath(id);
        await this.requestToPromise(store.delete(normalizedId));
        await this.transactionDone(transaction);
    },

    async renameFile(id, newName) {
        const db = await this.makeFileSystem();
        const transaction = db.transaction("files", "readwrite");
        const store = transaction.objectStore("files");
        const normalizedId = this.normalizePath(id);
        const fileEntry = await this.requestToPromise(store.get(normalizedId));

        if (!fileEntry || fileEntry.type !== "file") {
            throw new Error(`File \"${id}\" not found.`);
        }

        const newId = this.buildId(newName, fileEntry.path || "");

        if (newId !== normalizedId) {
            await this.assertPathAvailable(store, newId, newName, fileEntry.path || "");
            await this.requestToPromise(store.delete(normalizedId));
            await this.requestToPromise(
                store.put({
                    ...fileEntry,
                    id: newId,
                    name: String(newName).trim()
                })
            );
        } else {
            fileEntry.name = String(newName).trim();
            await this.requestToPromise(store.put(fileEntry));
        }

        await this.transactionDone(transaction);
    },

    async readFile(id) {
        const db = await this.makeFileSystem();
        const transaction = db.transaction("files", "readonly");
        const store = transaction.objectStore("files");
        const normalizedId = this.normalizePath(id);
        return this.requestToPromise(store.get(normalizedId));
    },

    async writeFile(id, content) {
        const db = await this.makeFileSystem();
        const transaction = db.transaction("files", "readwrite");
        const store = transaction.objectStore("files");
        const normalizedId = this.normalizePath(id);
        const fileEntry = await this.requestToPromise(store.get(normalizedId));

        if (!fileEntry || fileEntry.type !== "file") {
            throw new Error(`File \"${id}\" not found.`);
        }

        fileEntry.content = content;
        await this.requestToPromise(store.put(fileEntry));
        await this.transactionDone(transaction);
    },

    async exportFile(id, fileName) {
        // download file content
        const fileEntry = await this.readFile(id);
        if (!fileEntry || fileEntry.type !== "file") {
            throw new Error(`File \"${id}\" not found.`);
        }

        const blob = new Blob([fileEntry.content], { type: "text/markdown" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName || `${fileEntry.name}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    async importFile(file, parentPath = "") {
        const content = await file.text();
        return this.createFile(file.name, content, parentPath);
    },

    // MARK: Project operations
    async createProject(name, metadata = {}) {
        const projectDir = await this.createDirectory(name);
        await this.createDirectory("resources", projectDir.id);

        const projectMetadata = this.getDefaultProjectMetadata(metadata);
        await this.createFile(".project", JSON.stringify(projectMetadata, null, 2), projectDir.id);
        await this.createFile("New document.md", "", projectDir.id);
        return projectDir;
    },

    async getProjectMetadata(projectId) {
        const normalizedProjectId = this.normalizePath(projectId);
        const metadataFileId = this.buildId(".project", normalizedProjectId);
        const metadataEntry = await this.readFile(metadataFileId);

        if (!metadataEntry || metadataEntry.type !== "file") {
            const defaults = this.getDefaultProjectMetadata();
            await this.createFile(".project", JSON.stringify(defaults, null, 2), normalizedProjectId);
            return defaults;
        }

        let parsed = {};
        try {
            parsed = JSON.parse(String(metadataEntry.content || "{}"));
        } catch (error) {
            console.warn("Invalid .project metadata. Using defaults.", error);
        }

        const normalized = this.getDefaultProjectMetadata(parsed);

        if (JSON.stringify(parsed) !== JSON.stringify(normalized)) {
            await this.writeFile(metadataFileId, JSON.stringify(normalized, null, 2));
        }

        return normalized;
    },

    async updateProjectMetadata(projectId, metadataPatch = {}) {
        const normalizedProjectId = this.normalizePath(projectId);
        const metadataFileId = this.buildId(".project", normalizedProjectId);
        const currentMetadata = await this.getProjectMetadata(normalizedProjectId);
        const updatedMetadata = this.getDefaultProjectMetadata({ ...currentMetadata, ...metadataPatch });
        await this.writeFile(metadataFileId, JSON.stringify(updatedMetadata, null, 2));
        return updatedMetadata;
    },

    async duplicateProject(projectId, preferredName = null) {
        const normalizedProjectId = this.normalizePath(projectId);
        const sourceProject = await this.readFile(normalizedProjectId);

        if (!sourceProject || sourceProject.type !== "directory") {
            throw new Error(`Project \"${projectId}\" not found.`);
        }

        const targetName = await this.getUniqueDirectoryName(
            preferredName || `${sourceProject.name} Copy`,
            ""
        );
        const duplicatedProject = await this.createDirectory(targetName, "");

        const db = await this.makeFileSystem();
        const transaction = db.transaction("files", "readwrite");
        const store = transaction.objectStore("files");
        const allEntries = await this.requestToPromise(store.getAll());
        const entriesToClone = allEntries
            .filter((entry) => entry.id.startsWith(`${normalizedProjectId}/`))
            .sort((a, b) => a.id.localeCompare(b.id));

        for (const entry of entriesToClone) {
            const suffix = entry.id.slice(normalizedProjectId.length + 1);
            const targetId = `${duplicatedProject.id}/${suffix}`;
            const clonedEntry = {
                ...entry,
                id: targetId,
                path: targetId.includes("/") ? targetId.split("/").slice(0, -1).join("/") : ""
            };

            await this.requestToPromise(store.put(clonedEntry));
        }

        await this.transactionDone(transaction);
        return duplicatedProject;
    },

    // MARK: Miscellaneous operations
    getTitleFromMarkdownContent(content = "") {
        // Extracts a title from markdown content string using three methods:
        // 1. Search for YAML front matter "title" property
        // 2. Search for markdown headers (# ## ### etc)
        // 3. Use the first line of content as fallback
        // The returned value cannot contain illegal characters like `/`
        // If none of these methods yield a title, returns "New document"

        const sanitizeTitle = (title) => {
            title = title.replace(/\//g, ""); // remove `/` to avoid issues with file paths
            title = title.replace(/\\/g, ""); // remove `\` to avoid issues with windows file paths
            
            
            title = title.replace(/\./g, ""); // remove `.` to avoid issues with file extensions and hidden files

            title = title.replace(/</g, "&lt;").replace(/>/g, "&gt;"); // substitute `<` and `>` characters with entities to avoid HTML injection

            title = title.replace(/"/g, "&quot;").replace(/'/g, "&#39;"); // substitute `"` and `'` characters with entities to allow them in titles without breaking HTML
            
            // If the title ends up empty after sanitization, return "New document"
            if (!title.trim()) {
                return "New document";
            }

            return title;
        };

        const lines = String(content || "").split("\n");

        // Check for YAML front matter title
        if (lines[0].trim() === "---") {
            for (let i = 1; i < lines.length; i++) {
                if (lines[i].trim() === "---") {
                    break;
                }
                const match = lines[i].match(/^title:\s*(.+)$/);
                if (match) {
                    return sanitizeTitle(match[1].trim()).slice(0, 64);
                }
            }
        }

        // Check for markdown headers
        for (const line of lines) {
            const headerMatch = line.match(/^(#{1,6})\s+(.*)$/);
            if (headerMatch) {
                const rawTitle = headerMatch[2].trim();
                const title = sanitizeTitle(rawTitle).slice(0, 64);
                if (title) {
                    return title;
                }
                return "New document";
            }
        }

        // Fallback to first line
        return sanitizeTitle(lines[0]).trim().slice(0, 64) || "New document";
    },

    async getMarkdownTitle(id) {
        // Gets the title for a markdown file, checking for duplicates in the same directory
        // Uses getTitleFromMarkdownContent to extract the title from the file content
        // If the title already exists in the directory, returns "Title (n)" where n is the lowest number that makes the title unique

        const fileEntry = await this.readFile(id);
        if (!fileEntry || fileEntry.type !== "file") {
            throw new Error(`File \"${id}\" not found.`);
        }

        const content = fileEntry.content || "";
        let title = this.getTitleFromMarkdownContent(content);

        // Check if title already exists in the same directory
        if (title === "New document" || title.startsWith("New document (")) {
            const parentPath = fileEntry.path || "";
            const siblings = await this.listDirectory(parentPath);
            const existingTitles = new Set(siblings.map(s => s.name));

            let counter = 1;
            let uniqueTitle = title;
            while (existingTitles.has(uniqueTitle)) {
                uniqueTitle = `New document (${counter})`;
                counter++;
            }
            return uniqueTitle;
        }

        return title;
    }
}

const fileExporters = {};

const fileExporter = {
    add: function(mime, title, exec) {
        if (typeof exec !== "function") {
            throw new Error("Exporter exec must be a function.");
        }
        fileExporters[mime] = {
            title,
            exec
        };
    },
    get: function(mime) {
        return fileExporters[mime] || null;
    },
    list: function() {
        return Object.keys(fileExporters);
    },
    entries: function() {
        return Object.entries(fileExporters);
    },
    export: function(mime, options = {}) {
        // executes the exporter 'exec' function for the given mime type, which should return a blob or a URL to download
        const exporter = this.get(mime);
        if (!exporter) {
            throw new Error(`No exporter found for MIME type: ${mime}`);
        }
        return exporter.exec(options);
    }
}

// default exporters
fileExporter.add("text/markdown", "Markdown (.md)", async (options) => {
    const title = options.title || "Untitled";
    const content = editor.getValue();
    const blob = new Blob([content || ""], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return { url, fileName: `${title}.md` };
});

fileExporter.add("text/html", "HTML (.html)", async (options) => {
    const title = options.title || "Untitled";
    const text = editor.getValue();
    const documentContent = converter.makeHtml(text);
    const documentMeta = converter.getMetadata();
    const content = `<!-- Made with Cohesion - https://flarom.github.io/cohesion -->
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta name="generator" content="Cohesion">
                ${documentMeta.keywords ? `<meta name="keywords" content="${documentMeta.keywords}">` : ""}
                ${documentMeta.tags ? `<meta name="keywords" content="${documentMeta.tags}">` : ""}
                ${documentMeta.author ? `<meta name="author" content="${documentMeta.author}">` : ""}
                ${documentMeta.description ? `<meta name="description" content="${documentMeta.description}">` : ""}
                <title>`.trim().replace(/\s+/g, " ") + title + `</title>
                <style>
                    * {
                        max-width: 21cm;
                        margin: 0 auto;
                        padding: 0;
                        box-sizing: border-box;
                    }

                    body {
                        font-family: system-ui, -apple-system, sans-serif;
                        line-height: 1.6;
                        font-size: 16px;
                        color: #222;
                        background: #fff;
                        max-width: 720px;
                        margin: 40px auto;
                        padding: 0 16px;
                    }

                    h1, h2, h3, h4, h5, h6 {
                        line-height: 1.25;
                        margin-top: 1.5em;
                        margin-bottom: 0.5em;
                        font-weight: 600;
                    }

                    hr {
                        border: none;
                        border-top: 1px solid #666;
                        margin: 2em 0;
                    }

                    p {
                        margin: 1em 0;
                    }

                    a {
                        color: #0066cc;
                        text-decoration: none;
                    }

                    a:hover {
                        text-decoration: underline;
                    }

                    ul, ol {
                        margin: 1em 0 1em 1.5em;
                    }

                    li {
                        margin: 0.25em 0;
                    }

                    code {
                        font-size: 14px;
                        font-family: monospace;
                        background: #f4f4f4;
                        padding: 2px 4px;
                        border-radius: 4px;
                    }

                    pre {
                        background: #f4f4f4;
                        padding: 12px;
                        overflow-x: auto;
                        border-radius: 6px;
                    }

                    blockquote {
                        border-left: 4px solid #ddd;
                        padding-left: 1em;
                        margin: 1em 0;
                        color: #555;
                    }

                    img {
                        max-width: 100%;
                        height: auto;
                        display: block;
                        margin: 1em 0;
                    }

                    table {
                        border-collapse: collapse;
                        margin: 1em 0;
                        width: 100%;
                    }

                    table, th, td {
                        border: 1px solid #ddd;
                    }
                </style>
            </head>
            <body>
                `.trim().replace(/\s+/g, " ") + documentContent + `
            </body>
            </html>`.trim().replace(/\s+/g, " ");
    const blob = new Blob([content || ""], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return { url, fileName: `${title}.html` };
});

fileExporter.add("application/pdf", "PDF (.pdf)", async (options) => {
    const html2PdfBundleUrl = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";

    const ensureHtml2PdfLoaded = (() => {
        let html2PdfLoadPromise = null;

        return () => {
            if (typeof html2pdf !== "undefined") {
                return Promise.resolve(html2pdf);
            }

            if (!html2PdfLoadPromise) {
                html2PdfLoadPromise = new Promise((resolve, reject) => {
                    const existingScript = document.querySelector(`script[src="${html2PdfBundleUrl}"]`);

                    if (existingScript) {
                        existingScript.addEventListener("load", () => resolve(window.html2pdf), { once: true });
                        existingScript.addEventListener("error", () => reject(new Error("Failed to load html2pdf.")), { once: true });
                        return;
                    }

                    const script = document.createElement("script");
                    script.src = html2PdfBundleUrl;
                    script.async = true;
                    script.onload = () => resolve(window.html2pdf);
                    script.onerror = () => reject(new Error("Failed to load html2pdf."));
                    document.head.appendChild(script);
                });
            }

            return html2PdfLoadPromise;
        };
    })();

    const html2Pdf = await ensureHtml2PdfLoaded();

    const title = options.title || "Untitled";
    const text = editor.getValue();
    const documentContent = converter.makeHtml(text);
    const documentMeta = converter.getMetadata();
    const htmlContent = `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta name="generator" content="Cohesion">
                ${documentMeta.keywords ? `<meta name="keywords" content="${documentMeta.keywords}">` : ""}
                ${documentMeta.tags ? `<meta name="keywords" content="${documentMeta.tags}">` : ""}
                ${documentMeta.author ? `<meta name="author" content="${documentMeta.author}">` : ""}
                ${documentMeta.description ? `<meta name="description" content="${documentMeta.description}">` : ""}
                <title>${title}</title>
                <style>
                    html, body {
                        width: 100%;
                        margin: 0;
                        padding: 0;
                    }

                    body {
                        width: 100%;
                        color: #000;
                        font-family: system-ui, -apple-system, sans-serif;
                        line-height: 1.6;
                        font-size: 16px;
                    }

                    .pdf-document {
                        width: 100%;
                        box-sizing: border-box;
                        padding: 0;
                    }

                    p, h1, h2, h3, h4, h5, h6, blockquote, pre, table, ul, ol, img, figure {
                        break-inside: avoid;
                        page-break-inside: avoid;
                    }

                    p, blockquote, ul, ol, pre, table, figure {
                        orphans: 3;
                        widows: 3;
                    }

                    p {
                        margin: 1em 0;
                        overflow-wrap: anywhere;
                    }

                    h1, h2, h3, h4, h5, h6 {
                        line-height: 1.25;
                        margin: 1.5em 0 0.5em;
                        page-break-after: avoid;
                    }

                    img {
                        max-width: 100%;
                    }
                    table {
                        border-collapse: collapse;
                    }
                    table, th, td {
                        border: 1px solid black;
                    }
                    th, td {
                        padding: 5px;
                    }
                    th {
                        font-weight: bold;
                    }
                </style>
            </head>
            <body>
                ${documentContent}
            </body>
            </html>`;

    const optionsConfig = {
        margin: 0.5,
        filename: `${title}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        pagebreak: {
            mode: ["css", "legacy"],
            avoid: ["p", "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "pre", "table", "ul", "ol", "img", "figure"]
        },
        jsPDF: { unit: "in", format: "letter", orientation: "portrait" }
    };

    await html2Pdf().set(optionsConfig).from(htmlContent).save();

    return { fileName: `${title}.pdf` };
});

fileExporter.add("sharefile", "Share file", async (options) => {
    const title = options.title || "Untitled";
    const content = editor.getValue();

    toast.show('Please wait...', 'satellite_alt');

    try {
        const id = await shareFile(content);
        const link = `https://flarom.github.io/cohesion/share?f=${id}`;

        console.log(link);

        const qrUrl = createQRCode(link, 240);
        console.log(qrUrl);

        const expireTimestmp = new Date(Date.now() + 2 * 60 * 60 * 1000);
        const hh = expireTimestmp.getHours().toString().padStart(2, "0");
        const mm = expireTimestmp.getMinutes().toString().padStart(2, "0");
        const expireTime = `${hh}:${mm}`;

        const html = `
            <!DOCTYPE html>
            <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Save file</title>
                    <meta name="dialog-prefered-width" content="500">
                </head>
                <body>
                    <main class="padding">
                        <section>
                            <div style="display:flex;align-items:center;padding:10px;justify-content:center;">
                                <img src="${qrUrl}" alt="QR Code" style="width:240px; height:240px; padding:10px; background-color:#ffffff; border-radius:10px; box-shadow: var(--shadow)" />
                            </div>
                        </section>
                        <section>
                            <div class="row">
                                <input id="qr-link-field" readonly='true' type='text' style='text-align:center;margin:0;width:100%' value='${link}'/>
                                <button id="qr-copy-btn" translate='no' class='icon-button'>content_copy</button>
                            </div>
                            <div class="row" style="justify-content:center;">
                                <span style="font-size:tiny">Link is valid until ${expireTime}</span>
                            </div>
                        </section>
                    </main>
                </body>
                <script>
                    setTimeout(() => {
                        const input = document.getElementById("qr-link-field");
                        const btn = document.getElementById("qr-copy-btn");

                        if (btn && input) {
                            btn.addEventListener("click", () => {
                                toast.show("Copied to clipboard", "check");
                                input.select();
                                input.setSelectionRange(0, 99999);
                                navigator.clipboard.writeText(input.value);
                            });
                        }

                        input.select();
                        input.setSelectionRange(0, 99999);
                        navigator.clipboard.writeText(input.value);
                        toast.show("Link copied to clipboard", "check");
                    }, 50);
                </script>
            </html>
        `;

        await showDialog(html);
    }
    catch (err) {
        console.error("QR share failed:", err);
        toast.show("Failed to share this file", "error");
    }
});

async function shareFile(text) {
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
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}&color=2e3436&bgcolor=ffffff`;
    return url;
}