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
    let baseTitle = getFileTitle(index) || "New document";
    let title = baseTitle;
    let suffix = 1;

    const existingTitles = files
        .map((_, i) => (i === index ? null : getFileTitle(i)))
        .filter(Boolean);

    while (existingTitles.includes(title)) {
        title = `${baseTitle} (${suffix++})`;
    }

    const defaultMeta = {
        title,
        authors: "*",
        date: strftime(getSetting("dateFormat", "%Y/%m/%d %H:%M")),
        tags: "uncategorized",
        description: "*",
        color: "*",
        banner: "cohesion/banners/1.png"
    };

    const rawMeta = getSetting(
        "editorMeta",
        `title: *\nauthors: *\ndate: *\ntags: *\ndescription: *\ncolor: *\nbanner: *`,
        true
    );

    const metaLines = rawMeta
        .split("\n")
        .map(line => line.trim())
        .filter(line => line.includes(":"))
        .map(line => {
            const [key, ...rest] = line.split(":");
            const trimmedKey = key.trim();
            const value = rest.join(":").trim();

            const resolved = value === "*" ? (defaultMeta[trimmedKey] || "*") : value;
            return `${trimmedKey}: ${resolved}`;
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

function insertVimeoVideo(url) {
    return embedBlock(formatVimeoEmbed(url));

    function formatVimeoEmbed(url) {
        let regex = /(?:https?:\/\/)?(?:www\.)?(?:vimeo\.com\/(?:video\/)?)(\d+)/;
        let match = url.match(regex);

        if (match && match[1]) {
            return `https://player.vimeo.com/video/${match[1]}`;
        } else {
            return "Unknown";
        }
    }
}

function insertXPost(url) {
    return embedBlock(formatXEmbed(url));

    function formatXEmbed(url) {
        let regex = /(?:https?:\/\/)?(?:www\.)?(?:twitter\.com|x\.com)\/[a-zA-Z0-9_]+\/status\/(\d+)/;
        let match = url.match(regex);

        if (match && match[1]) {
            return `https://twitframe.com/show?url=${encodeURIComponent(url)}`;
        } else {
            return "Unknown";
        }
    }
}

function insertBlueskyPost(url) {
    return embedBlock(formatBlueskyEmbed(url));

    function formatBlueskyEmbed(url) {
        let regex = /(?:https?:\/\/)?(?:www\.)?bsky\.app\/profile\/[^\/]+\/post\/[a-zA-Z0-9]+/;
        let match = url.match(regex);

        if (match) {
            return `https://bsky.app/embed?url=${encodeURIComponent(url)}`;
        } else {
            return "Unknown";
        }
    }
}

// Função utilitária para gerar o bloco no formato simplificado
function embedBlock(embedUrl) {
    return `> [!EMBED]\n> ${embedUrl}`;
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
        "<span style='color:var(--quote-blue);'  ><span class=icon translate=no>article</span>            Note      </span>",
        "<span style='color:var(--quote-green);' ><span class=icon translate=no>lightbulb</span>          Tip       </span>",
        "<span style='color:var(--quote-purple);'><span class=icon translate=no>priority_high</span>      Important </span>",
        "<span style='color:var(--quote-yellow);'><span class=icon translate=no>warning</span>            Warning   </span>",
        "<span style='color:var(--quote-red);'   ><span class=icon translate=no>dangerous</span>          Caution   </span>",
        "<span style='color:var(--text-color);'  ><span class=icon translate=no>expand_circle_down</span> Details   </span>",
        "<span style='color:var(--text-color);'  ><span class=icon translate=no>table</span>              CSV table </span>",
        "<span style='color:var(--text-color);'  ><span class=icon translate=no>iframe</span>             Embed     </span>"
    ];

    const selection = await promptSelect("Select a block", blocks);

    switch (selection) {
        case 0:
            resolve("NOTE");
            break;
        case 1:
            resolve("TIP");
            break;
        case 2:
            resolve("IMPORTANT");
            break;
        case 3:
            resolve("WARNING");
            break;
        case 4:
            resolve("CAUTION");
            break;
        case 5:
            resolve("DETAILS:title");
            break;
        case 6:
            resolve("CSV");
            break;
        case 7:
            resolve("EMBED");
            break;
    }

    function resolve(value) {
        insertBlock("> [!" + value + "]\n> \n> \n> ");
        editor.focus();
    }
}

async function insertFile(prefix, suffix, accept = "*/*") {
    const file = await uploadFSFile(accept);
    if (!file || !file.name) throw new Error("No file returned");

    const filePath = `resources/${file.name}`;
    return prefix + filePath + suffix;
}

function insertDate(format) {
    if (!format) {
        format = getSetting("dateFormat", "%d/%m/%Y %H:%M");
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
