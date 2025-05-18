const internalLinkExtension = () => {
    return [{
        type: 'lang',
        regex: /\[\[([^\]]+)\]\]/g,
        replace: (match, linkText) => {
            const escaped = linkText.replace(/"/g, '&quot;');
            return `<a href="#" class="internal-link" data-title="${escaped}">${linkText}</a>`;
        }
    }];
};
