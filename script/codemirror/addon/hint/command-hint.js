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
            description: "Today's date",
            exec: function(arg) {
                insertDate();
            }
        },
        "admonition": {
            description: "Insert an admonition",
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
        "list": {
            description: "Insert a list",
            exec: function(arg) {
                selectFromMenu(editor, ["Ordered", "Unordered", "Task list"], function(selectedIndex) {
                    selectFromMenu(editor, [1,2,3,4,5,6,7,8,9,10].map(String), function(countIndex) {
                        let count = countIndex + 1;
                        let items = "";

                        switch (selectedIndex) {
                            case 0: // ordered
                                items = Array.from({length: count}, (_, i) => `${i+1}. `).join("\n");
                                break;
                            case 1: // unordered
                                items = Array.from({length: count}, () => `- `).join("\n");
                                break;
                            case 2: // task
                                items = Array.from({length: count}, () => `- [ ] `).join("\n");
                                break;
                        }

                        insertBlock(items);
                    });
                });
            }
        },
        "field": {
            description: "Create an input field",
            exec: function(arg) {
                selectFromMenu(editor, ["Textbox", "Slider", "Spinner", "Date", "Time"], function(selectedIndex) {
                    switch(selectedIndex) {
                        case 0: //text
                            insertAt(`<input id="" value="" type="text">`, 11,11);
                            break;
                        case 1: //range
                            insertAt(`<input id="" value="50" min="0" max="100" step="1" type="range">`, 11,11);
                            break;
                        case 2: //number
                            insertAt(`<input id="" value="0" min="0" max="100" step="1" type="number">`,11,11);
                    }
                }); 
            }
        },
        "summary": {
            description: "Create a summary",
            exec: function(arg) {
                insertBlock(getSummary(editor.getValue()));
            }
        },
        "table": {
            description: "Insert table",
            exec: function(arg) {
                let count = parseInt(arg, 10) || 3;
                insertBlock(getTable(count, 2));
            }
        },
        "resources": {
            description: "Insert a media file",
            exec: async function(arg) {
                const options = ["Upload", "Select", "Manage Resources"];

                selectFromMenu(editor, options, async (selectedIndex) => {
                    switch (selectedIndex) {
                        case 0: // Upload
                            try {
                                const file = await uploadFSFile("*/*");
                                const filePath = `resources/${file.name}`;

                                let markdown = `![ALT TEXT](${filePath})`;
                                insertAt(markdown, 2, 10);
                                showToast(`Archived ${file.name}`, "archive");
                            } catch (err) {
                                showToast("Failed to upload file.", "error");
                                console.error(err);
                            }
                            break;

                        case 1: // Open existing
                            try {
                                const files = await getFSFiles();
                                if (files.length === 0) {
                                    showToast("No files in resources.", "info");
                                    return;
                                }
                                const fileOptions = files.map(f => f.name);
                                selectFromMenu(editor, fileOptions, (fileIndex) => {
                                    const file = files[fileIndex];
                                    const filePath = `resources/${file.name}`;
                                    let markdown = `![ALT TEXT](${filePath})`;
                                    insertAt(markdown, 2, 10);
                                });
                            } catch (err) {
                                showToast("Failed to list resources.", "error");
                                console.error(err);
                            }
                            break;

                        case 2: // Manage Resources
                            showMessageFromFile('dialogs/resources.html', true, true);
                            hideAllMenus();
                            break;
                    }
                });
            }
        },
        "link": {
            description: "Insert an URL",
            exec: function(arg) {
                selectFromMenu(editor, ["Website", "Document"], function(selectedIndex) {
                    switch(selectedIndex) {
                        case 0: // Website
                            insertAt("[TITLE](URL)", 8, 11);
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
        "graph": {
            description: "Insert a graph",
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

        for (var key in COMMANDS) {
            if (!cmd || fuzzyMatch(key, cmd)) {
                (function(commandKey) {
                    list.push({
                        text: "/" + commandKey + (arg ? arg : ""),
                        displayText: "/" + commandKey + " - " + COMMANDS[commandKey].description,
                        hint: function(cm, data, completion) {
                            var from = CodeMirror.Pos(cur.line, start - 1);
                            var to = CodeMirror.Pos(cur.line, end);
                            cm.replaceRange("", from, to);
                            COMMANDS[commandKey].exec(arg);
                        }
                    });
                })(key);
            }
        }

        return {
            list: list,
            from: CodeMirror.Pos(cur.line, start - 1),
            to: CodeMirror.Pos(cur.line, end),
        };
    });
});
