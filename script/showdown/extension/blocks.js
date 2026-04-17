(function () {
    const showdown = window.showdown;
    if (!showdown) return;

    const blockTypes = {};

    window.BlockRegistry = {
        register(type, config) {
            blockTypes[type.toUpperCase()] = config;
        },
        list() {
            return { ...blockTypes };
        },
    };

    showdown.extension("blocks", function () {
        return [
            {
                type: "lang",

                filter(text, options) {
                    // capture text from blockquotes
                    const rgx = /(^ {0,3}>[ \t]?.*\n(?:^ {0,3}>[ \t]?.*\n)*)(?:\n|$)/gm;

                    return text.replace(rgx, function (raw) {
                        // divide lines and remove "> "
                        let lines = raw
                            .trimEnd()
                            .split("\n")
                            .map((l) => l.replace(/^ {0,3}>[ \t]?/, ""));

                        const header = lines[0].trim();

                        // format:  [!TYPE:Param](id)
                        const match = header.match(/^\[\!(\w+)(?::(.*?))?\](?:\((.+?)\))?$/i);
                        if (!match) return raw;

                        const type = match[1].toUpperCase();
                        const param = match[2] || "";
                        const id = match[3] || null;

                        const config = blockTypes[type];
                        if (!config || typeof config.render !== "function") {
                            return raw;
                        }

                        const inner = lines.slice(1).join("\n");

                        const conv = new showdown.Converter(options);
                        const htmlContent = config.allowHtml ? inner : conv.makeHtml(inner);

                        const ctx = { type, param, id, raw: inner };

                        const html = config.render(param, htmlContent, ctx);

                        return html + "\n\n";
                    });
                },
            },
        ];
    });
})();
