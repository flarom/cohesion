/**
 * aditional tools for editors to use in their documents scripts and automations
 */

const document_div_id = 'preview'
const doc_container = document.getElementById(document_div_id);

const ui = {
    notify : function(message) {
        showToast(message, 'info');
    },
    modal : {
        text : async function(message, defaultValue = ""){
            return await promptString(message, defaultValue);
        }
    }
}

const memory = {
    set : function(key, value = null) {
        localStorage.setItem(`cohesion-doc-memory-`+key, value);
    },
    get : function(key, fallback = null) {
        const memoryitem = localStorage.getItem(`cohesion-doc-memory-`+key);
        if (memoryitem) return memoryitem
        return fallback
    },
    remove : function(key) {
        localStorage.removeItem(`cohesion-doc-memory-`+key)
    },
    clear : function() {
        const prefix = "cohesion-doc-memory-";
        for (let i = localStorage.length - 1; i >= 0; i--) {
            const key = localStorage.key(i);
            if (key && key.startsWith(prefix)) {
                localStorage.removeItem(key);
            }
        }
    },
    list : function() {
        const prefix = "cohesion-doc-memory-";
        const result = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(prefix)) {
                const shortKey = key.slice(prefix.length);
                result[shortKey] = localStorage.getItem(key);
            }
        }
        return result;
    }
};

const documentPosition = Object.freeze({
    cursor: 0,     // cursor Position
    end: 1,        // End of the document
    start: 2,      // Start of the document
    start_safe: 3, // Start of the document, after the meta block
});

const file = {
    new : async function(content = "") {
        if (await promptConfirm("This script is trying to create a file. That's fine?")){
            createFile(content);
        }
    }
}

function insert(text, position = documentPosition.end) {
    const doc = editor.getDoc();

    switch (position) {
        case documentPosition.cursor:
            doc.replaceSelection(text);
            break;
        case documentPosition.end:
            const end = doc.posFromIndex(doc.getValue().length);
            doc.replaceRange('\n' + text, end);
            break;
        case documentPosition.start:
            doc.replaceRange(text + '\n', { line: 0, ch: 0 });
            break;
        case documentPosition.start_safe:
            const content = doc.getValue();
            const metaBlockEnd = content.indexOf('»»»');
            if (metaBlockEnd !== -1) {
                const safePos = doc.posFromIndex(metaBlockEnd + 3);
                doc.replaceRange('\n' + text, safePos);
            } else {
                doc.replaceRange(text + '\n', { line: 0, ch: 0 });
            }
            break;
        default:
            showToast('Unknown insertion position', 'warning');
    }
}

const field = {
    _escapeAttr : function (str) {
        if (str === null || str === undefined) return "";
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    },

    make : {
        textbox : function (id, value = "", max) {
            return `<input type="text" id="${field._escapeAttr(id)}" value="${field._escapeAttr(value)}" maxlength="${field._escapeAttr(max)}">`;
        },

        slider : function (id, value = 50, min = 0, max = 100, step = 1) {
            return `<input type="range" id="${field._escapeAttr(id)}" value="${field._escapeAttr(value)}" min="${field._escapeAttr(min)}" max="${field._escapeAttr(max)}" step="${field._escapeAttr(step)}">`;
        },

        spinner : function (id, value = 0, min = 0, max = 100, step = 1) {
            return `<input type="number" id="${field._escapeAttr(id)}" value="${field._escapeAttr(value)}" min="${field._escapeAttr(min)}" max="${field._escapeAttr(max)}" step="${field._escapeAttr(step)}">`;
        },

        date : function (id, value = "") {
            return `<input type="date" id="${field._escapeAttr(id)}" value="${field._escapeAttr(value)}">`;
        },

        time : function (id, value = "") {
            return `<input type="time" id="${field._escapeAttr(id)}" value="${field._escapeAttr(value)}">`;
        },

        select : function (id, options = [], selected = null) {
            const safeId = field._escapeAttr(id);
            const opts = options.map(opt => {
                const val = field._escapeAttr(opt.value ?? opt);
                const label = field._escapeAttr(opt.label ?? opt);
                const isSelected = (selected !== null && (opt.value ?? opt) == selected) ? " selected" : "";
                return `<option value="${val}"${isSelected}>${label}</option>`;
            }).join("");
            return `<select id="${safeId}">${opts}</select>`;
        }
    },

    keepValue : function(id) {
        const fields = doc_container.querySelectorAll(`#${id}`);
        if (fields.length === 0) return;

        const values = Array.from(fields).map(f => f.value);

        const doc = editor.getDoc();
        let content = doc.getValue();

        const re = new RegExp(
            `(<[^>]*\\bid=(["'])?${id}\\2?[^>]*)(>)`,
            "gi"
        );

        let idx = 0;
        content = content.replace(re, (match, pre, quote, close) => {
            const newVal = field._escapeAttr(values[idx++] ?? "");

            if (/\bvalue\s*=/.test(pre)) {
                return pre.replace(
                    /\bvalue\s*=\s*(['"])([\s\S]*?)\1/i,
                    `value="${newVal}"`
                ).replace(
                    /\bvalue\s*=\s*([^ >]+)/i,
                    `value="${newVal}"`
                ) + close;
            } else {
                return `${pre} value="${newVal}"${close}`;
            }
        });

        doc.setValue(content);
    },

    setValue : function(id, value) {
        const fields = doc_container.querySelectorAll(`#${id}`);
        if (fields.length === 0) return;

        const values = Array.isArray(value) ? value : Array(fields.length).fill(value);

        const doc = editor.getDoc();
        let content = doc.getValue();

        let i = 0;
        content = content.replace(
            new RegExp(`(<input[^>]*id=['"]${id}['"][^>]*value=['"])([^'"]*)(['"])`, "gi"),
            (match, pre, oldVal, post) => {
                const newVal = values[i++] ?? oldVal;
                return `${pre}${newVal}${post}`;
            }
        );

        doc.setValue(content);

        fields.forEach((f, i) => {
            f.value = values[i] ?? f.value;
        });
    },

    getValue : function(id) {
        const fields = doc_container.querySelectorAll(`#${id}`);
        if (fields.length === 0) return null;

        const values = Array.from(fields).map(f => f.value);
        return values.length === 1 ? values[0] : values;
    }
};

const block = {
    _escapeRegExp : function (str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    },

    _findBlockHeaderLine : function(lines, id) {
        const re = new RegExp('^\\s{0,3}>\\s*\\[![^\\]]+\\]\\(' + block._escapeRegExp(id) + '\\)');
        for (let i = 0; i < lines.length; i++) {
            if (re.test(lines[i])) return i;
        }
        return -1;
    },

    make : function(type, id, value = "") {
        const doc = editor.getDoc();
        const header = `> [!${type}](${id})`;
        const end = doc.posFromIndex(doc.getValue().length);

        doc.replaceRange((doc.getValue().length > 0 ? '\n' : '') + header + '\n', end);

        if (value) {
            const lines = value.split(/\r?\n/).map(l => `> ${l}`).join('\n');
            const afterHeader = doc.posFromIndex(doc.getValue().length);
            doc.replaceRange(lines + '\n', afterHeader);
        }
    },

    set : function(id, value) {
        const doc = editor.getDoc();
        const content = doc.getValue();
        const lines = content.split(/\r?\n/);
        const headerIdx = block._findBlockHeaderLine(lines, id);

        if (headerIdx === -1) {
            showToast(`Block '${id}' not found`, 'warning');
            return;
        }

        let start = headerIdx + 1;
        let end = start;
        while (end < lines.length && /^\s{0,3}>\s?/.test(lines[end])) end++;

        const newLines = value === '' ? [] : value.split(/\r?\n/).map(l => `> ${l}`);
        lines.splice(start, end - start, ...newLines);

        doc.setValue(lines.join('\n'));
    },

    add : function(id, value) {
        if (!value || value === '') return;
        const doc = editor.getDoc();
        const content = doc.getValue();
        const lines = content.split(/\r?\n/);
        const headerIdx = block._findBlockHeaderLine(lines, id);

        if (headerIdx === -1) {
            showToast(`Block '${id}' not found`, 'warning');
            return;
        }

        let start = headerIdx + 1;
        let end = start;
        while (end < lines.length && /^\s{0,3}>\s?/.test(lines[end])) end++;

        const addLines = value.split(/\r?\n/).map(l => `> ${l}`);
        lines.splice(end, 0, ...addLines);

        doc.setValue(lines.join('\n'));
    },

    addStart : function(id, value) {
        const doc = editor.getDoc();
        const content = doc.getValue();
        const lines = content.split(/\r?\n/);
        const headerIdx = block._findBlockHeaderLine(lines, id);

        if (headerIdx === -1) {
            showToast(`Block '${id}' not found`, 'warning');
            return;
        }

        let start = headerIdx + 1;
        let end = start;
        while (end < lines.length && /^\s{0,3}>\s?/.test(lines[end])) end++;

        const newLines = value === '' ? [] : value.split(/\r?\n/).map(l => `> ${l}`);
        lines.splice(start, 0, ...newLines);

        doc.setValue(lines.join('\n'));
    },

    getContent : function(id, mode = "plain") {
        const doc = editor.getDoc();
        const content = doc.getValue();
        const lines = content.split(/\r?\n/);
        const headerIdx = block._findBlockHeaderLine(lines, id);

        if (headerIdx === -1) {
            showToast(`Block '${id}' not found`, 'warning');
            return null;
        }

        let start = headerIdx + 1;
        let end = start;
        while (end < lines.length && /^\s{0,3}>\s?/.test(lines[end])) end++;
        const blockLines = lines.slice(start, end);

        if (mode === "plain-with-markers") {
            return blockLines.join('\n');
        } else if (mode === "plain") {
            return blockLines.map(l => l.replace(/^\s{0,3}>\s?/, '')).join('\n');
        } else {
            return blockLines.join('\n');
        }
    },

    get : function(id) {
        const doc = editor.getDoc();
        const content = doc.getValue();
        const lines = content.split(/\r?\n/);
        const headerIdx = block._findBlockHeaderLine(lines, id);

        if (headerIdx === -1) {
            showToast(`Block '${id}' not found`, 'warning');
            return null;
        }

        let end = headerIdx + 1;
        while (end < lines.length && /^\s{0,3}>\s?/.test(lines[end])) end++;
        return lines.slice(headerIdx, end).join('\n');
    },

    rename : function(id, newType) {
        const doc = editor.getDoc();
        let content = doc.getValue();
        const rgx = new RegExp(`(^ {0,3}>\\s*\\[!)(.+?)(\\]\\(${id}\\))`, 'gm');

        if (rgx.test(content)) {
            content = content.replace(rgx, `$1${newType}$3`);
            doc.setValue(content);
        } else {
            showToast(`Block '${id}' not found`, 'warning');
        }
    },

    getName : function(id) {
        const doc = editor.getDoc();
        const content = doc.getValue();
        const lines = content.split(/\r?\n/);
        const headerIdx = block._findBlockHeaderLine(lines, id);

        if (headerIdx === -1) {
            showToast(`Block '${id}' not found`, 'warning');
            return null;
        }

        const headerLine = lines[headerIdx];
        const match = headerLine.match(/^\s{0,3}>\s*\[!([^\]]+)\]\(/);

        if (match) {
            return match[1];
        }

        return null;
    },

    remove : function(id) {
        const doc = editor.getDoc();
        let content = doc.getValue();
        const lines = content.split(/\r?\n/);
        const headerIdx = block._findBlockHeaderLine(lines, id);

        if (headerIdx === -1) {
            showToast(`Block '${id}' not found`, 'warning');
            return;
        }

        let end = headerIdx + 1;
        while (end < lines.length && /^\s{0,3}>\s?/.test(lines[end])) end++;

        lines.splice(headerIdx, end - headerIdx);
        doc.setValue(lines.join('\n'));
    }
};

const network = {
    fetch : function(url, callback) {
        fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            callback(data);
        })
        .catch(error => {
            showToast(`Fetch error: ${error.message}`, 'error');
        });
    }
}

const resources = {
    write: async function(name, content) {
        await Resources.setFSFile({ name, content });
        showToast(`File '${name}' written`, 'save');
    },
    read: async function(name) {
        return await Resources.resolveFSItem(name);
    },
    delete: async function(name) {
        await Resources.deleteFSFile(name);
        showToast(`File '${name}' deleted`, 'delete');
    },
    list: async function() {
        return await Resources.getFSFiles();
    }
};