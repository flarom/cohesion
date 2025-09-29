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

    document.querySelectorAll(".sidebar").forEach((s) => {
        if (s !== sidebar) {
            s.classList.remove("show");
        }
    });

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
        setTimeout(() => el.remove(), 300);
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
        if (dangerous) {
            yesButton.className = "prompt-button danger";
        } else {
            yesButton.className = "prompt-button submit";
        }

        const noButton = document.createElement("button");
        noButton.textContent = "No";
        noButton.className = "prompt-button cancel";

        buttonContainer.appendChild(noButton);
        buttonContainer.appendChild(yesButton);
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
            <option value='pVimeo'>Vimeo Video</option>
            <option value='pBluesky'>Bluesky Post</option>
            <option value='pX'>X (Twitter) Post</option>
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
                case "pVimeo":
                    resolve(insertVimeoVideo(contentField.value));
                    break;
                case "pBluesky":
                    resolve(insertBlueskyPost(contentField.value));
                    break;
                case "pX":
                    resolve(insertXPost(contentField.value));
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

async function promptFileSearch() {
    return new Promise((resolve) => {
        const overlay = document.createElement("div");
        overlay.className = "prompt-overlay";

        const dialog = document.createElement("div");
        dialog.style.padding = "20px";
        dialog.className = "prompt-dialog";

        const title = document.createElement("p");
        title.textContent = "Search files...";
        title.className = "prompt-title";
        dialog.appendChild(title);

        const input = document.createElement("input");
        input.type = "text";
        input.placeholder = 'Search title, ~author, @date, #tag or "text"';
        dialog.appendChild(input);

        const previewList = document.createElement("ul");
        previewList.className = "prompt-preview-list";
        previewList.style.marginTop = "8px";
        dialog.appendChild(previewList);

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
            const authors = (metadata.authors || "")
                .toLowerCase()
                .split(",")
                .map((a) => a.trim());
            const tags = (metadata.tags || "")
                .toLowerCase()
                .split(",")
                .map((t) => t.trim());
            const date = (metadata.date || "").toLowerCase();
            const description = (metadata.description || "").toLowerCase();
            const body = text.toLowerCase();

            const lowerQuery = query.toLowerCase();

            if (lowerQuery.startsWith("#")) {
                const tagQuery = lowerQuery.slice(1);
                return tags.some((t) => t.includes(tagQuery));
            }

            if (lowerQuery.startsWith("~")) {
                const authorQuery = lowerQuery.slice(1);
                return authors.some((a) => a.includes(authorQuery));
            }

            if (lowerQuery.startsWith("@")) {
                const dateQuery = lowerQuery.slice(1);
                return date.includes(dateQuery);
            }

            if (lowerQuery.startsWith('"') && lowerQuery.endsWith('"')) {
                const textQuery = lowerQuery.slice(1, -1);
                return body.includes(textQuery);
            }

            return title.includes(lowerQuery);
        }

        function updatePreview() {
            const query = input.value.trim();
            filtered = [];

            if (query) {
                filtered = files
                    .map((_, i) => ({
                        index: i,
                        title: getFileTitle(i) || `New document`,
                    }))
                    .filter((file) => matchFile(query, file.index))
                    .slice(0, 10);
            }

            previewList.innerHTML = "";
            filtered.forEach((item, i) => {
                const li = document.createElement("li");
                li.textContent = item.title;
                li.className = i === selectedIndex ? "selected-option" : "";
                previewList.appendChild(li);
            });
        }

        function closePrompt(result) {
            document.body.removeChild(overlay);
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
                    closePrompt(filtered[selectedIndex].index);
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

function promptSelect(title, options) {
    return new Promise((resolve) => {
        const overlay = document.createElement("div");
        overlay.className = "prompt-overlay";

        const dialog = document.createElement("div");
        dialog.className = "prompt-dialog";

        const buttonContainer = document.createElement("div");
        buttonContainer.className = "prompt-button-list";
        dialog.appendChild(buttonContainer);

        const toolbar = document.createElement("div");
        toolbar.className = "toolbar";

        const leftDiv = document.createElement("div");
        leftDiv.className = "toolbar-left";
        leftDiv.innerHTML = `<span>${title}</span>`;

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
        closeButton.addEventListener("click", () => {
            document.body.removeChild(overlay);
            resolve(null);
        });

        toolbar.appendChild(leftDiv);
        toolbar.appendChild(centerDiv);
        toolbar.appendChild(rightDiv);

        rightDiv.appendChild(closeButton);

        dialog.appendChild(toolbar);

        const buttons = options.map((optionText, index) => {
            const button = document.createElement("button");
            button.innerHTML = optionText;
            button.className = "prompt-button";
            buttonContainer.appendChild(button);
            button.addEventListener("click", () => closePrompt(index));
            return button;
        });

        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        let selectedIndex = 0;
        updateSelection();

        function updateSelection() {
            buttons.forEach((btn, i) => {
                if (i === selectedIndex) {
                    btn.classList.add("selected-option");
                    btn.focus();
                } else {
                    btn.classList.remove("selected-option");
                }
            });
        }

        function closePrompt(result) {
            document.body.removeChild(overlay);
            resolve(result);
        }

        overlay.addEventListener("keydown", (event) => {
            if (event.key === "ArrowDown") {
                event.preventDefault();
                selectedIndex = (selectedIndex + 1) % options.length;
                updateSelection();
            } else if (event.key === "ArrowUp") {
                event.preventDefault();
                selectedIndex = (selectedIndex - 1 + options.length) % options.length;
                updateSelection();
            } else if (event.key === "Enter") {
                event.preventDefault();
                closePrompt(selectedIndex);
            } else if (event.key === "Escape") {
                closePrompt(null);
            }
        });

        overlay.tabIndex = -1;
        overlay.focus();
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
                        const dataUrl = await resolveFSItem(fileName);
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
                    authors: "*",
                    date: "*",
                    tags: "uncategorized",
                    description: "*",
                };

                const meta = { ...defaultMeta, ...metadata };

                // HTML meta
                const metaTags = `
                    <meta name="title" content="${meta.title}">
                    <meta name="author" content="${meta.authors}">
                    <meta name="date" content="${meta.date}">
                    <meta name="keywords" content="${meta.tags}">
                    <meta name="description" content="${meta.description}">
                `;

                // Build HTML file
                const htmlContainer = document.createElement("html");
                htmlContainer.lang = "en";
                htmlContainer.innerHTML = `
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${fileNameField.value}</title>
            ${metaTags}
            <!-- cohesion basic style for md documents -->
            <style>
                body {
                    max-width: 900px;
                    margin: 0 auto;
                    * { max-width: 900px; }
                }
                table { border-collapse: collapse; }
                table, th, td { border: 1px solid black; }
                th, td { padding: 5px; text-align: left; }
            </style>
        </head>
        <body>
            ${tempDiv.innerHTML}
        </body>
    `;

                // Create ZIP
                const zip = new JSZip();
                zip.file("index.html", "<!DOCTYPE html>\n" + htmlContainer.outerHTML);

                // Add resources
                await Promise.all(usedResources.map(async (fileName) => {
                    const dataUrl = await resolveFSItem(fileName);
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
    overlay.tabIndex = 0; // necessário para capturar keydown

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

    // Botão de tela cheia
    const fullscreenButton = document.createElement("button");
    fullscreenButton.textContent = "open_in_full";
    fullscreenButton.className = "icon-button";
    leftDiv.appendChild(fullscreenButton);

    // Botão de download (agora no painel direito)
    const downloadButton = document.createElement("a");
    downloadButton.textContent = "download";
    downloadButton.className = "icon-button";
    downloadButton.setAttribute("href", filePath);
    downloadButton.setAttribute("download", "");
    downloadButton.style.textDecoration = "none";
    downloadButton.style.color = "var(--text-color)";
    rightDiv.appendChild(downloadButton);

    // Botão de close
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
        const dataUrl = await resolveFSItem(fileName);
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