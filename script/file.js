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
    async getMarkdownTitle(id) {
        // There are three ways to get a title for a markdown file:
        // - the first line of the content, hard cutting at 64 characters so it doesn't get too long
        // - searching for lines that start with "# " or "## " and so on, which are common markdown title formats
        //   preferably the first one that appears in the content, and with the least amount of "#" characters, so we get the most relevant title
        // - searching for a "title" property in the file's metadata, considering markdown files can have metadata in the form of YAML front matter
        //   (the part between "---" or "««« and »»»" at the beginning of the file), and if a "title" property is found there, we use it as the title
        // The returned value can not contain `/` characters
        // If none of these methods yield a title, we fallback to using "New document" as the title.
        // When returning a title, we also make sure to check if theres already a file with that name in the same directory, and if so, we return "Title (n)" where n is the lowest number that makes the title unique in that directory.

        const fileEntry = await this.readFile(id);
        if (!fileEntry || fileEntry.type !== "file") {
            throw new Error(`File \"${id}\" not found.`);
        }

        const content = fileEntry.content || "";
        const lines = content.split("\n");

        // Check for YAML front matter title
        if (lines[0].trim() === "---") {
            for (let i = 1; i < lines.length; i++) {
                if (lines[i].trim() === "---") {
                    break;
                }
                const match = lines[i].match(/^title:\s*(.+)$/);
                if (match) {
                    return match[1].trim().slice(0, 64);
                }
            }
        }

        // Check for markdown headers
        for (const line of lines) {
            const headerMatch = line.match(/^(#{1,6})\s+(.*)$/);
            if (headerMatch) {
                const title = headerMatch[2].trim().slice(0, 64);
                if (title) {
                    return title;
                }
                return "New document";
            }
        }

        // Remove any `/` characters from the first line to avoid issues with file paths
        lines[0] = lines[0].replace(/\//g, "");
        // Substitute `<` and `>` characters with entities to avoid potential HTML injection issues in titles
        lines[0] = lines[0].replace(/</g, "&lt;").replace(/>/g, "&gt;");
        // Substitute `"` and `'` characters with entities to allow them in titles without breaking HTML rendering and avoid potential security issues
        lines[0] = lines[0].replace(/"/g, "&quot;").replace(/'/g, "&#39;");

        // Fallback to first line
        let title = lines[0].trim().slice(0, 64) || "New document";

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
