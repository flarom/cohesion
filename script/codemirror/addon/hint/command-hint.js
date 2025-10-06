(function (mod) {
    if (typeof exports == "object" && typeof module == "object")
        mod(require("../../lib/codemirror"));
    else if (typeof define == "function" && define.amd)
        define(["../../lib/codemirror"], mod);
    else mod(CodeMirror);
})(function (CodeMirror) {
    "use strict";

    var COMMANDS = {
        "today": {
            description: "Today's date and time",
            exec: function(arg) {
                insertDate();
            }
        },
        "toc": {
            description: "Table of Contents",
            exec: function(arg) {
                insertBlock(getSummary(editor.getValue()));
            }
        },
        "code": {
            description: "Create a code block",
            exec: function(arg) {
                insertSnippet('```${1:Language}\n${2:Code}\n```');
            }
        },
        "details": {
            description: "Hidable content block",
            exec: function(arg) {
                insertSnippet('> [!DETAILS:${1:Title}]\n> ${2:Content}');
            }
        },
        "embed": {
            description: "Embeded web content",
            exec: function(arg) {
                insertSnippet('> [!EMBED]\n> ${1:https\://example.com}');
            }
        },
        "meta": {
            description: "Create a meta block at the top",
            exec: function(arg) {
                insertAtTop(getMeta());
            }
        },
        "link": {
            description: "Website URL or internal link",
            exec: function(arg) {
                selectFromMenu(editor, ["Website", "Document"], function(selectedIndex) {
                    switch(selectedIndex) {
                        case 0: // Website
                            insertSnippet("[${1:Website}](${2:URL}) ${3: }");
                            break;

                        case 1: // Document
                            loadFilesFromStorage();

                            if (files.length === 0) {
                                showToast("No documents available.", "info");
                                return;
                            }

                            const docTitles = files.map((_, i) => getFileTitle(i) || `Untitled ${i+1}`);

                            selectFromMenu(editor, docTitles, function(docIndex) {
                                const title = docTitles[docIndex];
                                insertAt(`[[${title}]]`, 2, 2 + title.length + 4);
                            });
                            break;
                    }
                });
            }
        },
        "list": {
            description: "Ordered, unordered, or task list",
            exec: function(arg) {
                let cm = editor;
                let state = {
                    type: null,
                    indentCounters: {}
                };

                selectFromMenu(editor, ["Ordered list", "Unordered list", "Task list"], function(selectedIndex) {
                    switch(selectedIndex) {
                        case 0: state.type = "ordered"; break;
                        case 1: state.type = "unordered"; break;
                        case 2: state.type = "task"; break;
                    }

                    function openMenu() {
                        selectFromMenu(editor, [
                            "Add line",
                            "Remove line",
                            "Add indent",
                            "Remove indent",
                            "Done"
                        ], function(selectedIndex) {
                            const cursor = cm.getCursor();
                            const lineIndex = cursor.line > 0 ? cursor.line - 1 : cursor.line;

                            switch(selectedIndex) {
                                case 0: { // Add line
                                    let indent = "";
                                    if (lineIndex >= 0) {
                                        const prevLine = cm.getLine(lineIndex);
                                        const match = prevLine.match(/^\t*/);
                                        if (match) indent = match[0];
                                    }

                                    let lineContent = "";
                                    const level = indent.length;

                                    switch(state.type) {
                                        case "ordered":
                                            if (!state.indentCounters[level]) state.indentCounters[level] = 1;
                                            lineContent = `${state.indentCounters[level]}. `;
                                            state.indentCounters[level]++;
                                            break;
                                        case "unordered":
                                            lineContent = "- ";
                                            break;
                                        case "task":
                                            lineContent = "- [ ] ";
                                            break;
                                    }

                                    cm.replaceRange(indent + lineContent + "\n", cursor);
                                    break;
                                }

                                case 1: { // Remove line
                                    if (lineIndex >= 0) {
                                        const lineText = cm.getLine(lineIndex);
                                        const level = (lineText.match(/^\t*/)[0] || "").length;

                                        if (state.type === "ordered" && state.indentCounters[level] > 1) {
                                            state.indentCounters[level]--;
                                        }

                                        cm.replaceRange("", {line: lineIndex, ch: 0}, {line: lineIndex + 1, ch: 0});
                                    }
                                    break;
                                }

                                case 2: { // Add indent
                                    if (lineIndex >= 0) {
                                        cm.replaceRange("\t", {line: lineIndex, ch: 0});
                                    }
                                    break;
                                }

                                case 3: { // Remove indent
                                    if (lineIndex >= 0) {
                                        const lineText = cm.getLine(lineIndex);
                                        if (lineText.startsWith("\t")) {
                                            cm.replaceRange("", {line: lineIndex, ch: 0}, {line: lineIndex, ch: 1});
                                        }
                                    }
                                    break;
                                }

                                case 4: // Done
                                    return;
                            }

                            setTimeout(openMenu, 10);
                        });
                    }

                    openMenu();
                });
            }
        },
        "table": {
            description: "Insert a table",
            exec: function(arg) {
                let cm = editor;
                let state = {
                    cols: 3,
                    rows: 3,
                    width: 4,
                    from: null,
                    to: null
                };

                function updateTable() {
                    const table = getTable(state.cols, state.rows, state.width);

                    if (state.from && state.to) {
                        cm.replaceRange(table, state.from, state.to);
                        state.to = {
                            line: state.from.line + table.split("\n").length - 1,
                            ch: table.split("\n").slice(-1)[0].length
                        };
                    } else {
                        const cursor = cm.getCursor();
                        cm.replaceRange(table, cursor);
                        state.from = { line: cursor.line, ch: 0 };
                        state.to = {
                            line: cursor.line + table.split("\n").length - 1,
                            ch: table.split("\n").slice(-1)[0].length
                        };
                    }
                }

                function openMenu() {
                    selectFromMenu(editor, [
                        "Add row",
                        "Add column",
                        "Remove row",
                        "Remove column",
                        "Done"
                        // "Increase width",
                        // "Decrease width"
                    ], function(selectedIndex) {
                        switch (selectedIndex) {
                            case 0: state.rows++; break;
                            case 1: state.cols++; break;
                            case 2: state.rows = Math.max(1, state.rows - 1); break;
                            case 3: state.cols = Math.max(1, state.cols - 1); break;
                            case 4: return;
                            // case 4: state.width += 2; break;
                            // case 5: state.width = Math.max(4, state.width - 2); break;
                        }

                        updateTable();

                        setTimeout(openMenu, 10);
                    });
                }

                updateTable();
                openMenu();
            }
        },
        "resources": {
            description: "Manage your resources folder",
            exec: async function(arg) {
                const options = ["Upload", "Select", "Manage Resources"];

                selectFromMenu(editor, options, async (selectedIndex) => {
                    switch (selectedIndex) {
                        case 0: // Upload
                            try {
                                const file = await Resources.uploadFSFile("*/*");
                                const filePath = `resources/${file.name}`;

                                let markdown = `![\${1:ALT TEXT}](${filePath})\${2: }`;
                                insertSnippet(markdown);
                                showToast(`Archived ${file.name}`, "archive");
                            } catch (err) {
                                showToast("Failed to upload file.", "error");
                                console.error(err);
                            }
                            break;

                        case 1: // Open existing
                            try {
                                const files = await Resources.getFSFiles();
                                if (files.length === 0) {
                                    showToast("No files in resources.", "info");
                                    return;
                                }
                                const fileOptions = files.map(f => f.name);
                                selectFromMenu(editor, fileOptions, (fileIndex) => {
                                    const file = files[fileIndex];
                                    const filePath = `resources/${file.name}`;
                                    let markdown = `![\${1:ALT TEXT}](${filePath})\${2: }`;
                                    insertSnippet(markdown);
                                });
                            } catch (err) {
                                showToast("Failed to list resources.", "error");
                                console.error(err);
                            }
                            break;

                        case 2: // Manage Resources
                            let leftPane =
                            `<button class='icon-button' onclick='Resources.uploadFSFile().then(() => renderFSFiles());' translate='no' title='Upload file'>add</button>`

                            let rightpane =
                            `<button class='icon-button' translate='no' title='Search'>search</button>
                            <div class='dropdown'>
                                <button class='icon-button' onmousedown='toggleDropdown("resources-more-menu")' translate='no' title='More options'>more_vert</button>
                                <div class='dropdown-content menu' id='resources-more-menu'>
                                    <button class='text-button'>About Resources</button>
                                    <button class='text-button danger' onmouseup='promptDeleteAllFS()'>Delete all data</button>
                                </div>
                            </div>`

                            showMessageFromFile("dialogs/resources.html", true, false, true, true, 800, leftPane, "", rightpane);
                            break;
                    }
                });
            }
        },
        "image": {
            description: "Insert an image",
            exec: async function(arg) {
                try {
                    const file = await Resources.uploadFSFile("image/*");
                    const filePath = `resources/${file.name}`;

                    let markdown = `![\${1:ALT TEXT}](${filePath})\${2: }`;
                    insertSnippet(markdown);
                    showToast(`Archived ${file.name}`, "archive");
                } catch (err) {
                    showToast("Failed to upload file.", "error");
                    console.error(err);
                }
            }
        },
        "audio": {
            description: "Insert an audio",
            exec: async function(arg) {
                try {
                    const file = await Resources.uploadFSFile("audio/*");
                    const filePath = `resources/${file.name}`;

                    let markdown = `![\${1:ALT TEXT}](${filePath})\${2: }`;
                    insertSnippet(markdown);
                    showToast(`Archived ${file.name}`, "archive");
                } catch (err) {
                    showToast("Failed to upload file.", "error");
                    console.error(err);
                }
            }
        },
        "video": {
            description: "Insert a video",
            exec: async function(arg) {
                try {
                    const file = await Resources.uploadFSFile("video/*");
                    const filePath = `resources/${file.name}`;

                    let markdown = `![\${1:ALT TEXT}](${filePath})\${2: }`;
                    insertSnippet(markdown);
                    showToast(`Archived ${file.name}`, "archive");
                } catch (err) {
                    showToast("Failed to upload file.", "error");
                    console.error(err);
                }
            }
        },
        "admonition": {
            description: "Note, tip, warning, or important section",
            exec: function(arg) {
                selectFromMenu(editor, ["Note", "Tip", "Important", "Warning", "Caution"], function(selectedIndex) {
                    switch (selectedIndex) {
                        case 0:
                            insertBlock("> [!NOTE]\n> ");
                            break;
                        case 1:
                            insertBlock("> [!TIP]\n> ");
                            break;
                        case 2:
                            insertBlock("> [!IMPORTANT]\n> ");
                            break;
                        case 3:
                            insertBlock("> [!WARNING]\n> ");
                            break;
                        case 4:
                            insertBlock("> [!CAUTION]\n> ");
                            break;
                    }
                });
            }
        },
        "field": {
            description: "Text, number, slider, date, or time input",
            exec: function(arg) {
                selectFromMenu(editor, ["Text box", "Text area", "Slider", "Spinner", "Date", "Time"], function(selectedIndex) {
                    switch(selectedIndex) {
                        case 0: //text
                            insertSnippet('<input id="${1:ID}" value="${2:Text value}" type="text"> ${3: }');
                            break;
                        case 1: //textarea
                            insertSnippet('<textarea id="${1:ID}">${2:Text value}</textarea> ${3: }');
                            break;
                        case 2: //range
                            insertSnippet('<input id="${1:ID}" value="${2:50}" min="${3:0}" max="${4:100}" step="${5:1}" type="range"> ${6: }');
                            break;
                        case 3: //number
                            insertSnippet('<input id="${1:ID}" value="${2:0}" min="${3:0}" max="${4:100}" step="${5:1}" type="number"> ${6: }');
                            break;
                        case 4: //date
                            insertSnippet(`<input id="\${1:ID}" value="\${2:${strftime('%Y-%m-%d')}}" type="date" >\${3: }`);
                            break;
                        case 5: //time
                            insertSnippet(`<input id="\${1:ID}" value="\${2:${strftime('%H:%M')}}" type="time"> \${3: }`);
                            break;
                    }
                }); 
            }
        },
        "graph": {
            description: "Pie, bar, or line chart",
            exec: function(arg) {
                selectFromMenu(editor, ["pizza", "bars", "lines"], function(selectedIndex) {
                    switch (selectedIndex) {
                        case 0:
                            insertAt("> [!graph:pizza]\n> Label 1, value", 28,33);
                            break;
                        case 1:
                            insertAt("> [!graph:bars]\n> Label 1, value", 27,32);
                            break;
                        case 2:
                            insertAt("> [!graph:lines]\n> Label 1, [value, array]", 29, 41);
                            break;
                    }
                });
            }
        }
    };

    function fuzzyMatch(str, pattern) {
        pattern = pattern.replace(/-/g, "");
        if (!pattern) return true;
        let patternIdx = 0,
            strIdx = 0;
        while (strIdx < str.length && patternIdx < pattern.length) {
            if (str[strIdx].toLowerCase() === pattern[patternIdx].toLowerCase()) {
                patternIdx++;
            }
            strIdx++;
        }
        return patternIdx === pattern.length;
    }

    function selectFromMenu(editor, options, callback) {
        let list = options.map((opt, index) => ({
            text: opt,
            displayText: opt,
            hint: function(cm, data, completion) {
                let cur = cm.getCursor();
                let line = cm.getLine(cur.line);
                let start = cur.ch - completion.text.length;
                cm.replaceRange("", { line: cur.line, ch: start }, cur);

                callback(index);
            }
        }));

        editor.showHint({
            hint: () => ({
                list: list,
                from: editor.getCursor(),
                to: editor.getCursor()
            })
        });
    }

    function showTextMenu(editor, callback, deleteInput = false) {
        let doneClicked = false;
        const startCursor = editor.getCursor();
        const startCh = startCursor.ch;

        function openMenu() {
            if (doneClicked) return;

            const cur = editor.getCursor();
            const currentLineText = editor.getLine(cur.line);
            const typedText = currentLineText.slice(startCh);

            const list = [{
                text: "Done",
                displayText: "Done (finish typing)",
                hint: function(cm, data, completion) {
                    doneClicked = true;

                    if (deleteInput) {
                        cm.replaceRange("", {line: startCursor.line, ch: startCh}, {line: startCursor.line, ch: cur.ch});
                    }

                    callback(typedText);
                }
            }];

            editor.showHint({
                completeSingle: false,
                hint: () => ({
                    list: list,
                    from: {line: cur.line, ch: startCh},
                    to: {line: cur.line, ch: cur.ch}
                })
            });

            if (!doneClicked) {
                setTimeout(openMenu, 50);
            }
        }

        openMenu();
    }

    CodeMirror.registerHelper("hint", "command", function (editor, options) {
        var cur = editor.getCursor(),
            curLine = editor.getLine(cur.line);
        var end = cur.ch,
            start = end;
        while (start && curLine.charAt(start - 1) !== "/") --start;
        if (curLine.charAt(start - 1) !== "/") return;
        var curWord = curLine.slice(start, end);

        var list = [];
        var match = curWord.match(/^([a-zA-Z]+)?(\d*)$/);
        var cmd = match?.[1] || "";
        var arg = match?.[2] || "";

        let keys = Object.keys(COMMANDS).filter(key => !cmd || fuzzyMatch(key, cmd));
        keys.sort();

        let maxNameLength = 0;
        for (let key of keys) {
            if (key.length > maxNameLength) maxNameLength = key.length;
        }

        for (let commandKey of keys) {
            let spaces = " ".repeat(maxNameLength - commandKey.length + 2);
            list.push({
                text: "/" + commandKey + (arg ? arg : ""),
                displayText: commandKey + spaces + COMMANDS[commandKey].description,
                hint: function(cm, data, completion) {
                    var from = CodeMirror.Pos(cur.line, start - 1);
                    var to = CodeMirror.Pos(cur.line, end);
                    cm.replaceRange("", from, to);
                    COMMANDS[commandKey].exec(arg);
                }
            });
        }

        return {
            list: list,
            from: CodeMirror.Pos(cur.line, start - 1),
            to: CodeMirror.Pos(cur.line, end),
        };
    });
});
