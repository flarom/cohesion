showdown.extension('abbreviation', function () {
    const invalidChars = /[{}\[\]()<>\#\*\+\-\.\!\|]/;

    return [
        {
            type: 'lang',
            filter: function (text, converter, options) {
                const abbrMap = {};

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

                return text;
            }
        }
    ];
});
