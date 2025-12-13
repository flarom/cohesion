var inMetadata = false;

function metadataOverlay() {
    return {
        token(stream) {
            const line = stream.string;

            // delimiters (toggle metadata state)
            if (stream.sol() && line === "«««") {
                inMetadata = true;
                stream.skipToEnd();
                return "metadata-delimeter";
            }

            if (stream.sol() && line === "»»»") {
                inMetadata = false;
                stream.skipToEnd();
                return "metadata-delimeter";
            }

            // outside metadata block: nothing to highlight
            if (!inMetadata) {
                stream.skipToEnd();
                return null;
            }

            // field name
            if (stream.sol()) {
                const m = stream.match(/^([a-zA-Z0-9_-]+)/);
                if (m) {
                    const name = m[1].replace(/[^a-zA-Z0-9_-]/g, "-");
                    return "metadata-field metadata-field-" + name;
                }
            }

            // :
            if (stream.peek() === ":") {
                stream.next();
                return "metadata-field-delimeter";
            }

            // value
            stream.skipToEnd();
            return "metadata-value";
        }
    };
}
var metadataOverlay = {
    token: metadataOverlay().token
}