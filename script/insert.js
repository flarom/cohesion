const SNIPPET_PLACEHOLDER_CLASS = "cm-snippet-placeholder";

const insert = {
    _snippetSession: null,

    atCursor: (text, selectInsertion = false) => {
        insert._finishSnippetSession();
        const doc = editor.getDoc();
        const cursor = doc.getCursor();
        doc.replaceRange(text, cursor);
        if (selectInsertion) {
            doc.setSelection(cursor, { line: cursor.line, ch: cursor.ch + text.length });
            editor.focus();
        }
    },
    atStart: (text) => {
        insert._finishSnippetSession();
        const doc = editor.getDoc();
        doc.replaceRange(text, { line: 0, ch: 0 });
    },
    atStartSafe: (text) => {
        insert._finishSnippetSession();
        // only insert after a seccond "---" or a first "»»»", to avoid inserting before the metadata section
        const doc = editor.getDoc();
        const firstLine = doc.getLine(0);
        let insertPos = { line: 0, ch: 0 };

        if (firstLine.startsWith("---")) {
            for (let i = 1; i < doc.lineCount(); i++) {
                if (doc.getLine(i).startsWith("---")) {
                    insertPos = { line: i + 1, ch: 0 };
                    break;
                }
            }
        } else if (firstLine.startsWith("»»»")) {
            insertPos = { line: 1, ch: 0 };
        }

        doc.replaceRange(text, insertPos);
    },
    atEnd: (text) => {
        insert._finishSnippetSession();
        const doc = editor.getDoc();
        const lastLine = doc.lineCount() - 1;
        const lastCh = doc.getLine(lastLine).length;
        doc.replaceRange(text, { line: lastLine, ch: lastCh });
    },
    wrap : (prefix, suffix, textIfNoSelection = "") => {
        insert._finishSnippetSession();
        const doc = editor.getDoc();
        const from = doc.getCursor("from");
        const to = doc.getCursor("to");
        const hasSelection = doc.somethingSelected();

        if (!hasSelection) {
            const cursor = doc.getCursor();
            const inserted = prefix + textIfNoSelection + suffix;

            doc.replaceRange(inserted, cursor);

            const startIndex = doc.indexFromPos(cursor);
            const contentStart = startIndex + prefix.length;
            const contentEnd = contentStart + textIfNoSelection.length;

            if (textIfNoSelection.length > 0) {
                doc.setSelection(doc.posFromIndex(contentStart), doc.posFromIndex(contentEnd));
            } else {
                doc.setCursor(doc.posFromIndex(contentStart));
            }

            editor.focus();
            return;
        }

        const fullText = doc.getValue();
        const startIndex = doc.indexFromPos(from);
        const endIndex = doc.indexFromPos(to);
        const selection = fullText.slice(startIndex, endIndex);

        const isWrappedInsideSelection =
            selection.startsWith(prefix) &&
            selection.endsWith(suffix) &&
            selection.length >= prefix.length + suffix.length;

        const hasAdjacentPrefix =
            startIndex >= prefix.length &&
            fullText.slice(startIndex - prefix.length, startIndex) === prefix;
        const hasAdjacentSuffix =
            fullText.slice(endIndex, endIndex + suffix.length) === suffix;
        const isWrappedAdjacent = hasAdjacentPrefix && hasAdjacentSuffix;

        if (isWrappedInsideSelection) {
            const unwrapped = selection.slice(prefix.length, selection.length - suffix.length);
            doc.replaceRange(unwrapped, from, to);

            const newStart = startIndex;
            const newEnd = newStart + unwrapped.length;
            doc.setSelection(doc.posFromIndex(newStart), doc.posFromIndex(newEnd));
        } else if (isWrappedAdjacent) {
            const replaceFrom = doc.posFromIndex(startIndex - prefix.length);
            const replaceTo = doc.posFromIndex(endIndex + suffix.length);

            doc.replaceRange(selection, replaceFrom, replaceTo);

            const newStart = startIndex - prefix.length;
            const newEnd = newStart + selection.length;
            doc.setSelection(doc.posFromIndex(newStart), doc.posFromIndex(newEnd));
        } else {
            const wrapped = prefix + selection + suffix;
            doc.replaceRange(wrapped, from, to);

            const newStart = startIndex + prefix.length;
            const newEnd = newStart + selection.length;
            doc.setSelection(doc.posFromIndex(newStart), doc.posFromIndex(newEnd));
        }

        editor.focus();
    },
    async snippet(template) {
        const doc = editor.getDoc();
        this._finishSnippetSession();

        const snippetText = String(template || "");
        const selectionRanges = doc.listSelections().map((range) => {
            const from = CodeMirror.cmpPos(range.anchor, range.head) <= 0 ? range.anchor : range.head;
            const to = CodeMirror.cmpPos(range.anchor, range.head) <= 0 ? range.head : range.anchor;
            return { from, to, head: range.head };
        });

        let fileName = "";
        let directory = "";
        if (typeof fileManager !== "undefined" && fileManager.currentFileId && typeof file !== "undefined") {
            try {
                const fileEntry = await file.readFile(fileManager.currentFileId);
                fileName = fileEntry?.name || "";
                directory = fileEntry?.path || "";
            } catch (error) {
                console.warn("Could not get file info for snippet variables:", error);
            }
        }

        let clipboard = "";
        try {
            // clipboard = await navigator.clipboard.readText();
        } catch {
            clipboard = "";
        }

        const fullText = doc.getValue();
        const segments = selectionRanges.map((range, cursorIndex) => {
            const selectedText = doc.getRange(range.from, range.to);
            const activeLine = doc.getLine(range.head.line) || "";

            const variables = {
                SELECTED_TEXT: selectedText,
                CURRENT_LINE: activeLine,
                CURRENT_WORD: this._getWordAtPosition(doc, range.head),
                LINE_INDEX: String(range.head.line),
                LINE_NUMBER: String(range.head.line + 1),
                FILENAME: fileName,
                DIRECTORY: directory,
                CLIPBOARD: clipboard,
                CURSOR_INDEX: String(cursorIndex),
                CURSOR_NUMBER: String(cursorIndex + 1),
                RANDOM: this._generateRandomDigits(6),
                RANDOM_HEX: this._generateRandomHex(6),
                UUID: this._generateUuidV4()
            };

            const parsed = this._parseSnippetTemplate(snippetText, variables);
            return {
                fromIndex: doc.indexFromPos(range.from),
                toIndex: doc.indexFromPos(range.to),
                replacementText: parsed.text,
                placeholders: parsed.placeholders
            };
        }).sort((a, b) => a.fromIndex - b.fromIndex);

        const placeholdersByIndex = new Map();

        editor.operation(() => {
            let delta = 0;

            for (const segment of segments) {
                const startIndex = segment.fromIndex + delta;
                const endIndex = segment.toIndex + delta;
                const replaceFrom = doc.posFromIndex(startIndex);
                const replaceTo = doc.posFromIndex(endIndex);

                doc.replaceRange(segment.replacementText, replaceFrom, replaceTo);

                for (const placeholder of segment.placeholders) {
                    const from = doc.posFromIndex(startIndex + placeholder.start);
                    const to = doc.posFromIndex(startIndex + placeholder.end);
                    const mark = doc.markText(from, to, {
                        className: SNIPPET_PLACEHOLDER_CLASS,
                        inclusiveLeft: true,
                        inclusiveRight: true,
                        clearWhenEmpty: false
                    });

                    if (!placeholdersByIndex.has(placeholder.index)) {
                        placeholdersByIndex.set(placeholder.index, []);
                    }
                    placeholdersByIndex.get(placeholder.index).push(mark);
                }

                const originalLength = segment.toIndex - segment.fromIndex;
                delta += segment.replacementText.length - originalLength;
            }
        });

        if (placeholdersByIndex.size === 0) {
            editor.focus();
            return;
        }

        const orderedIndexes = Array.from(placeholdersByIndex.keys()).sort((a, b) => {
            if (a === 0) return 1;
            if (b === 0) return -1;
            return a - b;
        });

        const groups = orderedIndexes.map((index) => ({
            index,
            marks: placeholdersByIndex.get(index)
        }));

        const keyMap = {
            name: "cohesion-snippet-keymap",
            Tab: () => {
                if (this._moveSnippetSelection(1)) {
                    return;
                }
                return CodeMirror.Pass;
            },
            "Shift-Tab": () => {
                if (this._moveSnippetSelection(-1)) {
                    return;
                }
                return CodeMirror.Pass;
            },
            Esc: () => {
                this._finishSnippetSession();
            }
        };

        this._snippetSession = {
            groups,
            activeGroupIndex: -1,
            keyMap
        };

        editor.addKeyMap(keyMap);
        this._moveSnippetSelection(1);
        editor.focus();
    },
    snippetNext() {
        return this._moveSnippetSelection(1);
    },
    snippetPrevious() {
        return this._moveSnippetSelection(-1);
    },
    snippetCancel() {
        this._finishSnippetSession();
    },
    _moveSnippetSelection(direction) {
        if (!this._snippetSession || !Array.isArray(this._snippetSession.groups)) {
            return false;
        }

        const session = this._snippetSession;
        let targetGroupIndex = session.activeGroupIndex + direction;

        while (targetGroupIndex >= 0 && targetGroupIndex < session.groups.length) {
            const group = session.groups[targetGroupIndex];
            const ranges = group.marks
                .map((mark) => mark.find())
                .filter(Boolean)
                .map((range) => ({ anchor: range.from, head: range.to }));

            if (ranges.length > 0) {
                editor.getDoc().setSelections(ranges);
                session.activeGroupIndex = targetGroupIndex;
                editor.focus();
                return true;
            }

            targetGroupIndex += direction;
        }

        if (direction > 0) {
            this._finishSnippetSession();
        }

        return false;
    },
    _finishSnippetSession() {
        if (!this._snippetSession) {
            return;
        }

        const { groups, keyMap } = this._snippetSession;

        if (Array.isArray(groups)) {
            for (const group of groups) {
                for (const mark of group.marks || []) {
                    try {
                        mark.clear();
                    } catch {
                        // Ignore stale marker cleanup errors.
                    }
                }
            }
        }

        if (keyMap) {
            editor.removeKeyMap(keyMap);
        }

        this._snippetSession = null;
    },
    _parseSnippetTemplate(template, variables) {
        const placeholders = [];
        let output = "";
        let i = 0;

        const appendPlaceholder = (index, text) => {
            const placeholderText = String(text || "");
            const start = output.length;
            output += placeholderText;
            const end = output.length;
            placeholders.push({ index: Number(index), start, end });
        };

        while (i < template.length) {
            const char = template[i];

            if (char === "\\" && i + 1 < template.length) {
                const escaped = template[i + 1];
                if (escaped === "$" || escaped === "{" || escaped === "}" || escaped === "\\") {
                    output += escaped;
                    i += 2;
                    continue;
                }
            }

            if (char !== "$") {
                output += char;
                i += 1;
                continue;
            }

            const nextChar = template[i + 1];

            if (nextChar === "{") {
                const closeIndex = template.indexOf("}", i + 2);
                if (closeIndex === -1) {
                    output += char;
                    i += 1;
                    continue;
                }

                const body = template.slice(i + 2, closeIndex);

                const numberedPlaceholder = body.match(/^(\d+)(?::([\s\S]*))?$/);
                if (numberedPlaceholder) {
                    const index = Number(numberedPlaceholder[1]);
                    const defaultText = this._expandSnippetVariables(numberedPlaceholder[2] || "", variables);
                    appendPlaceholder(index, defaultText);
                    i = closeIndex + 1;
                    continue;
                }

                const variableWithDefault = body.match(/^([A-Z_][A-Z0-9_]*)(?::([\s\S]*))?$/);
                if (variableWithDefault) {
                    const variableName = variableWithDefault[1];
                    const fallbackText = variableWithDefault[2] || "";
                    const value = variables[variableName];
                    output += typeof value === "string" && value.length > 0 ? value : fallbackText;
                    i = closeIndex + 1;
                    continue;
                }

                output += template.slice(i, closeIndex + 1);
                i = closeIndex + 1;
                continue;
            }

            if (/\d/.test(nextChar || "")) {
                let j = i + 1;
                while (j < template.length && /\d/.test(template[j])) {
                    j += 1;
                }
                appendPlaceholder(Number(template.slice(i + 1, j)), "");
                i = j;
                continue;
            }

            if (/[A-Z_]/.test(nextChar || "")) {
                let j = i + 1;
                while (j < template.length && /[A-Z0-9_]/.test(template[j])) {
                    j += 1;
                }
                const variableName = template.slice(i + 1, j);
                const value = variables[variableName];
                output += typeof value === "string" ? value : "";
                i = j;
                continue;
            }

            output += char;
            i += 1;
        }

        return { text: output, placeholders };
    },
    _expandSnippetVariables(text, variables) {
        const source = String(text || "");
        let output = "";
        let i = 0;

        while (i < source.length) {
            const char = source[i];

            if (char === "\\" && i + 1 < source.length) {
                const escaped = source[i + 1];
                if (escaped === "$" || escaped === "{" || escaped === "}" || escaped === "\\") {
                    output += escaped;
                    i += 2;
                    continue;
                }
            }

            if (char !== "$") {
                output += char;
                i += 1;
                continue;
            }

            const nextChar = source[i + 1];

            if (nextChar === "{") {
                const closeIndex = source.indexOf("}", i + 2);
                if (closeIndex === -1) {
                    output += char;
                    i += 1;
                    continue;
                }

                const body = source.slice(i + 2, closeIndex);
                const variableWithDefault = body.match(/^([A-Z_][A-Z0-9_]*)(?::([\s\S]*))?$/);
                if (variableWithDefault) {
                    const variableName = variableWithDefault[1];
                    const fallbackText = variableWithDefault[2] || "";
                    const value = variables[variableName];
                    output += typeof value === "string" && value.length > 0 ? value : this._expandSnippetVariables(fallbackText, variables);
                    i = closeIndex + 1;
                    continue;
                }

                output += source.slice(i, closeIndex + 1);
                i = closeIndex + 1;
                continue;
            }

            if (/[A-Z_]/.test(nextChar || "")) {
                let j = i + 1;
                while (j < source.length && /[A-Z0-9_]/.test(source[j])) {
                    j += 1;
                }
                const variableName = source.slice(i + 1, j);
                const value = variables[variableName];
                output += typeof value === "string" ? value : "";
                i = j;
                continue;
            }

            output += char;
            i += 1;
        }

        return output;
    },
    _getWordAtPosition(doc, position) {
        const line = doc.getLine(position.line) || "";
        const cursorCh = Math.max(0, Math.min(position.ch, line.length));

        let start = cursorCh;
        let end = cursorCh;

        while (start > 0 && /[\w]/.test(line[start - 1])) {
            start -= 1;
        }
        while (end < line.length && /[\w]/.test(line[end])) {
            end += 1;
        }

        return line.slice(start, end);
    },
    _generateRandomDigits(length = 6) {
        let output = "";
        for (let i = 0; i < length; i += 1) {
            output += Math.floor(Math.random() * 10);
        }
        return output;
    },
    _generateRandomHex(length = 6) {
        let output = "";
        for (let i = 0; i < length; i += 1) {
            output += Math.floor(Math.random() * 16).toString(16);
        }
        return output;
    },
    _generateUuidV4() {
        if (typeof crypto !== "undefined" && crypto.randomUUID) {
            return crypto.randomUUID();
        }

        const randomBytes = new Uint8Array(16);
        if (typeof crypto !== "undefined" && crypto.getRandomValues) {
            crypto.getRandomValues(randomBytes);
        } else {
            for (let i = 0; i < randomBytes.length; i += 1) {
                randomBytes[i] = Math.floor(Math.random() * 256);
            }
        }

        randomBytes[6] = (randomBytes[6] & 0x0f) | 0x40;
        randomBytes[8] = (randomBytes[8] & 0x3f) | 0x80;

        const hex = Array.from(randomBytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
        return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
    }
}

function strftime(format, date = new Date()) {
    const locale = navigator.language || "en-US";

    const pad = (num, len = 2) => String(num).padStart(len, "0");
    const blankPad = (num) => String(num).padStart(2, " ");

    const getMicroseconds = (date) => pad(date.getMilliseconds() * 1000, 6);

    const getUTCOffset = (date) => {
        const offset = -date.getTimezoneOffset();
        const sign = offset >= 0 ? "+" : "-";
        const absOffset = Math.abs(offset);
        const hours = pad(Math.floor(absOffset / 60));
        const minutes = pad(absOffset % 60);
        return `${sign}${hours}${minutes}`;
    };

    const getWeekNumber = (d, startOfWeek) => {
        const newDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        const dayNum = newDate.getDay();
        const weekStart = startOfWeek === "sunday" ? 0 : 1;
        const diff = (newDate - new Date(newDate.getFullYear(), 0, 1)) / 86400000;
        return Math.floor((diff + new Date(newDate.getFullYear(), 0, 1).getDay() - weekStart) / 7) + 0;
    };

    const getISOWeekNumber = (d) => {
        const date = new Date(d.getTime());
        date.setHours(0, 0, 0, 0);
        date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
        const week1 = new Date(date.getFullYear(), 0, 4);
        return 1 + Math.round(((date - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
    };

    const formatTimeZone = () => {
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
        const parts = timeZone.split("/");
        if (parts.length > 1) {
            const city = parts[1].replace(/_/g, " ");
            return city.charAt(0).toUpperCase() + city.slice(1);
        }
        return timeZone;
    };

    const replacements = {
        "%a": () => new Intl.DateTimeFormat(locale, { weekday: "short" }).format(date),
        "%A": () => new Intl.DateTimeFormat(locale, { weekday: "long" }).format(date),
        "%w": () => date.getDay(),
        "%d": () => pad(date.getDate()),
        "%-d": () => date.getDate(),
        "%b": () => new Intl.DateTimeFormat(locale, { month: "short" }).format(date),
        "%B": () => new Intl.DateTimeFormat(locale, { month: "long" }).format(date),
        "%m": () => pad(date.getMonth() + 1),
        "%-m": () => date.getMonth() + 1,
        "%y": () => pad(date.getFullYear() % 100),
        "%Y": () => date.getFullYear(),
        "%H": () => pad(date.getHours()),
        "%-H": () => date.getHours(),
        "%I": () => pad(date.getHours() % 12 || 12),
        "%-I": () => date.getHours() % 12 || 12,
        "%p": () => (date.getHours() < 12 ? "AM" : "PM"),
        "%M": () => pad(date.getMinutes()),
        "%-M": () => date.getMinutes(),
        "%S": () => pad(date.getSeconds()),
        "%-S": () => date.getSeconds(),
        "%f": () => getMicroseconds(date),
        "%z": () => getUTCOffset(date),
        "%Z": () => formatTimeZone(),
        "%j": () => pad(Math.ceil((date - new Date(date.getFullYear(), 0, 0)) / 86400000), 3),
        "%-j": () => Math.ceil((date - new Date(date.getFullYear(), 0, 0)) / 86400000),
        "%U": () => pad(getWeekNumber(date, "sunday")),
        "%-U": () => getWeekNumber(date, "sunday"),
        "%W": () => pad(getWeekNumber(date, "monday")),
        "%-W": () => getWeekNumber(date, "monday"),
        "%c": () => new Intl.DateTimeFormat(locale, { dateStyle: "full", timeStyle: "long" }).format(date),
        "%x": () => new Intl.DateTimeFormat(locale, { dateStyle: "short" }).format(date),
        "%X": () => new Intl.DateTimeFormat(locale, { timeStyle: "medium" }).format(date),
        "%%": () => "%",
    };

    return format.replace(/%[-]?[a-zA-Z%]/g, (match) => {
        const replacer = replacements[match];
        return replacer ? replacer() : match;
    });
}

function insertMetadata() {
    
}

async function insertTable() {
	const md = await showDialogFile('dialog/table.html')
	insert.atCursor(md)
}