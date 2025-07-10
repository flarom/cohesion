(function (mod) {
    if (typeof exports == "object" && typeof module == "object")
        // CommonJS
        mod(require("../../lib/codemirror"));
    else if (typeof define == "function" && define.amd)
        // AMD
        define(["../../lib/codemirror"], mod);
    else mod(CodeMirror);
})(function (CodeMirror) {
    "use strict";

    var EMOJI_WORD = /:[\w+\-_]*:?/;

    CodeMirror.registerHelper("hint", "emoji", function (editor, options) {
        var cur = editor.getCursor(),
            curLine = editor.getLine(cur.line);
        var end = cur.ch,
            start = end;
        while (start && curLine.charAt(start - 1) !== ":") --start;
        if (curLine.charAt(start - 1) !== ":") return;
        var curWord = curLine.slice(start - 1, end);
        if (!curWord.startsWith(":")) return;

        var list = [];
        for (var key in showdown.helper.emojis) {
            var emojiCode = ":" + key + ":";
            if (emojiCode.indexOf(curWord) === 0) {
                list.push({
                    text: emojiCode,
                    displayText: showdown.helper.emojis[key] + "  " + emojiCode,
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
