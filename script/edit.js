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

function cutText() {
  const selection = editor.getSelection();
  navigator.clipboard.writeText(selection);
  editor.replaceSelection('');
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
  editor.replaceSelection('');
}

function selectAllText() {
  const doc = editor.getDoc();
  const start = {line: 0, ch: 0};
  const end = {line: doc.lineCount() - 1, ch: doc.getLine(doc.lineCount() - 1).length};
  doc.setSelection(start, end);
}