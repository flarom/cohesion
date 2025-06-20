showdown.extension("details", function () {
    return [
        {
            type: "lang",
            regex: /:::details\[(.*?)\]\s*\n([\s\S]+?)\n:::/g,
            replace: function (match, summary, content) {
                return `§§DETAILS_START§§${summary.trim()}§§DETAILS_MIDDLE§§${content.trim()}§§DETAILS_END§§`;
            },
        },
        {
            type: "output",
            regex: /§§DETAILS_START§§(.*?)§§DETAILS_MIDDLE§§([\s\S]*?)§§DETAILS_END§§/g,
            replace: function (match, summary, content, offset, string, converter) {
                const innerHtml = new showdown.Converter().makeHtml(content);
                return `<details><summary title='Click to expand'><span>${summary}</span></summary>\n<div class='content'>${innerHtml}</div>\n</details>`;
            },
        },
    ];
});
