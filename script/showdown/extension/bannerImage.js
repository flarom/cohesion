showdown.extension('bannerImage', function () {
    return [
        {
            type: 'output',
            filter: function (text, converter, options) {
                const metadata = converter.getMetadata ? converter.getMetadata() : {};
                const bannerPath = firstString(metadata.banner);
                const fallback = 'cohesion/file-icons/text-x-generic.svg';

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
                    ctx.clearRect(0, 0, size, size);
                    // draw chars with opaque color so pixels are readable
                    ctx.fillStyle = '#000';
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

                function extractEmojisFromString(s) {
                    if (!s) return [];
                    const found = [];

                    const codeRe = /:([^:\s]+):/g;
                    let m;
                    while ((m = codeRe.exec(s)) !== null) {
                        const mapped = getEmojiFromCode(m[0]);
                        if (mapped) found.push(mapped);
                    }

                    try {
                        const literal = s.match(/\p{Extended_Pictographic}/gu) || [];
                        for (const ch of literal) {
                            found.push(ch);
                        }
                    } catch (e) {
                        const fallback = s.match(/[\u{1F300}-\u{1FAFF}\u{1F1E6}-\u{1F1FF}\u{2600}-\u{27BF}]/gu) || [];
                        for (const ch of fallback) found.push(ch);
                    }

                    const out = [];
                    for (const e of found) if (e && out.indexOf(e) === -1) out.push(e);
                    return out;
                }

                function parseRgbString(str) {
                    const m = String(str).match(/rgb\((\d+),(\d+),(\d+)\)/);
                    return m ? [parseInt(m[1], 10), parseInt(m[2], 10), parseInt(m[3], 10)] : null;
                }

                function blendColors(colors) {
                    if (!colors.length) return 'transparent';
                    let r = 0, g = 0, b = 0, count = 0;
                    for (const c of colors) {
                        const p = parseRgbString(c);
                        if (p) { r += p[0]; g += p[1]; b += p[2]; count++; }
                    }
                    if (count === 0) return 'transparent';
                    return `rgb(${Math.round(r / count)},${Math.round(g / count)},${Math.round(b / count)})`;
                }

                function renderBanner(val) {
                    // try to extract one or more emojis from the value
                    const emojis = extractEmojisFromString(String(val));
                    if (emojis && emojis.length) {
                        // compute background as blend of emoji average colors
                        const cols = emojis.map(e => averageColorFromEmoji(e)).filter(c => c && c !== 'transparent');
                        const bgColor = blendColors(cols);

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

                        // draw emojis in a tiled pattern, alternating between emojis
                        const tile = 200; // tile size
                        ctx.font = `${tile * 0.8}px sans-serif`;
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';

                        const n = emojis.length;
                        for (let row = -2; row * tile < h + tile * 2; row++) {
                            for (let col = -2; col * tile < w + tile * 2; col++) {
                                const x = col * tile;
                                const y = row * tile;
                                // choose emoji index by a checkerboard/diagonal pattern for variation
                                const ix = Math.abs(col + row) % n;
                                ctx.fillText(emojis[ix], x + tile / 2, y + tile / 2);
                            }
                        }

                        ctx.restore();

                        // export png as data URL
                        const dataURL = canvas.toDataURL('image/png');

                        return `<div class="banner emoji-banner" style="background-image: url('${dataURL}'); background-color: ${bgColor}; background-size: cover;"></div>`;
                    }

                    return `<img class="banner" src="${escapeHtml(val)}" alt="Banner"/>`;
                }

                function renderIcon(iconVal) {
                    const raw = firstString(iconVal).trim();
                    if (!raw) {
                        return `<img class="banner-icon" src="${fallback}" alt="icon"/>`;
                    }

                    // [icon name:color]
                    const materialMatch = raw.match(/^\[([^\]:]+)(?::([^\]]+))?\]$/);
                    if (materialMatch) {
                        const iconName = materialMatch[1]
                            .trim()
                            .toLowerCase()
                            .replace(/\s+/g, "_");

                        const color = materialMatch[2]
                            ? escapeHtml(materialMatch[2].trim())
                            : "currentColor";

                        return `<span class="icon-color color-${color}"><span
                            class="icon"
                            style="color: ${color}"
                        >${iconName}</span></span>`;
                    }

                    // emoji :shortcode:
                    const emojiMatch = raw.match(/^:([^:]+):$/);
                    if (emojiMatch) {
                        const emojiVal = getEmojiFromCode(raw);
                        if (emojiVal) {
                            return `<span class="banner-emoji">${emojiVal}</span>`;
                        }
                        return `<span class="banner-emoji">:${escapeHtml(emojiMatch[1])}:</span>`;
                    }

                    // literal emoji
                    if (isLiteralEmoji(raw)) {
                        return `<span class="banner-emoji">${escapeHtml(raw)}</span>`;
                    }

                    // image path / url
                    if (
                        /^(data:|https?:|\/|\.\/|\.\.\/)/i.test(raw) ||
                        /\.(png|jpe?g|gif|svg|webp)(?:[?#].*)?$/i.test(raw)
                    ) {
                        return `<img class="banner-icon" src="${escapeHtml(raw)}" alt="icon"/>`;
                    }

                    // fallback
                    return `<img class="banner-icon" src="${fallback}" alt="icon"/>`;
                }

                if (bannerPath && String(bannerPath).length > 0) {
                    const bannerHtml = renderBanner(bannerPath);
                    const iconHtml = renderIcon(metadata.icon);
                    const title = firstString(metadata.title) || '';
                    const author = firstString(metadata.author) || firstString(metadata.author) || '';
                    const date = firstString(metadata.date) || '';
                    const tags = firstString(metadata.tags) || '';
                    const description = firstString(metadata.description) || '';

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

                    const headerHtml = 
`<div class="meta-container">
    <div class="banner-container">
        ${bannerHtml}
    </div>
    <div class="info-container">
        <div class="info-content">
            <div class="row">
                <div class="icon-container">${iconHtml}</div>
                <div class="text-container">
                    ${title ? `<span class="title">${escapeHtml(title)}</span>` : ""}
                    ${subtitle ? `<div class="banner-meta-subtitle">${subtitle}</div>` : ""}
                </div>
            </div>
        </div>
    </div>
</div>
<div class="description-container">
    ${description ? `<p class="description">${escapeHtml(description)}</p>` : ""}
</div>`;
                    return headerHtml + text;
                }

                return text;
            }
        }
    ];
});
