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

function insertBlock(text) {
    const doc = editor.getDoc();
    const selection = doc.listSelections()[0];

    const from = selection.anchor;
    const to = selection.head;

    const start = doc.indexFromPos(from);
    const end = doc.indexFromPos(to);

    const block = `\n${text}\n`;
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

    const from = doc.posFromIndex(index + selectFrom);
    const to = doc.posFromIndex(index + selectTo);

    doc.setSelection(from, to);
}

function insertAtTop(text) {
    const doc = editor.getDoc();
    const block = `${text}\n\n`;
    const startPos = { line: 0, ch: 0 };
    doc.replaceRange(block, startPos);
}

function getMeta() {
    const date = new Date();
    let baseTitle = getFileTitle(index) || "New document";
    let title = baseTitle;
    let suffix = 1;

    const existingTitles = files
        .map((_, i) => {
            if (i === index) return null;
            return getFileTitle(i);
        })
        .filter(Boolean);

    while (existingTitles.includes(title)) {
        title = `${baseTitle} (${suffix++})`;
    }

    return `«««\n` + `title: ${title}\n` + `authors: *\n` + `date: ${strftime(getSetting('dateFormat', "%d/%m/%Y %H:%M"))}\n` + `tags: misc\n` + `description: *\n` + `color: *\n` + `banner: cohesion/banners/1.png\n` + `***\n` + `editor: Cohesion\n` + `»»»`;
}

function insertYouTubeVideo(url) {
    let prefix = `<!-- YouTube Video Player -->\n<iframe width="100%" allowfullscreen\n    src="`;
    let value = formatYouTubeEmbed(url);
    let suffix = `"\n    title="⚠️ PLACE ALT TEXT HERE"\n></iframe>`;

    return prefix + value + suffix;

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
    let prefix = `<!-- Vimeo Video Player -->\n<iframe width="100%" allowfullscreen\n    src="`;
    let value = formatVimeoEmbed(url);
    let suffix = `"\n    title="⚠️ PLACE ALT TEXT HERE"\n></iframe>`;

    return prefix + value + suffix;

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
    let prefix = `<!-- X (Twitter) Post Embed -->\n<iframe width="100%" allowfullscreen\n    src="`;
    let value = formatXEmbed(url);
    let suffix = `"\n    title="⚠️ PLACE ALT TEXT HERE"\n></iframe>`;

    return prefix + value + suffix;

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
    let prefix = `<!-- Bluesky Post Embed -->\n<iframe width="100%" allowfullscreen\n    src="`;
    let value = formatBlueskyEmbed(url);
    let suffix = `"\n    title="⚠️ PLACE ALT TEXT HERE"\n></iframe>`;

    return prefix + value + suffix;

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
    const blocks = ["<span style='color:var(--quote-blue);'     ><span class=icon>article       </span>Note         </span>", "<span style='color:var(--quote-green);'    ><span class=icon>lightbulb     </span>Tip          </span>", "<span style='color:var(--quote-purple);'   ><span class=icon>priority_high </span>Important    </span>", "<span style='color:var(--quote-yellow);'   ><span class=icon>warning       </span>Warning      </span>", "<span style='color:var(--quote-red);'      ><span class=icon>dangerous     </span>Caution      </span>", "<span style='color:var(--quote-purple);'   ><span class=icon>pending       </span>To-do        </span>", "<span style='color:var(--quote-green);'    ><span class=icon>lightbulb     </span>Idea         </span>", "<span style='color:var(--quote-blue);'     ><span class=icon>info          </span>Information  </span>", "<span style='color:var(--quote-red);'      ><span class=icon>bookmark      </span>Remember     </span>"];

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
            resolve("TODO");
            break;
        case 6:
            resolve("INFO");
            break;
        case 7:
            resolve("REMEMBER");
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
        format = getSetting('dateFormat', "%d/%m/%Y %H:%M");
    }

    const time = strftime(format);

    insertAt(time,0,time.length);
}

function strftime(format, date = new Date()) {
    const locale = navigator.language || "en-US";

    const pad = (num, len = 2) => String(num).padStart(len, "0");
    const blankPad = (num) => String(num).padStart(2, " ");

    const replacements = {
        "%S": () => pad(date.getSeconds()),
        "%L": () => pad(date.getMilliseconds(), 3),
        "%s": () => Math.floor(date.getTime() / 1000),
        "%M": () => pad(date.getMinutes()),
        "%H": () => pad(date.getHours()),
        "%I": () => pad(date.getHours() % 12 || 12),
        "%k": () => blankPad(date.getHours()),
        "%l": () => blankPad(date.getHours() % 12 || 12),
        "%a": () => new Intl.DateTimeFormat(locale, { weekday: "short" }).format(date),
        "%A": () => new Intl.DateTimeFormat(locale, { weekday: "long" }).format(date),
        "%w": () => date.getDay(),
        "%u": () => (date.getDay() === 0 ? 7 : date.getDay()),
        "%d": () => pad(date.getDate()),
        "%e": () => String(date.getDate()),
        "%j": () => pad(Math.ceil((date - new Date(date.getFullYear(), 0, 0)) / 86400000), 3),
        "%U": () => pad(getWeekNumber(date, "sunday")),
        "%V": () => pad(getISOWeekNumber(date)),
        "%b": () => new Intl.DateTimeFormat(locale, { month: "short" }).format(date),
        "%B": () => new Intl.DateTimeFormat(locale, { month: "long" }).format(date),
        "%m": () => pad(date.getMonth() + 1),
        "%y": () => pad(date.getFullYear() % 100),
        "%Y": () => date.getFullYear(),
        "%p": () => (date.getHours() < 12 ? "AM" : "PM"),
        "%P": () => (date.getHours() < 12 ? "am" : "pm"),
        "%c": () => new Intl.DateTimeFormat(locale, { dateStyle: "full", timeStyle: "long" }).format(date),
        "%Z": () => Intl.DateTimeFormat().resolvedOptions().timeZone,
        "%%": () => "%",
        "%C": () => Math.floor(date.getFullYear() / 100),
        "%D": () => `${pad(date.getMonth() + 1)}/${pad(date.getDate())}/${pad(date.getFullYear() % 100)}`,
        "%n": () => "\n",
        "%t": () => "\t",
    };

    function getWeekNumber(d, startOfWeek) {
        const newDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        const dayNum = newDate.getDay();
        const weekStart = startOfWeek === "sunday" ? 0 : 1;
        const diff = (newDate - new Date(newDate.getFullYear(), 0, 1)) / 86400000;
        return Math.floor((diff + new Date(newDate.getFullYear(), 0, 1).getDay() - weekStart) / 7) + 1;
    }

    function getISOWeekNumber(d) {
        const date = new Date(d.getTime());
        date.setHours(0, 0, 0, 0);
        date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
        const week1 = new Date(date.getFullYear(), 0, 4);
        return 1 + Math.round(((date - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
    }

    return format.replace(/%[a-zA-Z%]/g, (match) => {
        const replacer = replacements[match];
        return replacer ? replacer() : match;
    });
}
