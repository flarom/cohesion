function metadataOverlay() {
    return {
        token(stream) {
            const line = stream.string;

            // delimiters
            if (stream.sol() && line === "«««") {
                stream.skipToEnd();
                return "metadata-delimeter";
            }

            if (stream.sol() && line === "»»»") {
                stream.skipToEnd();
                return "metadata-delimeter";
            }

            // outside metadata block
            if (!isInsideMetadata(line)) {
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

function isInsideMetadata(line) {
    // assume que todo metadata está no topo do documento
    return !line.startsWith("«««") &&
           !line.startsWith("»»»") &&
           !line.trim().startsWith("#");
}

var metadataOverlay = {
    token: metadataOverlay().token
}