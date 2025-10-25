showdown.extension('bannerImage', function () {
    return [
        {
            type: 'output',
            filter: function (text, converter, options) {
                const metadata = converter.getMetadata ? converter.getMetadata() : {};
                const bannerPath = metadata.banner;
                const fallback = 'cohesion/favicon.png';

                function escapeHtml(str) {
                    if (str === undefined || str === null) return '';
                    return String(str)
                        .replace(/&/g, '&amp;')
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;')
                        .replace(/"/g, '&quot;')
                        .replace(/'/g, '&#39;');
                }

                function firstString(v) {
                    if (Array.isArray(v)) return v.length ? String(v[0]) : '';
                    if (typeof v === 'object' && v !== null) return '';
                    return v == null ? '' : String(v);
                }

                function renderIcon(iconVal) {
                    const val = firstString(iconVal).trim();
                    if (!val) {
                        return `<img class="banner-icon" src="${fallback}" alt="icon"/>`;
                    }

                    // Material Icons <icon> tag
                    const iconTagMatch = val.match(/^<icon>([\s\S]*?)<\/icon>$/i);
                    if (iconTagMatch) {
                        return `<icon>${escapeHtml(iconTagMatch[1])}</icon>`;
                    }

                    // Emojicode :sparkles:
                    const emojiMatch = val.match(/^:([^:]+):$/);
                    if (emojiMatch) {
                        const code = emojiMatch[1];
                        try {
                            if (typeof showdown !== 'undefined' && showdown.helper && showdown.helper.emojis && showdown.helper.emojis.hasOwnProperty(code)) {
                                return `<span class="banner-emoji">${showdown.helper.emojis[code]}</span>`;
                            }
                        } catch (e) {}
                        // fallback se não achar o código
                        return `<span class="banner-emoji">:${escapeHtml(code)}:</span>`;
                    }

                    // Emoji literal (qualquer caractere Unicode de emoji)
                    if (/[\u{1F300}-\u{1FAFF}\u{1F1E6}-\u{1F1FF}\u{2600}-\u{27BF}\u{1F900}-\u{1F9FF}]/u.test(val)) {
                        // Renderiza direto o emoji literal
                        return `<span class="banner-emoji">${escapeHtml(val)}</span>`;
                    }

                    // Image path (data:, http(s), ./, ../, etc)
                    if (/^(data:|https?:|\/|\.\/|\.\.\/)/i.test(val) || /\.(png|jpe?g|gif|svg|webp)(?:[?#].*)?$/i.test(val)) {
                        return `<img class="banner-icon" src="${escapeHtml(val)}" alt="icon"/>`;
                    }

                    // fallback
                    return `<img class="banner-icon" src="${fallback}" alt="icon"/>`;
                }

                if (bannerPath && String(bannerPath).length > 1) {
                    const bannerImg = `<img class="banner" src="${escapeHtml(bannerPath)}" alt="Banner"/>`;

                    // Only render meta block when banner exists
                    const iconHtml = renderIcon(metadata.icon);
                    const title = firstString(metadata.title) || '';
                    const author = firstString(metadata.authors) || firstString(metadata.author) || '';
                    const date = firstString(metadata.date) || '';
                    const tags = firstString(metadata.tags) || '';
                    
                    const tagsHtml = tags ? tags.split(',')
                        .map(t => t.trim())
                        .filter(t => t)
                        .map(t => `<span class="tag" onclick="searchDocuments('#${escapeHtml(t)}')" role="button" tabindex="0">${escapeHtml(t)}</span>`)
                        .join('') : '';
                    
                    const subtitleParts = [];
                    if (author) subtitleParts.push(author);
                    if (date) subtitleParts.push(date);
                    
                    const subtitle = subtitleParts.join(', ') + (tagsHtml ? `<div class="tags">${tagsHtml}</div>` : '');

                    const headerHtml = `
<div class="meta-container">
  <div class="banner-container">
    ${bannerImg}
  </div>
  <div class="info-container">
    <div class="row">
      <div class="icon-container">${iconHtml}</div>
      <div class="text-container">
        ${title ? `<span class="title">${escapeHtml(title)}</span>` : ''}
        ${subtitle ? `<div class="banner-meta-subtitle">${subtitle}</div>` : ''}
      </div>
    </div>
  </div>
</div>
`;
                    return headerHtml + text;
                }

                return text;
            }
        }
    ];
});