var admonitionOverlay = {
    token: function(stream) {
        const doc = stream.lineOracle.doc;
        const lineNum = stream.lineOracle.line;

        const line = stream.string;

        // check for admonition header
        let headerMatch = line.match(/^(\s*>\s*)\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/i);
        if (headerMatch) {
            const type = headerMatch[2].toLowerCase();

            const prefix = headerMatch[1]; // "> " initial part
            const prefixLen = prefix.length;
            const headerStart = prefixLen; // start of "[!"
            
            // check if we are before, inside, or after the header
            if (stream.pos < headerStart) {
                stream.next();
                return "admonition-" + type;
            }

            // check if we are at the header
            if (stream.pos >= headerStart && stream.match(/\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/i, true)) {
                return "admonition-header admonition-" + type;
            }

            // after the header, skip to end of line
            stream.skipToEnd();
            return "admonition-" + type;
        }

        // subsequent lines of admonition block
        let blockquoteMatch = line.match(/^\s*>(.*)$/);
        if (!blockquoteMatch) {
            stream.next();
            return null;
        }

        // search backwards for the admonition header
        let type = null;
        for (let i = lineNum - 1; i >= 0; i--) {
            let prev = doc.getLine(i);

            if (!/^\s*>/.test(prev)) break;

            let m = prev.match(/^\s*>\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/i);
            if (m) {
                type = m[1].toLowerCase();
                break;
            }
        }

        if (!type) {
            stream.next();
            return null;
        }

        // add class for the first character of each line
        if (stream.sol()) {
            stream.next();
            return "admonition-" + type;
        }

        stream.next();
        return null;
    }
};
