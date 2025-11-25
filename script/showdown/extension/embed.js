(function() {
    const embedRegex = /\[!embed\s+([^\]]+)\]/gi;

    try {
        CommandRegistry.register("embed", {
            description: "Embeded web content",
            icon: "iframe",
            exec: function() {
                insertSnippet('[!embed ${1:https://example.com}]');
            }
        });
    } catch (e) {}  

    showdown.extension("embed", function() {
        return [
            {
                type: "lang",
                regex: embedRegex,
                replace: function(match, content) {
                    const args = [];
                    content.trim().replace(/"([^"]*)"|(\S+)/g, (m, quoted, plain) => {
                        args.push(quoted || plain);
                    });

                    const url = args[0] || "";

                    return `<iframe src="${url}" loading="lazy" sandbox="allow-same-origin allow-scripts allow-popups allow-forms" allowfullscreen=''></iframe>`;
                }
            }
        ];
    });
})();
