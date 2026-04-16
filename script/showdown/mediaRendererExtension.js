(function () {
    const IMAGE_EXTENSIONS = new Set([
        "apng",
        "avif",
        "gif",
        "jpg",
        "jpeg",
        "jfif",
        "pjpeg",
        "pjp",
        "png",
        "svg",
        "webp"
    ]);
    const VIDEO_EXTENSIONS = new Set(["webm", "mp4"]);
    const AUDIO_EXTENSIONS = new Set(["wav", "mp3", "ogg"]);

    function decodeEntities(value) {
        return String(value || "")
            .replace(/&amp;/gi, "&")
            .replace(/&quot;/gi, '"')
            .replace(/&#39;/gi, "'")
            .replace(/&lt;/gi, "<")
            .replace(/&gt;/gi, ">");
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function getFileExtensionFromSrc(src) {
        const cleanSrc = decodeEntities(src).split("#")[0].split("?")[0].trim().toLowerCase();
        const parts = cleanSrc.split(".");
        return parts.length > 1 ? parts.pop() : "";
    }

    function parseAttributes(rawAttributes) {
        const attributes = {};
        const attributeRegex = /([\w:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;
        let match;

        while ((match = attributeRegex.exec(rawAttributes || ""))) {
            const name = (match[1] || "").toLowerCase();
            const value = match[2] ?? match[3] ?? match[4] ?? true;
            attributes[name] = value;
        }

        return attributes;
    }

    function attrsToString(attributes) {
        return Object.keys(attributes)
            .map((name) => {
                const value = attributes[name];
                if (value === true) {
                    return name;
                }
                return `${name}="${escapeHtml(value)}"`;
            })
            .join(" ");
    }

    function buildVideoTag(attributes) {
        const videoAttrs = { ...attributes };
        delete videoAttrs.alt;

        if (!Object.prototype.hasOwnProperty.call(videoAttrs, "controls")) {
            videoAttrs.controls = true;
        }

        const attrs = attrsToString(videoAttrs);
        return `<video ${attrs}></video>`;
    }

    function buildAudioTag(attributes) {
        const audioAttrs = { ...attributes };
        delete audioAttrs.alt;

        if (!Object.prototype.hasOwnProperty.call(audioAttrs, "controls")) {
            audioAttrs.controls = true;
        }

        const attrs = attrsToString(audioAttrs);
        return `<audio ${attrs}></audio>`;
    }

    showdown.extension("mediaRenderer", function () {
        return [{
            type: "output",
            filter: function (text) {
                return text.replace(/<img\b([^>]*)>/gi, function (fullMatch, rawAttributes) {
                    const attributes = parseAttributes(rawAttributes);
                    const src = attributes.src;

                    if (!src) {
                        return fullMatch;
                    }

                    const extension = getFileExtensionFromSrc(src);

                    if (VIDEO_EXTENSIONS.has(extension)) {
                        return buildVideoTag(attributes);
                    }

                    if (AUDIO_EXTENSIONS.has(extension)) {
                        return buildAudioTag(attributes);
                    }

                    if (IMAGE_EXTENSIONS.has(extension)) {
                        return fullMatch;
                    }

                    return fullMatch;
                });
            }
        }];
    });
})();
