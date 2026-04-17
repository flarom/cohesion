/**
 * MediaRendererExtension - Handles rendering of different media types
 * 
 * Supports built-in media types (images, videos, audio) and extensible
 * custom handlers registered via MediaRendererRegistry API.
 * 
 * Extensions can register custom handlers:
 * @example
 * MediaRendererRegistry.register("extension", async (attributes) => {
 *   return "<custom-element>...</custom-element>";
 * });
 */
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
    const VIDEO_EXTENSIONS = new Set([
        "webm",
        "mp4"
    ]);
    const AUDIO_EXTENSIONS = new Set([
        "wav",
        "mp3",
        "ogg"
    ]);

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

                    // Try custom handlers registered by extensions
                    if (MediaRendererRegistry.has(extension)) {
                        // Mark this element for async processing
                        // Store the original src path in data attribute for later use
                        const attrs = attrsToString({
                            ...attributes,
                            "data-media-handler": extension,
                            "data-custom-media": "true",
                            "data-original-src": src  // Store original src before it gets replaced with blob URL
                        });
                        return `<img ${attrs}>`;
                    }

                    return fullMatch;
                });
            }
        }];
    });
})();

/**
 * Global API for registering custom media handlers
 * 
 * Allows extensions to register handlers for custom file types
 * that will be rendered in the preview.
 * 
 * Handlers receive attributes object and can return HTML string
 * (for sync handlers) or Promise<string> (for async handlers).
 * 
 * @example
 * // Simple handler
 * MediaRendererRegistry.register("gltf", (attributes) => {
 *     return `<model-viewer src="${attributes.src}"></model-viewer>`;
 * });
 * 
 * @example
 * // Async handler with resource loading
 * MediaRendererRegistry.register("xyz", async (attributes) => {
 *     const data = await fetch(attributes.src).then(r => r.text());
 *     return `<pre>${escapeHtml(data)}</pre>`;
 * });
 */
window.MediaRendererRegistry = (() => {
    const handlers = new Map();

    return {
        /**
         * Register a handler for a file extension
         * @param {string} extension - File extension (without dot)
         * @param {Function} handler - Handler function(attributes) => string | Promise<string>
         */
        register(extension, handler) {
            if (typeof extension !== "string" || !extension) {
                console.error("Invalid extension:", extension);
                return false;
            }
            if (typeof handler !== "function") {
                console.error("Handler must be a function");
                return false;
            }

            const ext = extension.toLowerCase();
            handlers.set(ext, handler);
            return true;
        },

        /**
         * Unregister a handler for a file extension
         * @param {string} extension - File extension (without dot)
         */
        unregister(extension) {
            const ext = extension.toLowerCase();
            return handlers.delete(ext);
        },

        /**
         * Check if handler exists for extension
         * @param {string} extension - File extension (without dot)
         */
        has(extension) {
            const ext = extension.toLowerCase();
            return handlers.has(ext);
        },

        /**
         * Get handler for extension
         * @param {string} extension - File extension (without dot)
         */
        get(extension) {
            const ext = extension.toLowerCase();
            return handlers.get(ext);
        },

        async getContent(attributes) {
            if (attributes.fileContent) {
                if (attributes.fileContent instanceof Blob) {
                    return await attributes.fileContent.text();
                }
                return String(attributes.fileContent);
            }
            return null;
        },

        /**
         * Render media using registered handler
         * @param {string} extension - File extension (without dot)
         * @param {Object} attributes - Element attributes
         * @returns {Promise<string|null>} HTML string or null if no handler
         */
        async render(extension, attributes) {
            const ext = extension.toLowerCase();
            const handler = handlers.get(ext);

            if (!handler) {
                return null;
            }

            try {
                return await Promise.resolve(handler(attributes));
            } catch (error) {
                console.error(`[MediaRendererRegistry] Error rendering ${ext}:`, error);
                return null;
            }
        },

        /**
         * Get all registered extensions
         */
        getRegistered() {
            return Array.from(handlers.keys());
        },

        /**
         * Clear all handlers
         */
        clearAll() {
            handlers.clear();
        }
    };
})();
