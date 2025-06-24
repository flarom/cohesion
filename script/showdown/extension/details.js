showdown.extension('details', function () {
    return [{
        type: 'lang',
        filter: function (text) {
            const htmlBlocks = [];
            const codeBlocks = [];
            const inlineCodes = [];

            text = text.replace(
                /<([a-zA-Z0-9]+)(?![^>]*markdown\s*=\s*["']?1["']?)[^>]*>[\s\S]*?<\/\1>/g,
                function (match) {
                    htmlBlocks.push(match);
                    return `§§§HTMLBLOCK${htmlBlocks.length - 1}§§§`;
                }
            );

            text = text.replace(/((```|~~~)[\s\S]*?\2|`[^`\n]+`)/g, function (match) {
                codeBlocks.push(match);
                return `§§§CODEBLOCK${codeBlocks.length - 1}§§§`;
            });

            text = text.replace(/:::details\[(.*?)\]\s*\n([\s\S]+?)\n:::/g, function (_, summary, content) {
                return `§§§DETAILS_START§§§${summary.trim()}§§§DETAILS_MIDDLE§§§${content.trim()}§§§DETAILS_END§§§`;
            });

            text = text.replace(/§§§CODEBLOCK(\d+)§§§/g, (_, i) => codeBlocks[i]);

            text = text.replace(/§§§HTMLBLOCK(\d+)§§§/g, (_, i) => htmlBlocks[i]);

            return text;
        }
    }, {
        type: 'output',
        regex: /§§§DETAILS_START§§§(.*?)§§§DETAILS_MIDDLE§§§([\s\S]*?)§§§DETAILS_END§§§/g,
        replace: function (_, summary, content) {
            const innerHtml = new showdown.Converter().makeHtml(content);
            return `<details><summary title='Click to expand'><span>${summary}</span></summary>\n<div class='content'>${innerHtml}</div>\n</details>`;
        }
    }];
});