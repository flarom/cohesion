function hasSelection(){
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

                const hasPrefix = prefixesToRemove.some(p => line.startsWith(p));
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
    let baseTitle = getFileTitle(index) || 'New document';
    let title = baseTitle;
    let suffix = 1;

    const existingTitles = files.map((_, i) => {
        if (i === index) return null;
        return getFileTitle(i);
    }).filter(Boolean);

    while (existingTitles.includes(title)) {
        title = `${baseTitle} (${suffix++})`;
    }

    return (
        `«««\n` +
        `title: ${title}\n` +
        `authors: *\n` +
        `date: ${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}\n` +
        `tags: misc\n` +
        `description: *\n` +
        `color: *\n` +
        `***\n` +
        `editor: Cohesion\n` +
        `»»»`
    );
}

function insertYouTubeVideo(url) {
    let prefix = `<!-- YouTube Video Player -->\n<iframe width="100%" allowfullscreen\n    src="`;
    let value = formatYouTubeEmbed(url);
    let suffix = `"\n    title="⚠️ PLACE ALT TEXT HERE"\n></iframe>`;

    return (prefix + value + suffix);

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

async function handleInsertImage() {
    try {
        const text = await insertFile('![ALT TEXT](', ')', '.apng, .gif, .ico, .cur, .jpg, .jpeg, .jfif, .pjpeg, .pjp, .png, .svg, .webp');
        insertAt(text, 2, 10);
    } catch (e) {
        showToast("No file selected.");
        console.error(e);
    }
}

async function handleInsertAudio() {
    try {
        const text = await insertFile('![ALT TEXT](', ')', '.mp3, .wav, .ogg');
        insertAt(text, 2, 10);
    } catch (e) {
        showToast("No file selected.");
        console.error(e);
    }
}

async function handleInsertVideo() {
    try {
        const text = await insertFile('![ALT TEXT](', ')', '.mp4, .webm, .ogg');
        insertAt(text, 2, 10);
    } catch (e) {
        showToast("No file selected.");
        console.error(e);
    }
}

async function insertFile(prefix, suffix, accept = '*/*') {
    const file = await uploadFSFile(accept);
    if (!file || !file.name) throw new Error("No file returned");

    const filePath = `pocket/${file.name}`;
    return prefix + filePath + suffix;
}