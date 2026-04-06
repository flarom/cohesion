(function (global) {
    const DEFAULT_LABEL = "Run Script";

    function encodeBase64Utf8(value) {
        return btoa(unescape(encodeURIComponent(value)));
    }

    function decodeBase64Utf8(value) {
        return decodeURIComponent(escape(atob(value)));
    }

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function parseAttributes(rawAttributes) {
        const attributes = {};
        const attributeRegex = /([^\s=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;
        let match;

        while ((match = attributeRegex.exec(rawAttributes))) {
            const name = match[1].toLowerCase();
            const value = match[2] ?? match[3] ?? match[4] ?? true;
            attributes[name] = value;
        }

        return attributes;
    }

    function extractLabel(scriptBody) {
        const labelRegex = /^\s*\/\/\s*@label:\s*(.+?)\s*(?:\r?\n|$)/;
        const match = scriptBody.match(labelRegex);

        if (!match) {
            return {
                label: DEFAULT_LABEL,
                code: scriptBody
            };
        }

        return {
            label: match[1].trim() || DEFAULT_LABEL,
            code: scriptBody.replace(labelRegex, "")
        };
    }

    function buildPayload(rawAttributes, rawBody) {
        const { label, code } = extractLabel(rawBody || "");

        const payload = {
            attrs: parseAttributes(rawAttributes || ""),
            code
        };

        return {
            label,
            encodedPayload: encodeBase64Utf8(JSON.stringify(payload))
        };
    }

    function runShowdownScriptPayload(encodedPayload, button) {
        let payload;

        try {
            payload = JSON.parse(decodeBase64Utf8(encodedPayload));
        } catch (error) {
            console.error("Invalid script payload", error);
            return;
        }

        const scriptElement = document.createElement("script");
        const attrs = payload.attrs || {};

        Object.keys(attrs).forEach((name) => {
            const value = attrs[name];
            if (value === true) {
                scriptElement.setAttribute(name, "");
            } else {
                scriptElement.setAttribute(name, String(value));
            }
        });

        if (!attrs.src) {
            scriptElement.textContent = payload.code || "";
        }

        const parent = document.body || document.documentElement;
        parent.appendChild(scriptElement);

        if (!attrs.src) {
            parent.removeChild(scriptElement);
        }

        if (button) {
            button.classList.add("md-script-exec-btn--executed");
        }
    }

    global.runShowdownScriptPayload = runShowdownScriptPayload;

    showdown.extension("scriptExecutionButton", function () {
        return [{
            type: "output",
            filter: function (text) {
                return text.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi, function (_full, rawAttributes, rawBody) {
                    const { label, encodedPayload } = buildPayload(rawAttributes, rawBody);
                    return (
                        `<button type="button" class="text-button" onclick="runShowdownScriptPayload('${encodedPayload}', this)">` +
                        escapeHtml(label) +
                        '</button>'
                    );
                });
            }
        }];
    });
})(window);
