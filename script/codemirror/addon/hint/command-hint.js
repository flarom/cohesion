(function (mod) {
    if (typeof exports == "object" && typeof module == "object")
        mod(require("../../lib/codemirror"));
    else if (typeof define == "function" && define.amd)
        define(["../../lib/codemirror"], mod);
    else mod(CodeMirror);
})(function (CodeMirror) {
    "use strict";
    var CommandRegistry = (function() {
        var commands = {};

        return {
            register: function(name, obj) {
                commands[name] = obj;
            },
            unregisterWhere: function(fn) {
                for (let name in commands) {
                    if (fn(commands[name], name)) {
                        delete commands[name];
                    }
                }
            },
            get: function(name) {
                return commands[name];
            },
            keys: function() {
                return Object.keys(commands);
            },
            all: function() {
                return commands;
            }
        };
    })();

    if (typeof CodeMirror !== 'undefined') CodeMirror.CommandRegistry = CommandRegistry;
    if (typeof window !== 'undefined') window.CommandRegistry = CommandRegistry;

    CommandRegistry.register("today", {
        description: "Today's date and time",
        icon: "today",
        exec: function(arg) { insertDate(); }
    });

    CommandRegistry.register("toc", {
        description: "Table of Contents",
        icon: "toc",
        exec: function(arg) { insertBlock(getSummary(editor.getValue())); }
    });

    CommandRegistry.register("code", {
        description: "Create a code block",
        icon: "code_blocks",
        exec: function(arg) { insertSnippet('```${1:Language}\n${2:Code}\n```'); }
    });

    CommandRegistry.register("details", {
        description: "Hidable content block",
        icon: "expand_all",
        exec: function(arg) { insertSnippet('> [!DETAILS:${1:Title}]\n> ${2:Content}'); }
    });

    CommandRegistry.register("meta", {
        description: "Create a meta block at the top",
        icon: "sell",
        exec: function(arg) { insertSnippetAtTop(getMeta(), '~'); }
    });

    CommandRegistry.register("link", {
        description: "Website URL or internal link",
        icon: "link",
        exec: function(arg) {
            selectFromMenu(["Website", "Document"], function(selectedIndex) {
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

                        selectFromMenu(docTitles, function(docIndex) {
                            const title = docTitles[docIndex];
                            insertAt(`[[${title}]]`, 2, 2 + title.length + 4);
                        });
                        break;
                }
            });
        }
    });

    CommandRegistry.register("list", {
        description: "Ordered, unordered, or task list",
        icon: "list",
        exec: function(arg) {
            let cm = editor;
            let state = { type: null, indentCounters: {} };

            selectFromMenu(["Ordered list", "Unordered list", "Task list"], function(selectedIndex) {
                switch(selectedIndex) {
                    case 0: state.type = "ordered"; break;
                    case 1: state.type = "unordered"; break;
                    case 2: state.type = "task"; break;
                }

                function openMenu() {
                    selectFromMenu(["Add line","Remove line","Add indent","Remove indent","Done"], function(selectedIndex) {
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
                                if (lineIndex >= 0) cm.replaceRange("\t", {line: lineIndex, ch: 0});
                                break;
                            }

                            case 3: { // Remove indent
                                if (lineIndex >= 0) {
                                    const lineText = cm.getLine(lineIndex);
                                    if (lineText.startsWith("\t")) cm.replaceRange("", {line: lineIndex, ch: 0}, {line: lineIndex, ch: 1});
                                }
                                break;
                            }

                            case 4: return; // Done
                        }

                        setTimeout(openMenu, 10);
                    });
                }

                openMenu();
            });
        }
    });

    CommandRegistry.register("table", {
        description: "Insert a table",
        icon: "table",
        exec: function(arg) {
            let cm = editor;
            let state = { cols:3, rows:3, width:4, from:null, to:null };

            function updateTable() {
                const table = getTable(state.cols, state.rows, state.width);

                if (state.from && state.to) {
                    cm.replaceRange(table, state.from, state.to);
                    state.to = { line: state.from.line + table.split("\n").length - 1, ch: table.split("\n").slice(-1)[0].length };
                } else {
                    const cursor = cm.getCursor();
                    cm.replaceRange(table, cursor);
                    state.from = { line: cursor.line, ch: 0 };
                    state.to = { line: cursor.line + table.split("\n").length - 1, ch: table.split("\n").slice(-1)[0].length };
                }
            }

            function openMenu() {
                selectFromMenu(["Add row","Add column","Remove row","Remove column","Done"], function(selectedIndex) {
                    switch (selectedIndex) {
                        case 0: state.rows++; break;
                        case 1: state.cols++; break;
                        case 2: state.rows = Math.max(1, state.rows - 1); break;
                        case 3: state.cols = Math.max(1, state.cols - 1); break;
                        case 4: return;
                    }

                    updateTable();
                    setTimeout(openMenu, 10);
                });
            }

            updateTable();
            openMenu();
        }
    });

    CommandRegistry.register("resources", {
        description: "Pick items from your resources folder",
        icon: "attach_file",
        exec: async function() {
            try {
                const files = await Resources.getFSFiles();
                if (files.length === 0) { showToast("No files in resources.", "info"); return; }
                const fileOptions = files.map(f => f.name);
                selectFromMenu(fileOptions, (fileIndex) => {
                    const file = files[fileIndex];
                    const filePath = `resources/${file.name}`;
                    let markdown = `\${1:${filePath}}`;
                    insertSnippet(markdown);
                });
            } catch (err) { showToast("Failed to list resources.", "error"); console.error(err); }
        }
    });

    // CommandRegistry.register("resources", {
    //     description: "Manage your resources folder",
    //     icon: "attach_file",
    //     exec: async function(arg) {
    //         const options = ["Upload","Select","Manage Resources"];

    //         selectFromMenu(options, async (selectedIndex) => {
    //             switch (selectedIndex) {
    //                 case 0: // Upload
    //                     try {
    //                         const file = await Resources.uploadFSFile("*/*");
    //                         const filePath = `resources/${file.name}`;
    //                         let markdown = `![\${1:ALT TEXT}](${filePath})\${2: }`;
    //                         insertSnippet(markdown);
    //                         showToast(`Archived ${file.name}`, "archive");
    //                     } catch (err) { showToast("Failed to upload file.", "error"); console.error(err); }
    //                     break;

    //                 case 1: // Open existing
    //                     try {
    //                         const files = await Resources.getFSFiles();
    //                         if (files.length === 0) { showToast("No files in resources.", "info"); return; }
    //                         const fileOptions = files.map(f => f.name);
    //                         selectFromMenu(fileOptions, (fileIndex) => {
    //                             const file = files[fileIndex];
    //                             const filePath = `resources/${file.name}`;
    //                             let markdown = `![\${1:ALT TEXT}](${filePath})\${2: }`;
    //                             insertSnippet(markdown);
    //                         });
    //                     } catch (err) { showToast("Failed to list resources.", "error"); console.error(err); }
    //                     break;

    //                 case 2: // Manage Resources
    //                     let leftPane = `<button class='icon-button' onclick='Resources.uploadFSFile().then(() => renderFSFiles());' translate='no' title='Upload file'>add</button>`;
    //                     let rightpane = `<button class='icon-button' translate='no' title='Search'>search</button>\n                            <div class='dropdown'>\n                                <button class='icon-button' onmousedown='toggleDropdown("resources-more-menu")' translate='no' title='More options'>more_vert</button>\n                                <div class='dropdown-content menu' id='resources-more-menu'>\n                                    <button class='text-button'>About Resources</button>\n                                    <button class='text-button danger' onmouseup='promptDeleteAllFS()'>Delete all data</button>\n                                </div>\n                            </div>`;

    //                     showMessageFromFile("dialogs/resources.html", true, false, true, true, 800, leftPane, "", rightpane);
    //                     break;
    //             }
    //         });
    //     }
    // });

    CommandRegistry.register("admonition", {
        description: "Note, tip, warning, or important section",
        icon: "warning",
        exec: function(arg) {
            selectFromMenu(["Note","Tip","Important","Warning","Caution"], function(selectedIndex) {
                switch (selectedIndex) {
                    case 0: insertBlock("> [!NOTE]\n> "); break;
                    case 1: insertBlock("> [!TIP]\n> "); break;
                    case 2: insertBlock("> [!IMPORTANT]\n> "); break;
                    case 3: insertBlock("> [!WARNING]\n> "); break;
                    case 4: insertBlock("> [!CAUTION]\n> "); break;
                }
            });
        }
    });

    CommandRegistry.register("field", {
        description: "Text, number, slider, date, or time input",
        icon: "edit_square",
        exec: function(arg) {
            selectFromMenu(["Text","Slider","Spinner","Date","Time"], function(selectedIndex) {
                switch(selectedIndex) {
                    case 0: insertSnippet(`> [!FIELD:text](\${1:ID})\n> \${2:Text}`); break;
                    case 1: insertSnippet(`> [!FIELD:range](\${1:ID})\n> \${2:Numeric value}`); break;
                    case 2: insertSnippet(`> [!FIELD:number](\${1:ID})\n> \${2:Numeric value}`); break;
                    case 3: insertSnippet(`> [!FIELD:date](\${1:ID})\n> \${2:${strftime('%Y-%m-%d')}}`); break;
                    case 4: insertSnippet(`> [!FIELD:time](\${1:ID})\n> \${2:${strftime('%H:%M')}}`); break;
                }
            });
        }
    });

    CommandRegistry.register("button", {
        description: "Button that executes arbitrary code",
        icon: "left_click",
        exec: function() {
            insertSnippet(`> [!BUTTON:\${1:Label}](\${2:ID})\n> \${3:JS body}`)
        }
    })

    CommandRegistry.register("graph", {
        description: "Pie, bar, or line chart",
        icon: "bar_chart",
        exec: function(arg) {
            selectFromMenu(["pizza","bars","lines"], function(selectedIndex) {
                switch (selectedIndex) {
                    case 0: insertSnippet("> [!graph:pie]\n> ${1:Label 1}, ${2:numeric value}\n> ${3:Label 2}, ${4:numeric value}"); break;
                    case 1: insertSnippet("> [!graph:bar]\n> ${1:Label 1}, ${2:numeric value}\n> ${3:Label 2}, ${4:numeric value}"); break;
                    case 2: insertSnippet("> [!graph:line]\n> ${1:Label 1}, ${2:Label 2}\n> ${3:numeric value}, ${4:numeric value}"); break;
                }
            });
        }
    });

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

    function showTextMenu(callback, message, deleteInput = false) {
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
                displayText: message,
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

    function selectFromMenu(options, callback) {
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
    window.selectFromMenu = selectFromMenu;
    window.showTextMenu = showTextMenu;

    CodeMirror.registerHelper("hint", "command", function (editor, options) {
        var cur = editor.getCursor(), curLine = editor.getLine(cur.line);
        var end = cur.ch, start = end;
        while (start && curLine.charAt(start - 1) !== "/") --start;
        if (curLine.charAt(start - 1) !== "/") return;
        var curWord = curLine.slice(start, end);

        var list = [];
        var match = curWord.match(/^([a-zA-Z]+)?(\d*)$/);
        var cmd = (match && match[1]) ? match[1] : "";
        var arg = (match && match[2]) ? match[2] : "";

        let keys = CommandRegistry.keys().filter(function(key) { return !cmd || fuzzyMatch(key, cmd); });
        keys.sort();

        let maxNameLength = 0;
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            if (key.length > maxNameLength) maxNameLength = key.length;
        }

        for (var j = 0; j < keys.length; j++) {
            (function() {
                var commandKey = keys[j];
                var cmdObj = CommandRegistry.get(commandKey);
                var spaces = " ".repeat(maxNameLength - commandKey.length + 2);
                list.push({
                    text: "/" + commandKey + (arg ? arg : ""),
                    displayText: commandKey,

                    render: function(el, data, completion) {
                        const descr = cmdObj?.description || "";
                        const icon = cmdObj?.icon || "";

                        el.innerHTML = "";
                        el.style.display = "flex";
                        el.style.gap = "6px";
                        el.style.alignItems = "center";

                        // icon
                        const iconEl = document.createElement("span");
                        iconEl.textContent = icon;
                        iconEl.style.fontFamily = "Material Symbols Rounded";
                        iconEl.style.opacity = "0.6";

                        // command name
                        const nameEl = document.createElement("span");
                        nameEl.textContent = commandKey;

                        // description
                        const descEl = document.createElement("span");
                        descEl.textContent = descr;
                        descEl.style.opacity = "0.6";

                        el.appendChild(iconEl);
                        el.appendChild(nameEl);
                        el.appendChild(descEl);
                    },

                    hint: function(cm, data, completion) {
                        var from = CodeMirror.Pos(cur.line, start - 1);
                        var to = CodeMirror.Pos(cur.line, end);
                        cm.replaceRange("", from, to);

                        if (cmdObj && typeof cmdObj.exec === "function") {
                            cmdObj.exec(arg);
                        }
                    }
                });
            })();
        }

        return {
            list: list,
            from: CodeMirror.Pos(cur.line, start - 1),
            to: CodeMirror.Pos(cur.line, end),
        };
    });
});
