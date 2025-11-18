showdown.extension("footnotes", function () {
    // Store footnote contents for tooltip use
    const footnoteMap = {};

    return [
        // footnote with block content
        {
            type: "lang",
            filter: function (text) {
                return text.replace(
                    /^\[\^([\d\w]+)\]:\s*((\n+(\s{2,4}|\t).+)+)$/gm,
                    function (str, name, rawContent, _, padding) {

                        var cleaned = rawContent.replace(new RegExp("^" + padding, "gm"), "");
                        var htmlContent = converter.makeHtml(cleaned);

                        // save for tooltip
                        footnoteMap[name] = cleaned.trim();

                        return (
                            '<div class="footnote" id="fn-' + name + '">' +
                            '<a class="footnote-backref" href="#fnref-' + name + '">' +
                            '<sup>[' + name + ']</sup></a>: ' +
                            htmlContent +
                            '</div>'
                        );
                    }
                );
            },
        },

        // simple footnote
        {
            type: "lang",
            filter: function (text) {
                return text.replace(
                    /^\[\^([\d\w]+)\]:( |\n)((.+\n)*.+)$/gm,
                    function (str, name, _, content) {

                        footnoteMap[name] = content.trim();

                        return (
                            '<small class="footnote" id="fn-' + name + '">' +
                            '<a class="footnote-backref" href="#fnref-' + name + '">' +
                            '<sup>[' + name + ']</sup></a>: ' +
                            content +
                            '</small>'
                        );
                    }
                );
            },
        },

        // document footnote references
        {
            type: "lang",
            filter: function (text) {
                return text.replace(/\[\^([\d\w]+)\]/gm, function (str, name) {

                    const tooltip = footnoteMap[name]
                        ? footnoteMap[name].replace(/"/g, "&quot;")
                        : "";

                    return (
                        '<a class="footnote-ref" id="fnref-' + name + '"' +
                        ' href="#fn-' + name + '"' +
                        (tooltip ? ' title="' + tooltip + '"' : "") +
                        '><sup>[' + name + ']</sup></a>'
                    );
                });
            },
        },
    ];
});
