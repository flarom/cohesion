// MARK: Dropdown Menu Logic
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

function hideAllMenus() {
    document.querySelectorAll('.dropdown').forEach(d => d.classList.remove('show'));
}

const dialogControllerStack = [];

function ensureDialogBridge() {
    if (window.__cohesionDialogBridgeInstalled) {
        return;
    }

    const resolveTopDialog = (method, value) => {
        const controller = dialogControllerStack[dialogControllerStack.length - 1];
        if (controller && typeof controller[method] === "function") {
            controller[method](value);
            return true;
        }
        return false;
    };

    if (typeof window.dialogReturn !== "function") {
        window.dialogReturn = (value) => resolveTopDialog("return", value);
    }

    if (typeof window.dialogCancel !== "function") {
        window.dialogCancel = (value = null) => resolveTopDialog("cancel", value);
    }

    if (typeof window.dialogArgs !== "function") {
        window.dialogArgs = () => {
            const controller = dialogControllerStack[dialogControllerStack.length - 1];
            return controller ? controller.args : {};
        };
    }

    window.cohesionDialogReturn = (value) => resolveTopDialog("return", value);
    window.cohesionDialogCancel = (value = null) => resolveTopDialog("cancel", value);
    window.cohesionDialogArgs = () => {
        const controller = dialogControllerStack[dialogControllerStack.length - 1];
        return controller ? controller.args : {};
    };
    window.__cohesionDialogBridgeInstalled = true;
}

function closeAllDialogs() {
    while (dialogControllerStack.length > 0) {
        const controller = dialogControllerStack.pop();
        if (controller && typeof controller.cancel === "function") {
            controller.cancel();
        }
    }
}

function getDialogOverlay(dialogId = null) {
    if (typeof dialogId === "string" && dialogId.trim()) {
        const escapedId = typeof CSS !== "undefined" && typeof CSS.escape === "function"
            ? CSS.escape(dialogId)
            : dialogId;

        const byDataId = document.querySelector(`dialog.dialog-overlay[data-dialog-id="${escapedId}"]`);
        if (byDataId) {
            return byDataId;
        }

        const byElementId = document.getElementById(dialogId);
        if (byElementId && byElementId.matches("dialog.dialog-overlay")) {
            return byElementId;
        }

        return null;
    }

    const openOverlays = Array.from(document.querySelectorAll("dialog.dialog-overlay[open]"));
    if (openOverlays.length > 0) {
        return openOverlays[openOverlays.length - 1];
    }

    const overlays = Array.from(document.querySelectorAll("dialog.dialog-overlay"));
    return overlays.length > 0 ? overlays[overlays.length - 1] : null;
}

function setToolbarSectionContent(section, content) {
    if (!(section instanceof HTMLElement)) {
        return;
    }

    if (content instanceof Node) {
        section.replaceChildren(content);
    } else if (Array.isArray(content)) {
        section.replaceChildren(...content.map((item) =>
            item instanceof Node ? item : document.createTextNode(String(item ?? ""))
        ));
    } else {
        section.innerHTML = String(content ?? "");
    }

    if (typeof translateWithin === "function") {
        translateWithin(section);
    }
}

function updateDialogToolbarSection(sectionClass, content, dialogId = null) {
    const overlay = getDialogOverlay(dialogId);
    if (!overlay) {
        console.warn("No dialog found to update toolbar section.");
        return false;
    }

    const section = overlay.querySelector(`.toolbar .${sectionClass}`);
    if (!(section instanceof HTMLElement)) {
        console.warn(`Toolbar section not found: ${sectionClass}`);
        return false;
    }

    setToolbarSectionContent(section, content);
    return true;
}

function updateDialogToolbarLeft(content, dialogId = null) {
    return updateDialogToolbarSection("toolbar-left", content, dialogId);
}

function updateDialogToolbarCenter(content, dialogId = null) {
    return updateDialogToolbarSection("toolbar-center", content, dialogId);
}

function updateDialogToolbarRight(content, dialogId = null) {
    return updateDialogToolbarSection("toolbar-right", content, dialogId);
}

function setHorizontalScroll(element, smooth = false) {
    element.addEventListener("wheel", (e) => {
        if (e.deltaY === 0) return; // only handle vertical scroll

        e.preventDefault();
        element.scrollBy({
            left: e.deltaY,
            behavior: smooth ? "smooth" : "auto"
        });
    });
}

// MARK: dialog pages
function toggleDialogPage(pageId) {
    // Find the dialog overlay that contains this call
    const dialog = document.querySelector('dialog.dialog-overlay[open]');
    if (!dialog) return;

    // Get all pages within the dialog-content
    const dialogContent = dialog.querySelector('.dialog-content');
    if (!dialogContent) return;

    const pages = dialogContent.querySelectorAll('.dialog-page');
    pages.forEach(page => page.classList.remove('active'));

    // Show the selected page
    const targetPage = dialogContent.querySelector(`#dialog-page-${pageId}`);
    if (targetPage) {
        targetPage.classList.add('active');
    } else {
        console.warn(`Dialog page with id "dialog-page-${pageId}" not found.`);
    }
}

// MARK: Show Dialog File
async function showDialogFile(filePath, args = {}) {
    try {
        ensureDialogBridge();

        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`Failed loading file: ${response.statusText}`);
        }

        const htmlContent = await response.text();

        // parse dialog html
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, "text/html");
        const sourceUrl = new URL(filePath, window.location.href);
        const dialogArgs = args && typeof args === "object" ? args : {};

        // meta helpers
        const getMeta = (name, fallback = null) => {
            const meta = doc.querySelector(`meta[name="${name}"]`);
            return meta ? meta.content : fallback;
        };

        const getMetaBool = (name, fallback = true) => {
            const value = getMeta(name);
            if (value === null) return fallback;
            return ["true", "1", "yes", "on"].includes(value.toLowerCase());
        };

        const getMetaInt = (name, fallback) => {
            const value = parseInt(getMeta(name), 10);
            return Number.isFinite(value) ? value : fallback;
        };

        // meta settings
        const showCloseButton = getMetaBool("dialog-show-close-button", true);
        const useBigDialog = getMetaBool("dialog-big", false);
        const showAnimation = getMetaBool("dialog-animate", true);
        const showBg = getMetaBool("dialog-show-bg", true);
        const width = getMetaInt("dialog-prefered-width", getMetaInt("dialog-preferred-width", 400));
        const height = getMetaInt("dialog-prefered-height", getMetaInt("dialog-preferred-height", 0));

        const toolbarLeft = getMeta("dialog-toolbar-left", "");
        const toolbarCenter = getMeta("dialog-toolbar-center", "");
        const toolbarRight = getMeta("dialog-toolbar-right", "");
        const toolbarOverlay = getMetaBool("dialog-toolbar-overlay", true);

        // inject dialog css
        const dialogId = crypto.randomUUID();
        const injectedStyles = [];

        doc.querySelectorAll("style").forEach((style) => {
            const clone = document.createElement("style");
            clone.textContent = style.textContent;
            clone.dataset.dialogStyle = dialogId;
            document.head.appendChild(clone);
            injectedStyles.push(clone);
        });

        doc.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
            const clone = document.createElement("link");
            const href = link.getAttribute("href");
            clone.rel = "stylesheet";
            clone.href = href ? new URL(href, sourceUrl).toString() : "";
            clone.dataset.dialogStyle = dialogId;
            document.head.appendChild(clone);
            injectedStyles.push(clone);
        });

        const previousFocusedElement = document.activeElement instanceof HTMLElement
            ? document.activeElement
            : null;

        // dialog host + panel
        const dialog = document.createElement("dialog");
        dialog.className = "dialog-overlay" + (showBg ? "" : "nobg");
        dialog.dataset.dialog = "";
        dialog.dataset.dialogId = dialogId;

        if (!useBigDialog) {
            dialog.style.maxWidth = `${width}px`;
            if (height > 0) {
                dialog.style.height = "100%";
                dialog.style.maxHeight = `${height}px`;
            }
        }

        if (!showAnimation) {
            dialog.classList.add("no-animation");
        }

        // toolbar
        const toolbar = document.createElement("div");
        toolbar.className = "toolbar";

        if (!toolbarOverlay) {
            toolbar.classList.add("no-overlay");
        }

        const left = document.createElement("div");
        left.className = "toolbar-left";
        left.innerHTML = toolbarLeft;

        const center = document.createElement("div");
        center.className = "toolbar-center";
        center.innerHTML = toolbarCenter;

        const right = document.createElement("div");
        right.className = "toolbar-right";
        right.innerHTML = toolbarRight;

        const closeButton = document.createElement("button");
        closeButton.textContent = "close";
        closeButton.className = "icon-button dialog-window-control";
        closeButton.setAttribute("translate", "no");

        if (showCloseButton) {
            right.appendChild(closeButton);
        }

        toolbar.append(left, center, right);

        // content
        const content = document.createElement("div");
        content.className = "dialog-content";
        content.append(...doc.body.childNodes);

        if (!useBigDialog) {
            content.style.maxWidth = `${width}px`;
            if (height > 0) {
                content.style.height = "100%";
                if (!toolbarOverlay) {
                    content.style.maxWidth = `calc(${width}px - 48px)`;
                } else {
                    content.style.maxHeight = `${height}px`;
                }
            }
        }

        dialog.append(toolbar, content);
        document.body.appendChild(dialog);

        translateWithin(dialog);

        return await new Promise((resolve) => {
            const cleanup = () => {
                const idx = dialogControllerStack.indexOf(controller);
                if (idx >= 0) {
                    dialogControllerStack.splice(idx, 1);
                }

                injectedStyles.forEach((el) => el.remove());
                dialog.removeEventListener("close", onClose);
                dialog.remove();

                if (previousFocusedElement) {
                    previousFocusedElement.focus();
                }
            };

            const controller = {
                args: dialogArgs,
                return(value) {
                    dialog.__dialogResult = value;
                    if (dialog.open) {
                        dialog.close("return");
                    }
                },
                cancel(value = null) {
                    dialog.__dialogResult = value;
                    if (dialog.open) {
                        dialog.close("cancel");
                    }
                },
                close() {
                    if (dialog.open) {
                        dialog.close("close");
                    }
                }
            };

            const onClose = () => {
                const hasDialogResult = Object.prototype.hasOwnProperty.call(dialog, "__dialogResult");
                const result = hasDialogResult
                    ? dialog.__dialogResult
                    : dialog.returnValue && !["close", "cancel"].includes(dialog.returnValue)
                        ? dialog.returnValue
                        : null;

                cleanup();
                resolve(result);
            };

            dialogControllerStack.push(controller);

            // Execute embedded dialog scripts only after the controller exists,
            // so dialogArgs() can read this dialog initialization data.
            content.querySelectorAll("script").forEach((oldScript) => {
                const newScript = document.createElement("script");

                if (oldScript.src) {
                    const src = oldScript.getAttribute("src");
                    newScript.src = src ? new URL(src, sourceUrl).toString() : "";
                } else {
                    newScript.textContent = oldScript.textContent;
                }

                [...oldScript.attributes].forEach((attr) =>
                    newScript.setAttribute(attr.name, attr.value)
                );

                oldScript.replaceWith(newScript);
            });

            closeButton.addEventListener("click", () => controller.close());
            dialog.addEventListener("close", onClose, { once: true });

            if (typeof dialog.showModal === "function") {
                dialog.showModal();
            } else {
                dialog.setAttribute("open", "open");
            }

            const focusable = dialog.querySelector(
                "[autofocus], [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
            );

            if (focusable instanceof HTMLElement) {
                focusable.focus();
                console.log("Focused element in dialog:", focusable);
            }
        });
    } catch (error) {
        console.error(error);
        throw error;
    }
}

// MARK: Show Confirm Dialog
async function showConfirmDialog(options = {}) {
    ensureDialogBridge();

    const defaults = {
        message: "message",
        detail: "detail",
        confirmButtonText: getTranslation("common.yes", "Yes"),
        confirmButtonDestructive: false,
        denyButtonText: getTranslation("common.no", "No"),
        showDenyButton: true,
        cancelButtonText: getTranslation("common.cancel", "Cancel"),
        showCancelButton: false,
        showCloseButton: false
    };

    const config = {
        ...defaults,
        ...(options && typeof options === "object" ? options : {})
    };

    const previousFocusedElement = document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const overlay = document.createElement("dialog");
    overlay.className = "dialog-overlay";
    overlay.dataset.dialog = "";
    overlay.dataset.dialogId = crypto.randomUUID();

    const dialog = document.createElement("div");
    dialog.style.userSelect = "none";
    dialog.className = "prompt-dialog";

    const toolbar = document.createElement("div");
    toolbar.className = "toolbar";

    const left = document.createElement("div");
    left.className = "toolbar-left";

    const center = document.createElement("div");
    center.className = "toolbar-center";

    const right = document.createElement("div");
    right.className = "toolbar-right";

    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.textContent = "close";
    closeButton.className = "icon-button dialog-window-control";
    closeButton.setAttribute("translate", "no");

    toolbar.append(left, center, right);

    const content = document.createElement("form");
    content.className = "padding";
    content.method = "dialog";

    const message = document.createElement("h3");
    message.style.margin = "0"
    message.style.marginTop = "4px";
    message.style.marginBottom = "4px";
    message.textContent = String(config.message ?? defaults.message);

    const detail = document.createElement("p");
    detail.textContent = String(config.detail ?? "");
    if (!detail.textContent.trim()) {
        detail.hidden = true;
    }

    const buttonGroup = document.createElement("div");
    buttonGroup.className = "button-row";

    const confirmButton = document.createElement("button");
    confirmButton.type = "button";
    confirmButton.textContent = String(config.confirmButtonText ?? defaults.confirmButtonText);
    confirmButton.className = `text-button ${config.confirmButtonDestructive ? "danger" : "primary"}`;

    const denyButton = document.createElement("button");
    denyButton.type = "button";
    denyButton.textContent = String(config.denyButtonText ?? defaults.denyButtonText);
    denyButton.className = "text-button";

    const cancelButton = document.createElement("button");
    cancelButton.type = "button";
    cancelButton.textContent = String(config.cancelButtonText ?? defaults.cancelButtonText);
    cancelButton.className = "text-button";

    if (config.showCancelButton) {
        buttonGroup.appendChild(cancelButton);
    }
    
    if (config.showDenyButton) {
        buttonGroup.appendChild(denyButton);
    }
    
    buttonGroup.appendChild(confirmButton);

    if (config.showCloseButton) {
        right.appendChild(closeButton);
    }

    content.append(message, detail, buttonGroup);
    dialog.append(toolbar, content);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    translateWithin(overlay);

    return await new Promise((resolve) => {
        const cleanup = () => {
            const idx = dialogControllerStack.indexOf(controller);
            if (idx >= 0) {
                dialogControllerStack.splice(idx, 1);
            }

            overlay.removeEventListener("close", onClose);
            overlay.removeEventListener("cancel", onCancel);
            overlay.remove();

            if (previousFocusedElement) {
                previousFocusedElement.focus();
            }
        };

        const controller = {
            args: config,
            return(value) {
                overlay.__dialogResult = value;
                if (overlay.open) {
                    overlay.close("return");
                }
            },
            cancel(value = null) {
                overlay.__dialogResult = value;
                if (overlay.open) {
                    overlay.close("cancel");
                }
            },
            close() {
                if (overlay.open) {
                    overlay.close("close");
                }
            }
        };

        const onClose = () => {
            const hasDialogResult = Object.prototype.hasOwnProperty.call(overlay, "__dialogResult");
            const result = hasDialogResult ? overlay.__dialogResult : null;

            cleanup();
            resolve(result);
        };

        const onCancel = (event) => {
            event.preventDefault();
            controller.cancel(null);
        };

        dialogControllerStack.push(controller);

        confirmButton.addEventListener("click", () => controller.return(true));
        denyButton.addEventListener("click", () => controller.return(false));
        cancelButton.addEventListener("click", () => controller.cancel(null));
        closeButton.addEventListener("click", () => controller.cancel(null));

        overlay.addEventListener("close", onClose, { once: true });
        overlay.addEventListener("cancel", onCancel);

        if (typeof overlay.showModal === "function") {
            overlay.showModal();
        } else {
            overlay.setAttribute("open", "open");
        }

        confirmButton.focus();
    });

}

// MARK: Show Input Dialog
async function showInputDialog(options = {}) {
    ensureDialogBridge();

    const defaults = {
        label: "label",
        defaultValue: "",
        type: "text",
        confirmButtonText: getTranslation("common.ok", "OK"),
        cancelButtonText: getTranslation("common.cancel", "Cancel")
    };

    const config = {
        ...defaults,
        ...(options && typeof options === "object" ? options : {})
    };

    const previousFocusedElement = document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const overlay = document.createElement("dialog");
    overlay.className = "dialog-overlay";
    overlay.dataset.dialog = "";
    overlay.style.maxWidth = "fit-content";
    overlay.dataset.dialogId = crypto.randomUUID();

    const dialog = document.createElement("div");
    dialog.className = "prompt-dialog";

    const content = document.createElement("main");
    content.className = "padding";
    content.method = "dialog";

    const inputSect = document.createElement("section");

    const inputRow = document.createElement("div");
    inputRow.className = "row";

    const label = document.createElement("label");
    label.textContent = String(config.label ?? "");

    const input = document.createElement("input");
    input.type = String(config.type || "text");
    input.value = String(config.defaultValue ?? "");

    const buttonGroup = document.createElement("div");
    buttonGroup.className = "button-row";

    const cancelButton = document.createElement("button");
    cancelButton.type = "button";
    cancelButton.textContent = String(config.cancelButtonText ?? defaults.cancelButtonText);
    cancelButton.className = "text-button";

    const confirmButton = document.createElement("button");
    confirmButton.type = "button";
    confirmButton.textContent = String(config.confirmButtonText ?? defaults.confirmButtonText);
    confirmButton.className = "text-button primary";

    inputRow.append(label, input);
    inputSect.append(inputRow);
    buttonGroup.append(cancelButton, confirmButton);
    content.append(inputSect, buttonGroup);

    dialog.append(content);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    translateWithin(overlay);

    return await new Promise((resolve) => {
        const cleanup = () => {
            const idx = dialogControllerStack.indexOf(controller);
            if (idx >= 0) {
                dialogControllerStack.splice(idx, 1);
            }

            overlay.removeEventListener("close", onClose);
            overlay.removeEventListener("cancel", onCancel);
            overlay.remove();

            if (previousFocusedElement) {
                previousFocusedElement.focus();
            }
        };

        const controller = {
            args: config,
            return(value) {
                overlay.__dialogResult = value;
                if (overlay.open) {
                    overlay.close("return");
                }
            },
            cancel(value = null) {
                overlay.__dialogResult = value;
                if (overlay.open) {
                    overlay.close("cancel");
                }
            },
            close() {
                if (overlay.open) {
                    overlay.close("close");
                }
            }
        };

        const onClose = () => {
            const hasDialogResult = Object.prototype.hasOwnProperty.call(overlay, "__dialogResult");
            const result = hasDialogResult ? overlay.__dialogResult : null;

            cleanup();
            resolve(result);
        };

        const onCancel = (event) => {
            event.preventDefault();
            controller.cancel(null);
        };

        dialogControllerStack.push(controller);

        confirmButton.addEventListener("click", () => controller.return(input.value));
        cancelButton.addEventListener("click", () => controller.cancel(null));

        input.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                controller.return(input.value);
            }
        });

        overlay.addEventListener("close", onClose, { once: true });
        overlay.addEventListener("cancel", onCancel);

        if (typeof overlay.showModal === "function") {
            overlay.showModal();
        } else {
            overlay.setAttribute("open", "open");
        }

        input.focus();
        input.select();
    });
}

// MARK: Show Text Editor Dialog
async function showTextEditorDialog(options = {}) {
    ensureDialogBridge();

    const defaults = {
        value: "",
        mode: "javascript",
        label: "",
        confirmButtonText: getTranslation("common.ok", "OK"),
        showConfirmButton: true,
        showCloseButton: true
    };

    const config = {
        ...defaults,
        ...(options && typeof options === "object" ? options : {})
    };

    const previousFocusedElement = document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const overlay = document.createElement("dialog");
    overlay.className = "dialog-overlay";
    overlay.dataset.dialog = "";
    overlay.dataset.dialogId = crypto.randomUUID();
    overlay.style.width = "calc(100vw - 24px)";
    overlay.style.maxWidth = "min(1100px, calc(100vw - 24px))";
    overlay.style.height = "calc(100vh - 24px)";
    overlay.style.maxHeight = "calc(100vh - 24px)";

    const dialog = document.createElement("div");
    dialog.className = "prompt-big-dialog";
    dialog.style.height = "100%";
    dialog.style.display = "flex";
    dialog.style.flexDirection = "column";

    const toolbar = document.createElement("div");
    toolbar.className = "toolbar";

    const left = document.createElement("div");
    left.className = "toolbar-left";

    const center = document.createElement("div");
    center.className = "toolbar-center";

    const right = document.createElement("div");
    right.className = "toolbar-right";

    const copyButton = document.createElement("button");
    copyButton.type = "button";
    copyButton.textContent = "content_copy";
    copyButton.className = "icon-button";
    copyButton.setAttribute("translate", "no");

    const pasteButton = document.createElement("button");
    pasteButton.type = "button";
    pasteButton.textContent = "content_paste";
    pasteButton.className = "icon-button";
    pasteButton.setAttribute("translate", "no");

    const cutButton = document.createElement("button");
    cutButton.type = "button";
    cutButton.textContent = "content_cut";
    cutButton.className = "icon-button";
    cutButton.setAttribute("translate", "no");

    const separator = document.createElement("hr");
    separator.style.margin = "0";
    separator.style.width = "1px";
    separator.style.height = "26px";
    separator.style.border = "none";
    separator.style.borderLeft = "1px solid var(--border-light-color)";

    const undoButton = document.createElement("button");
    undoButton.type = "button";
    undoButton.textContent = "undo";
    undoButton.className = "icon-button";
    undoButton.setAttribute("translate", "no");

    const redoButton = document.createElement("button");
    redoButton.type = "button";
    redoButton.textContent = "redo";
    redoButton.className = "icon-button";
    redoButton.setAttribute("translate", "no");

    const confirmButton = document.createElement("button");
    confirmButton.type = "button";
    confirmButton.textContent = "check";
    confirmButton.className = "icon-button";
    confirmButton.setAttribute("translate", "no");
    confirmButton.title = String(config.confirmButtonText ?? defaults.confirmButtonText);
    confirmButton.setAttribute("aria-label", String(config.confirmButtonText ?? defaults.confirmButtonText));

    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.textContent = "close";
    closeButton.className = "icon-button dialog-window-control";
    closeButton.setAttribute("translate", "no");

    left.append(copyButton, pasteButton, cutButton, separator, undoButton, redoButton);

    if (config.label) {
        center.textContent = String(config.label);
    }

    if (config.showConfirmButton) {
        right.append(confirmButton);
    }
    if (config.showCloseButton) {
        right.append(closeButton);
    }

    toolbar.append(left, center, right);

    const content = document.createElement("div");
    content.className = "dialog-content";
    content.style.paddingTop = "52px";
    content.style.height = "100%";
    content.style.display = "flex";
    content.style.flexDirection = "column";
    content.style.boxSizing = "border-box";

    const textarea = document.createElement("textarea");
    textarea.value = String(config.value ?? "");
    textarea.style.width = "100%";
    textarea.style.height = "100%";

    content.appendChild(textarea);
    dialog.append(toolbar, content);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    translateWithin(overlay);

    return await new Promise((resolve) => {
        const cleanup = () => {
            const idx = dialogControllerStack.indexOf(controller);
            if (idx >= 0) {
                dialogControllerStack.splice(idx, 1);
            }

            overlay.removeEventListener("close", onClose);
            overlay.removeEventListener("cancel", onCancel);
            overlay.remove();

            if (previousFocusedElement) {
                previousFocusedElement.focus();
            }
        };

        const controller = {
            args: config,
            return(value) {
                overlay.__dialogResult = {
                    confirmed: true,
                    value
                };
                if (overlay.open) {
                    overlay.close("return");
                }
            },
            cancel(value = null) {
                overlay.__dialogResult = {
                    confirmed: false,
                    value
                };
                if (overlay.open) {
                    overlay.close("cancel");
                }
            },
            close() {
                if (overlay.open) {
                    overlay.close("close");
                }
            }
        };

        const onClose = () => {
            const hasDialogResult = Object.prototype.hasOwnProperty.call(overlay, "__dialogResult");
            const result = hasDialogResult
                ? overlay.__dialogResult
                : {
                    confirmed: false,
                    value: cm.getValue()
                };

            cleanup();
            resolve(result);
        };

        const onCancel = (event) => {
            event.preventDefault();
            controller.cancel(cm.getValue());
        };

        dialogControllerStack.push(controller);

        const cm = CodeMirror.fromTextArea(textarea, {
            mode: config.mode,
            theme: "material-darker",
            lineNumbers: false,
            lineWrapping: true,
            keyMap: "sublime",
            styleActiveLine: true,
            extraKeys: {
                "Ctrl-Enter": () => controller.return(cm.getValue()),
                "Cmd-Enter": () => controller.return(cm.getValue())
            }
        });

        cm.setSize("100%", "100%");

        const writeSelectionOrAllToClipboard = async () => {
            const selected = cm.getSelection();
            const text = selected || cm.getValue();
            if (!text) return;

            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(text);
            } else {
                cm.focus();
                if (!selected) {
                    cm.execCommand("selectAll");
                }
                document.execCommand("copy");
            }
        };

        copyButton.addEventListener("click", async () => {
            try {
                await writeSelectionOrAllToClipboard();
            } catch (error) {
                console.warn("Failed to copy text from editor dialog", error);
            }
        });

        cutButton.addEventListener("click", async () => {
            try {
                const selected = cm.getSelection();
                if (!selected) {
                    return;
                }
                if (navigator.clipboard?.writeText) {
                    await navigator.clipboard.writeText(selected);
                    cm.replaceSelection("");
                } else {
                    cm.focus();
                    document.execCommand("cut");
                }
            } catch (error) {
                console.warn("Failed to cut text from editor dialog", error);
            }
        });

        pasteButton.addEventListener("click", async () => {
            try {
                if (navigator.clipboard?.readText) {
                    const text = await navigator.clipboard.readText();
                    if (text) {
                        cm.replaceSelection(text);
                    }
                } else {
                    cm.focus();
                    document.execCommand("paste");
                }
            } catch (error) {
                console.warn("Failed to paste text into editor dialog", error);
            }
        });

        undoButton.addEventListener("click", () => cm.undo());
        redoButton.addEventListener("click", () => cm.redo());
        confirmButton.addEventListener("click", () => controller.return(cm.getValue()));
        closeButton.addEventListener("click", () => controller.cancel(cm.getValue()));

        overlay.addEventListener("close", onClose, { once: true });
        overlay.addEventListener("cancel", onCancel);

        if (typeof overlay.showModal === "function") {
            overlay.showModal();
        } else {
            overlay.setAttribute("open", "open");
        }

        setTimeout(() => {
            cm.refresh();
            cm.focus();
        }, 0);
    });
}

// MARK: Inject CSS

const customStyle = {
    injectedStyles: new Map(),

    add(id, css) {
        let style = document.getElementById('extension-injected-styles');
        
        if (!style) {
            style = document.createElement('style');
            style.id = 'extension-injected-styles';
            document.head.appendChild(style);
        }
        
        this.injectedStyles.set(id, css);
        this.updateStyleSheet();
    },

    remove(id) {
        if (this.injectedStyles.delete(id)) {
            this.updateStyleSheet();
        }
    },

    update(id, css) {
        if (this.injectedStyles.has(id)) {
            this.injectedStyles.set(id, css);
            this.updateStyleSheet();
        }
    },

    updateStyleSheet() {
        const style = document.getElementById('extension-injected-styles');
        if (style) {
            style.textContent = Array.from(this.injectedStyles.values()).join('\n');
        }
    }
};