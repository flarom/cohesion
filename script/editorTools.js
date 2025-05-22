/**
 * aditional tools for editors to use in their documents scripts and automations
 */

function Notify(message) {
    showToast(message, 'info');
}

const Insert_position = Object.freeze({
    CURSOR: 0,              // Cursor Position
    DOCUMENT_END: 1,        // End of the document
    DOCUMENT_START: 2,      // Start of the document
    DOCUMENT_START_SAFE: 3, // Start of the document, after the meta block
});

function Insert_text(text, positon = Insert_position.DOCUMENT_END) {
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

async function Create_document(Content = "") {
    if (await promptConfirm("This script is trying to create a file. That's fine?")){
        createFile(Content);
    }
}

/**
 * Fetch data from a given URL and execute a callback with the parsed JSON data.
 * Limited to same-origin or CORS-enabled endpoints for security.
 */
function Fetch_data(url, callback) {
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
 * Fetch text data from a given URL and insert it into the document at the given position.
 * Supports JSON or plain text.
 */
function Fetch_insert(url, position = Insert_position.CURSOR, parseAs = 'text') {
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return parseAs === 'json' ? response.json() : response.text();
        })
        .then(data => {
            const text = parseAs === 'json' ? JSON.stringify(data, null, 2) : data;
            Insert_text(text, position);
            showToast(`Data fetched and inserted`);
        })
        .catch(error => {
            showToast(`Fetch error: ${error.message}`, 'error');
        });
}
