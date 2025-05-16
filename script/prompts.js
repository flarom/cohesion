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

    document.addEventListener('click', closeDropdownOnClickOutside);
}

function closeDropdownOnClickOutside(event) {
    const dropdowns = document.querySelectorAll('.dropdown');
    dropdowns.forEach(dropdown => {
        if (!dropdown.contains(event.target)) {
            dropdown.classList.remove('show');
        }
    });
    document.removeEventListener('click', closeDropdownOnClickOutside);
}

function toggleSidebar(sidebarId) {
    const sidebar = document.getElementById(sidebarId);

    document.querySelectorAll('.sidebar').forEach(s => {
        if (s !== sidebar) {
            s.classList.remove('show');
        }
    });

    sidebar.classList.toggle('show');
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
    document.querySelectorAll('.dropdown').forEach(dropdown => {
        dropdown.classList.remove('show');
    });
}

function hideAllSidebars() {
    document.querySelectorAll('.sidebar').forEach(sidebar => {
        sidebar.classList.remove('show');
    });
}
function closeAllDialogs () {
document.querySelectorAll('.prompt-overlay').forEach(el => el.remove());
}

function promptString(title, defaultText = "") {
    return new Promise((resolve) => {
        // overlay
        const overlay = document.createElement('div');
        overlay.className = 'prompt-overlay';

        // dialog
        const dialog = document.createElement('div');
        dialog.className = 'prompt-dialog';

        // title
        const titleElement = document.createElement('p');
        titleElement.textContent = title;
        titleElement.className = 'prompt-title';
        dialog.appendChild(titleElement);

        // field
        const input = document.createElement('input');
        input.type = 'text';
        input.value = defaultText ? defaultText : ""
        dialog.appendChild(input);

        // buttons
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'prompt-buttons';

        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'Cancel';
        cancelButton.className = 'prompt-button cancel';

        const submitButton = document.createElement('button');
        submitButton.textContent = 'Ok';
        submitButton.className = 'prompt-button submit';

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

        cancelButton.addEventListener('click', () => closePrompt(null));
        submitButton.addEventListener('click', () => closePrompt(input.value));

        overlay.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                closePrompt(input.value);
            } else if (event.key === 'Escape') {
                closePrompt(null);
            }
        });
    });
}

function promptMessage(htmlContent, showCloseButton = true) {
    return new Promise((resolve) => {
        // overlay
        const overlay = document.createElement('div');
        overlay.className = 'prompt-overlay';

        // dialog
        const dialog = document.createElement('div');
        dialog.className = 'prompt-dialog';
        dialog.style.width = '100%';
        dialog.style.maxWidth = '500px';

        // html content
        const content = document.createElement('div');
        content.innerHTML = htmlContent;
        content.style.marginBottom = '15px';
        dialog.appendChild(content);

        // ok button
        const okButton = document.createElement('button');
        okButton.textContent = 'Ok';
        okButton.className = 'prompt-button submit';

        if (showCloseButton) {
            dialog.appendChild(okButton);
        }
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        function closePrompt() {
            document.body.removeChild(overlay);
            resolve();
        }

        okButton.addEventListener('click', closePrompt);

        overlay.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === 'Escape') {
                closePrompt();
            }
        });

        okButton.focus();
    });
}

function promptMessageFromFile(filePath, showCloseButton = true) {
    return new Promise((resolve, reject) => {
        fetch(filePath)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed loading file: ${response.statusText}`);
                }
                return response.text();
            })
            .then(htmlContent => {
                const overlay = document.createElement('div');
                overlay.className = 'prompt-overlay';

                const dialog = document.createElement('div');
                dialog.className = 'prompt-dialog';
                dialog.style.width = '100%';
                dialog.style.maxWidth = '500px';

                const okButton = document.createElement('button');
                okButton.textContent = 'close';
                okButton.className = 'icon-button dialog-window-control';

                if (showCloseButton) {
                    dialog.appendChild(okButton);
                }

                const content = document.createElement('div');
                content.innerHTML = htmlContent;
                content.style.marginBottom = '15px';
                dialog.appendChild(content);

                const scripts = content.querySelectorAll('script');
                scripts.forEach(script => {
                    const newScript = document.createElement('script');
                    if (script.src) {
                        newScript.src = script.src;
                    } else {
                        newScript.textContent = script.textContent;
                    }
                    document.head.appendChild(newScript);
                });

                overlay.appendChild(dialog);
                document.body.appendChild(overlay);

                function closePrompt() {
                    document.body.removeChild(overlay);
                    resolve();
                }

                okButton.addEventListener('click', closePrompt);

                overlay.addEventListener('keydown', (event) => {
                    if (event.key === 'Escape') {
                        closePrompt();
                    }
                });

                okButton.focus();
            })
            .catch(error => {
                reject(error);
            });
    });
}

function promptConfirm(message, dangerous = false) {
    return new Promise((resolve) => {
        // overlay
        const overlay = document.createElement('div');
        overlay.className = 'prompt-overlay';

        // dialog
        const dialog = document.createElement('div');
        dialog.className = 'prompt-dialog';
        dialog.style.width = '100%';
        dialog.style.maxWidth = '400px';

        // message
        const text = document.createElement('p');
        text.textContent = message;
        text.className = 'prompt-title';
        dialog.appendChild(text);

        // buttons
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'prompt-buttons';

        const yesButton = document.createElement('button');
        yesButton.textContent = 'Yes';
        if (dangerous) {yesButton.className = 'prompt-button danger';}
        else { yesButton.className = 'prompt-button submit';}

        const noButton = document.createElement('button');
        noButton.textContent = 'No';
        noButton.className = 'prompt-button cancel';

        buttonContainer.appendChild(noButton);
        buttonContainer.appendChild(yesButton);
        dialog.appendChild(buttonContainer);

        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        function closePrompt(result) {
            document.body.removeChild(overlay);
            resolve(result);
        }

        yesButton.addEventListener('click', () => closePrompt(true));
        noButton.addEventListener('click', () => closePrompt(false));

        overlay.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                closePrompt(false);
            }
        });

        if(!dangerous) yesButton.focus();
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

        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'prompt-buttons';

        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'close';
        cancelButton.className = 'icon-button dialog-window-control';
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
                btn.classList.toggle(
                    "highlighted",
                    r <= targetRow && c <= targetCol
                );
            });

            info.textContent = `${targetRow} x ${targetCol}`;
        });

        cancelButton.addEventListener('click', () => {document.body.removeChild(overlay);resolve(null);});
        tableContainer.addEventListener("click", (e) => {
            if (!e.target.classList.contains("table-item-ex")) return;

            const rowCount = parseInt(e.target.dataset.row);
            const colCount = parseInt(e.target.dataset.col);

            document.body.removeChild(overlay);

            let md = "";
            const headerRow = Array(colCount).fill("          ").join("|");
            const separator = Array(colCount).fill(":--------:").join("|");
            md += `|${headerRow}|\n`;
            md += `|${separator}|\n`;
            for (let i = 0; i < rowCount - 1; i++) {
                md += `|${Array(colCount).fill("          ").join("|")}|\n`;
            }

            resolve(md);
        });

        overlay.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                document.body.removeChild(overlay);
                resolve(null);
            }
        });
    });
}

function promptIframe(){
    return new Promise((resolve) => {
        const overlay = document.createElement("div");
        overlay.className = "prompt-overlay";

        const dialog = document.createElement("div");
        dialog.className = "prompt-dialog";

        const plataformCbx = document.createElement("select");
        plataformCbx.innerHTML = `
            <option value='pYouTube'>YouTube Video</option>
            <option value=''>Place holder</option>
            <option value=''>Place holder</option>
            <option value=''>Place holder</option>
        `;
        dialog.appendChild(plataformCbx);

        const contentField = document.createElement("input");
        contentField.type = 'text';
        contentField.className = 'prompt-input';
        contentField.placeholder = 'URL'
        dialog.appendChild(contentField);

        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'prompt-buttons';

        const insertButton = document.createElement('button');
        insertButton.textContent = 'Insert';
        insertButton.className = 'prompt-button submit';
        buttonContainer.appendChild(insertButton);
        
        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'Cancel';
        cancelButton.className = 'prompt-button cancel';
        buttonContainer.appendChild(cancelButton);
        dialog.appendChild(buttonContainer);
        
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);
        
        insertButton.addEventListener('click', () => closePrompt(false));
        cancelButton.addEventListener('click', () => closePrompt(true));

        function closePrompt(returnNull) {
            document.body.removeChild(overlay);

            if (returnNull) resolve(null);
            if (contentField.value.length == 0) resolve(null);

            switch (plataformCbx.value) {
                case 'pYouTube':
                    resolve(insertYouTubeVideo(contentField.value));
                    break;
            }
        }

        overlay.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                closePrompt(true);
            } else if (event.key === "Enter") {
                closePrompt(false);
            }
        });

        plataformCbx.focus();
    });
}

function promptStringSelector(title, options, defaultText = "") {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'prompt-overlay';

        const dialog = document.createElement('div');
        dialog.className = 'prompt-dialog';

        const titleElement = document.createElement('p');
        titleElement.textContent = title;
        titleElement.className = 'prompt-title';
        dialog.appendChild(titleElement);

        const input = document.createElement('input');
        input.type = 'text';
        input.value = defaultText;
        dialog.appendChild(input);

        const previewList = document.createElement('ul');
        previewList.className = 'prompt-preview-list';
        previewList.style.marginTop = "8px";
        dialog.appendChild(previewList);

        overlay.appendChild(dialog);
        document.body.appendChild(overlay);
        input.focus();
        input.selectionStart = 0;
        input.selectionEnd = input.value.length;

        let filtered = [];
        let selectedIndex = 0;

        function updatePreview() {
            const query = input.value.toLowerCase();
            filtered = options
                .map((text, index) => ({
                    index,
                    text,
                    score: text.toLowerCase().includes(query) ? 0 : 1,
                    distance: text.toLowerCase().indexOf(query),
                }))
                .sort((a, b) => {
                    if (a.score !== b.score) return a.score - b.score;
                    return a.distance - b.distance;
                })
                .slice(0, 5);

            previewList.innerHTML = '';
            filtered.forEach((item, i) => {
                const li = document.createElement('li');
                li.textContent = item.text;
                li.className = i === selectedIndex ? 'selected-option' : '';
                previewList.appendChild(li);
            });
        }

        updatePreview();

        function closePrompt(result) {
            document.body.removeChild(overlay);
            resolve(result);
        }

        input.addEventListener('input', () => {
            selectedIndex = 0;
            updatePreview();
        });

        overlay.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                if (filtered[selectedIndex]) {
                    event.preventDefault();
                    closePrompt(filtered[selectedIndex].index);
                } else {
                    closePrompt(null);
                }
            } else if (event.key === 'ArrowDown') {
                event.preventDefault();
                if (selectedIndex < filtered.length - 1) {
                    selectedIndex++;
                    updatePreview();
                }
            } else if (event.key === 'ArrowUp') {
                event.preventDefault();
                if (selectedIndex > 0) {
                    selectedIndex--;
                    updatePreview();
                }
            } else if (event.key === 'Escape') {
                closePrompt(null);
            }
        });
    });
}
