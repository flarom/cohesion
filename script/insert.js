function hasSelection() {
    return editor.getDoc().getSelection().length > 0;
}

function wrapSelection(prefix, suffix) {
    const doc = editor.getDoc();
    const selection = doc.getSelection();
    const replacement = prefix + selection + suffix;
    doc.replaceSelection(replacement, "around");
}

function toggleLineStart(prefix, toggle = false, prefixesToRemove = []) {
    const doc = editor.getDoc();
    const selections = doc.listSelections();

    editor.operation(() => {
        for (const sel of selections) {
            const fromLine = sel.anchor.line;
            const toLine = sel.head.line;
            const start = Math.min(fromLine, toLine);
            const end = Math.max(fromLine, toLine);

            for (let i = start; i <= end; i++) {
                const line = doc.getLine(i);
                let newLine = line;

                const hasPrefix = prefixesToRemove.some((p) => line.startsWith(p));
                if (toggle && hasPrefix) {
                    for (const p of prefixesToRemove) {
                        if (newLine.startsWith(p)) {
                            newLine = newLine.slice(p.length);
                            break;
                        }
                    }
                } else {
                    newLine = prefix + line;
                }

                doc.replaceRange(newLine, { line: i, ch: 0 }, { line: i, ch: line.length });
            }
        }
    });
}

function getTable(cols, rows, width = 10) {
    let md = "";
    const cell = " ".repeat(width);
    const headerRow = Array(cols).fill(cell).join("|");
    const separator = Array(cols).fill(":" + "-".repeat(width - 2) + ":").join("|");

    md += `|${headerRow}|\n`;
    md += `|${separator}|\n`;
    for (let i = 0; i < rows; i++) {
        md += `|${Array(cols).fill(cell).join("|")}|\n`;
    }
    return md;
}

function insertBlock(text) {
    const doc = editor.getDoc();
    const selection = doc.listSelections()[0];

    const from = selection.anchor;
    const to = selection.head;

    const start = doc.indexFromPos(from);
    const end = doc.indexFromPos(to);

    const lineText = doc.getLine(from.line);
    const needsNewline = lineText.trim().length > 0;

    const block = (needsNewline ? "\n" : "") + text;
    doc.replaceRange(block, from, to);

    const newIndex = start + block.length;
    const newPos = doc.posFromIndex(newIndex);
    doc.setCursor(newPos);
}

function insertSnippet(snippet, markerChar = "$") {
    const doc = editor.getDoc();
    const cursor = doc.getCursor();
    const startIdx = doc.indexFromPos(cursor);

    doc.replaceRange(snippet, cursor);
    const endIdx = startIdx + snippet.length;
    const fullText = doc.getRange(doc.posFromIndex(startIdx), doc.posFromIndex(endIdx));

    const esc = markerChar.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`${esc}\\{(\\d+):([^}]*)\\}|${esc}0`, "g");

    let cleanText = "";
    let last = 0;
    const placeholders = [];

    let match;
    while ((match = re.exec(fullText)) !== null) {
        cleanText += fullText.slice(last, match.index);

        if (match[0] === `${markerChar}0`) {
            placeholders.push({ id: 0, start: cleanText.length, end: cleanText.length });
        } else {
            const id = parseInt(match[1]);
            const text = match[2];
            const s = cleanText.length;
            cleanText += text;
            const e = cleanText.length;
            placeholders.push({ id, start: s, end: e });
        }

        last = match.index + match[0].length;
    }
    cleanText += fullText.slice(last);

    doc.replaceRange(cleanText, doc.posFromIndex(startIdx), doc.posFromIndex(endIdx));

    const groups = {};
    placeholders.forEach(ph => {
        if (!groups[ph.id]) groups[ph.id] = [];
        const from = doc.posFromIndex(startIdx + ph.start);
        const to = doc.posFromIndex(startIdx + ph.end);
        const marker = doc.markText(from, to, { inclusiveLeft: true, inclusiveRight: true });
        groups[ph.id].push(marker);
    });

    const ids = Object.keys(groups).map(Number);
    const order = ids.filter(i => i > 0).sort((a, b) => a - b);
    if (ids.includes(0)) order.push(0);

    const stops = order.map(id => ({ id, markers: groups[id] }));

    editor._snippetStops = stops;
    editor._snippetIndex = -1;

    StatusRegister.remove("contextualShortcut");
    StatusRegister.register({
        id: "contextualShortcut",
        side: "left",

        render() {
            return `
                <label>
                    <kbd>Tab</kbd> to advance. <kbd>Shift</kbd>+<kbd>Tab</kbd> to go back. <kbd>Esc</kbd> to cancel.
                </label>
            `;
        }
    });

    const firstIdx = stops.findIndex(s => s.id > 0);
    const initial = firstIdx !== -1 ? firstIdx : stops.findIndex(s => s.id === 0);

    if (initial !== -1) {
        editor._snippetIndex = initial;
        const markers = stops[initial].markers;
        const ranges = markers.map(m => ({ anchor: m.find().from, head: m.find().to }));
        doc.setSelections(ranges);
    } else {
        doc.setCursor(doc.posFromIndex(startIdx + cleanText.length));
    }
}

function _snippetTab(cm) {
    const stops = cm._snippetStops;
    if (!stops) return CodeMirror.Pass;

    let idx = cm._snippetIndex ?? -1;
    idx++;

    if (idx >= stops.length) {
        StatusRegister.remove("contextualShortcut");
        cm._snippetStops = null;
        cm._snippetIndex = -1;
        return CodeMirror.Pass;
    }

    cm._snippetIndex = idx;
    const doc = cm.getDoc();
    const markers = stops[idx].markers;
    const ranges = markers.map(m => {
        const pos = m.find();
        return pos ? { anchor: pos.from, head: pos.to } : null;
    }).filter(Boolean);

    doc.setSelections(ranges);
}

function _snippetShiftTab(cm) {
    const stops = cm._snippetStops;
    if (!stops) return CodeMirror.Pass;

    let idx = cm._snippetIndex ?? 0;
    idx--;

    if (idx < 0) {
        StatusRegister.remove("contextualShortcut");
        cm._snippetStops = null;
        cm._snippetIndex = -1;
        return CodeMirror.Pass;
    }

    cm._snippetIndex = idx;
    const doc = cm.getDoc();
    const markers = stops[idx].markers;
    const ranges = markers.map(m => {
        const pos = m.find();
        return pos ? { anchor: pos.from, head: pos.to } : null;
    }).filter(Boolean);

    doc.setSelections(ranges);
}

function insertAt(text, selectFrom, selectTo) {
    const doc = editor.getDoc();
    const cursor = doc.getCursor();
    const index = doc.indexFromPos(cursor);

    doc.replaceRange(text, cursor);

    const start = index;
    const end = index + text.length;

    if (typeof selectFrom === "number" && typeof selectTo === "number") {
        const from = doc.posFromIndex(start + selectFrom);
        const to = doc.posFromIndex(start + selectTo);
        doc.setSelection(from, to);
    } else {
        const pos = doc.posFromIndex(end);
        doc.setCursor(pos);
    }
}

function insertAtTop(text) {
    const doc = editor.getDoc();
    const block = `${text}\n\n`;
    const startPos = { line: 0, ch: 0 };
    doc.replaceRange(block, startPos);
}

function getMeta() {
    const rawMeta = Settings.getSetting(
        "editorMeta",
        `title:       ~{1:\${getFileTitle(index) || "New document"}}
project:     ~{2:Documents}
description: ~{3:No description provided}
tags:        ~{4:Uncategorized}
author:      ~{5:Author name}
date:        ~{6:\${strftime(Settings.getSetting("dateFormat", "%Y/%m/%d %H:%M"))}}
icon:        ~{7:📄}
banner:      ~{8:cohesion/banners/1.png}
#language:   ~{9:Blank}
#license:    ~{10:Blank}
#source:     ~{11:Blank}`,
        true
    );

    function evalJS(str) {
        return str.replace(/\$\{([^}]*)\}/g, (_, code) => {
            try {
                return Function(`return (${code});`)();
            } catch (e) {
                console.error("Meta JS error:", e);
                return "";
            }
        });
    }

    const metaLines = rawMeta
        .split("\n")
        .map(line => line.trim())
        .filter(line => line && !line.startsWith("#"))
        .filter(line => line.includes(":"))
        .map(line => {
            const [key, ...rest] = line.split(":");
            const value = rest.join(":");
            return `${key}: ${evalJS(value)}`;
        });

    return `«««\n${metaLines.join("\n")}\n»»»`;
}

function insertYouTubeVideo(url) {
    return embedBlock(formatYouTubeEmbed(url));

    function formatYouTubeEmbed(url) {
        let regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/;
        let match = url.match(regex);

        if (match && match[1]) {
            return `https://www.youtube.com/embed/${match[1]}`;
        } else {
            return "Unknown";
        }
    }
}

function embedBlock(embedUrl) {
    return `[!EMBED ${embedUrl}]`;
}

async function handleInsertImage() {
    try {
        const text = await insertFile("![ALT TEXT](", ")", ".apng, .gif, .ico, .cur, .jpg, .jpeg, .jfif, .pjpeg, .pjp, .png, .svg, .webp");
        insertAt(text, 2, 10);
    } catch (e) {
        showToast("No file selected.");
        console.error(e);
    }
}

async function handleInsertAudio() {
    try {
        const text = await insertFile("![ALT TEXT](", ")", ".mp3, .wav, .ogg");
        insertAt(text, 2, 10);
    } catch (e) {
        showToast("No file selected.");
        console.error(e);
    }
}

async function handleInsertVideo() {
    try {
        const text = await insertFile("![ALT TEXT](", ")", ".mp4, .webm, .ogg");
        insertAt(text, 2, 10);
    } catch (e) {
        showToast("No file selected.");
        console.error(e);
    }
}

async function handleInsertBlock() {
    const blocks = [
        {title: "Note"     , icon: "article"           , color: "blue"             , description: "Shows additional contextual information"        },
        {title: "Tip"      , icon: "lightbulb"         , color: "green"            , description: "Highlights helpful hints or best practices"     },
        {title: "Important", icon: "priority_high"     , color: "purple"           , description: "Emphasizes critical information"                },
        {title: "Warning"  , icon: "warning"           , color: "yellow"           , description: "Alerts about possible issues or risks"          },
        {title: "Caution"  , icon: "dangerous"         , color: "red"              , description: "Warns about actions that may cause harm or loss"},
        {title: "Details"  , icon: "expand_circle_down", color: "var(--text-color)", description: "Expandable block for optional content"          },
        {title: "CSV table", icon: "table"             , color: "var(--text-color)", description: "Converts CSV content into a table"              },
        {title: "Embed"    , icon: "iframe"            , color: "var(--text-color)", description: "Embedded web content"                           }
    ];

    const selection = await promptSelect("Select a block", blocks);

    switch (selection) {
        case 0: insertBlock("> [!NOTE]\n> "); editor.focus(); break;
        case 1: insertBlock("> [!TIP]\n> "); editor.focus(); break;
        case 2: insertBlock("> [!IMPORTANT]\n> "); editor.focus(); break;
        case 3: insertBlock("> [!WARNING]\n> "); editor.focus(); break;
        case 4: insertBlock("> [!CAUTION]\n> "); editor.focus(); break;
        case 5: insertSnippet('> [!DETAILS:${1:Title}]\n> ${2:Content}'); editor.focus(); break;
        case 6: insertSnippet('> [!CSV]\n> ${1:CSV Content}'); editor.focus(); break;
        case 7: insertSnippet('[!embed ${1:https://example.com}]'); editor.focus(); break;
    }
}

async function insertFile(prefix, suffix, accept = "*/*") {
    const file = await Resources.uploadFSFile(accept);
    if (!file || !file.name) throw new Error("No file returned");

    const filePath = `resources/${file.name}`;
    return prefix + filePath + suffix;
}

function insertDate(format) {
    if (!format) {
        format = Settings.getSetting("dateFormat", "%d/%m/%Y %H:%M");
    }

    const time = strftime(format);

    insertAt(time, 0, time.length);
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

function getSummary(markdown) {
    const lines = markdown.split("\n");
    const titles = [];

    for (const line of lines) {
        const match = line.match(/^(#{1,6})\s+(.+)$/);
        if (match) {
            const level = match[1].length;
            const text = match[2].trim();
            const id = text
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[^\w\s-]/g, "")
                .replace(/\s+/g, "-");

            titles.push({ level, text, id });
        }
    }

    return titles
        .map((title) => {
            const indent = "    ".repeat(title.level - 1);
            return `${indent}- [${title.text}](#${title.id})`;
        })
        .join("\n");
}

function insertSnippetAtTop(snippet, markerChar = "$") {
    const doc = editor.getDoc();

    const insertPos = { line: 0, ch: 0 };
    const startIdx = 0;

    doc.replaceRange(snippet, insertPos);

    const endIdx = snippet.length;
    const fullText = doc.getRange(
        doc.posFromIndex(startIdx),
        doc.posFromIndex(endIdx)
    );

    const esc = markerChar.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`${esc}\\{(\\d+):([^}]*)\\}|${esc}0`, "g");

    let cleanText = "";
    let last = 0;
    const placeholders = [];

    let match;
    while ((match = re.exec(fullText)) !== null) {
        cleanText += fullText.slice(last, match.index);

        if (match[0] === `${markerChar}0`) {
            placeholders.push({
                id: 0,
                start: cleanText.length,
                end: cleanText.length
            });
        } else {
            const id = parseInt(match[1]);
            const text = match[2];
            const s = cleanText.length;
            cleanText += text;
            const e = cleanText.length;
            placeholders.push({ id, start: s, end: e });
        }

        last = match.index + match[0].length;
    }

    cleanText += fullText.slice(last);

    doc.replaceRange(
        cleanText,
        doc.posFromIndex(startIdx),
        doc.posFromIndex(endIdx)
    );

    const groups = {};
    placeholders.forEach(ph => {
        if (!groups[ph.id]) groups[ph.id] = [];
        const from = doc.posFromIndex(startIdx + ph.start);
        const to = doc.posFromIndex(startIdx + ph.end);
        const marker = doc.markText(from, to, {
            inclusiveLeft: true,
            inclusiveRight: true
        });
        groups[ph.id].push(marker);
    });

    const ids = Object.keys(groups).map(Number);
    const order = ids.filter(i => i > 0).sort((a, b) => a - b);
    if (ids.includes(0)) order.push(0);

    const stops = order.map(id => ({
        id,
        markers: groups[id]
    }));

    editor._snippetStops = stops;
    editor._snippetIndex = -1;

    const firstIdx = stops.findIndex(s => s.id > 0);
    const initial =
        firstIdx !== -1 ? firstIdx : stops.findIndex(s => s.id === 0);

    if (initial !== -1) {
        editor._snippetIndex = initial;
        const markers = stops[initial].markers;
        const ranges = markers
            .map(m => {
                const pos = m.find();
                return pos
                    ? { anchor: pos.from, head: pos.to }
                    : null;
            })
            .filter(Boolean);
        doc.setSelections(ranges);
    } else {
        doc.setCursor(doc.posFromIndex(cleanText.length));
    }
}

function getTopMetaBlockInfo(text) {
    const match = text.match(/^«««\n([\s\S]*?)\n»»»/);
    if (!match) return null;

    const blockText = match[0];
    const inner = match[1];

    const start = match.index;
    const end = start + blockText.length;

    const lines = inner.split("\n");
    let offset = start + "«««\n".length;

    const fields = [];

    for (const line of lines) {
        const valueMatch = line.match(/^(\s*[^:]+:\s*)(.+)$/);
        if (valueMatch) {
            const valueStart = offset + valueMatch[1].length;
            const valueEnd = valueStart + valueMatch[2].length;

            fields.push({ from: valueStart, to: valueEnd });
        }

        offset += line.length + 1;
    }

    return { start, end, fields };
}

function activateMetaSnippet(metaInfo) {
    const doc = editor.getDoc();

    const groups = {};
    metaInfo.fields.forEach((field, i) => {
        const from = doc.posFromIndex(field.from);
        const to = doc.posFromIndex(field.to);

        const marker = doc.markText(from, to, {
            inclusiveLeft: true,
            inclusiveRight: true
        });

        const id = i + 1;
        if (!groups[id]) groups[id] = [];
        groups[id].push(marker);
        StatusRegister.remove("contextualShortcut");
    });

    const stops = Object.keys(groups)
        .map(Number)
        .sort((a, b) => a - b)
        .map(id => ({
            id,
            markers: groups[id]
        }));

    editor._snippetStops = stops;
    editor._snippetIndex = 0;

    const first = stops[0].markers
        .map(m => {
            const pos = m.find();
            return pos
                ? { anchor: pos.from, head: pos.to }
                : null;
        })
        .filter(Boolean);

    doc.setSelections(first);

    StatusRegister.remove("contextualShortcut");
    StatusRegister.register({
        id: "contextualShortcut",
        side: "left",

        render() {
            return `
                <label>
                    <kbd>Tab</kbd> to advance. <kbd>Shift</kbd>+<kbd>Tab</kbd> to go back. <kbd>Esc</kbd> to cancel.
                </label>
            `;
        }
    });
}

function insertOrEditMeta() {
    const text = editor.getValue();
    const meta = getTopMetaBlockInfo(text);

    if (!meta) {
        insertSnippetAtTop(getMeta() + "\n\n", "~");
        return;
    }

    editor.focus();
    activateMetaSnippet(meta);
}
