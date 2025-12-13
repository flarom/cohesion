function metadataOverlay() {
    return {
        token(stream) {
            const line = stream.string;
            const lineNo = stream.lineOracle.line;
            const doc = stream.lineOracle.doc;

            // delimeters
            if (stream.sol() && line === "«««") {
                stream.skipToEnd();
                return "metadata-delimeter";
            }

            if (stream.sol() && line === "»»»") {
                stream.skipToEnd();
                return "metadata-delimeter";
            }

            // not inside metadata block
            if (!isInsideMetadata(doc, lineNo)) {
                stream.skipToEnd();
                return null;
            }

            // field
            if (stream.sol() && stream.match(/^[a-zA-Z0-9_-]+/)) {
                const fieldName = stream.current();
                return "metadata-field metadata-field-" + fieldName;
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


function isInsideMetadata(doc, lineNo) {
    let hasStart = false;
    let hasEnd = false;

    // search for ««« above
    for (let i = lineNo - 1; i >= 0; i--) {
        const line = doc.getLine(i);
        if (line === "»»»") break;
        if (line === "«««") {
            hasStart = true;
            break;
        }
    }

    // search for »»» below
    for (let i = lineNo + 1; i < doc.lineCount(); i++) {
        const line = doc.getLine(i);
        if (line === "«««") break;
        if (line === "»»»") {
            hasEnd = true;
            break;
        }
    }

    return hasStart && hasEnd;
}


var metadataOverlay = metadataOverlay();