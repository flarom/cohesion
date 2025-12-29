(function (mod) {
    if (typeof exports == "object" && typeof module == "object") {
        mod(require("../../lib/codemirror"));
    } else if (typeof define == "function" && define.amd) {
        define(["../../lib/codemirror"], mod);
    } else {
        mod(CodeMirror);
    }
})(function (CodeMirror) {
    "use strict";

    function isOnlyWhitespace(str) {
        return /^\s+$/.test(str);
    }

    function hasNonWhitespace(str) {
        return /\S/.test(str);
    }

    function clearMarks(cm) {
        const marks = cm.state.selectionHighlightMarks;
        if (marks) {
            for (let i = 0; i < marks.length; i++) {
                marks[i].clear();
            }
        }
        cm.state.selectionHighlightMarks = [];
    }

    function getTarget(cm) {
        const sel = cm.getSelection();

        if (sel && sel.length && sel.indexOf("\n") === -1) {
            if (!hasNonWhitespace(sel)) return null;

            return {
                text: sel,
                range: {
                    from: cm.getCursor("from"),
                    to: cm.getCursor("to"),
                },
            };
        }

        const cursor = cm.getCursor();
        const line = cm.getLine(cursor.line);
        if (!line) return null;

        const ch = line[cursor.ch] || "";
        if (/\s/.test(ch)) return null;

        const word = cm.findWordAt(cursor);
        const text = cm.getRange(word.anchor, word.head);

        if (!text || isOnlyWhitespace(text)) return null;

        return {
            text,
            range: {
                from: word.anchor,
                to: word.head,
            },
        };
    }

    function highlight(cm) {
        clearMarks(cm);

        const target = getTarget(cm);
        if (!target) return;

        const search = cm.getSearchCursor(target.text, null, { caseFold: cm.options.selectionHighlightCaseInsensitive });

        while (search.findNext()) {
            const from = search.from();
            const to = search.to();
            const text = cm.getRange(from, to);

            if (isOnlyWhitespace(text)) continue;

            // if (sameRange({ from, to }, target.range)) continue;

            const mark = cm.markText(from, to, { className: "cm-selection-similar" });

            cm.state.selectionHighlightMarks.push(mark);
        }
    }

    CodeMirror.defineOption("selectionSimilar", false, function (cm, val, old) {
        if (old && old !== CodeMirror.Init) {
            cm.off("cursorActivity", cm.state.selectionHighlightHandler);
            clearMarks(cm);
        }

        if (val) {
            cm.state.selectionHighlightMarks = [];
            cm.state.selectionHighlightHandler = function () {
                highlight(cm);
            };
            cm.on("cursorActivity", cm.state.selectionHighlightHandler);
        }
    });

    CodeMirror.defineOption("selectionHighlightCaseInsensitive", true);
});
