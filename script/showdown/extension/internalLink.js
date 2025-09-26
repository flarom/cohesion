showdown.extension('internalLink', function () {
    return [
        {
            type: 'output',
            filter: function (text) {
                return text.replace(/(<code[\s\S]*?<\/code>|<pre[\s\S]*?<\/pre>)|(\[\[([^\]]+)\]\])/g, function (match, codeBlock, _, linkText) {
                    if (codeBlock) {
                        return codeBlock;
                    }
                    const escaped = linkText.replace(/"/g, '&quot;');
                    return `<a href="#" class="internal-link" data-title="${escaped}">${linkText}</a>`;
                });
            }
        }
    ];
});
