showdown.extension('bannerImage', function () {
    return [
        {
            type: 'output',
            filter: function (text, converter, options) {
                const metadata = converter.getMetadata ? converter.getMetadata() : {};
                const bannerPath = firstString(metadata.banner);
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

                function isLiteralEmoji(str) {
                    return /[\u{1F300}-\u{1FAFF}\u{1F1E6}-\u{1F1FF}\u{2600}-\u{27BF}\u{1F900}-\u{1F9FF}]/u.test(str);
                }

                function getEmojiFromCode(val) {
                    const match = val.match(/^:([^:]+):$/);
                    if (!match) return null;
                    const code = match[1];
                    try {
                        if (typeof showdown !== 'undefined' && showdown.helper?.emojis?.[code]) {
                            return showdown.helper.emojis[code];
                        }
                    } catch { }
                    return null;
                }

                // get average color from rendered emoji
                function averageColorFromEmoji(emoji) {
                    const canvas = document.createElement('canvas');
                    const size = 64;
                    canvas.width = size;
                    canvas.height = size;
                    const ctx = canvas.getContext('2d');
                    ctx.font = `${size}px sans-serif`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(emoji, size / 2, size / 2);

                    const imageData = ctx.getImageData(0, 0, size, size).data;
                    let r = 0, g = 0, b = 0, count = 0;
                    for (let i = 0; i < imageData.length; i += 4) {
                        const alpha = imageData[i + 3];
                        if (alpha > 0) {
                            r += imageData[i];
                            g += imageData[i + 1];
                            b += imageData[i + 2];
                            count++;
                        }
                    }
                    if (count === 0) return 'transparent';
                    r = Math.round(r / count);
                    g = Math.round(g / count);
                    b = Math.round(b / count);
                    return `rgb(${r},${g},${b})`;
                }

                function renderBanner(val) {
                    const emojiLiteral = isLiteralEmoji(val) ? val : getEmojiFromCode(val);
                    if (emojiLiteral) {
                        const bgColor = averageColorFromEmoji(emojiLiteral);

                        // create canvas
                        const canvas = document.createElement('canvas');
                        const w = 1920;
                        const h = 1080;
                        canvas.width = w;
                        canvas.height = h;
                        const ctx = canvas.getContext('2d');

                        // set background
                        ctx.fillStyle = bgColor;
                        ctx.fillRect(0, 0, w, h);

                        // apply rotation
                        ctx.save();
                        ctx.translate(w / 2, h / 2);
                        ctx.rotate((12 * Math.PI) / 180);
                        ctx.translate(-w / 2, -h / 2);

                        // draw emojis in a tiled 
                        const tile = 200; // tile size
                        ctx.font = `${tile * 0.8}px sans-serif`;
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';

                        for (let y = -tile; y < h + tile * 2; y += tile) {
                            for (let x = -tile; x < w + tile * 2; x += tile) {
                                ctx.fillText(emojiLiteral, x + tile / 2, y + tile / 2);
                            }
                        }

                        ctx.restore();

                        // export png as data URL
                        const dataURL = canvas.toDataURL('image/png');

                        return `<div class="banner emoji-banner" style="
                            background-image: url('${dataURL}');
                            background-color: ${bgColor};
                            background-size: cover;
                        "></div>`;
                    }

                    return `<img class="banner" src="${escapeHtml(val)}" alt="Banner"/>`;
                }

                function renderIcon(iconVal) {
                    const val = firstString(iconVal).trim();
                    if (!val) return `<img class="banner-icon" src="${fallback}" alt="icon"/>`;

                    const iconTagMatch = val.match(/^<icon>([\s\S]*?)<\/icon>$/i);
                    if (iconTagMatch) return `<icon>${escapeHtml(iconTagMatch[1])}</icon>`;

                    const emojiMatch = val.match(/^:([^:]+):$/);
                    if (emojiMatch) {
                        const emojiVal = getEmojiFromCode(val);
                        if (emojiVal) return `<span class="banner-emoji">${emojiVal}</span>`;
                        return `<span class="banner-emoji">:${escapeHtml(emojiMatch[1])}:</span>`;
                    }

                    if (isLiteralEmoji(val)) {
                        return `<span class="banner-emoji">${escapeHtml(val)}</span>`;
                    }

                    if (/^(data:|https?:|\/|\.\/|\.\.\/)/i.test(val) || /\.(png|jpe?g|gif|svg|webp)(?:[?#].*)?$/i.test(val)) {
                        return `<img class="banner-icon" src="${escapeHtml(val)}" alt="icon"/>`;
                    }

                    return `<img class="banner-icon" src="${fallback}" alt="icon"/>`;
                }

                if (bannerPath && String(bannerPath).length > 0) {
                    const bannerHtml = renderBanner(bannerPath);
                    const iconHtml = renderIcon(metadata.icon);
                    const title = firstString(metadata.title) || '';
                    const author = firstString(metadata.authors) || firstString(metadata.author) || '';
                    const date = firstString(metadata.date) || '';
                    const tags = firstString(metadata.tags) || '';

                    const tagsHtml = tags
                        ? tags.split(',')
                            .map(t => t.trim())
                            .filter(Boolean)
                            .map(t => `<span class="tag" onclick="searchDocuments('#${escapeHtml(t)}')" role="button" tabindex="0">${escapeHtml(t)}</span>`)
                            .join('')
                        : '';

                    const subtitleParts = [];
                    if (author) subtitleParts.push(author);
                    if (date) subtitleParts.push(date);
                    const subtitle = subtitleParts.join(', ') + (tagsHtml ? `<div class="tags">${tagsHtml}</div>` : '');

                    const headerHtml = `
<div class="meta-container">
  <div class="banner-container">
    ${bannerHtml}
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
