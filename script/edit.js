function wrapSelectionWith(before, after, defaultText = "") {
    const doc = editor.getDoc();
    const selections = doc.listSelections();
    const texts = selections.map(sel => {
        const text = doc.getRange(sel.anchor, sel.head);
        return text ? before + text + after : before + defaultText + after;
    });

    doc.replaceSelections(texts, "around");

    editor.focus();
}

function formatBold() {
    wrapSelectionWith("**", "**", "Bold text");
}

function formatItalic() {
    wrapSelectionWith("*", "*", "Italic text");
}

function formatUnderline() {
    wrapSelectionWith("__", "__", "Underlined text");
}

function formatStrikethrough() {
    wrapSelectionWith("~~", "~~", "Stroked text");
}

function formatPreformatted() {
    wrapSelectionWith("`", "`", "Preformatted text");
}

function formatHighlight() {
    wrapSelectionWith("==", "==", "Highlighted text");
}

function formatUrl() {
    const doc = editor.getDoc();
    const selections = doc.listSelections();

    const texts = selections.map(sel => {
        const text = doc.getRange(sel.anchor, sel.head);
        return `[${text || "Link title"}](URL)`;
    });

    doc.replaceSelections(texts, "around");

    const firstSel = doc.listSelections()[0];
    const firstText = doc.getRange(firstSel.anchor, firstSel.head);
    const urlStartCh = firstSel.anchor.ch + firstText.indexOf("(URL)") + 1;
    const urlEndCh = urlStartCh + 3;

    doc.setSelection(
        { line: firstSel.anchor.line, ch: urlStartCh },
        { line: firstSel.anchor.line, ch: urlEndCh }
    );

    editor.focus();
}

function formatTable() {
    const selection = editor.getSelection();
    if (!selection) return;

    const lines = selection.split('\n').filter(line => line.trim().length > 0);
    if (lines.length < 2) return;

    const table = lines.map(line => {
        return line.trim()
                   .replace(/^\|/, '')
                   .replace(/\|$/, '')
                   .split('|')
                   .map(cell => cell.trim());
    });

    if (table.length < 2) return;

    const colCount = Math.max(...table.map(row => row.length));

    for (let row of table) {
        while (row.length < colCount) {
            row.push('');
        }
    }

    const colWidths = Array(colCount).fill(0);
    for (let row of table) {
        row.forEach((cell, i) => {
            colWidths[i] = Math.max(colWidths[i], cell.length);
        });
    }

    const alignments = table[1].map(cell => {
        const left = cell.startsWith(':');
        const right = cell.endsWith(':');
        if (left && right) return 'center';
        if (right) return 'right';
        return 'left';
    });

    const formatted = table.map((row, rowIndex) => {
        return '| ' + row.map((cell, colIndex) => {
            if (rowIndex === 1) {
                const left = cell.startsWith(':');
                const right = cell.endsWith(':');
                let dashes = '-'.repeat(colWidths[colIndex]);

                if (left) dashes = ':' + dashes.slice(1);
                if (right) dashes = dashes.slice(0, -1) + ':';

                return dashes;
            } else {
                const width = colWidths[colIndex];
                const align = alignments[colIndex] || 'left';

                if (align === 'right') {
                    return cell.padStart(width, ' ');
                } else if (align === 'center') {
                    const totalPadding = width - cell.length;
                    const padLeft = Math.floor(totalPadding / 2);
                    const padRight = totalPadding - padLeft;
                    return ' '.repeat(padLeft) + cell + ' '.repeat(padRight);
                } else {
                    return cell.padEnd(width, ' ');
                }
            }
        }).join(' | ') + ' |';
    });

    editor.replaceSelection(formatted.join('\n'));
}

function cutText() {
    const selection = editor.getSelection();
    navigator.clipboard.writeText(selection);
    editor.replaceSelection("");
}

function copyText() {
    const selection = editor.getSelection();
    navigator.clipboard.writeText(selection);
}

async function pasteText() {
    const text = await navigator.clipboard.readText();
    editor.replaceSelection(text);
}

function deleteText() {
    editor.replaceSelection("");
}

function selectAllText() {
    const doc = editor.getDoc();
    const start = { line: 0, ch: 0 };
    const end = { line: doc.lineCount() - 1, ch: doc.getLine(doc.lineCount() - 1).length };
    doc.setSelection(start, end);
}

function hasTableSelected() {
    const selection = editor.getSelection();
    const lines = selection.split('\n');
    const tableLinePattern = /^\s*\|.*\|\s*$/;

    let tableLines = lines.filter(line => tableLinePattern.test(line));
    
    return tableLines.length >= 2;
}

function hasURLSelected() {
    const selection = editor.getSelection();
    const urlPattern = /\b(?:https?:\/\/|www\.)\S+\b/i;

    return urlPattern.test(selection);
}

function hasMediaSelected() {
    const selection = editor.getSelection();
    const mediaPattern = /!\[[^\]]*\]\([^)\s]+\)/;

    return mediaPattern.test(selection);
}

function extractMetadata(markdown) {
    const metaMatch = markdown.match(/«««([\s\S]*?)»»»/);
    if (!metaMatch) return {};

    const metaText = metaMatch[1];
    const metaLines = metaText.split('\n').map(line => line.trim()).filter(Boolean);

    const metadata = {};
    metaLines.forEach(line => {
        const [key, ...rest] = line.split(':');
        if (key && rest.length) {
            metadata[key.trim()] = rest.join(':').trim();
        }
    });

    return metadata;
}