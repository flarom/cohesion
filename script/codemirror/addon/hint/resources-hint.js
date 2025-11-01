(function(mod) {
    if (typeof exports == "object" && typeof module == "object")
        mod(require("codemirror"));
    else if (typeof define == "function" && define.amd)
        define(["codemirror"], mod);
    else
        mod(CodeMirror);
})(function(CodeMirror) {

    let cache = [];
    let lastFetch = 0;

    async function getResources() {
        const now = Date.now();
        if (now - lastFetch < 5000 && cache.length) return cache;

        try {
            const files = await Resources.getFSFiles();
            cache = files.map(f => f.name);
            lastFetch = now;
            return cache;
        } catch (e) {
            console.warn("resources-hint: failed to fetch resources", e);
            return [];
        }
    }

    CodeMirror.registerHelper("hint", "resources", async function(cm) {
        const cursor = cm.getCursor();
        const line = cm.getLine(cursor.line);
        const before = line.slice(0, cursor.ch);

        const match = before.match(/(?:^|[\s\(\[\{<>'"`])resources\/([\w\-.]*)$/);
        if (!match) return null;

        const prefix = match[1] || "";
        const list = await getResources();

        const filtered = list
            .filter(f => f.toLowerCase().includes(prefix.toLowerCase()))
            .slice(0, 20)
            .map(f => ({
                text: f,
                displayText: f,
                className: "cm-resource-hint"
            }));

        if (!filtered.length) return null;

        const start = before.lastIndexOf(prefix);
        return {
            list: filtered,
            from: CodeMirror.Pos(cursor.line, start),
            to: cursor
        };
    });
});