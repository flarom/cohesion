








renderEditor();
editor.focus();

document.addEventListener("DOMContentLoaded", () => {
    loadSettings();
});

//
// EDITOR
//

// Initialize CodeMirror editor
const editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
    mode: "markdown", // Set mode to markdown, hardcoded
    lineNumbers: Settings.getSetting("editorLineNumbers", "false") === "true", // Show line numbers based on settings, false as default
    theme: "default", // Set theme to default, hardcoded
    lineWrapping: true, // Enable line wrapping, hardcoded
    autoCloseBrackets: Settings.getSetting("editorAutoCloseBrackets", "true") === "true", // Auto close brackets based on settings, true as default
    autoCloseTags: Settings.getSetting("editorAutoCloseTags", "false") === "true", // Auto close tags based on settings, false as default
    extraKeys: {
        Enter: "newlineAndIndentContinueMarkdownList", // Pressing Enter continues markdown lists
        "Ctrl-Space": "autocomplete", // Trigger autocomplete with Ctrl-Space
        Tab: _snippetTab, // Custom snippet tab function
        "Shift-Tab": _snippetShiftTab, // Custom snippet shift-tab function
        "Ctrl-K": false, // Disable default Ctrl-K behavior
        "Cmd-K": false // Disable default Cmd-K behavior (for Mac)
    },
    keyMap: "sublime", // Use Sublime Text keymap, hardcoded
    direction: Settings.getSetting("editorDirection", "ltr"), // Set text direction based on settings, default to left-to-right
    showCursorWhenSelecting: true, // Show cursor when selecting text, hardcoded
    styleActiveLine: Settings.getSetting("editorHighlightActiveLine", "true") === "true", // Highlight active line based on settings, true as default
});

// Add overlays
editor.addOverlay(markOverlay); // Overlay for displaying ==highlighted text==
editor.addOverlay(underlineOverlay); // Overlay for displaying __underlined text__

const editorMenu = document.getElementById("editorMenu"); // editor context menu
const hrContextualSeparator = document.getElementById("contextual-selection-separator"); // horizontal line shown when contextual options are available
const btnFormatTable = document.getElementById("formatTable"); // button to format selected text as table
const btnOpenURL = document.getElementById("openSelectedURL"); // button to open selected URL
const btnPeek = document.getElementById("peekmedia"); // button to peek selected media

// Handle right-click context menu
editor.getWrapperElement().addEventListener("contextmenu", function (e) {
    e.preventDefault();

    // if table selected, show format table option
    if (hasTableSelected()) {
        hrContextualSeparator.style.display = "block";
        btnFormatTable.style.display = "flex";
        btnOpenURL.style.display = "none";
        btnPeek.style.display = "none";
    }
    
    // if media selected, show peek option
    else if (hasMediaSelected()) {
        hrContextualSeparator.style.display = "block";
        btnFormatTable.style.display = "none";
        btnOpenURL.style.display = "none";
        btnPeek.style.display = "flex";
    }
    
    // if URL selected, show open URL option
    else if (hasURLSelected()) {
        hrContextualSeparator.style.display = "block";
        btnFormatTable.style.display = "none";
        btnOpenURL.style.display = "flex";
        btnPeek.style.display = "none";
    } 
    
    // else, hide contextual options
    else {
        hrContextualSeparator.style.display = "none";
        btnFormatTable.style.display = "none";
        btnOpenURL.style.display = "none";
        btnPeek.style.display = "none";
    }

    // Show context menu at mouse position
    const rect = editor.getWrapperElement().getBoundingClientRect();
    editorMenu.style.top = e.clientY + "px";
    editorMenu.style.left = e.clientX + "px";
    editorMenu.style.display = "block";

    const buttons = editorMenu.querySelectorAll("button");
    if (buttons.length > 0) {
        setTimeout(() => buttons[0].focus(), 0);
    }
    editorMenu.addEventListener("keydown", handleArrowNavigation);
    editorMenu.addEventListener("keydown", handleActivation);
});

// Close context menu on click outside
document.addEventListener("click", function () {
    editorMenu.style.display = "none";
    editorMenu.removeEventListener("keydown", handleArrowNavigation);
    editorMenu.removeEventListener("keydown", handleActivation);
});

// Handle paste events
editor.getWrapperElement().addEventListener("paste", async function (e) {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === "file") {
            const file = item.getAsFile();
            if (file) {
                try {
                    const savedFile = await Resources.saveClipboardFile(file);
                    const filePath = `resources/${savedFile.name}`;

                    const ext = savedFile.name.split(".").pop().toLowerCase();

                    let markdown = `![ALT TEXT](${filePath})`;

                    insertAt(markdown, 2, 10);
                    showToast(`Archieved ${savedFile.name}`, "archive");
                } catch (err) {
                    showToast("Failed to insert clipboard file.", "error");
                    console.error(err);
                }
            }
        }
    }
});

/**
 * Render the editor content based on the current index
 */
function renderEditor() {
    if (!files[index]) files[index] = "";
    editor.setValue(files[index]);
    document.getElementById("filename").innerText = getFileTitle(index) || "New document";
    document.title = getFileTitle(index) || "New document - Cohesion";
}

//
// MD TO HTML CONVERTER
//

const converter = new showdown.Converter({
    extensions: [
        'bannerImage', // banner image controled by document meta
        'internalLink', // internal link support
        'definitionList', // definition list support
        'abbreviation', // abbreviation support
        'rubyText' // ruby text support
    ],
});

// MD previewer element
const preview = document.getElementById("preview");

// Status bar elements
const statusBar = document.getElementById("status");
const cursorPosLabel = document.getElementById("cursorPosLabel");
const documentSizeLabel = document.getElementById("documentSizeLabel");
const editorModeLabel = document.getElementById("editorMode");

// Search (Ctrl-F) and replace (Ctrl-H) elements
const searchField = document.getElementById("search-field");
const replaceField = document.getElementById("replace-field");
let lastQuery = "";
let caseSensitive = false;
let useRegex = false;
let currentCursor = null;