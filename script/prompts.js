function isMobile() {
    return window.innerWidth <= 800;
}

function isPc() {
    return !isMobile();
}

function toggleDropdown(menuId) {
    const menu = document.getElementById(menuId);
    const dropdown = menu.parentElement;

    document.querySelectorAll('.dropdown').forEach(d => {
        if (d !== dropdown) {
            d.classList.remove('show');
        }
    });

    dropdown.classList.toggle('show');

    if (dropdown.classList.contains('show')) {
        const buttons = menu.querySelectorAll('button');
        if (buttons.length > 0) {
            setTimeout(() => buttons[0].focus(), 0);
        }

        menu.addEventListener('keydown', handleArrowNavigation);
        menu.addEventListener('keydown', handleActivation);
    } else {
        menu.removeEventListener('keydown', handleArrowNavigation);
        menu.removeEventListener('keydown', handleActivation);
    }
}

function handleArrowNavigation(e) {
    const buttons = Array.from(e.currentTarget.querySelectorAll('button'))
        .filter(btn => btn.offsetParent !== null);
    const currentIndex = buttons.findIndex(btn => btn === document.activeElement);

    if (['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft'].includes(e.key)) {
        e.preventDefault();
        let nextIndex;

        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
            nextIndex = (currentIndex + 1) % buttons.length;
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
            nextIndex = (currentIndex - 1 + buttons.length) % buttons.length;
        }

        buttons[nextIndex]?.focus();
    }
}

function handleActivation(e) {
    if (e.key === 'Enter' || e.key === ' ') {
        const active = document.activeElement;
        if (active && active.tagName === 'BUTTON') {
            e.preventDefault();

            active.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
            active.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        }
    }
}

function toggleSidebar(sidebarId) {
    const sidebar = document.getElementById(sidebarId);

    // document.querySelectorAll(".sidebar").forEach((s) => {
    //     if (s !== sidebar) {
    //         s.classList.remove("show");
    //     }
    // });

    sidebar.classList.toggle("show");

    if (sidebar.classList.contains("show")) {
        const buttons = sidebar.querySelectorAll(".file");
        if (buttons.length > 0) {
            buttons[0].focus();
        }

        sidebar.addEventListener("keydown", handleArrowNavigation);
    } else {
        sidebar.removeEventListener("keydown", handleArrowNavigation);
    }

    localStorage.setItem(`last${sidebarId}SidebarState`, sidebar.classList.contains("show"));
}

function showToast(message, icon = "") {
    const snackbar = document.createElement("div");
    snackbar.className = "toast show";
    snackbar.innerHTML = `<span class='icon' style='font-size:x-large'>${icon}</span><p>${message}</p>`;

    document.body.appendChild(snackbar);

    setTimeout(() => {
        snackbar.classList.remove("show");
        setTimeout(() => {
            snackbar.remove();
        }, 400);
    }, 3000);
}

function hideAllMenus() {
    document.querySelectorAll(".dropdown").forEach((dropdown) => {
        dropdown.classList.remove("show");
    });
}

function hideAllSidebars() {
    document.querySelectorAll(".sidebar").forEach((sidebar) => {
        sidebar.classList.remove("show");
    });
}
function closeAllDialogs() {
    document.querySelectorAll(".prompt-overlay").forEach((el) => el.remove());
}

function fadeOutAllDialogs() {
    document.querySelectorAll(".prompt-overlay").forEach((el) => {
        el.classList.add("fade-out");
        setTimeout(() => el.remove(), 500);
    });
}

function promptString(title, defaultText = "", warn = false) {
    return new Promise((resolve) => {
        // overlay
        const overlay = document.createElement("div");
        overlay.className = "prompt-overlay";

        // dialog
        const dialog = document.createElement("div");
        dialog.className = "prompt-dialog";
        dialog.style.padding = "20px";
        if (warn) dialog.classList.add("warn");

        // title
        const titleElement = document.createElement("p");
        titleElement.textContent = title;
        titleElement.className = "prompt-title";
        dialog.appendChild(titleElement);

        // field
        const input = document.createElement("input");
        input.type = "text";
        input.value = defaultText ? defaultText : "";
        dialog.appendChild(input);

        // buttons
        const buttonContainer = document.createElement("div");
        buttonContainer.className = "prompt-buttons";

        const cancelButton = document.createElement("button");
        cancelButton.textContent = "Cancel";
        cancelButton.className = "prompt-button cancel";

        const submitButton = document.createElement("button");
        submitButton.textContent = "Ok";
        submitButton.className = "prompt-button submit";

        buttonContainer.appendChild(cancelButton);
        buttonContainer.appendChild(submitButton);
        dialog.appendChild(buttonContainer);

        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        input.focus();
        input.selectionStart = 0;
        input.selectionEnd = input.value.length;

        function closePrompt(result) {
            document.body.removeChild(overlay);
            resolve(result);
        }

        cancelButton.addEventListener("click", () => closePrompt(null));
        submitButton.addEventListener("click", () => closePrompt(input.value));

        overlay.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                closePrompt(input.value);
            } else if (event.key === "Escape") {
                closePrompt(null);
            }
        });
    });
}

function promptMessage(htmlContent, showCloseButton = true, useBigDialog = false, toolbarLeft = "", toolbarCenter = "", toolbarRight = "") {
    return new Promise((resolve) => {
        // overlay
        const overlay = document.createElement("div");
        overlay.className = "prompt-overlay";
        overlay.tabIndex = -1;

        // dialog
        const dialog = document.createElement("div");
        dialog.className = useBigDialog ? "prompt-big-dialog" : "prompt-dialog";

        if (!useBigDialog) {
            dialog.style.width = "100%";
            dialog.style.maxWidth = "500px";
        }

        const toolbar = document.createElement("div");
        toolbar.className = "toolbar";

        const leftDiv = document.createElement("div");
        leftDiv.className = "toolbar-left";
        leftDiv.innerHTML = toolbarLeft || "";

        const centerDiv = document.createElement("div");
        centerDiv.className = "toolbar-center";
        centerDiv.innerHTML = toolbarCenter || "";

        const rightDiv = document.createElement("div");
        rightDiv.className = "toolbar-right";
        rightDiv.innerHTML = toolbarRight || "";

        let closeButton = null;
        if (showCloseButton) {
            closeButton = document.createElement("button");
            closeButton.textContent = "close";
            closeButton.className = "icon-button dialog-window-control";
            closeButton.setAttribute("translate", "no");
        }

        toolbar.appendChild(leftDiv);
        toolbar.appendChild(centerDiv);
        toolbar.appendChild(rightDiv);

        if (showCloseButton) {
            rightDiv.appendChild(closeButton);
        }

        const content = document.createElement("div");
        content.className = "prompt-content";
        content.innerHTML = htmlContent || "";

        const scripts = content.querySelectorAll("script");
        scripts.forEach((oldScript) => {
            const newScript = document.createElement("script");
            Array.from(oldScript.attributes).forEach((attr) =>
                newScript.setAttribute(attr.name, attr.value)
            );
            if (oldScript.src) {
                newScript.src = oldScript.src;
            } else {
                newScript.textContent = oldScript.textContent;
            }
            oldScript.replaceWith(newScript);
        });

        dialog.appendChild(toolbar);
        dialog.appendChild(content);
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        function cleanup() {
            try { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); } catch (e) { }
            overlay.removeEventListener("keydown", onKeyDown);
            if (closeButton) closeButton.removeEventListener("click", onCloseClick);
        }

        function onCloseClick() {
            cleanup();
            resolve();
        }

        function onKeyDown(event) {
            if (event.key === "Escape" || event.key === "Enter") {
                cleanup();
                resolve();
            }
        }

        if (closeButton) {
            closeButton.addEventListener("click", onCloseClick);
            closeButton.focus();
        } else {
            overlay.focus();
        }

        overlay.addEventListener("keydown", onKeyDown);
    });
}

function showMessageFromFile(filePath, showCloseButton = true, useBigDialog = false, showAnimation = true, showBg = true, width = 400, toolbarLeft = "", toolbarCenter = "", toolbarRight = "") {
    fetch(filePath).then((response) => {
        if (!response.ok) {
            throw new Error(`Failed loading file: ${response.statusText}`);
        }
        return response.text();
    }).then((htmlContent) => {
        const overlay = document.createElement("div");
        overlay.className = "prompt-overlay";
        if (!showBg) {
            overlay.classList.add("no-bg");
        }
        const dialog = document.createElement("div");
        dialog.className = useBigDialog ? "prompt-big-dialog" : "prompt-dialog";
        if (!useBigDialog) dialog.style.maxWidth = `${width}px`;
        if (!showAnimation) dialog.classList.add("no-animation");

        const closeButton = document.createElement("button");
        closeButton.textContent = "close";
        closeButton.className = "icon-button dialog-window-control";
        closeButton.setAttribute("translate", "no");

        const toolbar = document.createElement("div");
        toolbar.className = "toolbar";

        const toolbarLeftDiv = document.createElement("div");
        toolbarLeftDiv.className = "toolbar-left";
        toolbarLeftDiv.innerHTML = toolbarLeft;

        const toolbarCenterDiv = document.createElement("div");
        toolbarCenterDiv.className = "toolbar-center";
        toolbarCenterDiv.innerHTML = toolbarCenter;

        const toolbarRightDiv = document.createElement("div");
        toolbarRightDiv.className = "toolbar-right";
        toolbarRightDiv.innerHTML = toolbarRight;

        if (showCloseButton) toolbarRightDiv.appendChild(closeButton);

        toolbar.appendChild(toolbarLeftDiv);
        toolbar.appendChild(toolbarCenterDiv);
        toolbar.appendChild(toolbarRightDiv);

        const content = document.createElement("div");
        const template = document.createElement("template");
        template.innerHTML = htmlContent.trim();
        Array.from(template.content.childNodes).forEach((node) => content.appendChild(node));

        dialog.appendChild(toolbar);
        dialog.appendChild(content);

        overlay.appendChild(dialog);
        document.body.appendChild(overlay);
        translateWithin(overlay);

        const scripts = content.querySelectorAll("script");
        scripts.forEach((oldScript) => {
            const newScript = document.createElement("script");
            if (oldScript.src) {
                newScript.src = oldScript.src;
            } else {
                newScript.textContent = oldScript.textContent;
            }
            Array.from(oldScript.attributes).forEach((attr) =>
                newScript.setAttribute(attr.name, attr.value)
            );
            oldScript.replaceWith(newScript);
        });

        closeButton.addEventListener("click", () => {
            document.body.removeChild(overlay);
        });

        overlay.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                document.body.removeChild(overlay);
            }
        });

        closeButton.focus();
    })
        .catch((error) => {
            console.error(error);
        });
}


function promptConfirm(message, dangerous = false) {
    return new Promise((resolve) => {
        // overlay
        const overlay = document.createElement("div");
        overlay.className = "prompt-overlay";

        // dialog
        const dialog = document.createElement("div");
        dialog.className = "prompt-dialog";
        dialog.style.padding = "20px";
        dialog.style.width = "100%";
        dialog.style.maxWidth = "400px";

        // message
        const text = document.createElement("p");
        text.textContent = message;
        text.className = "prompt-title";
        dialog.appendChild(text);

        // buttons
        const buttonContainer = document.createElement("div");
        buttonContainer.className = "prompt-buttons";

        const yesButton = document.createElement("button");
        yesButton.textContent = "Yes";
        yesButton.dataset.locale = "generic.yes";
        if (dangerous) {
            yesButton.className = "prompt-button danger";
        } else {
            yesButton.className = "prompt-button submit";
        }

        const noButton = document.createElement("button");
        noButton.textContent = "No";
        noButton.dataset.locale = "generic.no";
        noButton.className = "prompt-button cancel";

        buttonContainer.appendChild(noButton);
        buttonContainer.appendChild(yesButton);
        translateWithin(buttonContainer);
        dialog.appendChild(buttonContainer);

        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        function closePrompt(result) {
            document.body.removeChild(overlay);
            resolve(result);
        }

        yesButton.addEventListener("click", () => closePrompt(true));
        noButton.addEventListener("click", () => closePrompt(false));

        overlay.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                closePrompt(false);
            }
        });

        if (!dangerous) yesButton.focus();
        else noButton.focus();
    });
}

function promptTableSelector() {
    return new Promise((resolve) => {
        const overlay = document.createElement("div");
        overlay.className = "prompt-overlay";

        const dialog = document.createElement("div");
        dialog.className = "prompt-dialog";

        const tableContainer = document.createElement("div");
        tableContainer.className = "table-selector-dialog";
        dialog.appendChild(tableContainer);

        const rows = 4;
        const cols = 6;
        const buttons = [];

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const btn = document.createElement("div");
                btn.className = "table-item-ex";
                btn.dataset.row = row + 1;
                btn.dataset.col = col + 1;
                tableContainer.appendChild(btn);
                buttons.push(btn);
            }
        }

        const info = document.createElement("p");
        info.textContent = "0 x 0";
        info.style.textAlign = "center";
        info.style.marginTop = "8px";
        dialog.appendChild(info);

        const toolbar = document.createElement("div");
        toolbar.className = "toolbar";

        const leftDiv = document.createElement("div");
        leftDiv.className = "toolbar-left";
        leftDiv.innerHTML = "";

        const centerDiv = document.createElement("div");
        centerDiv.className = "toolbar-center";
        centerDiv.innerHTML = "";

        const rightDiv = document.createElement("div");
        rightDiv.className = "toolbar-right";
        rightDiv.innerHTML = "";

        const closeButton = document.createElement("button");
        closeButton.textContent = "close";
        closeButton.className = "icon-button dialog-window-control";
        closeButton.setAttribute("translate", "no");

        toolbar.appendChild(leftDiv);
        toolbar.appendChild(centerDiv);
        toolbar.appendChild(rightDiv);

        rightDiv.appendChild(closeButton);

        dialog.appendChild(toolbar);
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        tableContainer.addEventListener("mouseover", (e) => {
            if (!e.target.classList.contains("table-item-ex")) return;

            const targetRow = parseInt(e.target.dataset.row);
            const targetCol = parseInt(e.target.dataset.col);

            buttons.forEach((btn) => {
                const r = parseInt(btn.dataset.row);
                const c = parseInt(btn.dataset.col);
                btn.classList.toggle("highlighted", r <= targetRow && c <= targetCol);
            });

            info.textContent = `${targetRow} x ${targetCol}`;
        });

        closeButton.addEventListener("click", () => {
            document.body.removeChild(overlay);
            resolve(null);
        });
        tableContainer.addEventListener("click", (e) => {
            if (!e.target.classList.contains("table-item-ex")) return;

            const rowCount = parseInt(e.target.dataset.row);
            const colCount = parseInt(e.target.dataset.col);

            document.body.removeChild(overlay);

            resolve(getTable(colCount, rowCount));
        });

        overlay.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                document.body.removeChild(overlay);
                resolve(null);
            }
        });
    });
}

function promptIframe() {
    return new Promise((resolve) => {
        const overlay = document.createElement("div");
        overlay.className = "prompt-overlay";

        const dialog = document.createElement("div");
        dialog.style.padding = "20px";
        dialog.className = "prompt-dialog";

        const plataformCbx = document.createElement("select");
        plataformCbx.innerHTML = `
            <option value='pYouTube'>YouTube Video</option>
        `;
        dialog.appendChild(plataformCbx);

        const contentField = document.createElement("input");
        contentField.type = "text";
        contentField.className = "prompt-input";
        contentField.placeholder = "URL";
        dialog.appendChild(contentField);

        const buttonContainer = document.createElement("div");
        buttonContainer.className = "prompt-buttons";

        const insertButton = document.createElement("button");
        insertButton.textContent = "Insert";
        insertButton.className = "prompt-button submit";
        buttonContainer.appendChild(insertButton);

        const cancelButton = document.createElement("button");
        cancelButton.textContent = "Cancel";
        cancelButton.className = "prompt-button cancel";
        buttonContainer.appendChild(cancelButton);
        dialog.appendChild(buttonContainer);

        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        insertButton.addEventListener("click", () => closePrompt(false));
        cancelButton.addEventListener("click", () => closePrompt(true));

        function closePrompt(returnNull) {
            document.body.removeChild(overlay);

            if (returnNull) resolve(null);
            if (contentField.value.length == 0) resolve(null);

            switch (plataformCbx.value) {
                case "pYouTube":
                    resolve(insertYouTubeVideo(contentField.value));
                    break;
            }
        }

        overlay.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                closePrompt(true);
            } else if (event.key === "Enter") {
                closePrompt(false);
            }
        });

        plataformCbx.focus();
    });
}

const searchMenuActions = [];

function addSearchMenuAction(title, icon, description, fn) {
    searchMenuActions.push({ title, icon, description, fn });
}

addSearchMenuAction("Search ~author" , "person", "", () => {promptFileSearch("~", false);});
addSearchMenuAction("Search @date"   , "event" , "", () => {promptFileSearch("@", false);});
addSearchMenuAction("Search #tag"    , "sell"  , "", () => {promptFileSearch("#", false);});
addSearchMenuAction("Search /project", "folder", "", () => {promptFileSearch("/", false);});
// addSearchMenuAction("Search \"text fragment\"", 'text_snippet', () => {promptFileSearch('"');});

async function promptFileSearch(value = '', doAnimation = true) {
    return new Promise((resolve) => {
        const overlay = document.createElement("div");
        overlay.className = "prompt-overlay";

        const dialog = document.createElement("div");
        dialog.className = "prompt-dialog";
        dialog.style.maxWidth = "600px";
        if (!doAnimation) dialog.classList.add("no-animation")

        // const lbltitle = document.createElement("p");
        // lbltitle.textContent = "Search";
        // lbltitle.className = "prompt-title";
        // dialog.appendChild(lbltitle);

        const input = document.createElement("input");
        input.type = "text";
        input.placeholder = 'Search documents';
        input.value = value;
        input.className = "prompt-search-input";
        dialog.appendChild(input);

        const previewList = document.createElement("ul");
        previewList.className = "prompt-preview-list";
        dialog.appendChild(previewList);

        const toolbar = document.createElement("div");
        toolbar.className = "toolbar";
        toolbar.style.marginTop = "2px";

        const leftDiv = document.createElement("div");
        leftDiv.className = "toolbar-left";
        leftDiv.innerHTML = "";

        const centerDiv = document.createElement("div");
        centerDiv.className = "toolbar-center";
        centerDiv.innerHTML = "";

        const rightDiv = document.createElement("div");
        rightDiv.className = "toolbar-right";
        rightDiv.innerHTML = "";

        const closeButton = document.createElement("button");
        closeButton.textContent = "close";
        closeButton.className = "icon-button dialog-window-control transparent-dialog-window-control";
        closeButton.setAttribute("translate", "no");

        toolbar.appendChild(leftDiv);
        toolbar.appendChild(centerDiv);
        toolbar.appendChild(rightDiv);

        rightDiv.appendChild(closeButton);

        dialog.appendChild(toolbar);

        overlay.appendChild(dialog);
        document.body.appendChild(overlay);
        input.focus();

        let filtered = [];
        let selectedIndex = 0;

        closeButton.addEventListener("click", () => {
            document.body.removeChild(overlay);
            resolve(null);
        });

        function matchFile(query, index) {
            const text = getFileText(index);
            if (!text) return false;

            const conv = new showdown.Converter({ metadata: true });
            conv.makeHtml(text);
            const metadata = conv.getMetadata();

            const title = (getFileTitle(index) || "").toLowerCase();
            const author = (metadata.author || "")
                .toLowerCase()
                .split(",")
                .map((a) => a.trim());
            const tags = (metadata.tags || "")
                .toLowerCase()
                .split(",")
                .map((t) => t.trim());
            const date = (metadata.date || "").toLowerCase();
            const project = (metadata.project || metadata.folder || "")
            const body = text.toLowerCase();

            const lowerQuery = query.toLowerCase();

            if (lowerQuery.startsWith("#")) {
                const tagQuery = lowerQuery.slice(1);
                return tags.some((t) => t.includes(tagQuery));
            }

            if (lowerQuery.startsWith("~")) {
                const authorQuery = lowerQuery.slice(1);
                return author.some((a) => a.includes(authorQuery));
            }

            if (lowerQuery.startsWith("@")) {
                const dateQuery = lowerQuery.slice(1);
                return date.includes(dateQuery);
            }

            if (lowerQuery.startsWith("/")) {
                const projQuery = lowerQuery.slice(1)
                return project.toLowerCase().includes(projQuery);
            }

            if (lowerQuery.startsWith('"') && lowerQuery.endsWith('"')) {
                const textQuery = lowerQuery.slice(1, -1);
                return body.includes(textQuery);
            }

            // lbltitle.textContent = "Search";
            return title.includes(lowerQuery);
        }

        async function executeAction(fn) {
            try {
                await Promise.resolve(fn());
            } catch (e) {
                console.error("Search action error:", e);
            }
            closePrompt(null);
        }

        function updatePreview() {
            const query = input.value.trim();
            const lowerQuery = query.toLowerCase();

            let fileItems = [];
            if (query) {
                fileItems = files
                    .map((_, i) => ({
                        index: i,
                        title: getFileTitle(i) || `New document`,
                    }))
                    .filter((file) => matchFile(query, file.index))
                    .slice(0, 10)
                    .map(f => ({ type: "file", index: f.index, title: f.title }));
            }

            const actionItems = searchMenuActions
                .filter(a => {
                    if (!query) return true;
                    return a.title.toLowerCase().includes(lowerQuery);
                })
                .slice(0, 5)
                .map(a => ({ type: "action", title: a.title, icon: a.icon, description: a.description, fn: a.fn }));

            filtered = [...actionItems, ...fileItems];

            if (selectedIndex >= filtered.length) selectedIndex = Math.max(0, filtered.length - 1);

            previewList.innerHTML = "";
            filtered.forEach((item, i) => {
                const li = document.createElement("li");
                li.className = "prompt-item";

                const iconSpan = document.createElement("span");
                iconSpan.className = "icon";
                iconSpan.setAttribute("translate", "no");

                const textWrap = document.createElement("div");
                textWrap.className = "prompt-item-text";

                const titleSpan = document.createElement("div");
                titleSpan.className = "prompt-item-title";

                const descSpan = document.createElement("div");
                descSpan.className = "prompt-item-description";

                if (item.type === "action") {
                    iconSpan.textContent = item.icon || "";
                    titleSpan.textContent = item.title;
                    descSpan.textContent = item.description || "";
                }

                if (item.type === "file") {
                    const text = getFileText(item.index);
                    let metadata = {};

                    if (text) {
                        const conv = new showdown.Converter({ metadata: true });
                        conv.makeHtml(text);
                        metadata = conv.getMetadata();
                    }

                    const projectMeta = parseProjectMeta(
                        metadata.project || metadata.folder
                    );

                    iconSpan.textContent = projectMeta.icon;
                    iconSpan.style.color = projectMeta.color;
                    iconSpan.classList.add("color-" + projectMeta.color)

                    titleSpan.textContent = item.title;
                    descSpan.innerHTML = buildFileDescription(metadata, input.value);
                }

                textWrap.append(titleSpan);
                if (descSpan.innerHTML) textWrap.append(descSpan);

                li.append(iconSpan, textWrap);

                if (i === selectedIndex) li.classList.add("selected-option");

                li.addEventListener("click", () => {
                    if (item.type === "action") executeAction(item.fn);
                    else closePrompt(item.index);
                });

                previewList.appendChild(li);
            });
        }

        function closePrompt(result) {
            if (overlay.parentNode) document.body.removeChild(overlay);
            resolve(result);
        }

        input.addEventListener("input", () => {
            selectedIndex = 0;
            updatePreview();
        });

        overlay.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                if (filtered[selectedIndex]) {
                    event.preventDefault();
                    const sel = filtered[selectedIndex];
                    if (sel.type === "action") {
                        executeAction(sel.fn);
                    } else {
                        closePrompt(sel.index);
                    }
                } else {
                    closePrompt(null);
                }
            } else if (event.key === "ArrowDown") {
                event.preventDefault();
                if (selectedIndex < filtered.length - 1) {
                    selectedIndex++;
                    updatePreview();
                }
            } else if (event.key === "ArrowUp") {
                event.preventDefault();
                if (selectedIndex > 0) {
                    selectedIndex--;
                    updatePreview();
                }
            } else if (event.key === "Escape") {
                closePrompt(null);
            }
        });

        updatePreview();
    });
}

function parseProjectMeta(raw) {
    if (!raw) {
        return {
            name: "Documents",
            icon: "draft",
            color: "currentColor"
        };
    }

    const str = String(raw).trim();

    // [icon:color]Project name
    const m = str.match(/^\[([^:\]]+)(?::([^\]]+))?\](.*)$/);

    if (m) {
        return {
            icon: m[1].trim().toLowerCase().replace(/\s+/g, "_"),
            color: m[2]?.trim() || "currentColor",
            name: m[3].trim() || "Documents"
        };
    }

    return {
        name: str,
        icon: "draft",
        color: "currentColor"
    };
}

function buildFileDescription(metadata, query) {
    const lower = query.toLowerCase();

    const parts = [];

    if (lower.startsWith("~") && metadata.author) {
        return `<span class="icon">person</span> ${metadata.author}`;
    }

    if (lower.startsWith("@") && metadata.date) {
        return `<span class="icon">event</span> ${metadata.date}`;
    }

    if (lower.startsWith("#") && metadata.tags) {
        return metadata.tags
            .split(",")
            .map(t => t.trim())
            .filter(Boolean)
            .map(t => `<span class="tag">#${t}</span>`)
            .join(" ");
    }

    if (lower.startsWith("/") && (metadata.project || metadata.folder)) {
        const proj = parseProjectMeta(metadata.project || metadata.folder);
        return `<span class="icon">folder</span> ${proj.name}`;
    }

    // default: title search
    if (metadata.project || metadata.folder) {
        const proj = parseProjectMeta(metadata.project || metadata.folder);
        parts.push(`<span class="icon">folder</span> ${proj.name}`);
    }

    if (metadata.author) {
        parts.push(`<span class="icon">person</span> ${metadata.author}`);
    }

    if (metadata.date) {
        parts.push(`<span class="icon">event</span> ${metadata.date}`);
    }

    if (metadata.description) {
        parts.push(metadata.description);
    }

    return parts.join(" • ");
}

function promptSelect(title, options) {
    return new Promise((resolve) => {
        const overlay = document.createElement("div");
        overlay.className = "prompt-overlay";

        const dialog = document.createElement("div");
        dialog.className = "prompt-dialog";
        dialog.style.maxWidth = "600px";

        const input = document.createElement("input");
        input.type = "text";
        input.className = "prompt-search-input";
        input.placeholder = title;

        const list = document.createElement("ul");
        list.className = "prompt-preview-list";

        dialog.append(input, list);

        const toolbar = document.createElement("div");
        toolbar.className = "toolbar";
        toolbar.style.marginTop = "2px";

        const left = document.createElement("div");
        left.className = "toolbar-left";

        const center = document.createElement("div");
        center.className = "toolbar-center";

        const right = document.createElement("div");
        right.className = "toolbar-right";

        const closeButton = document.createElement("button");
        closeButton.textContent = "close";
        closeButton.className =
            "icon-button dialog-window-control transparent-dialog-window-control";
        closeButton.setAttribute("translate", "no");

        closeButton.addEventListener("click", () => close(null));

        toolbar.append(left, center, right);
        right.appendChild(closeButton);

        dialog.appendChild(toolbar);
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        let filtered = [];
        let selectedIndex = 0;

        function normalizeOption(opt) {
            if (typeof opt === "string") {
                return {
                    title: opt,
                    description: ""
                };
            }
            return opt;
        }

        const normalized = options.map(normalizeOption);

        function close(result) {
            if (overlay.parentNode) overlay.remove();
            resolve(result);
        }

        function update() {
            const q = input.value.toLowerCase();

            filtered = normalized.filter(o =>
                o.title.toLowerCase().includes(q)
            );

            list.innerHTML = "";

            filtered.forEach((item, i) => {
                const li = document.createElement("li");
                li.className = "prompt-item";
                if (i === selectedIndex) li.classList.add("selected-option");

                const icon = document.createElement("span");
                icon.className = "icon";
                icon.textContent = item.icon || "";
                icon.style.color = item.color;
                icon.classList.add("color-" + item.color);

                const textWrap = document.createElement("div");
                textWrap.className = "prompt-item-text";

                const titleEl = document.createElement("div");
                titleEl.className = "prompt-item-title";
                titleEl.textContent = item.title;

                textWrap.appendChild(titleEl);

                if (item.description) {
                    const desc = document.createElement("div");
                    desc.className = "prompt-item-description";
                    desc.innerHTML = item.description;
                    textWrap.appendChild(desc);
                }

                li.append(icon, textWrap);

                li.addEventListener("click", () =>
                    close(normalized.indexOf(item))
                );

                list.appendChild(li);
            });
        }

        input.addEventListener("input", () => {
            selectedIndex = 0;
            update();
        });

        overlay.addEventListener("keydown", (e) => {
            if (e.key === "ArrowDown") {
                e.preventDefault();
                selectedIndex = Math.min(
                    selectedIndex + 1,
                    filtered.length - 1
                );
                update();
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                selectedIndex = Math.max(selectedIndex - 1, 0);
                update();
            } else if (e.key === "Enter") {
                e.preventDefault();
                if (filtered[selectedIndex]) {
                    close(normalized.indexOf(filtered[selectedIndex]));
                }
            } else if (e.key === "Escape") {
                close(null);
            }
        });

        overlay.tabIndex = -1;
        overlay.focus();
        input.focus();

        update();
    });
}

async function promptSaveFile(fileId) {
    const overlay = document.createElement("div");
    overlay.className = "prompt-overlay";

    const dialog = document.createElement("div");
    dialog.style.padding = "20px";
    dialog.className = "prompt-dialog";

    const fileNameLabel = document.createElement("label");
    fileNameLabel.textContent = "File name:";
    dialog.appendChild(fileNameLabel);

    const fileNameField = document.createElement("input");
    fileNameField.type = "text";
    fileNameField.className = "prompt-input";
    fileNameField.value = `${getFileTitle(fileId) || "New document"}`;
    dialog.appendChild(fileNameField);

    const fileFormatField = document.createElement("select");
    fileFormatField.innerHTML = `
            <option value='md'>Markdown Document (*.md)</option>
            <option value='pdf'>Portable Document File (*.pdf)</option>
            <option value='html'>HTML Page (*.html)</option>
        `;
    dialog.appendChild(fileFormatField);

    const buttonContainer = document.createElement("div");
    buttonContainer.className = "prompt-buttons";

    const saveButton = document.createElement("button");
    saveButton.textContent = "Save";
    saveButton.className = "prompt-button submit";
    buttonContainer.appendChild(saveButton);

    const cancelButton = document.createElement("button");
    cancelButton.textContent = "Cancel";
    cancelButton.className = "prompt-button cancel";
    buttonContainer.appendChild(cancelButton);
    dialog.appendChild(buttonContainer);

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    saveButton.addEventListener("click", () => closePrompt(false));
    cancelButton.addEventListener("click", () => closePrompt(true));

    async function closePrompt(returnNull) {
        document.body.removeChild(overlay);

        if (returnNull) return;
        if (fileNameField.value.length == 0) return;

        switch (fileFormatField.value) {
            case "md":
                exportFile(fileId, fileNameField.value);
                break;
            case "pdf":
                const pdfContainer = document.createElement("div");
                pdfContainer.innerHTML = converter.makeHtml(getFileText(fileId));
                pdfContainer.style.padding = "20px";
                pdfContainer.style.maxWidth = "900px";
                pdfContainer.style.margin = "0 auto";
                pdfContainer.style.fontFamily = "sans-serif";

                // Convert all images to Data URLs
                const imgEls = pdfContainer.querySelectorAll("img");
                await Promise.all(Array.from(imgEls).map(async (img) => {
                    const src = img.getAttribute("src");
                    if (!src) return;
                    if (src.startsWith("resources/")) {
                        const fileName = src.slice(10);
                        const dataUrl = await Resources.resolveFSItem(fileName);
                        if (dataUrl) img.src = dataUrl;
                    } else if (/^https?:\/\//.test(src)) {
                        try {
                            const response = await fetch(src);
                            const blob = await response.blob();
                            const reader = new FileReader();
                            img.src = await new Promise((resolve) => {
                                reader.onload = () => resolve(reader.result);
                                reader.readAsDataURL(blob);
                            });
                        } catch (e) {
                            // If fetch fails, leave as is
                        }
                    }
                }));

                document.body.appendChild(pdfContainer);
                html2pdf()
                    .set({
                        margin: 10,
                        filename: fileNameField.value + ".pdf",
                        image: { type: 'jpeg', quality: 0.98 },
                        html2canvas: { scale: 2 },
                        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
                    })
                    .from(pdfContainer)
                    .save()
                    .then(() => {
                        document.body.removeChild(pdfContainer);
                    })
                    .catch(() => {
                        document.body.removeChild(pdfContainer);
                    });
                break;
            case "html":
                // Find all resources used
                const htmlContent = converter.makeHtml(getFileText(fileId));
                const metadata = converter.getMetadata();
                const tempDiv = document.createElement("div");
                tempDiv.innerHTML = htmlContent;
                const usedResources = Array.from(tempDiv.querySelectorAll("img,audio,video,iframe"))
                    .map(el => el.getAttribute("src"))
                    .filter(src => src && src.startsWith("resources/"))
                    .map(src => src.slice(10));
                // Replace src with resources/filename
                usedResources.forEach(async (fileName) => {
                    tempDiv.querySelectorAll(`[src="resources/${fileName}"]`).forEach(el => {
                        el.setAttribute("src", "resources/" + fileName);
                    });
                });

                // defualt metadata values
                const defaultMeta = {
                    title: "New document",
                    author: "unknown",
                    date: "unknown",
                    tags: "uncategorized",
                    description: "none",
                };

                const meta = { ...defaultMeta, ...metadata };

                // HTML meta
                const metaTags = `<meta name="title" content="${meta.title}">
<meta name="author" content="${meta.author}">
<meta name="date" content="${meta.date}">
<meta name="keywords" content="${meta.tags}">
<meta name="description" content="${meta.description}">
<meta name="generator" content="Cohesion" />`;

                // Build HTML file
                const htmlContainer = document.createElement("html");
                htmlContainer.lang = "en";
                htmlContainer.innerHTML = `<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${fileNameField.value}.html</title>
${metaTags}
<link rel="stylesheet" href="style.css">
</head>
<body>
${tempDiv.innerHTML}
</body>`;

                // Create ZIP
                const zip = new JSZip();
                zip.file("index.html", "<!DOCTYPE html>\n" + htmlContainer.outerHTML);

                // Add exported HTML CSS as root style.css
                const cssResponse = await fetch("./style/exportedHtmlDocument.css");
                if (cssResponse.ok) {
                    const cssText = await cssResponse.text();
                    zip.file("style.css", cssText);
                }

                // Add resources
                await Promise.all(usedResources.map(async (fileName) => {
                    const dataUrl = await Resources.resolveFSItem(fileName);
                    if (dataUrl) {
                        // Extract base64 data and mime type
                        const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);
                        if (matches) {
                            const mime = matches[1];
                            const base64 = matches[2];
                            zip.folder("resources").file(fileName, base64, { base64: true });
                        }
                    }
                }));

                zip.generateAsync({ type: "blob" }).then((blob) => {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = fileNameField.value + ".zip";
                    a.click();
                    URL.revokeObjectURL(url);
                });
                break;
        }
    }

    overlay.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closePrompt(true);
        } else if (event.key === "Enter") {
            closePrompt(false);
        }
    });

    fileNameField.focus();
    fileNameField.selectionStart = 0;
    fileNameField.selectionEnd = fileNameField.value.length;
}

async function showMedia(filePath) {
    closeAllDialogs();

    const overlay = document.createElement("div");
    overlay.className = "prompt-overlay";
    overlay.tabIndex = 0;

    const dialog = document.createElement("div");
    dialog.className = "prompt-dialog";
    dialog.style.maxHeight = "90%";
    dialog.style.maxWidth = "800px";
    dialog.style.display = "flex";
    dialog.style.flexDirection = "column";

    const toolbar = document.createElement("div");
    toolbar.className = "toolbar";

    const leftDiv = document.createElement("div");
    leftDiv.className = "toolbar-left";

    const rightDiv = document.createElement("div");
    rightDiv.className = "toolbar-right";

    // fullscreen button
    const fullscreenButton = document.createElement("button");
    fullscreenButton.textContent = "open_in_full";
    fullscreenButton.className = "icon-button";
    leftDiv.appendChild(fullscreenButton);

    // download button
    const downloadButton = document.createElement("a");
    downloadButton.textContent = "download";
    downloadButton.className = "icon-button";
    downloadButton.setAttribute("href", filePath);
    downloadButton.setAttribute("download", "");
    downloadButton.style.textDecoration = "none";
    downloadButton.style.color = "var(--button-color)";
    rightDiv.appendChild(downloadButton);

    // close button
    const closeButton = document.createElement("button");
    closeButton.textContent = "close";
    closeButton.className = "icon-button dialog-window-control";
    rightDiv.appendChild(closeButton);

    toolbar.appendChild(leftDiv);
    toolbar.appendChild(document.createElement("div"));
    toolbar.appendChild(rightDiv);

    const content = document.createElement("div");
    content.className = "prompt-content";
    content.style.flex = "1";
    content.style.display = "flex";
    content.style.justifyContent = "center";
    content.style.overflow = "scroll";

    let mediaEl;
    let src = filePath;

    if (filePath.startsWith("resources/")) {
        const fileName = filePath.slice(10);
        const dataUrl = await Resources.resolveFSItem(fileName);
        if (dataUrl) {
            src = dataUrl;
            downloadButton.setAttribute("href", dataUrl);
        }
    }

    if (/\.(png|jpe?g|gif|webp|svg)$/i.test(filePath)) {
        mediaEl = document.createElement("img");
        mediaEl.src = src;
        mediaEl.style.maxWidth = "100%";
        mediaEl.style.maxHeight = "100%";
    } else if (/\.(mp4|webm|ogg)$/i.test(filePath)) {
        mediaEl = document.createElement("video");
        mediaEl.src = src;
        mediaEl.controls = true;
        mediaEl.style.maxWidth = "100%";
        mediaEl.style.maxHeight = "100%";
    } else if (/\.(mp3|wav|ogg)$/i.test(filePath)) {
        mediaEl = document.createElement("audio");
        mediaEl.src = src;
        mediaEl.controls = true;
        mediaEl.style.width = "100%";
    } else if (/\.pdf$/i.test(filePath)) {
        mediaEl = document.createElement("embed");
        mediaEl.src = src;
        mediaEl.type = "application/pdf";
        mediaEl.style.width = "100%";
        mediaEl.style.height = "100%";
    } else {
        mediaEl = document.createElement("img");
        mediaEl.src = src;
        mediaEl.style.maxWidth = "100%";
        mediaEl.style.maxHeight = "100%";
        mediaEl.onerror = () => {
            mediaEl.replaceWith(Object.assign(document.createElement("p"), {
                textContent: "Unsupported media type: " + filePath
            }));
        };
    }

    content.appendChild(mediaEl);

    dialog.appendChild(toolbar);
    dialog.appendChild(content);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    // Eventos
    closeButton.addEventListener("click", () => overlay.remove());

    fullscreenButton.addEventListener("click", () => {
        if (!document.fullscreenElement) {
            dialog.requestFullscreen?.();
        } else {
            document.exitFullscreen?.();
        }
    });

    overlay.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            if (document.fullscreenElement) {
                document.exitFullscreen?.();
            } else {
                overlay.remove();
            }
        }
    });

    overlay.focus();
    closeButton.focus();
}

function promptCodeEditor(initialText = "") {
    return new Promise((resolve) => {
        // overlay
        const overlay = document.createElement("div");
        overlay.className = "prompt-overlay";

        // dialog
        const dialog = document.createElement("div");
        dialog.className = "prompt-dialog";
        dialog.style.display = "flex";
        dialog.style.flexDirection = "column";
        dialog.style.maxWidth = "80%";

        // toolbar
        const toolbar = document.createElement("div");
        toolbar.className = "toolbar";

        const leftDiv = document.createElement("div");
        leftDiv.className = "toolbar-left";

        const centerDiv = document.createElement("div");
        centerDiv.className = "toolbar-center";

        const rightDiv = document.createElement("div");
        rightDiv.className = "toolbar-right";

        const undoButton = document.createElement("button");
        undoButton.textContent = "undo";
        undoButton.className = "icon-button";
        undoButton.title = "Un-do";
        undoButton.setAttribute("translate", "no");

        const redoButton = document.createElement("button");
        redoButton.textContent = "redo";
        redoButton.className = "icon-button";
        redoButton.title = "Re-do";
        redoButton.setAttribute("translate", "no");

        const okButton = document.createElement("button");
        okButton.textContent = "check";
        okButton.className = "icon-button";
        okButton.title = "Confirm";
        okButton.setAttribute("translate", "no");

        const closeButton = document.createElement("button");
        closeButton.textContent = "close";
        closeButton.className = "icon-button dialog-window-control";
        closeButton.setAttribute("translate", "no");

        leftDiv.appendChild(undoButton);
        leftDiv.appendChild(redoButton);

        rightDiv.appendChild(okButton);
        rightDiv.appendChild(closeButton);

        toolbar.appendChild(leftDiv);
        toolbar.appendChild(centerDiv);
        toolbar.appendChild(rightDiv);

        // textarea container
        const editorContainer = document.createElement("div");
        editorContainer.style.display = "flex";
        editorContainer.style.flex = "1";
        editorContainer.style.padding = "0";
        editorContainer.style.margin = "0";

        const textarea = document.createElement("textarea");
        textarea.value = initialText;
        textarea.style.flex = "1";
        textarea.className = "prompt-text-editor";
        textarea.setAttribute("spellcheck", "false");

        editorContainer.appendChild(textarea);
        
        dialog.appendChild(toolbar);
        dialog.appendChild(editorContainer);
        
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        textarea.focus();

        requestAnimationFrame(() => {
            textarea.selectionStart = 0;
            textarea.selectionEnd = 0;
            textarea.scrollTop = 0;
        });

        // helpers
        function closePrompt(result) {
            document.body.removeChild(overlay);
            resolve(result);
        }

        okButton.addEventListener("click", () => closePrompt(textarea.value));
        closeButton.addEventListener("click", () => closePrompt(null));

        undoButton.addEventListener("click", () => {
            textarea.focus();
            document.execCommand("undo");
        });

        redoButton.addEventListener("click", () => {
            textarea.focus();
            document.execCommand("redo");
        });

        textarea.addEventListener("keydown", (event) => {
            if (event.key === "Tab") {
                event.preventDefault();

                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;

                const value = textarea.value;
                const lines = value.split("\n");

                const startLine = value.substring(0, start).split("\n").length - 1;
                const endLine = value.substring(0, end).split("\n").length - 1;

                if (!event.shiftKey) {
                    for (let i = startLine; i <= endLine; i++) {
                        lines[i] = "\t" + lines[i];
                    }
                } else {
                    for (let i = startLine; i <= endLine; i++) {
                        if (lines[i].startsWith("\t")) {
                            lines[i] = lines[i].substring(1);
                        }
                    }
                }

                const newValue = lines.join("\n");

                let diff = 0;

                if (!event.shiftKey) {
                    diff = 1;
                } else {
                    const originalLines = value.split("\n");
                    if (originalLines[startLine].startsWith("\t")) diff = -1;
                }

                textarea.value = newValue;

                textarea.selectionStart = start + diff;
                textarea.selectionEnd = end + diff * (endLine - startLine + 1);
            }
        });

        overlay.addEventListener("keydown", (event) => {
            if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
                closePrompt(textarea.value);
            }
        });
    });
}


function showBanner({ message = "", buttons = [], menuButtons = [] }) {
    // Remove existing banners
    document.querySelectorAll('.prompt-banner').forEach(b => b.remove());

    // Creates the banner container
    const banner = document.createElement('div');
    banner.className = 'prompt-banner';

    /**
     * Closes the banner
     */
    function closeBanner() {
        banner.remove();
    }

    // Left side (message)
    const leftContent = document.createElement('div');
    leftContent.className = 'prompt-banner-left';
    leftContent.innerHTML = message;
    banner.appendChild(leftContent);

    // Right side (actions)
    const rightContent = document.createElement('div');
    rightContent.className = 'prompt-banner-right';

    // create buttons (right side)
    buttons.forEach(btnInfo => {
        const btn = document.createElement('button');
        btn.innerHTML = btnInfo.value;
        btn.className = 'prompt-text-button';
        if (btnInfo.isPrimary) btn.classList.add('prompt-primary');
        if (btnInfo.isIcon) btn.classList.add('icon-button');

        // allows button action to close the banner
        btn.addEventListener('mouseup', () => btnInfo.onclick?.(closeBanner));
        rightContent.appendChild(btn);
    });

    // create menu (right side)
    if (menuButtons.length > 0) {
        const dropdown = document.createElement('div');
        dropdown.className = 'dropdown';

        const menuButton = document.createElement('button');
        menuButton.className = 'icon-button';
        menuButton.innerHTML = 'more_vert';
        menuButton.title = 'More options';
        menuButton.addEventListener('mousedown', (e) => {
            e.preventDefault();
            dropdown.classList.toggle('show');
        });
        dropdown.appendChild(menuButton);

        const menuContent = document.createElement('div');
        menuContent.className = 'dropdown-content menu';

        menuButtons.forEach(item => {
            const btn = document.createElement('button');
            btn.className = 'text-button';
            btn.innerHTML = item.value;
            btn.addEventListener('mouseup', () => {
                item.onclick?.(closeBanner);
                dropdown.classList.remove('show');
            });
            menuContent.appendChild(btn);
        });

        dropdown.appendChild(menuContent);
        rightContent.appendChild(dropdown);
    }

    banner.appendChild(rightContent);
    document.body.appendChild(banner);
}

function promptColorInfo(colorString, schemeType = "none") {
    return new Promise((resolve) => {
        function parseCssColorToRGBA(input) {
            // create an offscreen element to get computed color
            const el = document.createElement("div");
            el.style.color = input;
            el.style.position = "absolute";
            el.style.left = "-9999px";
            document.body.appendChild(el);
            const cs = getComputedStyle(el).color;
            document.body.removeChild(el);

            const m = cs.match(/rgba?\(([\d.\s]+),\s*([\d.\s]+),\s*([\d.\s]+)(?:,\s*([\d.\s]+))?\)/);
            if (!m) return null;
            return {
                r: Math.round(Number(m[1])),
                g: Math.round(Number(m[2])),
                b: Math.round(Number(m[3])),
                a: m[4] !== undefined ? Number(m[4]) : 1
            };
        }

        function toHex({ r, g, b, a }) {
            const h = (v) => v.toString(16).padStart(2, "0");
            if (a < 1) {
                const aa = Math.round(a * 255);
                return `#${h(r)}${h(g)}${h(b)}${h(aa)}`.toLowerCase();
            }
            return `#${h(r)}${h(g)}${h(b)}`.toLowerCase();
        }

        function toRgbString({ r, g, b, a }) {
            return a < 1 ? `rgba(${r}, ${g}, ${b}, ${+a.toFixed(3)})` : `rgb(${r}, ${g}, ${b})`;
        }

        function rgbToHsv({ r, g, b }) {
            const rn = r / 255, gn = g / 255, bn = b / 255;
            const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
            const d = max - min;
            let h = 0;
            if (d !== 0) {
                if (max === rn) h = ((gn - bn) / d) % 6;
                else if (max === gn) h = (bn - rn) / d + 2;
                else h = (rn - gn) / d + 4;
                h = Math.round(h * 60);
                if (h < 0) h += 360;
            }
            const s = max === 0 ? 0 : +(d / max * 100).toFixed(1);
            const v = +(max * 100).toFixed(1);
            return { h, s, v };
        }

        function rgbToHsvString(rgb) {
            const { h, s, v } = rgbToHsv(rgb);
            return `hsv(${h}, ${s}%, ${v}%)`;
        }

        function rgbToHsl({ r, g, b }) {
            const rn = r / 255, gn = g / 255, bn = b / 255;
            const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
            const d = max - min;
            const l = (max + min) / 2;
            let h = 0, s = 0;
            
            if (d !== 0) {
                if (max === rn) h = ((gn - bn) / d) % 6;
                else if (max === gn) h = (bn - rn) / d + 2;
                else h = (rn - gn) / d + 4;
                h = Math.round(h * 60);
                if (h < 0) h += 360;
                s = +(d / (1 - Math.abs(2 * l - 1)) * 100).toFixed(1);
            }
            
            return { h, s, l: +(l * 100).toFixed(1) };
        }

        function rgbToHslString(rgb) {
            const { h, s, l } = rgbToHsl(rgb);
            return `hsl(${h}, ${s}%, ${l}%)`;
        }

        // Oklab conversion
        function srgbToLinear(c) {
            c = c / 255;
            return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        }

        function linearToOklab(r, g, b) {
            // linear r,g,b -> XYZ
            const X = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
            const Y = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
            const Z = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;

            // XYZ -> LMS
            const l_ = 0.8189330101 * X + 0.3618667424 * Y - 0.1288597137 * Z;
            const m_ = 0.0329845436 * X + 0.9293118715 * Y + 0.0361456387 * Z;
            const s_ = 0.0482003018 * X + 0.2643662691 * Y + 0.6338517070 * Z;

            const l = Math.cbrt(l_);
            const m = Math.cbrt(m_);
            const s = Math.cbrt(s_);

            const L = 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s;
            const a = 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s;
            const b_ = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s;

            return { L, a, b: b_ };
        }

        function rgbToOklabString({ r, g, b }) {
            const lr = srgbToLinear(r);
            const lg = srgbToLinear(g);
            const lb = srgbToLinear(b);

            const { L, a, b: bb } = linearToOklab(lr, lg, lb);

            const Lcss = +(L * 100).toFixed(4);
            return `oklab(${Lcss}%, ${a.toFixed(4)}, ${bb.toFixed(4)})`;
        }

        function hsvToRgb({ h, s, v }) {
            // Normalize s and v from 0-100 to 0-1
            const sat = s / 100;
            const val = v / 100;
            
            const c = val * sat;
            const hp = h / 60;
            const x = c * (1 - Math.abs(hp % 2 - 1));
            let r = 0, g = 0, b = 0;
            
            if (hp >= 0 && hp < 1) { r = c; g = x; b = 0; }
            else if (hp >= 1 && hp < 2) { r = x; g = c; b = 0; }
            else if (hp >= 2 && hp < 3) { r = 0; g = c; b = x; }
            else if (hp >= 3 && hp < 4) { r = 0; g = x; b = c; }
            else if (hp >= 4 && hp < 5) { r = x; g = 0; b = c; }
            else if (hp >= 5 && hp < 6) { r = c; g = 0; b = x; }
            
            const m = val - c;
            return {
                r: Math.round((r + m) * 255),
                g: Math.round((g + m) * 255),
                b: Math.round((b + m) * 255),
                a: 1
            };
        }

        function getColorScheme(rgba, scheme) {
            const hsv = rgbToHsv(rgba);
            const colors = [rgba]; // include the original color
            
            switch (scheme) {
                case "complementary":
                    colors.push(hsvToRgb({ h: (hsv.h + 180) % 360, s: hsv.s, v: hsv.v }));
                    break;
                case "monochromatic":
                    colors.push(hsvToRgb({ h: hsv.h, s: hsv.s, v: Math.max(0, hsv.v - 30) }));
                    colors.push(hsvToRgb({ h: hsv.h, s: hsv.s, v: Math.min(100, hsv.v + 30) }));
                    break;
                case "analogous":
                    colors.push(hsvToRgb({ h: (hsv.h + 30) % 360, s: hsv.s, v: hsv.v }));
                    colors.push(hsvToRgb({ h: (hsv.h - 30 + 360) % 360, s: hsv.s, v: hsv.v }));
                    break;
                case "triadic":
                    colors.push(hsvToRgb({ h: (hsv.h + 120) % 360, s: hsv.s, v: hsv.v }));
                    colors.push(hsvToRgb({ h: (hsv.h + 240) % 360, s: hsv.s, v: hsv.v }));
                    break;
                case "tetradic":
                    colors.push(hsvToRgb({ h: (hsv.h + 90) % 360, s: hsv.s, v: hsv.v }));
                    colors.push(hsvToRgb({ h: (hsv.h + 180) % 360, s: hsv.s, v: hsv.v }));
                    colors.push(hsvToRgb({ h: (hsv.h + 270) % 360, s: hsv.s, v: hsv.v }));
                    break;
            }
            
            return colors;
        }

        function createRow(label, value, aboutColor) {
            const row = document.createElement("div");
            row.className = "color-info-row";

            const lbl = document.createElement("div");
            lbl.className = "color-info-label";
            lbl.title = aboutColor;
            lbl.textContent = label;

            const val = document.createElement("input");
            val.style.marginBottom = "0";
            val.style.fontFamily = "monospace";
            val.value = value;
            val.readOnly = true;

            const copyBtn = document.createElement("button");
            copyBtn.className = "icon-button";
            copyBtn.textContent = "content_copy";
            copyBtn.title = "Copy to clipboard";
            copyBtn.translate = "no";
            copyBtn.addEventListener("click", async () => {
                try {
                    await navigator.clipboard.writeText(val.value);
                    showToast("Copied", "check");
                } catch (e) {
                    // fallback select
                    val.select();
                    document.execCommand && document.execCommand("copy");
                    showToast("Copied", "check");
                }
            });

            row.appendChild(lbl);
            row.appendChild(val);
            row.appendChild(copyBtn);
            return row;
        }

        function createColorSchemeGrid(colors, scheme, targetContainer) {
            colors.forEach((color, index) => {
                const colorBox = document.createElement("div");
                colorBox.className = "color-scheme-box";
                colorBox.style.backgroundColor = toHex(color);
                colorBox.title = toHex(color);
                
                colorBox.addEventListener("click", (e) => {
                    e.stopPropagation();
                    closeAllDialogs();
                    promptColorInfo(toHex(color), scheme);
                });
                
                targetContainer.appendChild(colorBox);
            });
        }

        // build dialog
        const rgba = parseCssColorToRGBA(colorString) || { r: 0, g: 0, b: 0, a: 1 };
        const hex = toHex(rgba);
        const rgbStr = toRgbString(rgba);
        const hsvStr = rgbToHsvString(rgba);
        const hslStr = rgbToHslString(rgba);
        const oklabStr = rgbToOklabString(rgba);

        const overlay = document.createElement("div");
        overlay.className = "prompt-overlay";

        const dialog = document.createElement("div");
        dialog.className = "prompt-dialog color-preview-dialog";
        dialog.style.maxWidth = "420px";

        const toolbar = document.createElement("div");
        toolbar.className = "toolbar";
        const left = document.createElement("div"); left.className = "toolbar-left";
        const center = document.createElement("div"); center.className = "toolbar-center";
        const right = document.createElement("div"); right.className = "toolbar-right";
        
        // Hidden select for scheme value tracking
        const schemeSelect = document.createElement("select");
        schemeSelect.style.display = "none";
        schemeSelect.innerHTML = `
            <option value="none">None</option>
            <option value="complementary">Complementary</option>
            <option value="monochromatic">Monochromatic</option>
            <option value="analogous">Analogous</option>
            <option value="triadic">Triadic</option>
            <option value="tetradic">Tetradic</option>
        `;
        schemeSelect.value = schemeType;
        
        // Scheme dropdown menu
        const dropdown = document.createElement("div");
        dropdown.className = "dropdown";
        
        const menuButton = document.createElement("button");
        menuButton.className = "icon-button";
        menuButton.setAttribute("translate", "no");
        menuButton.title = "Color scheme";
        menuButton.textContent = "more_vert";
        
        const dropdownMenuId = "color-scheme-menu-" + Math.random().toString(36).substr(2, 9);
        
        const dropdownContent = document.createElement("div");
        dropdownContent.className = "dropdown-content menu align-left";
        dropdownContent.id = dropdownMenuId;
        dropdownContent.style.minWidth = "150px";
        
        // Scheme options
        const schemes = [
            { value: "none", label: "None" },
            { value: "complementary", label: "Complementary" },
            { value: "monochromatic", label: "Monochromatic" },
            { value: "analogous", label: "Analogous" },
            { value: "triadic", label: "Triadic" },
            { value: "tetradic", label: "Tetradic" }
        ];
        
        schemes.forEach((scheme, index) => {
            const btn = document.createElement("button");
            btn.className = "text-button";
            btn.textContent = scheme.label;
            
            if (schemeType === scheme.value) {
                btn.style.backgroundColor = "var(--hover-color)";
            }
            
            btn.addEventListener("mouseup", () => {
                schemeSelect.value = scheme.value;
                updateScheme();
                
                // Update button styling
                dropdownContent.querySelectorAll("button").forEach(b => {
                    b.style.backgroundColor = "";
                });
                btn.style.backgroundColor = "var(--hover-color)";
                
                dropdown.classList.remove("show");
                hideAllMenus();
            });
            
            dropdownContent.appendChild(btn);
        });
        
        menuButton.addEventListener("mousedown", (e) => {
            e.preventDefault();
            toggleDropdown(dropdownMenuId);
        });
        
        dropdown.appendChild(menuButton);
        dropdown.appendChild(dropdownContent);
        left.appendChild(dropdown);
        
        const closeButton = document.createElement("button");
        closeButton.textContent = "close";
        closeButton.className = "icon-button dialog-window-control";
        closeButton.setAttribute("translate", "no");
        right.appendChild(closeButton);
        toolbar.appendChild(left); toolbar.appendChild(center); toolbar.appendChild(right);

        const preview = document.createElement("div");
        preview.className = "color-info-preview";
        preview.style.background = colorString;

        // Scheme colors container
        const schemeColorsContainer = document.createElement("div");
        schemeColorsContainer.id = "color-scheme-colors";

        const inputList = document.createElement("div");
        inputList.className = "color-info-list";

        inputList.appendChild(createRow("Hex", hex, "Hexadecimal color representation"));
        inputList.appendChild(createRow("RGB", rgbStr, "Red, Green, Blue (and Alpha) color model"));
        inputList.appendChild(createRow("HSL", hslStr, "Hue, Saturation, Lightness color model"));
        inputList.appendChild(createRow("HSV", hsvStr, "Hue, Saturation, Value color model"));
        inputList.appendChild(createRow("OKLab", oklabStr, "Perceptually uniform color space"));

        // Scheme colors container (used for menu)
        const schemeContainer = document.createElement("div");
        schemeContainer.id = "color-scheme-container";

        function updateScheme() {
            schemeColorsContainer.innerHTML = "";
            if (schemeSelect.value !== "none") {
                const schemeColors = getColorScheme(rgba, schemeSelect.value);
                createColorSchemeGrid(schemeColors, schemeSelect.value, schemeColorsContainer);
            }
        }

        updateScheme();
        schemeSelect.addEventListener("change", updateScheme);

        dialog.appendChild(toolbar);
        dialog.appendChild(preview);
        dialog.appendChild(schemeColorsContainer);
        dialog.appendChild(inputList);
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        function cleanup() {
            if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
            resolve();
        }

        closeButton.addEventListener("click", cleanup);
        overlay.addEventListener("keydown", (e) => {
            if (e.key === "Escape") cleanup();
        });

        // focus first input
        const firstInput = inputList.querySelector("input");
        if (firstInput) firstInput.focus();
    });
}

async function promptMacroInfo(macro = {}) {
    return new Promise((resolve) => {
        const overlay = document.createElement("div");
        overlay.className = "prompt-overlay";

        const dialog = document.createElement("div");
        dialog.className = "prompt-dialog";
        dialog.style.padding = "20px";

        const title = document.createElement("p");
        title.className = "prompt-title";
        title.textContent = "Edit macro info";
        title.setAttribute("data-locale","prompts.prompt-macro-info.title");
        dialog.appendChild(title);

        // NAME
        const nameLabel = document.createElement("label");
        nameLabel.textContent = "Name";
        nameLabel.setAttribute("data-locale","prompts.prompt-macro-info.name-label");
        const nameInput = document.createElement("input");
        nameInput.type = "text";
        nameInput.value = macro.name || "";
        dialog.appendChild(nameLabel);
        dialog.appendChild(nameInput);

        // DESCRIPTION
        const descLabel = document.createElement("label");
        descLabel.textContent = "Description";
        descLabel.setAttribute("data-locale","prompts.prompt-macro-info.desc-label");
        const descInput = document.createElement("input");
        descInput.type = "text";
        descInput.value = macro.description || "";
        dialog.appendChild(descLabel);
        dialog.appendChild(descInput);

        // AUTHOR
        const authLabel = document.createElement("label");
        authLabel.textContent = "Author";
        authLabel.setAttribute("data-locale","prompts.prompt-macro-info.auth-label");
        const authInput = document.createElement("input");
        authInput.type = "text";
        authInput.value = macro.author || "";
        dialog.appendChild(authLabel);
        dialog.appendChild(authInput);

        // ICON
        const iconLabel = document.createElement("label");
        iconLabel.textContent = "Icon (Material Symbols Rounded)";
        iconLabel.setAttribute("data-locale","prompts.prompt-macro-info.icon-label");
        dialog.appendChild(iconLabel);

        const iconRow = document.createElement("div");
        iconRow.style.display = "flex";
        iconRow.style.alignItems = "center";
        iconRow.style.marginBottom = "20px";
        dialog.appendChild(iconRow);

        const iconInput = document.createElement("input");
        iconInput.type = "text";
        iconInput.value = macro.icon || "action_key";
        iconInput.style.borderRadius = "15px 0px 0px 15px";
        iconInput.style.margin = "0";

        const iconDatalist = document.createElement("datalist");
        iconDatalist.id = "material-symbols-datalist";
        dialog.appendChild(iconDatalist);

        iconInput.setAttribute("list", iconDatalist.id);

        async function populateMaterialIconsDatalist() {
            const icons = await loadMaterialIcons();

            const fragment = document.createDocumentFragment();

            for (const name of icons) {
                const option = document.createElement("option");
                option.value = name;
                fragment.appendChild(option);
            }

            iconDatalist.appendChild(fragment);
        }

        const iconPreview = document.createElement("span");
        iconPreview.style.fontFamily = "Material Symbols Rounded";
        iconPreview.style.backgroundColor = "var(--field-color)";
        iconPreview.style.border = "1px solid var(--border-field-color)";
        iconPreview.style.borderLeft = "none";
        iconPreview.style.padding = "0px 15px 0px 5px";
        iconPreview.style.borderRadius = "0px 15px 15px 0px";
        iconPreview.style.fontSize = "28px";
        iconPreview.style.maxHeight = "33px";
        iconPreview.style.maxWidth = "33px";
        iconPreview.style.overflow = "hidden";
        iconPreview.style.userSelect = "none";
        iconPreview.textContent = iconInput.value;
        iconPreview.setAttribute("translate", "no");

        iconRow.appendChild(iconInput);
        iconRow.appendChild(iconPreview);

        iconInput.addEventListener("input", () => { iconPreview.textContent = iconInput.value || "action_key"; });
        iconInput.addEventListener("focus",() => { populateMaterialIconsDatalist(); }, { once: true } );

        // BUTTONS 
        const buttonContainer = document.createElement("div");
        buttonContainer.className = "prompt-buttons";

        const cancelButton = document.createElement("button");
        cancelButton.textContent = "Cancel";
        cancelButton.setAttribute("data-locale","generic.cancel");
        cancelButton.className = "prompt-button cancel";

        const submitButton = document.createElement("button");
        submitButton.textContent = "Save";
        submitButton.setAttribute("data-locale","generic.save");
        submitButton.className = "prompt-button submit";

        buttonContainer.appendChild(cancelButton);
        buttonContainer.appendChild(submitButton);
        dialog.appendChild(buttonContainer);

        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        function close(result) {
            document.body.removeChild(overlay);
            resolve(result);
        }

        cancelButton.onclick = () => close(null);
        submitButton.onclick = () =>
            close({
                name: nameInput.value,
                author: authInput.value,
                description: descInput.value,
                icon: iconInput.value
            });

        overlay.addEventListener("keydown", (ev) => {
            if (ev.key === "Escape") close(null);
            if (ev.key === "Enter") {
                close({
                    name: nameInput.value,
                    description: descInput.value,
                    icon: iconInput.value
                });
            }
        });

        translateWithin(overlay);

        nameInput.focus();
    });
}

let materialIconsCache = null;

async function loadMaterialIcons() {
    if (materialIconsCache) return materialIconsCache;

    const module = await import("./dictMaterialSymbols.js");
    materialIconsCache = module.default.MaterialIconsValues;
    return materialIconsCache;
}