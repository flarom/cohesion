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

function promptString(title, defaultText = "", warn = false) {
    return new Promise((resolve) => {
        // overlay
        const overlay = document.createElement("div");
        overlay.className = "prompt-overlay";

        // dialog
        const dialog = document.createElement("div");
        dialog.className = "prompt-dialog";
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

function promptMessage(htmlContent, showCloseButton = true, useBigDialog = false) {
    return new Promise((resolve) => {
        // overlay
        const overlay = document.createElement("div");
        overlay.className = "prompt-overlay";

        // dialog
        const dialog = document.createElement("div");
        dialog.className = useBigDialog ? "prompt-big-dialog" : "prompt-dialog";

        if (!useBigDialog) {
            dialog.style.width = "100%";
            dialog.style.maxWidth = "500px";
        }

        // html content
        const content = document.createElement("div");
        content.innerHTML = htmlContent;
        content.style.height = "100%";
        dialog.appendChild(content);

        const closeButton = document.createElement("button");
        closeButton.textContent = "close";
        closeButton.className = "icon-button dialog-window-control";
        closeButton.setAttribute("translate", "no");

        if (showCloseButton) {
            dialog.appendChild(closeButton);
        }

        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        function closePrompt() {
            document.body.removeChild(overlay);
            resolve();
        }

        closeButton.addEventListener("click", closePrompt);

        overlay.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === "Escape") {
                closePrompt();
            }
        });

        closeButton.focus();
    });
}

function showMessageFromFile(filePath, showCloseButton = true, useBigDialog = false, width = 400) {
    fetch(filePath)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Failed loading file: ${response.statusText}`);
            }
            return response.text();
        })
        .then((htmlContent) => {
            const overlay = document.createElement("div");
            overlay.className = "prompt-overlay";

            const dialog = document.createElement("div");
            if (useBigDialog) {
                dialog.className = "prompt-big-dialog";
            } else {
                dialog.className = "prompt-dialog";
                dialog.style.maxWidth = `${width}px`;
            }

            const okButton = document.createElement("button");
            okButton.textContent = "close";
            okButton.className = "icon-button dialog-window-control";
            okButton.setAttribute('translate', 'no');

            const content = document.createElement("div");

            const template = document.createElement("template");
            template.innerHTML = htmlContent.trim();

            Array.from(template.content.childNodes).forEach((node) => {
                content.appendChild(node);
            });

            dialog.appendChild(content);
            if (showCloseButton) dialog.appendChild(okButton);

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
                Array.from(oldScript.attributes).forEach((attr) => newScript.setAttribute(attr.name, attr.value));
                oldScript.replaceWith(newScript);
            });

            okButton.addEventListener("click", () => {
                document.body.removeChild(overlay);
            });

            overlay.addEventListener("keydown", (event) => {
                if (event.key === "Escape") {
                    document.body.removeChild(overlay);
                }
            });

            okButton.focus();
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

        const buttonContainer = document.createElement("div");
        buttonContainer.className = "prompt-buttons";

        const cancelButton = document.createElement("button");
        cancelButton.textContent = "close";
        cancelButton.className = "icon-button dialog-window-control";
        cancelButton.setAttribute('translate', 'no');
        buttonContainer.appendChild(cancelButton);

        dialog.appendChild(buttonContainer);
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

        cancelButton.addEventListener("click", () => {
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

        overlay.appendChild(dialog);
        document.body.appendChild(overlay);
        input.focus();

        let filtered = [];
        let selectedIndex = 0;

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

        const titleElement = document.createElement("p");
        titleElement.textContent = title;
        titleElement.className = "prompt-title";
        dialog.appendChild(titleElement);

        const buttonContainer = document.createElement("div");
        buttonContainer.className = "prompt-button-list";
        dialog.appendChild(buttonContainer);

        const titleButtonContainer = document.createElement("div");
        titleButtonContainer.className = "prompt-buttons";
        dialog.appendChild(titleButtonContainer);

        const cancelButton = document.createElement("button");
        cancelButton.textContent = "close";
        cancelButton.className = "icon-button dialog-window-control";
        cancelButton.setAttribute('translate', 'no');
        cancelButton.addEventListener("click", () => {
            document.body.removeChild(overlay);
            resolve(null);
        });
        titleButtonContainer.appendChild(cancelButton);

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

function promptSaveFile(fileId) {
    const overlay = document.createElement("div");
    overlay.className = "prompt-overlay";

    const dialog = document.createElement("div");
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

    function closePrompt(returnNull) {
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
                const htmlContainer = document.createElement("html");
                htmlContainer.lang = "en";
                htmlContainer.innerHTML = `
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>${fileNameField.value}</title>
                        <style>
                            body {
                                max-width: 900px;
                                margin: 0 auto;
                            }
                        </style>
                    </head>
                    <body>
                        ${converter.makeHtml(getFileText(fileId))}
                    </body>
                `;

                const blob = new Blob(["<!DOCTYPE html>\n" + htmlContainer.outerHTML], { type: "text/html" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = fileNameField.value + ".html";
                a.click();
                URL.revokeObjectURL(url);
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