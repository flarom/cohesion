function formatBold() {
    if (hasSelection()) {
        wrapSelection("**", "**");
    } else {
        insertAt("**Bold text**", 2, 11);
    }
    editor.focus();
}

function formatItalic() {
    if (hasSelection()) {
        wrapSelection("*", "*");
    } else {
        insertAt("*Italic text*", 1, 12);
    }
    editor.focus();
}

function formatUnderline() {
    if (hasSelection()) {
        wrapSelection("__", "__");
    } else {
        insertAt("__Underlined text__", 2, 17);
    }
    editor.focus();
}

function formatStrikethrough() {
    if (hasSelection()) {
        wrapSelection("~~", "~~");
    } else {
        insertAt("~~Stroked text~~", 2, 14);
    }
    editor.focus();
}

function formatPreformatted() {
    if (hasSelection()) {
        wrapSelection("`", "`");
    } else {
        insertAt("`Preformatted text`", 1, 18);
    }
    editor.focus();
}

function formatHighlight() {
    if (hasSelection()) {
        wrapSelection("==", "==");
    } else {
        insertAt("==Highlighted text==", 2, 18);
    }
    editor.focus();
}

function formatTable() {
    const selection = editor.getSelection();
    if (!selection) return;

    const lines = selection.split('\n').filter(line => line.trim().length > 0);
    if (lines.length < 2) return;  // Pelo menos cabeçalho e separador

    const table = lines.map(line => {
        return line.trim()
                   .replace(/^\|/, '')   // remove | no começo
                   .replace(/\|$/, '')   // remove | no final
                   .split('|')
                   .map(cell => cell.trim());
    });

    if (table.length < 2) return;

    const colCount = Math.max(...table.map(row => row.length));

    // Ajustar as linhas para sempre terem colCount células
    for (let row of table) {
        while (row.length < colCount) {
            row.push('');
        }
    }

    // Calcular largura máxima de cada coluna
    const colWidths = Array(colCount).fill(0);
    for (let row of table) {
        row.forEach((cell, i) => {
            colWidths[i] = Math.max(colWidths[i], cell.length);
        });
    }

    // Detectar alinhamento com base no separador (segunda linha)
    const alignments = table[1].map(cell => {
        const left = cell.startsWith(':');
        const right = cell.endsWith(':');
        if (left && right) return 'center';
        if (right) return 'right';
        return 'left';  // Default: left
    });

    // Reformatar as linhas
    const formatted = table.map((row, rowIndex) => {
        return '| ' + row.map((cell, colIndex) => {
            if (rowIndex === 1) {  // linha de separador
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