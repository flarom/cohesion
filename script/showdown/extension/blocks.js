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
                    // Captura blocos de blockquote
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

                        // conteúdo interno markdown
                        const inner = lines.slice(1).join("\n");

                        // showdown local para renderizar conteúdo interno
                        const conv = new showdown.Converter(options);
                        const htmlContent = config.allowHtml ? inner : conv.makeHtml(inner);

                        const ctx = { type, param, id, raw: inner };

                        // render padronizado
                        const html = config.render(param, htmlContent, ctx);

                        return html + "\n\n";
                    });
                },
            },
        ];
    });

    // pre-built
    BlockRegistry.register("DETAILS", {
        allowHtml: false,
        render: function (title, contentHtml) {
            return `<details><summary title="Click to expand"><span>${title}</span></summary>\n` + `<div class="content">\n${contentHtml}\n</div>\n</details>`;
        },
    });
    BlockRegistry.register("CSV", {
        allowHtml: true,
        render: function (sep, contentText) {
            // CSV block: sep is the separator, contentText is the CSV data
            let separator = ",";
            let data = contentText;

            if (sep.length === 1 || sep.length === 0) {
                separator = sep || ",";
            }

            const lines = data.split(/\r?\n/).filter((line) => line.trim() !== "");
            if (lines.length === 0) return "";

            const rows = lines.map((line) => line.split(separator).map((cell) => cell.trim()));

            let tbody = "";
            for (let i = 0; i < rows.length; i++) {
                tbody += "<tr>" + rows[i].map((cell) => `<td>${cell}</td>`).join("") + "</tr>\n";
            }

            return `<div class="csv-table-container">\n<table class="csv-table">\n<tbody>\n${tbody}</tbody>\n</table>\n</div>`;
        },
    });

    BlockRegistry.register("FIELD", {
        allowHtml: true,
        render(param, content, ctx) {
            const type = param || "text"

            content = content.replace(/^<p>/i, "").replace(/<\/p>$/i, "");
            content = content.replace(/^>\s*/gm, "").trim();

            return `<input type='${type}' value='${content}' id='${ctx.id}' onchange='try{field.keepValue("${ctx.id}", this.value)}catch (e){}' />`;
        }
    });

    BlockRegistry.register("BUTTON", {
        allowHtml: true,
        render(param, content, ctx) {
            const label = param || "Button";
            const code = content || "";

            const htmlSafe = code
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;");

            console.warn(`Document contains button with arbitrary code: \n${code}`)
            return `<button id="${ctx.id}" data-code="${htmlSafe}" onclick="ARBITRARY_runButtonCode(this)">
        ${label}
    </button>`;
        }
    });

    window.ARBITRARY_runButtonCode = function(btn) {
        const code = btn.dataset.code;
        (new Function(code))();
    };

    BlockRegistry.register("NOTE", {
        allowHtml: false,
        render(param, content, ctx) {
            return `<blockquote class="custom-block quote-blue" ${ctx.id ? `id="${ctx.id}"` : ""}>
                        <label class="quote-blue-label quote-label">
                            <span class="icon">article</span>Note
                        </label>

                        <div class="quote-content">${content}</div>
                    </blockquote>`;
        },
    });

    BlockRegistry.register("TIP", {
        allowHtml: false,
        render(param, content, ctx) {
            return `<blockquote class="custom-block quote-green" ${ctx.id ? `id="${ctx.id}"` : ""}>
                        <label class="quote-green-label quote-label">
                            <span class="icon">lightbulb</span>Tip  
                        </label>

                        <div class="quote-content">${content}</div>
                    </blockquote>`;
        },
    });

    BlockRegistry.register("IMPORTANT", {
        allowHtml: false,
        render(param, content, ctx) {
            return `<blockquote class="custom-block quote-purple" ${ctx.id ? `id="${ctx.id}"` : ""}>
                        <label class="quote-purple-label quote-label">
                            <span class="icon">priority_high</span>Important  
                        </label>

                        <div class="quote-content">${content}</div>
                    </blockquote>`;
        },
    });

    BlockRegistry.register("WARNING", {
        allowHtml: false,
        render(param, content, ctx) {
            return `<blockquote class="custom-block quote-yellow" ${ctx.id ? `id="${ctx.id}"` : ""}>
                        <label class="quote-yellow-label quote-label">
                            <span class="icon">warning</span>Warning  
                        </label>

                        <div class="quote-content">${content}</div>
                    </blockquote>`;
        },
    });

    BlockRegistry.register("CAUTION", {
        allowHtml: false,
        render(param, content, ctx) {
            return `<blockquote class="custom-block quote-red" ${ctx.id ? `id="${ctx.id}"` : ""}>
                        <label class="quote-red-label quote-label">
                            <span class="icon">dangerous</span>Caution  
                        </label>

                        <div class="quote-content">${content}</div>
                    </blockquote>`;
        },
    });
})();
