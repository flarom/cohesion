(function (mod) {
    if (typeof exports == "object" && typeof module == "object")
        mod(require("../../lib/codemirror"));
    else if (typeof define == "function" && define.amd)
        define(["../../lib/codemirror"], mod);
    else mod(CodeMirror);
})(function (CodeMirror) {
    "use strict";

    var COMMANDS = {
        "/today": {
            description: "Insert todays date",
            exec: function(editor) {
                insertDate();
            }
        },
        "/note": {
            description: "Note block",
            exec: function(editor) {
                insertBlock("> [!NOTE]\n> \n> \n> ");
            }
        }
    };

    CodeMirror.registerHelper("hint", "command", function (editor, options) {
        var cur = editor.getCursor(),
            curLine = editor.getLine(cur.line);
        var end = cur.ch,
            start = end;
        while (start && curLine.charAt(start - 1) !== "/") --start;
        if (curLine.charAt(start - 1) !== "/") return;
        var curWord = curLine.slice(start - 1, end);
        if (!curWord.startsWith("/")) return;

        var list = [];
        for (var key in COMMANDS) {
            if (key.indexOf(curWord) === 0) {
                list.push({
                    text: key,
                    displayText: key + " - " + COMMANDS[key].description,
                    hint: function(cm, data, completion) {
                        var from = CodeMirror.Pos(cur.line, start - 1);
                        var to = CodeMirror.Pos(cur.line, end);
                        cm.replaceRange("", from, to);
                        COMMANDS[key].exec(cm);
                    }
                });
            }
        }
        return {
            list: list,
            from: CodeMirror.Pos(cur.line, start - 1),
            to: CodeMirror.Pos(cur.line, end),
        };
    });
});