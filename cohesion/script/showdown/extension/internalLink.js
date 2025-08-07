showdown.extension('internalLink', function () {
    return [
        {
            type: 'lang',
            filter: function (text, converter, options) {
                return text.replace(/\[\[([^\]]+)\]\]/g, function (match, linkText) {
                    const escaped = linkText.replace(/"/g, '&quot;');
                    return `<a href="#" class="internal-link" data-title="${escaped}">${linkText}</a>`;
                });
            }
        }
    ];
});