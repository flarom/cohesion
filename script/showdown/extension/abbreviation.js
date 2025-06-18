showdown.extension('abbreviation', function () {
    const invalidChars = /[{}\[\]()<>\#\*\+\-\.\!\|]/;

    return [
        {
            type: 'lang',
            filter: function (text) {
                const abbrMap = {};
                const codeBlocks = [];

                text = text.replace(/((```|~~~)[\s\S]*?\2|`[^`\n]+`)/g, function (match) {
                    codeBlocks.push(match);
                    return `§§§CODEBLOCK${codeBlocks.length - 1}§§§`;
                });

                text = text.replace(/^\*\[([^\]]+)\]:\s+(.+)$/gim, function (_, abbr, title) {
                    if (invalidChars.test(abbr)) return _;
                    abbrMap[abbr.toLowerCase()] = title;
                    return '';
                });

                for (let abbr in abbrMap) {
                    const regex = new RegExp(`\\b(${abbr})\\b`, 'gi');
                    const replacement = `<abbr title="${abbrMap[abbr]}">$1</abbr>`;
                    text = text.replace(regex, replacement);
                }

                text = text.replace(/§§§CODEBLOCK(\d+)§§§/g, (_, i) => codeBlocks[i]);

                return text;
            }
        }
    ];
});
