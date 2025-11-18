showdown.extension("footnotes", function () {
    const footnoteMap = {};

    return [
        {
            type: "lang",
            filter: function (text) {
                const codeStore = [];
                text = text.replace(/(```[\s\S]*?```|`[^`]*`)/g, function(match) {
                    const placeholder = "@@CODE" + codeStore.length + "@@";
                    codeStore.push(match);
                    return placeholder;
                });

                // block-style footnote
                text = text.replace(
                    /^\[\^([\d\w]+)\]:\s*((\n+(\s{2,4}|\t).+)+)$/gm,
                    function (str, name, rawContent, _, padding) {
                        var cleaned = rawContent.replace(new RegExp("^" + padding, "gm"), "");
                        var htmlContent = converter.makeHtml(cleaned);

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

                // simple footnote
                text = text.replace(
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

                // inline references
                text = text.replace(/\[\^([\d\w]+)\]/gm, function (str, name) {
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

                // restore code blocks
                text = text.replace(/@@CODE(\d+)@@/g, function(_, index) {
                    return codeStore[index];
                });

                return text;
            }
        }
    ];
});
