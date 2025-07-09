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
        "list": {
            description: "Unordered list",
            exec: function(arg) {
                let count = parseInt(arg, 10) || 3;
                let items = Array.from({length: count}, () => '- ').join('\n');
                insertBlock(items);
            }
        },
        "ul": {
            description: "Unordered list",
            exec: function(arg) {
                let count = parseInt(arg, 10) || 3;
                let items = Array.from({length: count}, () => '- ').join('\n');
                insertBlock(items);
            }
        },
        "ol": {
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
    };

    CodeMirror.registerHelper("hint", "command", function (editor, options) {
        var cur = editor.getCursor(),
            curLine = editor.getLine(cur.line);
        var end = cur.ch,
            start = end;
        while (start && curLine.charAt(start - 1) !== "/") --start;
        if (curLine.charAt(start - 1) !== "/") return;
        var curWord = curLine.slice(start, end);

        var list = [];
        if (!curWord) {
            for (var key in COMMANDS) {
                (function(commandKey) {
                    list.push({
                        text: "/" + commandKey,
                        displayText: "/" + commandKey + " - " + COMMANDS[commandKey].description,
                        hint: function(cm, data, completion) {
                            var from = CodeMirror.Pos(cur.line, start - 1);
                            var to = CodeMirror.Pos(cur.line, end);
                            cm.replaceRange("", from, to);
                            COMMANDS[commandKey].exec();
                        }
                    });
                })(key);
            }
        } else {
            var match = curWord.match(/^([a-zA-Z]+)(\d*)$/);
            if (!match) return;
            var cmd = match[1];
            var arg = match[2];

            for (var key in COMMANDS) {
                if (key.indexOf(cmd) === 0) {
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
        }
        return {
            list: list,
            from: CodeMirror.Pos(cur.line, start - 1),
            to: CodeMirror.Pos(cur.line, end),
        };
    });
});