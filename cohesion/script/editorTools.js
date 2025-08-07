/**
 * aditional tools for editors to use in their documents scripts and automations
 */

function notify(message) {
    showToast(message, 'info');
}

const Insert_position = Object.freeze({
    CURSOR: 0,              // Cursor Position
    DOCUMENT_END: 1,        // End of the document
    DOCUMENT_START: 2,      // Start of the document
    DOCUMENT_START_SAFE: 3, // Start of the document, after the meta block
});

function inserttext(text, positon = Insert_position.DOCUMENT_END) {
    const doc = editor.getDoc();

    switch (positon) {
        case Insert_position.CURSOR:
            doc.replaceSelection(text);
            break;
        case Insert_position.DOCUMENT_END:
            const end = doc.posFromIndex(doc.getValue().length);
            doc.replaceRange('\n'+text, end);
            break;
        case Insert_position.DOCUMENT_START:
            doc.replaceRange(text+'\n', { line: 0, ch: 0 });
            break;
        case Insert_position.DOCUMENT_START_SAFE:
            const content = doc.getValue();
            const metaBlockEnd = content.indexOf('»»»');
            if (metaBlockEnd !== -1) {
                const safePos = doc.posFromIndex(metaBlockEnd + 3);
                doc.replaceRange('\n'+text, safePos);
            } else {
                doc.replaceRange(text+'\n', { line: 0, ch: 0 });
            }
            break;
        default:
            showToast('Unknown insertion position', 'warning');
    }
}

async function createdocument(Content = "") {
    if (await promptConfirm("This script is trying to create a file. That's fine?")){
        createFile(Content);
    }
}

/**
 * Fetch data from a given URL and execute a callback with the parsed JSON data.
 * Limited to same-origin or CORS-enabled endpoints for security.
 */
function fetchdata(url, callback) {
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

/**
 * Get text value from a text field
 */
function getfieldvalue(id) {
    let field = document.getElementById(id);
    if (field) { return field.value; }
    return null
}

/**
 * Set the content of a block by its ID
 */
function setblockcontent(id, value) {
    const doc = editor.getDoc();
    let content = doc.getValue();
    const rgx = new RegExp(`(^ {0,3}>\\s*\\[!.+?\\]\\(${id}\\)\\s*\\n)([\\s\\S]*?)(?=\\n{2,}|$)`, 'gm');

    if (rgx.test(content)) {
        const formattedValue = value.split('\n').map(line => `> ${line}`).join('\n');
        content = content.replace(rgx, `$1${formattedValue}`);
        doc.setValue(content);
    } else {
        showToast(`Block '${id}' not found`, 'warning');
    }
}

/**
 * Add content to the end of a block by its ID
 */
function addblockcontent(id, value) {
    const doc = editor.getDoc();
    let content = doc.getValue();
    const rgx = new RegExp(
        `(^ {0,3}>\\s*\\[!.+?\\]\\(${id}\\)\\s*\\n)((?:>.*\\n)*)(?=\\n{2,}|$)`,
        'gm'
    );

    if (rgx.test(content)) {
        content = content.replace(rgx, (match, header, blockContent) => {
            const trimmed = blockContent.trimEnd();
            return `${header}${trimmed}\n> ${value}\n`;
        });
        doc.setValue(content);
    } else {
        showToast(`Block '${id}' not found`, 'warning');
    }
}


/**
 * Add content to the start of a block by its ID
 */
function shiftblockcontent(id, value) {
    const doc = editor.getDoc();
    let content = doc.getValue();
    const rgx = new RegExp(`(^ {0,3}>\\s*\\[!.+?\\]\\(${id}\\)\\s*\\n)([\\s\\S]*?)(?=\\n{2,}|$)`, 'gm');

    if (rgx.test(content)) {
        content = content.replace(rgx, (match, header, blockContent) => {
            // Garante espaçamento certinho
            return `${header}> ${value}\n${blockContent.trimStart()}`;
        });
        doc.setValue(content);
    } else {
        showToast(`Block '${id}' not found`, 'warning');
    }
}


/**
 * Rename the title of a block by its ID
 */
function renameblock(id, name) {
    const doc = editor.getDoc();
    let content = doc.getValue();
    const rgx = new RegExp(`(^ {0,3}>\\s*\\[!)(.+?)(\\]\\(${id}\\))`, 'gm');

    if (rgx.test(content)) {
        content = content.replace(rgx, `$1${name}$3`);
        doc.setValue(content);
    } else {
        showToast(`Block '${id}' not found`, 'warning');
    }
}
