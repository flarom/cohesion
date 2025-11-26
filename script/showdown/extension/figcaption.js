showdown.extension("figureCaption", function() {

    function renderInlineMD(md) {
        const conv = new showdown.Converter();
        const html = conv.makeHtml(md.trim());
        return html.replace(/^<p>|<\/p>$/g, '');
    }

    return [
        {
            type: 'output',

            regex: /<a\s+href="([^"]+)"[^>]*>\s*([\s\S]*?)<img([^>]*?)alt="([^"]*?)"([^>]*?)title="([^"]*?)"([^>]*?)>([\s\S]*?)<\/a>/g,

            replace: function(match, url, beforeImg, beforeAlt, alt, between, title, afterAlt) {

                const srcMatch = match.match(/src="([^"]*?)"/);
                const src = srcMatch ? srcMatch[1] : "";

                const caption = renderInlineMD(title);

                return `<figure><img src="${src}" alt="${alt}" onclick="window.open('${url}')" style="cursor:pointer;"><figcaption>${caption}<div style='text-align:right'><a href='${url}' target='_blank'>${url}</a></div></figcaption></figure>`;
            }
        },

        {
            type: 'output',
            regex: /<img([^>]*?)alt="([^"]*?)"([^>]*?)title="([^"]*?)"([^>]*?)>/g,
            replace: function(match) {

                const alt = match.match(/alt="([^"]*?)"/)[1];
                const src = match.match(/src="([^"]*?)"/)[1];
                const title = match.match(/title="([^"]*?)"/)[1];

                const caption = renderInlineMD(title);

                return `<figure><img src="${src}" alt="${alt}"><figcaption>${caption}</figcaption></figure>`;
            }
        }
    ];
});
