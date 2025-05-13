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