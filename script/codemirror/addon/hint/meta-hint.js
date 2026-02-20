(function(mod) {
    if (typeof exports == "object" && typeof module == "object")
        mod(require("codemirror"));
    else if (typeof define == "function" && define.amd)
        define(["codemirror"], mod);
    else
        mod(CodeMirror);
})(function(CodeMirror) {

    // MARK: conf

    const metaRegistry = {
        'title': {},
        'description': {},

        'tags': {
            getValues: function() {
                return typeof getAllTagsNames === "function"
                    ? getAllTagsNames()
                    : [];
            },
            commaSeparated: true
        },

        'keywords': {
            extends: 'tags'
        },

        'author': {},
        'authors': {},

        'date': {
            getValues: function() {
                return typeof getPreferedDateAndTime === "function"
                    ? getPreferedDateAndTime()
                    : [];
            }
        },

        'created-date': {
            extends: 'date'
        },

        'project': {
            getValues: function() {
                return typeof getAllGroupNames === "function"
                    ? getAllGroupNames()
                    : [];
            }
        },

        'folder': {
            extends: 'project'
        }
    };

    // MARK: helpers

    function isCursorInMetaBlock(cm, cursor) {
        try {
            const doc = cm.getValue();
            const posIndex = cm.indexFromPos(cursor);
            const start = doc.lastIndexOf('«««', posIndex);
            if (start === -1) return false;
            const end = doc.indexOf('»»»', posIndex);
            return end !== -1 && start < posIndex && posIndex <= end;
        } catch (e) {
            return false;
        }
    }

    function getKeyHints(typed) {
        const lower = typed.toLowerCase();
        return Object.keys(metaRegistry)
            .filter(k => k.toLowerCase().startsWith(lower));
    }

    function getValueHints(key, typed) {
        const config = resolveConfig(key);
        if (!config) return [];

        let values = [];

        if (Array.isArray(config.values)) {
            values = config.values.slice();
        }

        if (typeof config.getValues === "function") {
            const dynamicValues = config.getValues();
            if (Array.isArray(dynamicValues)) {
                values = values.concat(dynamicValues);
            }
        }

        // remove dupped
        values = [...new Set(values)];

        // if nothing was typed, return everything
        if (!typed) return values;

        const lowerTyped = typed.toLowerCase();

        return values.filter(v => {
            if (typeof v !== "string") return false;
            return v.toLowerCase().includes(lowerTyped);
        });
    }

    function getPreferedDateAndTime() {
        return [strftime(Settings.getSetting("dateFormat", "%Y/%m/%d %H:%M"))]
    }

    function resolveConfig(key) {
        let config = metaRegistry[key];
        if (!config) return null;

        if (config.extends) {
            const parent = resolveConfig(config.extends);
            if (!parent) return config;

            return Object.assign({}, parent, config);
        }

        return config;
    }

    // MARK: main hint register

    CodeMirror.registerHelper("hint", "meta", function(cm) {

        const cursor = cm.getCursor();
        const line = cm.getLine(cursor.line);
        const before = line.slice(0, cursor.ch);

        if (!isCursorInMetaBlock(cm, cursor))
            return null;

        // detects if theres ":" on the line
        const colonIndex = before.indexOf(":");

        // suggest key
        if (colonIndex === -1) {
            const keyMatch = before.match(/^\s*([\w-]*)$/);
            if (!keyMatch) return null;

            const typed = keyMatch[1] || "";
            const list = getKeyHints(typed);

            if (!list.length) return null;

            return {
                from: CodeMirror.Pos(cursor.line, before.length - typed.length),
                to: cursor,
                list: list.map(k => ({
                    text: k + ": ",
                    displayText: k,
                    className: "cm-meta-key-hint"
                }))
            };
        }

        // suggest value
        const keyPart = before.slice(0, colonIndex).trim();
        const valuePart = before.slice(colonIndex + 1);

        const key = keyPart.toLowerCase();
        const config = resolveConfig(key);

        if (!config) return null;

        const valueStartCh = colonIndex + 1;

        //// comma separated strings
        if (config.commaSeparated) {

            const segments = valuePart.split(",");
            const currentSegment = segments[segments.length - 1];

            const leadingSpacesMatch = currentSegment.match(/^\s*/);
            const leadingSpaces = leadingSpacesMatch ? leadingSpacesMatch[0] : "";
            const typedValue = currentSegment.trim();

            let segmentStartOffset = valuePart.lastIndexOf(currentSegment);
            segmentStartOffset += leadingSpaces.length;

            const from = CodeMirror.Pos(
                cursor.line,
                valueStartCh + segmentStartOffset
            );

            const values = getValueHints(key, typedValue);
            if (!values.length) return null;

            return {
                from: from,
                to: cursor,
                list: values.map(v => ({
                    text: v,
                    displayText: v,
                    className: "cm-meta-value-hint"
                }))
            };
        }

        //// single strings

        const leadingSpacesMatch = valuePart.match(/^\s*/);
        const spaceCount = leadingSpacesMatch ? leadingSpacesMatch[0].length : 0;
        const typedValue = valuePart.trim();

        const from = CodeMirror.Pos(
            cursor.line,
            valueStartCh + spaceCount
        );

        const values = getValueHints(key, typedValue);
        if (!values.length) return null;

        return {
            from: from,
            to: cursor,
            list: values.map(v => ({
                text: v,
                displayText: v,
                className: "cm-meta-value-hint"
            }))
        };
    });
});
