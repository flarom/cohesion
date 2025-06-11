showdown.extension('abbreviation', function () {
    let abbrMap = {};

    return [
        {
            type: 'lang',
            regex: /^\*\[([^\]]+)\]:\s+(.+)$/gim,
            replace: function (match, abbr, title) {
                abbrMap[abbr.toLowerCase()] = title;
                return '';
            }
        },
        {
            type: 'output',
            filter: function (text) {
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
