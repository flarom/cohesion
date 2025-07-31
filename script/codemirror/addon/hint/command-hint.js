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
        "note": {
            description: "Note block",
            exec: function(arg) {
                insertBlock("> [!NOTE]\n> \n> \n> ");
            }
        },
        "todo": {
            description: "To-Do block",
            exec: function(arg) {
                insertBlock("> [!TODO]\n> \n> \n> ");
            }
        },
        "list": {
            description: "Unordered list",
            exec: function(arg) {
                let count = parseInt(arg, 10) || 3;
                let items = Array.from({length: count}, () => '- ').join('\n');
                insertBlock(items);
            }
        },
        "unorderedlist": {
            description: "Unordered list",
            exec: function(arg) {
                let count = parseInt(arg, 10) || 3;
                let items = Array.from({length: count}, () => '- ').join('\n');
                insertBlock(items);
            }
        },
        "orderedlist": {
            description: "Ordered list",
            exec: function(arg) {
                let count = parseInt(arg, 10) || 3;
                let items = Array.from({length: count}, (_, i) => `${i+1}. `).join('\n');
                insertBlock(items);
            }
        },
        "checklist": {
            description: "Check list",
            exec: function(arg) {
                let count = parseInt(arg, 10) || 3;
                let items = Array.from({length: count}, () => '- [ ] ').join('\n');
                insertBlock(items);
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
        "image": {
            description: "Insert an image",
            exec: function(arg) {
                insertAt("![ALT TEXT](URL)", 12, 15);
            }
        },
        "url": {
            description: "Insert an URL",
            exec: function(arg) {
                insertAt("[TITLE](URL)", 8, 11);
            }
        },
        "link": {
            description: "Insert an URL",
            exec: function(arg) {
                insertAt("[TITLE](URL)", 8, 11);
            }
        },
        "anchor": {
            description: "Insert an URL",
            exec: function(arg) {
                insertAt("[TITLE](URL)", 8, 11);
            }
        },
        "details": {
            description: "Insert a detail block",
            exec: function(arg) {
                insertAt("> [!DETAILS:title here]", 12, 22);
            }
        }
    };

    function fuzzyMatch(str, pattern) {
        pattern = pattern.replace(/:/g, "");
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
