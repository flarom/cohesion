(function () {
    if (!window.showdown || typeof window.showdownKatex !== "function") {
        console.warn("[katex extension] showdown-katex was not loaded.");
        return;
    }

    const katexConfig = {
        displayMode: true,
        throwOnError: false,
        errorColor: "var(--danger)",
        delimiters: [
            { left: "$$", right: "$$", display: false },
            { left: "~", right: "~", display: false, asciimath: true }
        ]
    };

    const baseExt = window.showdownKatex(katexConfig);

    showdown.extension("katex", function () {
        const resolvedBase = typeof baseExt === "function" ? baseExt() : baseExt;

        return [
            {
                type: "lang",
                filter: function (text) {
                    // Alias: ```am ... ``` and ~~~am ... ~~~ to asciimath blocks
                    return (text || "").replace(
                        /(^|\n)(```+|~~~+)\s*am\s*(\n)/gi,
                        "$1$2asciimath$3"
                    );
                }
            },
            ...(Array.isArray(resolvedBase) ? resolvedBase : [resolvedBase])
        ];
    });
})();
