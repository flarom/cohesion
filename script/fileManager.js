/*
Cohesion File Manager
=====================

API for managing markdown files in the sidebar
*/

const fileManager = {
    currentProjectId: null,
    currentProjectMetadata: null,
    currentFileId: null,
    files: [],
    projects: [],

    getRecentFileIds() {
        if (!this.currentProjectId) {
            return [];
        }

        const projectKey = `lastOpenedFileIds:${this.currentProjectId}`;
        const storedValue = Settings.getSetting("lastOpenedFileIds", null);
        const projectStoredValue = Settings.getSetting(projectKey, null);

        if (projectStoredValue) {
            try {
                const parsed = JSON.parse(projectStoredValue);
                if (Array.isArray(parsed)) {
                    return parsed
                        .filter((id) => typeof id === "string" && id.length > 0)
                        .filter((id, index, arr) => arr.indexOf(id) === index)
                        .slice(0, 5);
                }
            } catch (error) {
                console.warn("Could not parse project lastOpenedFileIds setting:", error);
            }
        }

        if (storedValue) {
            try {
                const parsed = JSON.parse(storedValue);
                if (Array.isArray(parsed)) {
                    return parsed
                        .filter((id) => typeof id === "string" && id.length > 0)
                        .filter((id, index, arr) => arr.indexOf(id) === index)
                        .slice(0, 5)
                        .filter((id) => id.startsWith(`${this.currentProjectId}/`));
                }
            } catch (error) {
                console.warn("Could not parse lastOpenedFileIds setting:", error);
            }
        }

        // Backward compatibility with the previous single value setting.
        const legacyValue = Settings.getSetting("lastOpenedFileId", null);
        if (typeof legacyValue === "string" && legacyValue.length > 0) {
            return [legacyValue];
        }

        return [];
    },

    updateRecentFileIds(fileId) {
        if (!fileId) return;

        const updatedIds = [fileId, ...this.getRecentFileIds().filter((id) => id !== fileId)].slice(0, 5);
        Settings.setSetting("lastOpenedFileIds", JSON.stringify(updatedIds));

        if (this.currentProjectId) {
            Settings.setSetting(`lastOpenedFileIds:${this.currentProjectId}`, JSON.stringify(updatedIds));
        }
    },

    async initializeFileManager() {
        await this.loadProjects();

        const preferredProjectId = Settings.getSetting("activeProjectId", null);
        if (typeof preferredProjectId === "string" && preferredProjectId.length > 0) {
            const exists = this.projects.some((project) => project.id === preferredProjectId);
            if (exists) {
                await this.openProject(preferredProjectId);
            }
        }

        //this.renderSidebar();
    },

    async loadProjects() {
        this.projects = await file.listProjects();
    },

    async openProject(projectId) {
        if (!projectId) {
            return;
        }

        await this.autosaveCurrentFile();
        this.currentProjectId = file.normalizePath(projectId);
        this.currentProjectMetadata = await file.getProjectMetadata(this.currentProjectId);
        Settings.setSetting("activeProjectId", this.currentProjectId);

        await this.loadFiles();

        if (this.files.length === 0) {
            const newFile = await this.createUniqueMarkdownFile("");
            this.currentFileId = newFile.id;
            await this.loadFiles();
        } else {
            const recentFileIds = this.getRecentFileIds();
            this.currentFileId = recentFileIds.find((id) => this.files.some((entry) => entry.id === id)) || this.files[0].id;
        }

        const fileEntry = this.currentFileId ? await file.readFile(this.currentFileId) : null;
        editor.setValue(fileEntry?.content || "");
        this.updateRecentFileIds(this.currentFileId);
        await updateTitle();
        this.renderSidebar();

        editor.focus();
    },

    async closeProject() {
        await this.autosaveCurrentFile();
        this.currentProjectId = null;
        this.currentProjectMetadata = null;
        this.currentFileId = null;
        this.files = [];
        editor.setValue("");
        await updateTitle();
        this.renderSidebar();
    },

    async createUniqueMarkdownFile(content = "") {
        if (!this.currentProjectId) {
            throw new Error("No active project.");
        }

        const uniqueName = await this.getUniqueMarkdownName("New document");
        return file.createFile(uniqueName, content, this.currentProjectId);
    },

    async getUniqueMarkdownName(baseTitle, excludeId = null) {
        if (!this.currentProjectId) {
            throw new Error("No active project.");
        }

        const projectEntries = await file.listDirectory(this.currentProjectId);
        const normalizedBase = String(baseTitle || "New document").trim() || "New document";
        const baseName = `${normalizedBase}.md`;

        const usedNames = new Set(
            projectEntries
                .filter((entry) => entry.type === "file" && entry.name.endsWith(".md") && entry.id !== excludeId)
                .map((entry) => entry.name.toLowerCase())
        );

        if (!usedNames.has(baseName.toLowerCase())) {
            return baseName;
        }

        let counter = 1;
        while (true) {
            const candidate = `${normalizedBase} (${counter}).md`;
            if (!usedNames.has(candidate.toLowerCase())) {
                return candidate;
            }
            counter += 1;
        }
    },

    async loadFiles() {
        if (!this.currentProjectId) {
            this.files = [];
            return;
        }

        this.files = await file.listDirectory(this.currentProjectId);
        this.files = this.files.filter((entry) =>
            entry.type === "file" &&
            entry.name.endsWith(".md") &&
            entry.name !== ".project"
        );
    },

    async renderSidebar() {
        const sidebar = document.getElementById("sidebar");
        sidebar.innerHTML = "";

        if (!this.currentProjectId) {
            const emptyState = document.createElement("div");
            emptyState.className = "padding";
            sidebar.appendChild(emptyState);
            return;
        }

        const fileList = document.createElement("div");
        fileList.className = "file-list";
        
        // Render files
        for (const fileEntry of this.files) {
            const title = await file.getMarkdownTitle(fileEntry.id);
            const fileItem = document.createElement("div");
            fileItem.className = "file-item";
            if (fileEntry.id === this.currentFileId) {
                fileItem.classList.add("active");
            }

            fileItem.innerHTML = `
            <button class="file-button" data-file-id="${fileEntry.id}">
                <span class="file-name">${title}</span>
            </button>
            <div class="dropdown">
                <button class="icon-button" translate="no" onmousedown="toggleDropdown('file-dropdown-${fileEntry.id}')">more_horiz</button>
                <div class="dropdown-content menu" id="file-dropdown-${fileEntry.id}">
                    <button class="text-button" data-duplicate-id="${fileEntry.id} " data-locale="main.sidebar.file-menu.duplicate">Duplicate</button>
                    <button class="text-button" data-export-id="${fileEntry.id}" data-locale="main.sidebar.file-menu.save">Save</button>
                    <hr>
                    <button class="text-button file-delete-btn danger" data-file-id="${fileEntry.id}" data-locale="main.sidebar.file-menu.delete">Delete</button>
                </div>
            </div>`;

            const fileButton = fileItem.querySelector(".file-button");
            fileButton.addEventListener("click", () => this.selectFile(fileEntry.id));
            fileButton.addEventListener("contextmenu", (e) => {
                e.preventDefault();
                toggleDropdown(`file-dropdown-${fileEntry.id}`);
            });

            const duplicateBtn = fileItem.querySelector("[data-duplicate-id]");
            translateElement(duplicateBtn);
            duplicateBtn.addEventListener("click", async (e) => {
                e.stopPropagation();
                const originalContent = await file.readFile(fileEntry.id);
                const newFile = await this.createUniqueMarkdownFile(originalContent.content);
                await this.selectFile(newFile.id);
                await this.loadFiles();
                this.renderSidebar();
                Toast.show("File duplicated", "check");
            });

            const exportBtn = fileItem.querySelector("[data-export-id]");
            translateElement(exportBtn);
            exportBtn.addEventListener("click", async (e) => {
                e.stopPropagation();
                saveCurrentFile();
            });

            const deleteBtn = fileItem.querySelector(".file-delete-btn");
            translateElement(deleteBtn);
            deleteBtn.addEventListener("click", async (e) => {
                e.stopPropagation();
                await this.deleteFile(fileEntry.id);
                Toast.show("File deleted", "delete");
            });

            fileList.appendChild(fileItem);
        }

        sidebar.appendChild(fileList);
    },

    async selectFile(fileId) {
        if (!this.currentProjectId) {
            return;
        }

        await this.autosaveCurrentFile();
        this.currentFileId = fileId;

        const fileEntry = await file.readFile(fileId);
        if (fileEntry) {
            editor.setValue(fileEntry.content);
        }

        await updateTitle();

        this.updateRecentFileIds(fileId);

        this.renderSidebar();
    },

    async createNewFile() {
        if (!this.currentProjectId) {
            Toast.show("Open a project first", "warning");
            return;
        }

        const newFile = await this.createUniqueMarkdownFile("");
        this.currentFileId = newFile.id;
        await this.loadFiles();
        this.renderSidebar();
        editor.setValue("");
        editor.focus();

        if (mode === "b" && !splitEnabled) {
            mode = "a";
            render();
        }
    },

    async deleteFile(fileId) {
        if (!this.currentProjectId) {
            return;
        }

        if (this.files.length === 1) {
            Toast.show("Cannot delete the last file", "warning");
            return;
        }

        await file.removeFile(fileId);

        // If deleted file was selected, select another one
        if (this.currentFileId === fileId) {
            const remainingFiles = this.files.filter(f => f.id !== fileId);
            this.currentFileId = remainingFiles[0]?.id || null;

            if (this.currentFileId) {
                const fileEntry = await file.readFile(this.currentFileId);
                if (fileEntry) {
                    editor.setValue(fileEntry.content);
                    this.updateRecentFileIds(this.currentFileId);
                }
            }
        }

        // Reload and check if project is empty
        await this.loadFiles();

        // Ensure project is not empty
        if (this.files.length === 0) {
            await this.createUniqueMarkdownFile("");
            await this.loadFiles();
            if (!this.currentFileId) {
                this.currentFileId = this.files[0]?.id;
                const fileEntry = await file.readFile(this.currentFileId);
                if (fileEntry) {
                    editor.setValue(fileEntry.content);
                }
            }
        }

        this.renderSidebar();
    },

    escapeHtml(text) {
        const div = document.createElement("div");
        div.textContent = text;
        return div.innerHTML;
    },

    async autosaveCurrentFile() {
        if (!this.currentProjectId || !this.currentFileId) return;

        const content = editor.getValue();
        
        const fileEntry = await file.readFile(this.currentFileId);
        
        if (fileEntry && fileEntry.type === "file") {
            await file.writeFile(this.currentFileId, content);
            
            // Get the new title from the file content
            const newTitle = await file.getMarkdownTitle(this.currentFileId);
            const newFileName = await this.getUniqueMarkdownName(newTitle, this.currentFileId);
            
            // If title changed, rename the file
            if (fileEntry.name !== newFileName) {
                try {
                    await file.renameFile(this.currentFileId, newFileName);
                    
                    this.currentFileId = file.buildId(newFileName, fileEntry.path || "");
                    await this.loadFiles();
                    this.renderSidebar();
                    
                    this.updateRecentFileIds(this.currentFileId);
                } catch (error) {
                    console.error("Error renaming file:", error);
                }
            } else {
                // Update display name in sidebar without renaming
                const fileButton = document.querySelector(`[data-file-id="${this.currentFileId}"] .file-name`);
                if (fileButton) {
                    fileButton.textContent = newTitle;
                }
            }
        }
    },

    async openResourcesDialog() {
        if (!this.currentProjectId) {
            Toast.show("Open a project first", "warning");
            return;
        }

        await showDialogFile("dialog/resources.html", {
            projectId: this.currentProjectId
        });
    }
};
