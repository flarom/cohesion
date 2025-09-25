/*! showdown v 2.0.0 - 10-03-2022 */
(function () {
    /**
     * Created by Tivie on 13-07-2015.
     */

    function getDefaultOpts(simple) {
        "use strict";

        var defaultOptions = {
            omitExtraWLInCodeBlocks: {
                defaultValue: false,
                describe: "Omit the default extra whiteline added to code blocks",
                type: "boolean",
            },
            noHeaderId: {
                defaultValue: false,
                describe: "Turn on/off generated header id",
                type: "boolean",
            },
            prefixHeaderId: {
                defaultValue: false,
                describe: "Add a prefix to the generated header ids. Passing a string will prefix that string to the header id. Setting to true will add a generic 'section-' prefix",
                type: "string",
            },
            rawPrefixHeaderId: {
                defaultValue: false,
                describe: 'Setting this option to true will prevent showdown from modifying the prefix. This might result in malformed IDs (if, for instance, the " char is used in the prefix)',
                type: "boolean",
            },
            ghCompatibleHeaderId: {
                defaultValue: true,
                describe: "Generate header ids compatible with github style (spaces are replaced with dashes, a bunch of non alphanumeric chars are removed)",
                type: "boolean",
            },
            rawHeaderId: {
                defaultValue: false,
                describe: "Remove only spaces, ' and \" from generated header ids (including prefixes), replacing them with dashes (-). WARNING: This might result in malformed ids",
                type: "boolean",
            },
            headerLevelStart: {
                defaultValue: false,
                describe: "The header blocks level start",
                type: "integer",
            },
            parseImgDimensions: {
                defaultValue: false,
                describe: "Turn on/off image dimension parsing",
                type: "boolean",
            },
            simplifiedAutoLink: {
                defaultValue: true,
                describe: "Turn on/off GFM autolink style",
                type: "boolean",
            },
            literalMidWordUnderscores: {
                defaultValue: false,
                describe: "Parse midword underscores as literal underscores",
                type: "boolean",
            },
            literalMidWordAsterisks: {
                defaultValue: false,
                describe: "Parse midword asterisks as literal asterisks",
                type: "boolean",
            },
            strikethrough: {
                defaultValue: true,
                describe: "Turn on/off strikethrough support",
                type: "boolean",
            },
            tables: {
                defaultValue: true,
                describe: "Turn on/off tables support",
                type: "boolean",
            },
            tablesHeaderId: {
                defaultValue: false,
                describe: "Add an id to table headers",
                type: "boolean",
            },
            ghCodeBlocks: {
                defaultValue: true,
                describe: "Turn on/off GFM fenced code blocks support",
                type: "boolean",
            },
            tasklists: {
                defaultValue: true,
                describe: "Turn on/off GFM tasklist support",
                type: "boolean",
            },
            smoothLivePreview: {
                defaultValue: false,
                describe: "Prevents weird effects in live previews due to incomplete input",
                type: "boolean",
            },
            smartIndentationFix: {
                defaultValue: false,
                describe: "Tries to smartly fix indentation in es6 strings",
                type: "boolean",
            },
            disableForced4SpacesIndentedSublists: {
                defaultValue: false,
                describe: "Disables the requirement of indenting nested sublists by 4 spaces",
                type: "boolean",
            },
            simpleLineBreaks: {
                defaultValue: false,
                describe: "Parses simple line breaks as <br> (GFM Style)",
                type: "boolean",
            },
            requireSpaceBeforeHeadingText: {
                defaultValue: true,
                describe: "Makes adding a space between `#` and the header text mandatory (GFM Style)",
                type: "boolean",
            },
            ghMentions: {
                defaultValue: false,
                describe: "Enables github @mentions",
                type: "boolean",
            },
            ghMentionsLink: {
                defaultValue: "https://github.com/{u}",
                describe: "Changes the link generated by @mentions. Only applies if ghMentions option is enabled.",
                type: "string",
            },
            encodeEmails: {
                defaultValue: true,
                describe: "Encode e-mail addresses through the use of Character Entities, transforming ASCII e-mail addresses into its equivalent decimal entities",
                type: "boolean",
            },
            openLinksInNewWindow: {
                defaultValue: true,
                describe: "Open all links in new windows",
                type: "boolean",
            },
            backslashEscapesHTMLTags: {
                defaultValue: true,
                describe: "Support for HTML Tag escaping. ex: <div>foo</div>",
                type: "boolean",
            },
            emoji: {
                defaultValue: true,
                describe: "Enable emoji support. Ex: `this is a :smile: emoji`",
                type: "boolean",
            },
            underline: {
                defaultValue: true,
                describe: "Enable support for underline. Syntax is double or triple underscores: `__underline word__`. With this option enabled, underscores no longer parses into `<em>` and `<strong>`",
                type: "boolean",
            },
            ellipsis: {
                defaultValue: true,
                describe: "Replaces three dots with the ellipsis unicode character",
                type: "boolean",
            },
            dash: {
                defaultValue: true,
                describe: "Replaces two minus signs with the dash unicode character",
                type: "boolean",
            },
            completeHTMLDocument: {
                defaultValue: false,
                describe: "Outputs a complete html document, including `<html>`, `<head>` and `<body>` tags",
                type: "boolean",
            },
            metadata: {
                defaultValue: true,
                describe: "Enable support for document metadata (defined at the top of the document between `«««` and `»»»` or between `---` and `---`).",
                type: "boolean",
            },
            splitAdjacentBlockquotes: {
                defaultValue: true,
                describe: "Split adjacent blockquote blocks",
                type: "boolean",
            },
            moreStyling: {
                defaultValue: true,
                describe: "Adds some useful styling css classes in the generated html",
                type: "boolean",
            },
            relativePathBaseUrl: {
                defaultValue: false,
                describe: "Prepends a base URL to relative paths",
                type: "string",
            },
        };
        if (simple === false) {
            return JSON.parse(JSON.stringify(defaultOptions));
        }
        var ret = {};
        for (var opt in defaultOptions) {
            if (defaultOptions.hasOwnProperty(opt)) {
                ret[opt] = defaultOptions[opt].defaultValue;
            }
        }
        return ret;
    }

    function allOptionsOn() {
        "use strict";
        var options = getDefaultOpts(true),
            ret = {};
        for (var opt in options) {
            if (options.hasOwnProperty(opt)) {
                ret[opt] = true;
            }
        }
        return ret;
    }

    /**
     * Created by Tivie on 06-01-2015.
     */
    // Private properties
    var showdown = {},
        parsers = {},
        extensions = {},
        globalOptions = getDefaultOpts(true),
        setFlavor = "vanilla",
        flavor = {
            github: {
                omitExtraWLInCodeBlocks: true,
                simplifiedAutoLink: true,
                literalMidWordUnderscores: true,
                strikethrough: true,
                tables: true,
                tablesHeaderId: true,
                ghCodeBlocks: true,
                tasklists: true,
                disableForced4SpacesIndentedSublists: true,
                simpleLineBreaks: true,
                requireSpaceBeforeHeadingText: true,
                ghCompatibleHeaderId: true,
                ghMentions: true,
                backslashEscapesHTMLTags: true,
                emoji: true,
                splitAdjacentBlockquotes: true,
            },
            original: {
                noHeaderId: true,
                ghCodeBlocks: false,
            },
            ghost: {
                omitExtraWLInCodeBlocks: true,
                parseImgDimensions: true,
                simplifiedAutoLink: true,
                literalMidWordUnderscores: true,
                strikethrough: true,
                tables: true,
                tablesHeaderId: true,
                ghCodeBlocks: true,
                tasklists: true,
                smoothLivePreview: true,
                simpleLineBreaks: true,
                requireSpaceBeforeHeadingText: true,
                ghMentions: false,
                encodeEmails: true,
            },
            vanilla: getDefaultOpts(true),
            allOn: allOptionsOn(),
        };

    /**
     * helper namespace
     * @type {{}}
     */
    showdown.helper = {};

    /**
     * TODO LEGACY SUPPORT CODE
     * @type {{}}
     */
    showdown.extensions = {};

    /**
     * Set a global option
     * @static
     * @param {string} key
     * @param {*} value
     * @returns {showdown}
     */
    showdown.setOption = function (key, value) {
        "use strict";
        globalOptions[key] = value;
        return this;
    };

    /**
     * Get a global option
     * @static
     * @param {string} key
     * @returns {*}
     */
    showdown.getOption = function (key) {
        "use strict";
        return globalOptions[key];
    };

    /**
     * Get the global options
     * @static
     * @returns {{}}
     */
    showdown.getOptions = function () {
        "use strict";
        return globalOptions;
    };

    /**
     * Reset global options to the default values
     * @static
     */
    showdown.resetOptions = function () {
        "use strict";
        globalOptions = getDefaultOpts(true);
    };

    /**
     * Set the flavor showdown should use as default
     * @param {string} name
     */
    showdown.setFlavor = function (name) {
        "use strict";
        if (!flavor.hasOwnProperty(name)) {
            throw Error(name + " flavor was not found");
        }
        showdown.resetOptions();
        var preset = flavor[name];
        setFlavor = name;
        for (var option in preset) {
            if (preset.hasOwnProperty(option)) {
                globalOptions[option] = preset[option];
            }
        }
    };

    /**
     * Get the currently set flavor
     * @returns {string}
     */
    showdown.getFlavor = function () {
        "use strict";
        return setFlavor;
    };

    /**
     * Get the options of a specified flavor. Returns undefined if the flavor was not found
     * @param {string} name Name of the flavor
     * @returns {{}|undefined}
     */
    showdown.getFlavorOptions = function (name) {
        "use strict";
        if (flavor.hasOwnProperty(name)) {
            return flavor[name];
        }
    };

    /**
     * Get the default options
     * @static
     * @param {boolean} [simple=true]
     * @returns {{}}
     */
    showdown.getDefaultOptions = function (simple) {
        "use strict";
        return getDefaultOpts(simple);
    };

    /**
     * Get or set a subParser
     *
     * subParser(name)       - Get a registered subParser
     * subParser(name, func) - Register a subParser
     * @static
     * @param {string} name
     * @param {function} [func]
     * @returns {*}
     */
    showdown.subParser = function (name, func) {
        "use strict";
        if (showdown.helper.isString(name)) {
            if (typeof func !== "undefined") {
                parsers[name] = func;
            } else {
                if (parsers.hasOwnProperty(name)) {
                    return parsers[name];
                } else {
                    throw Error("SubParser named " + name + " not registered!");
                }
            }
        } else {
            throw Error("showdown.subParser function first argument must be a string (the name of the subparser)");
        }
    };

    /**
     * Gets or registers an extension
     * @static
     * @param {string} name
     * @param {object|object[]|function=} ext
     * @returns {*}
     */
    showdown.extension = function (name, ext) {
        "use strict";

        if (!showdown.helper.isString(name)) {
            throw Error("Extension 'name' must be a string");
        }

        name = showdown.helper.stdExtName(name);

        // Getter
        if (showdown.helper.isUndefined(ext)) {
            if (!extensions.hasOwnProperty(name)) {
                throw Error("Extension named " + name + " is not registered!");
            }
            return extensions[name];

            // Setter
        } else {
            // Expand extension if it's wrapped in a function
            if (typeof ext === "function") {
                ext = ext();
            }

            // Ensure extension is an array
            if (!showdown.helper.isArray(ext)) {
                ext = [ext];
            }

            var validExtension = validate(ext, name);

            if (validExtension.valid) {
                extensions[name] = ext;
            } else {
                throw Error(validExtension.error);
            }
        }
    };

    /**
     * Gets all extensions registered
     * @returns {{}}
     */
    showdown.getAllExtensions = function () {
        "use strict";
        return extensions;
    };

    /**
     * Remove an extension
     * @param {string} name
     */
    showdown.removeExtension = function (name) {
        "use strict";
        delete extensions[name];
    };

    /**
     * Removes all extensions
     */
    showdown.resetExtensions = function () {
        "use strict";
        extensions = {};
    };

    /**
     * Validate extension
     * @param {array} extension
     * @param {string} name
     * @returns {{valid: boolean, error: string}}
     */
    function validate(extension, name) {
        "use strict";

        var errMsg = name ? "Error in " + name + " extension->" : "Error in unnamed extension",
            ret = {
                valid: true,
                error: "",
            };

        if (!showdown.helper.isArray(extension)) {
            extension = [extension];
        }

        for (var i = 0; i < extension.length; ++i) {
            var baseMsg = errMsg + " sub-extension " + i + ": ",
                ext = extension[i];
            if (typeof ext !== "object") {
                ret.valid = false;
                ret.error = baseMsg + "must be an object, but " + typeof ext + " given";
                return ret;
            }

            if (!showdown.helper.isString(ext.type)) {
                ret.valid = false;
                ret.error = baseMsg + 'property "type" must be a string, but ' + typeof ext.type + " given";
                return ret;
            }

            var type = (ext.type = ext.type.toLowerCase());

            // normalize extension type
            if (type === "language") {
                type = ext.type = "lang";
            }

            if (type === "html") {
                type = ext.type = "output";
            }

            if (type !== "lang" && type !== "output" && type !== "listener") {
                ret.valid = false;
                ret.error = baseMsg + "type " + type + ' is not recognized. Valid values: "lang/language", "output/html" or "listener"';
                return ret;
            }

            if (type === "listener") {
                if (showdown.helper.isUndefined(ext.listeners)) {
                    ret.valid = false;
                    ret.error = baseMsg + '. Extensions of type "listener" must have a property called "listeners"';
                    return ret;
                }
            } else {
                if (showdown.helper.isUndefined(ext.filter) && showdown.helper.isUndefined(ext.regex)) {
                    ret.valid = false;
                    ret.error = baseMsg + type + ' extensions must define either a "regex" property or a "filter" method';
                    return ret;
                }
            }

            if (ext.listeners) {
                if (typeof ext.listeners !== "object") {
                    ret.valid = false;
                    ret.error = baseMsg + '"listeners" property must be an object but ' + typeof ext.listeners + " given";
                    return ret;
                }
                for (var ln in ext.listeners) {
                    if (ext.listeners.hasOwnProperty(ln)) {
                        if (typeof ext.listeners[ln] !== "function") {
                            ret.valid = false;
                            ret.error = baseMsg + '"listeners" property must be an hash of [event name]: [callback]. listeners.' + ln + " must be a function but " + typeof ext.listeners[ln] + " given";
                            return ret;
                        }
                    }
                }
            }

            if (ext.filter) {
                if (typeof ext.filter !== "function") {
                    ret.valid = false;
                    ret.error = baseMsg + '"filter" must be a function, but ' + typeof ext.filter + " given";
                    return ret;
                }
            } else if (ext.regex) {
                if (showdown.helper.isString(ext.regex)) {
                    ext.regex = new RegExp(ext.regex, "g");
                }
                if (!(ext.regex instanceof RegExp)) {
                    ret.valid = false;
                    ret.error = baseMsg + '"regex" property must either be a string or a RegExp object, but ' + typeof ext.regex + " given";
                    return ret;
                }
                if (showdown.helper.isUndefined(ext.replace)) {
                    ret.valid = false;
                    ret.error = baseMsg + '"regex" extensions must implement a replace string or function';
                    return ret;
                }
            }
        }
        return ret;
    }

    /**
     * Validate extension
     * @param {object} ext
     * @returns {boolean}
     */
    showdown.validateExtension = function (ext) {
        "use strict";

        var validateExtension = validate(ext, null);
        if (!validateExtension.valid) {
            console.warn(validateExtension.error);
            return false;
        }
        return true;
    };

    /**
     * showdownjs helper functions
     */

    if (!showdown.hasOwnProperty("helper")) {
        showdown.helper = {};
    }

    if (typeof this === "undefined" && typeof window !== "undefined") {
        showdown.helper.document = window.document;
    } else {
        if (typeof this.document === "undefined" && typeof this.window === "undefined") {
            var jsdom = require("jsdom");
            this.window = new jsdom.JSDOM("", {}).window; // jshint ignore:line
        }
        showdown.helper.document = this.window.document;
    }

    /**
     * Check if var is string
     * @static
     * @param {string} a
     * @returns {boolean}
     */
    showdown.helper.isString = function (a) {
        "use strict";
        return typeof a === "string" || a instanceof String;
    };

    /**
     * Check if var is a function
     * @static
     * @param {*} a
     * @returns {boolean}
     */
    showdown.helper.isFunction = function (a) {
        "use strict";
        var getType = {};
        return a && getType.toString.call(a) === "[object Function]";
    };

    /**
     * isArray helper function
     * @static
     * @param {*} a
     * @returns {boolean}
     */
    showdown.helper.isArray = function (a) {
        "use strict";
        return Array.isArray(a);
    };

    /**
     * Check if value is undefined
     * @static
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is `undefined`, else `false`.
     */
    showdown.helper.isUndefined = function (value) {
        "use strict";
        return typeof value === "undefined";
    };

    /**
     * ForEach helper function
     * Iterates over Arrays and Objects (own properties only)
     * @static
     * @param {*} obj
     * @param {function} callback Accepts 3 params: 1. value, 2. key, 3. the original array/object
     */
    showdown.helper.forEach = function (obj, callback) {
        "use strict";
        // check if obj is defined
        if (showdown.helper.isUndefined(obj)) {
            throw new Error("obj param is required");
        }

        if (showdown.helper.isUndefined(callback)) {
            throw new Error("callback param is required");
        }

        if (!showdown.helper.isFunction(callback)) {
            throw new Error("callback param must be a function/closure");
        }

        if (typeof obj.forEach === "function") {
            obj.forEach(callback);
        } else if (showdown.helper.isArray(obj)) {
            for (var i = 0; i < obj.length; i++) {
                callback(obj[i], i, obj);
            }
        } else if (typeof obj === "object") {
            for (var prop in obj) {
                if (obj.hasOwnProperty(prop)) {
                    callback(obj[prop], prop, obj);
                }
            }
        } else {
            throw new Error("obj does not seem to be an array or an iterable object");
        }
    };

    /**
     * Standardidize extension name
     * @static
     * @param {string} s extension name
     * @returns {string}
     */
    showdown.helper.stdExtName = function (s) {
        "use strict";
        return s
            .replace(/[_?*+\/\\.^-]/g, "")
            .replace(/\s/g, "")
            .toLowerCase();
    };

    function escapeCharactersCallback(wholeMatch, m1) {
        "use strict";
        var charCodeToEscape = m1.charCodeAt(0);
        return "¨E" + charCodeToEscape + "E";
    }

    /**
     * Callback used to escape characters when passing through String.replace
     * @static
     * @param {string} wholeMatch
     * @param {string} m1
     * @returns {string}
     */
    showdown.helper.escapeCharactersCallback = escapeCharactersCallback;

    /**
     * Escape characters in a string
     * @static
     * @param {string} text
     * @param {string} charsToEscape
     * @param {boolean} afterBackslash
     * @returns {string|void|*}
     */
    showdown.helper.escapeCharacters = function (text, charsToEscape, afterBackslash) {
        "use strict";
        // First we have to escape the escape characters so that
        // we can build a character class out of them
        var regexString = "([" + charsToEscape.replace(/([\[\]\\])/g, "\\$1") + "])";

        if (afterBackslash) {
            regexString = "\\\\" + regexString;
        }

        var regex = new RegExp(regexString, "g");
        text = text.replace(regex, escapeCharactersCallback);

        return text;
    };

    var rgxFindMatchPos = function (str, left, right, flags) {
        "use strict";
        var f = flags || "",
            g = f.indexOf("g") > -1,
            x = new RegExp(left + "|" + right, "g" + f.replace(/g/g, "")),
            l = new RegExp(left, f.replace(/g/g, "")),
            pos = [],
            t,
            s,
            m,
            start,
            end;

        do {
            t = 0;
            while ((m = x.exec(str))) {
                if (l.test(m[0])) {
                    if (!t++) {
                        s = x.lastIndex;
                        start = s - m[0].length;
                    }
                } else if (t) {
                    if (!--t) {
                        end = m.index + m[0].length;
                        var obj = {
                            left: { start: start, end: s },
                            match: { start: s, end: m.index },
                            right: { start: m.index, end: end },
                            wholeMatch: { start: start, end: end },
                        };
                        pos.push(obj);
                        if (!g) {
                            return pos;
                        }
                    }
                }
            }
        } while (t && (x.lastIndex = s));

        return pos;
    };

    /**
     * matchRecursiveRegExp
     *
     * (c) 2007 Steven Levithan <stevenlevithan.com>
     * MIT License
     *
     * Accepts a string to search, a left and right format delimiter
     * as regex patterns, and optional regex flags. Returns an array
     * of matches, allowing nested instances of left/right delimiters.
     * Use the "g" flag to return all matches, otherwise only the
     * first is returned. Be careful to ensure that the left and
     * right format delimiters produce mutually exclusive matches.
     * Backreferences are not supported within the right delimiter
     * due to how it is internally combined with the left delimiter.
     * When matching strings whose format delimiters are unbalanced
     * to the left or right, the output is intentionally as a
     * conventional regex library with recursion support would
     * produce, e.g. "<<x>" and "<x>>" both produce ["x"] when using
     * "<" and ">" as the delimiters (both strings contain a single,
     * balanced instance of "<x>").
     *
     * examples:
     * matchRecursiveRegExp("test", "\\(", "\\)")
     * returns: []
     * matchRecursiveRegExp("<t<<e>><s>>t<>", "<", ">", "g")
     * returns: ["t<<e>><s>", ""]
     * matchRecursiveRegExp("<div id=\"x\">test</div>", "<div\\b[^>]*>", "</div>", "gi")
     * returns: ["test"]
     */
    showdown.helper.matchRecursiveRegExp = function (str, left, right, flags) {
        "use strict";

        var matchPos = rgxFindMatchPos(str, left, right, flags),
            results = [];

        for (var i = 0; i < matchPos.length; ++i) {
            results.push([str.slice(matchPos[i].wholeMatch.start, matchPos[i].wholeMatch.end), str.slice(matchPos[i].match.start, matchPos[i].match.end), str.slice(matchPos[i].left.start, matchPos[i].left.end), str.slice(matchPos[i].right.start, matchPos[i].right.end)]);
        }
        return results;
    };

    /**
     *
     * @param {string} str
     * @param {string|function} replacement
     * @param {string} left
     * @param {string} right
     * @param {string} flags
     * @returns {string}
     */
    showdown.helper.replaceRecursiveRegExp = function (str, replacement, left, right, flags) {
        "use strict";

        if (!showdown.helper.isFunction(replacement)) {
            var repStr = replacement;
            replacement = function () {
                return repStr;
            };
        }

        var matchPos = rgxFindMatchPos(str, left, right, flags),
            finalStr = str,
            lng = matchPos.length;

        if (lng > 0) {
            var bits = [];
            if (matchPos[0].wholeMatch.start !== 0) {
                bits.push(str.slice(0, matchPos[0].wholeMatch.start));
            }
            for (var i = 0; i < lng; ++i) {
                bits.push(replacement(str.slice(matchPos[i].wholeMatch.start, matchPos[i].wholeMatch.end), str.slice(matchPos[i].match.start, matchPos[i].match.end), str.slice(matchPos[i].left.start, matchPos[i].left.end), str.slice(matchPos[i].right.start, matchPos[i].right.end)));
                if (i < lng - 1) {
                    bits.push(str.slice(matchPos[i].wholeMatch.end, matchPos[i + 1].wholeMatch.start));
                }
            }
            if (matchPos[lng - 1].wholeMatch.end < str.length) {
                bits.push(str.slice(matchPos[lng - 1].wholeMatch.end));
            }
            finalStr = bits.join("");
        }
        return finalStr;
    };

    /**
     * Returns the index within the passed String object of the first occurrence of the specified regex,
     * starting the search at fromIndex. Returns -1 if the value is not found.
     *
     * @param {string} str string to search
     * @param {RegExp} regex Regular expression to search
     * @param {int} [fromIndex = 0] Index to start the search
     * @returns {Number}
     * @throws InvalidArgumentError
     */
    showdown.helper.regexIndexOf = function (str, regex, fromIndex) {
        "use strict";
        if (!showdown.helper.isString(str)) {
            throw "InvalidArgumentError: first parameter of showdown.helper.regexIndexOf function must be a string";
        }
        if (!(regex instanceof RegExp)) {
            throw "InvalidArgumentError: second parameter of showdown.helper.regexIndexOf function must be an instance of RegExp";
        }
        var indexOf = str.substring(fromIndex || 0).search(regex);
        return indexOf >= 0 ? indexOf + (fromIndex || 0) : indexOf;
    };

    /**
     * Splits the passed string object at the defined index, and returns an array composed of the two substrings
     * @param {string} str string to split
     * @param {int} index index to split string at
     * @returns {[string,string]}
     * @throws InvalidArgumentError
     */
    showdown.helper.splitAtIndex = function (str, index) {
        "use strict";
        if (!showdown.helper.isString(str)) {
            throw "InvalidArgumentError: first parameter of showdown.helper.regexIndexOf function must be a string";
        }
        return [str.substring(0, index), str.substring(index)];
    };

    /**
     * Obfuscate an e-mail address through the use of Character Entities,
     * transforming ASCII characters into their equivalent decimal or hex entities.
     *
     * Since it has a random component, subsequent calls to this function produce different results
     *
     * @param {string} mail
     * @param {string} seed
     * @returns {string}
     */
    showdown.helper.encodeEmailAddress = function (mail, seed) {
        "use strict";
        var encode = [
            function (ch) {
                return "&#" + ch.charCodeAt(0) + ";";
            },
            function (ch) {
                return "&#x" + ch.charCodeAt(0).toString(16) + ";";
            },
            function (ch) {
                return ch;
            },
        ];

        mail = mail.replace(/./g, function (ch) {
            if (ch === "@") {
                // this *must* be encoded. I insist.
                ch = encode[Math.floor(Math.random() * 2)](ch);
            } else {
                var r = Math.random();
                // roughly 10% raw, 45% hex, 45% dec
                ch = r > 0.9 ? encode[2](ch) : r > 0.45 ? encode[1](ch) : encode[0](ch);
            }
            return ch;
        });

        return mail;
    };

    /**
     * String.prototype.repeat polyfill
     *
     * @param {string} str
     * @param {int} count
     * @returns {string}
     */
    showdown.helper.repeat = function (str, count) {
        "use strict";
        // use built-in method if it's available
        if (!showdown.helper.isUndefined(String.prototype.repeat)) {
            return str.repeat(count);
        }
        str = "" + str;
        if (count < 0) {
            throw new RangeError("repeat count must be non-negative");
        }
        if (count === Infinity) {
            throw new RangeError("repeat count must be less than infinity");
        }
        count = Math.floor(count);
        if (str.length === 0 || count === 0) {
            return "";
        }
        // Ensuring count is a 31-bit integer allows us to heavily optimize the
        // main part. But anyway, most current (August 2014) browsers can't handle
        // strings 1 << 28 chars or longer, so:
        /*jshint bitwise: false*/
        if (str.length * count >= 1 << 28) {
            throw new RangeError("repeat count must not overflow maximum string size");
        }
        /*jshint bitwise: true*/
        var maxCount = str.length * count;
        count = Math.floor(Math.log(count) / Math.log(2));
        while (count) {
            str += str;
            count--;
        }
        str += str.substring(0, maxCount - str.length);
        return str;
    };

    /**
     * String.prototype.padEnd polyfill
     *
     * @param str
     * @param targetLength
     * @param padString
     * @returns {string}
     */
    showdown.helper.padEnd = function padEnd(str, targetLength, padString) {
        "use strict";
        /*jshint bitwise: false*/
        // eslint-disable-next-line space-infix-ops
        targetLength = targetLength >> 0; //floor if number or convert non-number to 0;
        /*jshint bitwise: true*/
        padString = String(padString || " ");
        if (str.length > targetLength) {
            return String(str);
        } else {
            targetLength = targetLength - str.length;
            if (targetLength > padString.length) {
                padString += showdown.helper.repeat(padString, targetLength / padString.length); //append to original to ensure we are longer than needed
            }
            return String(str) + padString.slice(0, targetLength);
        }
    };

    /**
     * Unescape HTML entities
     * @param txt
     * @returns {string}
     */
    showdown.helper.unescapeHTMLEntities = function (txt) {
        "use strict";

        return txt
            .replace(/&quot;/g, '"')
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&amp;/g, "&");
    };

    showdown.helper._hashHTMLSpan = function (html, globals) {
        return "¨C" + (globals.gHtmlSpans.push(html) - 1) + "C";
    };

    /**
     * Prepends a base URL to relative paths.
     *
     * @param {string} baseUrl the base URL to prepend to a relative path
     * @param {string} url the path to modify, which may be relative
     * @returns {string} the full URL
     */
    showdown.helper.applyBaseUrl = function (baseUrl, url) {
        // Only prepend if given a base URL and the path is not absolute.
        if (baseUrl && !this.isAbsolutePath(url)) {
            var urlResolve = require("url").resolve;
            url = urlResolve(baseUrl, url);
        }

        return url;
    };

    /**
     * Checks if the given path is absolute.
     *
     * @param {string} path the path to test for absolution
     * @returns {boolean} `true` if the given path is absolute, else `false`
     */
    showdown.helper.isAbsolutePath = function (path) {
        // Absolute paths begin with '[protocol:]//' or '#' (anchors)
        return /(^([a-z]+:)?\/\/)|(^#)/i.test(path);
    };

    /**
     * Showdown's Event Object
     * @param {string} name Name of the event
     * @param {string} text Text
     * @param {{}} params optional. params of the event
     * @constructor
     */
    showdown.helper.Event = function (name, text, params) {
        "use strict";

        var regexp = params.regexp || null;
        var matches = params.matches || {};
        var options = params.options || {};
        var converter = params.converter || null;
        var globals = params.globals || {};

        /**
         * Get the name of the event
         * @returns {string}
         */
        this.getName = function () {
            return name;
        };

        this.getEventName = function () {
            return name;
        };

        this._stopExecution = false;

        this.parsedText = params.parsedText || null;

        this.getRegexp = function () {
            return regexp;
        };

        this.getOptions = function () {
            return options;
        };

        this.getConverter = function () {
            return converter;
        };

        this.getGlobals = function () {
            return globals;
        };

        this.getCapturedText = function () {
            return text;
        };

        this.getText = function () {
            return text;
        };

        this.setText = function (newText) {
            text = newText;
        };

        this.getMatches = function () {
            return matches;
        };

        this.setMatches = function (newMatches) {
            matches = newMatches;
        };

        this.preventDefault = function (bool) {
            this._stopExecution = !bool;
        };
    };

    /**
     * POLYFILLS
     */
    // use this instead of builtin is undefined for IE8 compatibility
    if (typeof console === "undefined") {
        console = {
            warn: function (msg) {
                "use strict";
                alert(msg);
            },
            log: function (msg) {
                "use strict";
                alert(msg);
            },
            error: function (msg) {
                "use strict";
                throw msg;
            },
        };
    }

    /**
     * Common regexes.
     * We declare some common regexes to improve performance
     */
    showdown.helper.regexes = {
        asteriskDashTildeAndColon: /([*_:~])/g,
        asteriskDashAndTilde: /([*_~])/g,
    };

    /**
     * EMOJIS LIST
     * reference: https://github.com/ikatyang/emoji-cheat-sheet/blob/master/README.md
     * new reference
     */
    showdown.helper.emojis = {"grinning":"😀","smiley":"😃","smile":"😄","grin":"😁","laughing":"😆","sweat_smile":"😅","rofl":"🤣","joy":"😂","slightly_smiling_face":"🙂","upside_down_face":"🙃","melting_face":"🫠","wink":"😉","blush":"😊","innocent":"😇","smiling_face_with_three_hearts":"🥰","heart_eyes":"😍","star_struck":"🤩","kissing_heart":"😘","kissing":"😗","relaxed":"☺️","kissing_closed_eyes":"😚","kissing_smiling_eyes":"😙","smiling_face_with_tear":"🥲","yum":"😋","stuck_out_tongue":"😛","stuck_out_tongue_winking_eye":"😜","zany_face":"🤪","stuck_out_tongue_closed_eyes":"😝","money_mouth_face":"🤑","hugs":"🤗","hand_over_mouth":"🤭","face_with_open_eyes_and_hand_over_mouth":"🫢","face_with_peeking_eye":"🫣","shushing_face":"🤫","thinking":"🤔","saluting_face":"🫡","zipper_mouth_face":"🤐","raised_eyebrow":"🤨","neutral_face":"😐","expressionless":"😑","no_mouth":"😶","dotted_line_face":"🫥","face_in_clouds":"😶‍🌫️","smirk":"😏","unamused":"😒","roll_eyes":"🙄","grimacing":"😬","face_exhaling":"😮‍💨","lying_face":"🤥","shaking_face":"🫨","head_shaking_horizontally":"🙂‍↔️","head_shaking_vertically":"🙂‍↕️","relieved":"😌","pensive":"😔","sleepy":"😪","drooling_face":"🤤","sleeping":"😴","face_with_bags_under_eyes":"🫩","mask":"😷","face_with_thermometer":"🤒","face_with_head_bandage":"🤕","nauseated_face":"🤢","vomiting_face":"🤮","sneezing_face":"🤧","hot_face":"🥵","cold_face":"🥶","woozy_face":"🥴","dizzy_face":"😵","face_with_spiral_eyes":"😵‍💫","exploding_head":"🤯","cowboy_hat_face":"🤠","partying_face":"🥳","disguised_face":"🥸","sunglasses":"😎","nerd_face":"🤓","monocle_face":"🧐","confused":"😕","face_with_diagonal_mouth":"🫤","worried":"😟","slightly_frowning_face":"🙁","frowning_face":"☹️","open_mouth":"😮","hushed":"😯","astonished":"😲","flushed":"😳","pleading_face":"🥺","face_holding_back_tears":"🥹","frowning":"😦","anguished":"😧","fearful":"😨","cold_sweat":"😰","disappointed_relieved":"😥","cry":"😢","sob":"😭","scream":"😱","confounded":"😖","persevere":"😣","disappointed":"😞","sweat":"😓","weary":"😩","tired_face":"😫","yawning_face":"🥱","triumph":"😤","rage":"😡","angry":"😠","cursing_face":"🤬","smiling_imp":"😈","imp":"👿","skull":"💀","skull_and_crossbones":"☠️","hankey":"💩","clown_face":"🤡","japanese_ogre":"👹","japanese_goblin":"👺","ghost":"👻","alien":"👽","space_invader":"👾","robot":"🤖","smiley_cat":"😺","smile_cat":"😸","joy_cat":"😹","heart_eyes_cat":"😻","smirk_cat":"😼","kissing_cat":"😽","scream_cat":"🙀","crying_cat_face":"😿","pouting_cat":"😾","see_no_evil":"🙈","hear_no_evil":"🙉","speak_no_evil":"🙊","love_letter":"💌","cupid":"💘","gift_heart":"💝","sparkling_heart":"💖","heartpulse":"💗","heartbeat":"💓","revolving_hearts":"💞","two_hearts":"💕","heart_decoration":"💟","heavy_heart_exclamation":"❣️","broken_heart":"💔","heart_on_fire":"❤️‍🔥","mending_heart":"❤️‍🩹","heart":"❤️","pink_heart":"🩷","orange_heart":"🧡","yellow_heart":"💛","green_heart":"💚","blue_heart":"💙","light_blue_heart":"🩵","purple_heart":"💜","brown_heart":"🤎","black_heart":"🖤","grey_heart":"🩶","white_heart":"🤍","kiss":"💋","100":"💯","anger":"💢","boom":"💥","dizzy":"💫","sweat_drops":"💦","dash":"💨","hole":"🕳️","speech_balloon":"💬","eye_speech_bubble":"👁️‍🗨️","left_speech_bubble":"🗨️","right_anger_bubble":"🗯️","thought_balloon":"💭","zzz":"💤","wave":"👋","raised_back_of_hand":"🤚","raised_hand_with_fingers_splayed":"🖐️","hand":"✋","vulcan_salute":"🖖","rightwards_hand":"🫱","leftwards_hand":"🫲","palm_down_hand":"🫳","palm_up_hand":"🫴","leftwards_pushing_hand":"🫷","rightwards_pushing_hand":"🫸","ok_hand":"👌","pinched_fingers":"🤌","pinching_hand":"🤏","v":"✌️","crossed_fingers":"🤞","hand_with_index_finger_and_thumb_crossed":"🫰","love_you_gesture":"🤟","metal":"🤘","call_me_hand":"🤙","point_left":"👈","point_right":"👉","point_up_2":"👆","middle_finger":"🖕","point_down":"👇","point_up":"☝️","index_pointing_at_the_viewer":"🫵","+1":"👍","-1":"👎","fist_raised":"✊","fist_oncoming":"👊","fist_left":"🤛","fist_right":"🤜","clap":"👏","raised_hands":"🙌","heart_hands":"🫶","open_hands":"👐","palms_up_together":"🤲","handshake":"🤝","pray":"🙏","writing_hand":"✍️","nail_care":"💅","selfie":"🤳","muscle":"💪","mechanical_arm":"🦾","mechanical_leg":"🦿","leg":"🦵","foot":"🦶","ear":"👂","ear_with_hearing_aid":"🦻","nose":"👃","brain":"🧠","anatomical_heart":"🫀","lungs":"🫁","tooth":"🦷","bone":"🦴","eyes":"👀","eye":"👁️","tongue":"👅","lips":"👄","biting_lip":"🫦","baby":"👶","child":"🧒","boy":"👦","girl":"👧","adult":"🧑","man":"👨","woman":"👩","older_adult":"🧓","older_man":"👴","older_woman":"👵","frowning_person":"🙍","frowning_man":"🙍‍♂️","frowning_woman":"🙍‍♀️","pouting_face":"🙎","pouting_man":"🙎‍♂️","pouting_woman":"🙎‍♀️","no_good":"🙅","no_good_man":"🙅‍♂️","no_good_woman":"🙅‍♀️","ok_person":"🙆","ok_man":"🙆‍♂️","ok_woman":"🙆‍♀️","tipping_hand_person":"💁","tipping_hand_man":"💁‍♂️","tipping_hand_woman":"💁‍♀️","raising_hand":"🙋","raising_hand_man":"🙋‍♂️","raising_hand_woman":"🙋‍♀️","deaf_person":"🧏","deaf_man":"🧏‍♂️","deaf_woman":"🧏‍♀️","bow":"🙇","bowing_man":"🙇‍♂️","bowing_woman":"🙇‍♀️","facepalm":"🤦","man_facepalming":"🤦‍♂️","woman_facepalming":"🤦‍♀️","shrug":"🤷","man_shrugging":"🤷‍♂️","woman_shrugging":"🤷‍♀️","health_worker":"🧑‍⚕️","man_health_worker":"👨‍⚕️","woman_health_worker":"👩‍⚕️","student":"🧑‍🎓","man_student":"👨‍🎓","woman_student":"👩‍🎓","teacher":"🧑‍🏫","man_teacher":"👨‍🏫","woman_teacher":"👩‍🏫","judge":"🧑‍⚖️","man_judge":"👨‍⚖️","woman_judge":"👩‍⚖️","farmer":"🧑‍🌾","man_farmer":"👨‍🌾","woman_farmer":"👩‍🌾","cook":"🧑‍🍳","man_cook":"👨‍🍳","woman_cook":"👩‍🍳","mechanic":"🧑‍🔧","man_mechanic":"👨‍🔧","woman_mechanic":"👩‍🔧","factory_worker":"🧑‍🏭","man_factory_worker":"👨‍🏭","woman_factory_worker":"👩‍🏭","office_worker":"🧑‍💼","man_office_worker":"👨‍💼","woman_office_worker":"👩‍💼","scientist":"🧑‍🔬","man_scientist":"👨‍🔬","woman_scientist":"👩‍🔬","technologist":"🧑‍💻","man_technologist":"👨‍💻","woman_technologist":"👩‍💻","singer":"🧑‍🎤","man_singer":"👨‍🎤","woman_singer":"👩‍🎤","artist":"🧑‍🎨","man_artist":"👨‍🎨","woman_artist":"👩‍🎨","pilot":"🧑‍✈️","man_pilot":"👨‍✈️","woman_pilot":"👩‍✈️","astronaut":"🧑‍🚀","man_astronaut":"👨‍🚀","woman_astronaut":"👩‍🚀","firefighter":"🧑‍🚒","man_firefighter":"👨‍🚒","woman_firefighter":"👩‍🚒","police_officer":"👮","policeman":"👮‍♂️","policewoman":"👮‍♀️","detective":"🕵️","male_detective":"🕵️‍♂️","female_detective":"🕵️‍♀️","guard":"💂","guardsman":"💂‍♂️","guardswoman":"💂‍♀️","ninja":"🥷","construction_worker":"👷","construction_worker_man":"👷‍♂️","construction_worker_woman":"👷‍♀️","person_with_crown":"🫅","prince":"🤴","princess":"👸","person_with_turban":"👳","man_with_turban":"👳‍♂️","woman_with_turban":"👳‍♀️","man_with_gua_pi_mao":"👲","woman_with_headscarf":"🧕","person_in_tuxedo":"🤵","man_in_tuxedo":"🤵‍♂️","woman_in_tuxedo":"🤵‍♀️","person_with_veil":"👰","man_with_veil":"👰‍♂️","woman_with_veil":"👰‍♀️","pregnant_woman":"🤰","pregnant_man":"🫃","pregnant_person":"🫄","breast_feeding":"🤱","woman_feeding_baby":"👩‍🍼","man_feeding_baby":"👨‍🍼","person_feeding_baby":"🧑‍🍼","angel":"👼","santa":"🎅","mrs_claus":"🤶","mx_claus":"🧑‍🎄","superhero":"🦸","superhero_man":"🦸‍♂️","superhero_woman":"🦸‍♀️","supervillain":"🦹","supervillain_man":"🦹‍♂️","supervillain_woman":"🦹‍♀️","mage":"🧙","mage_man":"🧙‍♂️","mage_woman":"🧙‍♀️","fairy":"🧚","fairy_man":"🧚‍♂️","fairy_woman":"🧚‍♀️","vampire":"🧛","vampire_man":"🧛‍♂️","vampire_woman":"🧛‍♀️","merperson":"🧜","merman":"🧜‍♂️","mermaid":"🧜‍♀️","elf":"🧝","elf_man":"🧝‍♂️","elf_woman":"🧝‍♀️","genie":"🧞","genie_man":"🧞‍♂️","genie_woman":"🧞‍♀️","zombie":"🧟","zombie_man":"🧟‍♂️","zombie_woman":"🧟‍♀️","troll":"🧌","massage":"💆","massage_man":"💆‍♂️","massage_woman":"💆‍♀️","haircut":"💇","haircut_man":"💇‍♂️","haircut_woman":"💇‍♀️","walking":"🚶","walking_man":"🚶‍♂️","walking_woman":"🚶‍♀️","person_walking_facing_right":"🚶‍➡️","woman_walking_facing_right":"🚶‍♀️‍➡️","man_walking_facing_right":"🚶‍♂️‍➡️","standing_person":"🧍","standing_man":"🧍‍♂️","standing_woman":"🧍‍♀️","kneeling_person":"🧎","kneeling_man":"🧎‍♂️","kneeling_woman":"🧎‍♀️","person_kneeling_facing_right":"🧎‍➡️","woman_kneeling_facing_right":"🧎‍♀️‍➡️","man_kneeling_facing_right":"🧎‍♂️‍➡️","person_with_probing_cane":"🧑‍🦯","person_with_white_cane_facing_right":"🧑‍🦯‍➡️","man_with_probing_cane":"👨‍🦯","man_with_white_cane_facing_right":"👨‍🦯‍➡️","woman_with_probing_cane":"👩‍🦯","woman_with_white_cane_facing_right":"👩‍🦯‍➡️","person_in_motorized_wheelchair":"🧑‍🦼","person_in_motorized_wheelchair_facing_right":"🧑‍🦼‍➡️","man_in_motorized_wheelchair":"👨‍🦼","man_in_motorized_wheelchair_facing_right":"👨‍🦼‍➡️","woman_in_motorized_wheelchair":"👩‍🦼","woman_in_motorized_wheelchair_facing_right":"👩‍🦼‍➡️","person_in_manual_wheelchair":"🧑‍🦽","person_in_manual_wheelchair_facing_right":"🧑‍🦽‍➡️","man_in_manual_wheelchair":"👨‍🦽","man_in_manual_wheelchair_facing_right":"👨‍🦽‍➡️","woman_in_manual_wheelchair":"👩‍🦽","woman_in_manual_wheelchair_facing_right":"👩‍🦽‍➡️","runner":"🏃","running_man":"🏃‍♂️","running_woman":"🏃‍♀️","person_running_facing_right":"🏃‍➡️","woman_running_facing_right":"🏃‍♀️‍➡️","man_running_facing_right":"🏃‍♂️‍➡️","woman_dancing":"💃","man_dancing":"🕺","business_suit_levitating":"🕴️","dancers":"👯","dancing_men":"👯‍♂️","dancing_women":"👯‍♀️","sauna_person":"🧖","sauna_man":"🧖‍♂️","sauna_woman":"🧖‍♀️","climbing":"🧗","climbing_man":"🧗‍♂️","climbing_woman":"🧗‍♀️","person_fencing":"🤺","horse_racing":"🏇","skier":"⛷️","snowboarder":"🏂","golfing":"🏌️","golfing_man":"🏌️‍♂️","golfing_woman":"🏌️‍♀️","surfer":"🏄","surfing_man":"🏄‍♂️","surfing_woman":"🏄‍♀️","rowboat":"🚣","rowing_man":"🚣‍♂️","rowing_woman":"🚣‍♀️","swimmer":"🏊","swimming_man":"🏊‍♂️","swimming_woman":"🏊‍♀️","bouncing_ball_person":"⛹️","bouncing_ball_man":"⛹️‍♂️","bouncing_ball_woman":"⛹️‍♀️","weight_lifting":"🏋️","weight_lifting_man":"🏋️‍♂️","weight_lifting_woman":"🏋️‍♀️","bicyclist":"🚴","biking_man":"🚴‍♂️","biking_woman":"🚴‍♀️","mountain_bicyclist":"🚵","mountain_biking_man":"🚵‍♂️","mountain_biking_woman":"🚵‍♀️","cartwheeling":"🤸","man_cartwheeling":"🤸‍♂️","woman_cartwheeling":"🤸‍♀️","wrestling":"🤼","men_wrestling":"🤼‍♂️","women_wrestling":"🤼‍♀️","water_polo":"🤽","man_playing_water_polo":"🤽‍♂️","woman_playing_water_polo":"🤽‍♀️","handball_person":"🤾","man_playing_handball":"🤾‍♂️","woman_playing_handball":"🤾‍♀️","juggling_person":"🤹","man_juggling":"🤹‍♂️","woman_juggling":"🤹‍♀️","lotus_position":"🧘","lotus_position_man":"🧘‍♂️","lotus_position_woman":"🧘‍♀️","bath":"🛀","sleeping_bed":"🛌","people_holding_hands":"🧑‍🤝‍🧑","two_women_holding_hands":"👭","couple":"👫","two_men_holding_hands":"👬","couplekiss":"💏","couple_with_heart":"💑","speaking_head":"🗣️","bust_in_silhouette":"👤","busts_in_silhouette":"👥","people_hugging":"🫂","family":"👪","footprints":"👣","fingerprint":"🫆","monkey_face":"🐵","monkey":"🐒","gorilla":"🦍","orangutan":"🦧","dog":"🐶","dog2":"🐕","guide_dog":"🦮","service_dog":"🐕‍🦺","poodle":"🐩","wolf":"🐺","fox_face":"🦊","raccoon":"🦝","cat":"🐱","cat2":"🐈","black_cat":"🐈‍⬛","lion":"🦁","tiger":"🐯","tiger2":"🐅","leopard":"🐆","horse":"🐴","moose":"🫎","donkey":"🫏","racehorse":"🐎","unicorn":"🦄","zebra":"🦓","deer":"🦌","bison":"🦬","cow":"🐮","ox":"🐂","water_buffalo":"🐃","cow2":"🐄","pig":"🐷","pig2":"🐖","boar":"🐗","pig_nose":"🐽","ram":"🐏","sheep":"🐑","goat":"🐐","dromedary_camel":"🐪","camel":"🐫","llama":"🦙","giraffe":"🦒","elephant":"🐘","mammoth":"🦣","rhinoceros":"🦏","hippopotamus":"🦛","mouse":"🐭","mouse2":"🐁","rat":"🐀","hamster":"🐹","rabbit":"🐰","rabbit2":"🐇","chipmunk":"🐿️","beaver":"🦫","hedgehog":"🦔","bat":"🦇","bear":"🐻","polar_bear":"🐻‍❄️","koala":"🐨","panda_face":"🐼","sloth":"🦥","otter":"🦦","skunk":"🦨","kangaroo":"🦘","badger":"🦡","feet":"🐾","turkey":"🦃","chicken":"🐔","rooster":"🐓","hatching_chick":"🐣","baby_chick":"🐤","hatched_chick":"🐥","bird":"🐦","penguin":"🐧","dove":"🕊️","eagle":"🦅","duck":"🦆","swan":"🦢","owl":"🦉","dodo":"🦤","feather":"🪶","flamingo":"🦩","peacock":"🦚","parrot":"🦜","wing":"🪽","black_bird":"🐦‍⬛","goose":"🪿","phoenix":"🐦‍🔥","frog":"🐸","crocodile":"🐊","turtle":"🐢","lizard":"🦎","snake":"🐍","dragon_face":"🐲","dragon":"🐉","sauropod":"🦕","t-rex":"🦖","whale":"🐳","whale2":"🐋","dolphin":"🐬","seal":"🦭","fish":"🐟","tropical_fish":"🐠","blowfish":"🐡","shark":"🦈","octopus":"🐙","shell":"🐚","coral":"🪸","jellyfish":"🪼","crab":"🦀","lobster":"🦞","shrimp":"🦐","squid":"🦑","oyster":"🦪","snail":"🐌","butterfly":"🦋","bug":"🐛","ant":"🐜","bee":"🐝","beetle":"🪲","lady_beetle":"🐞","cricket":"🦗","cockroach":"🪳","spider":"🕷️","spider_web":"🕸️","scorpion":"🦂","mosquito":"🦟","fly":"🪰","worm":"🪱","microbe":"🦠","bouquet":"💐","cherry_blossom":"🌸","white_flower":"💮","lotus":"🪷","rosette":"🏵️","rose":"🌹","wilted_flower":"🥀","hibiscus":"🌺","sunflower":"🌻","blossom":"🌼","tulip":"🌷","hyacinth":"🪻","seedling":"🌱","potted_plant":"🪴","evergreen_tree":"🌲","deciduous_tree":"🌳","palm_tree":"🌴","cactus":"🌵","ear_of_rice":"🌾","herb":"🌿","shamrock":"☘️","four_leaf_clover":"🍀","maple_leaf":"🍁","fallen_leaf":"🍂","leaves":"🍃","empty_nest":"🪹","nest_with_eggs":"🪺","mushroom":"🍄","leafless_tree":"🪾","grapes":"🍇","melon":"🍈","watermelon":"🍉","tangerine":"🍊","lemon":"🍋","lime":"🍋‍🟩","banana":"🍌","pineapple":"🍍","mango":"🥭","apple":"🍎","green_apple":"🍏","pear":"🍐","peach":"🍑","cherries":"🍒","strawberry":"🍓","blueberries":"🫐","kiwi_fruit":"🥝","tomato":"🍅","olive":"🫒","coconut":"🥥","avocado":"🥑","eggplant":"🍆","potato":"🥔","carrot":"🥕","corn":"🌽","hot_pepper":"🌶️","bell_pepper":"🫑","cucumber":"🥒","leafy_green":"🥬","broccoli":"🥦","garlic":"🧄","onion":"🧅","peanuts":"🥜","beans":"🫘","chestnut":"🌰","ginger_root":"🫚","pea_pod":"🫛","brown_mushroom":"🍄‍🟫","root_vegetable":"🫜","bread":"🍞","croissant":"🥐","baguette_bread":"🥖","flatbread":"🫓","pretzel":"🥨","bagel":"🥯","pancakes":"🥞","waffle":"🧇","cheese":"🧀","meat_on_bone":"🍖","poultry_leg":"🍗","cut_of_meat":"🥩","bacon":"🥓","hamburger":"🍔","fries":"🍟","pizza":"🍕","hotdog":"🌭","sandwich":"🥪","taco":"🌮","burrito":"🌯","tamale":"🫔","stuffed_flatbread":"🥙","falafel":"🧆","egg":"🥚","fried_egg":"🍳","shallow_pan_of_food":"🥘","stew":"🍲","fondue":"🫕","bowl_with_spoon":"🥣","green_salad":"🥗","popcorn":"🍿","butter":"🧈","salt":"🧂","canned_food":"🥫","bento":"🍱","rice_cracker":"🍘","rice_ball":"🍙","rice":"🍚","curry":"🍛","ramen":"🍜","spaghetti":"🍝","sweet_potato":"🍠","oden":"🍢","sushi":"🍣","fried_shrimp":"🍤","fish_cake":"🍥","moon_cake":"🥮","dango":"🍡","dumpling":"🥟","fortune_cookie":"🥠","takeout_box":"🥡","icecream":"🍦","shaved_ice":"🍧","ice_cream":"🍨","doughnut":"🍩","cookie":"🍪","birthday":"🎂","cake":"🍰","cupcake":"🧁","pie":"🥧","chocolate_bar":"🍫","candy":"🍬","lollipop":"🍭","custard":"🍮","honey_pot":"🍯","baby_bottle":"🍼","milk_glass":"🥛","coffee":"☕","teapot":"🫖","tea":"🍵","sake":"🍶","champagne":"🍾","wine_glass":"🍷","cocktail":"🍸","tropical_drink":"🍹","beer":"🍺","beers":"🍻","clinking_glasses":"🥂","tumbler_glass":"🥃","pouring_liquid":"🫗","cup_with_straw":"🥤","bubble_tea":"🧋","beverage_box":"🧃","mate":"🧉","ice_cube":"🧊","chopsticks":"🥢","plate_with_cutlery":"🍽️","fork_and_knife":"🍴","spoon":"🥄","hocho":"🔪","jar":"🫙","amphora":"🏺","earth_africa":"🌍","earth_americas":"🌎","earth_asia":"🌏","globe_with_meridians":"🌐","world_map":"🗺️","japan":"🗾","compass":"🧭","mountain_snow":"🏔️","mountain":"⛰️","volcano":"🌋","mount_fuji":"🗻","camping":"🏕️","beach_umbrella":"🏖️","desert":"🏜️","desert_island":"🏝️","national_park":"🏞️","stadium":"🏟️","classical_building":"🏛️","building_construction":"🏗️","bricks":"🧱","rock":"🪨","wood":"🪵","hut":"🛖","houses":"🏘️","derelict_house":"🏚️","house":"🏠","house_with_garden":"🏡","office":"🏢","post_office":"🏣","european_post_office":"🏤","hospital":"🏥","bank":"🏦","hotel":"🏨","love_hotel":"🏩","convenience_store":"🏪","school":"🏫","department_store":"🏬","factory":"🏭","japanese_castle":"🏯","european_castle":"🏰","wedding":"💒","tokyo_tower":"🗼","statue_of_liberty":"🗽","church":"⛪","mosque":"🕌","hindu_temple":"🛕","synagogue":"🕍","shinto_shrine":"⛩️","kaaba":"🕋","fountain":"⛲","tent":"⛺","foggy":"🌁","night_with_stars":"🌃","cityscape":"🏙️","sunrise_over_mountains":"🌄","sunrise":"🌅","city_sunset":"🌆","city_sunrise":"🌇","bridge_at_night":"🌉","hotsprings":"♨️","carousel_horse":"🎠","playground_slide":"🛝","ferris_wheel":"🎡","roller_coaster":"🎢","barber":"💈","circus_tent":"🎪","steam_locomotive":"🚂","railway_car":"🚃","bullettrain_side":"🚄","bullettrain_front":"🚅","train2":"🚆","metro":"🚇","light_rail":"🚈","station":"🚉","tram":"🚊","monorail":"🚝","mountain_railway":"🚞","train":"🚋","bus":"🚌","oncoming_bus":"🚍","trolleybus":"🚎","minibus":"🚐","ambulance":"🚑","fire_engine":"🚒","police_car":"🚓","oncoming_police_car":"🚔","taxi":"🚕","oncoming_taxi":"🚖","car":"🚗","oncoming_automobile":"🚘","blue_car":"🚙","pickup_truck":"🛻","truck":"🚚","articulated_lorry":"🚛","tractor":"🚜","racing_car":"🏎️","motorcycle":"🏍️","motor_scooter":"🛵","manual_wheelchair":"🦽","motorized_wheelchair":"🦼","auto_rickshaw":"🛺","bike":"🚲","kick_scooter":"🛴","skateboard":"🛹","roller_skate":"🛼","busstop":"🚏","motorway":"🛣️","railway_track":"🛤️","oil_drum":"🛢️","fuelpump":"⛽","wheel":"🛞","rotating_light":"🚨","traffic_light":"🚥","vertical_traffic_light":"🚦","stop_sign":"🛑","construction":"🚧","anchor":"⚓","ring_buoy":"🛟","boat":"⛵","canoe":"🛶","speedboat":"🚤","passenger_ship":"🛳️","ferry":"⛴️","motor_boat":"🛥️","ship":"🚢","airplane":"✈️","small_airplane":"🛩️","flight_departure":"🛫","flight_arrival":"🛬","parachute":"🪂","seat":"💺","helicopter":"🚁","suspension_railway":"🚟","mountain_cableway":"🚠","aerial_tramway":"🚡","artificial_satellite":"🛰️","rocket":"🚀","flying_saucer":"🛸","bellhop_bell":"🛎️","luggage":"🧳","hourglass":"⌛","hourglass_flowing_sand":"⏳","watch":"⌚","alarm_clock":"⏰","stopwatch":"⏱️","timer_clock":"⏲️","mantelpiece_clock":"🕰️","clock12":"🕛","clock1230":"🕧","clock1":"🕐","clock130":"🕜","clock2":"🕑","clock230":"🕝","clock3":"🕒","clock330":"🕞","clock4":"🕓","clock430":"🕟","clock5":"🕔","clock530":"🕠","clock6":"🕕","clock630":"🕡","clock7":"🕖","clock730":"🕢","clock8":"🕗","clock830":"🕣","clock9":"🕘","clock930":"🕤","clock10":"🕙","clock1030":"🕥","clock11":"🕚","clock1130":"🕦","new_moon":"🌑","waxing_crescent_moon":"🌒","first_quarter_moon":"🌓","moon":"🌔","full_moon":"🌕","waning_gibbous_moon":"🌖","last_quarter_moon":"🌗","waning_crescent_moon":"🌘","crescent_moon":"🌙","new_moon_with_face":"🌚","first_quarter_moon_with_face":"🌛","last_quarter_moon_with_face":"🌜","thermometer":"🌡️","sunny":"☀️","full_moon_with_face":"🌝","sun_with_face":"🌞","ringed_planet":"🪐","star":"⭐","star2":"🌟","stars":"🌠","milky_way":"🌌","cloud":"☁️","partly_sunny":"⛅","cloud_with_lightning_and_rain":"⛈️","sun_behind_small_cloud":"🌤️","sun_behind_large_cloud":"🌥️","sun_behind_rain_cloud":"🌦️","cloud_with_rain":"🌧️","cloud_with_snow":"🌨️","cloud_with_lightning":"🌩️","tornado":"🌪️","fog":"🌫️","wind_face":"🌬️","cyclone":"🌀","rainbow":"🌈","closed_umbrella":"🌂","open_umbrella":"☂️","umbrella":"☔","parasol_on_ground":"⛱️","zap":"⚡","snowflake":"❄️","snowman_with_snow":"☃️","snowman":"⛄","comet":"☄️","fire":"🔥","droplet":"💧","ocean":"🌊","jack_o_lantern":"🎃","christmas_tree":"🎄","fireworks":"🎆","sparkler":"🎇","firecracker":"🧨","sparkles":"✨","balloon":"🎈","tada":"🎉","confetti_ball":"🎊","tanabata_tree":"🎋","bamboo":"🎍","dolls":"🎎","flags":"🎏","wind_chime":"🎐","rice_scene":"🎑","red_envelope":"🧧","ribbon":"🎀","gift":"🎁","reminder_ribbon":"🎗️","tickets":"🎟️","ticket":"🎫","medal_military":"🎖️","trophy":"🏆","medal_sports":"🏅","1st_place_medal":"🥇","2nd_place_medal":"🥈","3rd_place_medal":"🥉","soccer":"⚽","baseball":"⚾","softball":"🥎","basketball":"🏀","volleyball":"🏐","football":"🏈","rugby_football":"🏉","tennis":"🎾","flying_disc":"🥏","bowling":"🎳","cricket_game":"🏏","field_hockey":"🏑","ice_hockey":"🏒","lacrosse":"🥍","ping_pong":"🏓","badminton":"🏸","boxing_glove":"🥊","martial_arts_uniform":"🥋","goal_net":"🥅","golf":"⛳","ice_skate":"⛸️","fishing_pole_and_fish":"🎣","diving_mask":"🤿","running_shirt_with_sash":"🎽","ski":"🎿","sled":"🛷","curling_stone":"🥌","dart":"🎯","yo_yo":"🪀","kite":"🪁","gun":"🔫","8ball":"🎱","crystal_ball":"🔮","magic_wand":"🪄","video_game":"🎮","joystick":"🕹️","slot_machine":"🎰","game_die":"🎲","jigsaw":"🧩","teddy_bear":"🧸","pinata":"🪅","mirror_ball":"🪩","nesting_dolls":"🪆","spades":"♠️","hearts":"♥️","diamonds":"♦️","clubs":"♣️","chess_pawn":"♟️","black_joker":"🃏","mahjong":"🀄","flower_playing_cards":"🎴","performing_arts":"🎭","framed_picture":"🖼️","art":"🎨","thread":"🧵","sewing_needle":"🪡","yarn":"🧶","knot":"🪢","eyeglasses":"👓","dark_sunglasses":"🕶️","goggles":"🥽","lab_coat":"🥼","safety_vest":"🦺","necktie":"👔","shirt":"👕","jeans":"👖","scarf":"🧣","gloves":"🧤","coat":"🧥","socks":"🧦","dress":"👗","kimono":"👘","sari":"🥻","one_piece_swimsuit":"🩱","swim_brief":"🩲","shorts":"🩳","bikini":"👙","womans_clothes":"👚","folding_hand_fan":"🪭","purse":"👛","handbag":"👜","pouch":"👝","shopping":"🛍️","school_satchel":"🎒","thong_sandal":"🩴","mans_shoe":"👞","athletic_shoe":"👟","hiking_boot":"🥾","flat_shoe":"🥿","high_heel":"👠","sandal":"👡","ballet_shoes":"🩰","boot":"👢","hair_pick":"🪮","crown":"👑","womans_hat":"👒","tophat":"🎩","mortar_board":"🎓","billed_cap":"🧢","military_helmet":"🪖","rescue_worker_helmet":"⛑️","prayer_beads":"📿","lipstick":"💄","ring":"💍","gem":"💎","mute":"🔇","speaker":"🔈","sound":"🔉","loud_sound":"🔊","loudspeaker":"📢","mega":"📣","postal_horn":"📯","bell":"🔔","no_bell":"🔕","musical_score":"🎼","musical_note":"🎵","notes":"🎶","studio_microphone":"🎙️","level_slider":"🎚️","control_knobs":"🎛️","microphone":"🎤","headphones":"🎧","radio":"📻","saxophone":"🎷","accordion":"🪗","guitar":"🎸","musical_keyboard":"🎹","trumpet":"🎺","violin":"🎻","banjo":"🪕","drum":"🥁","long_drum":"🪘","maracas":"🪇","flute":"🪈","harp":"🪉","iphone":"📱","calling":"📲","phone":"☎️","telephone_receiver":"📞","pager":"📟","fax":"📠","battery":"🔋","low_battery":"🪫","electric_plug":"🔌","computer":"💻","desktop_computer":"🖥️","printer":"🖨️","keyboard":"⌨️","computer_mouse":"🖱️","trackball":"🖲️","minidisc":"💽","floppy_disk":"💾","cd":"💿","dvd":"📀","abacus":"🧮","movie_camera":"🎥","film_strip":"🎞️","film_projector":"📽️","clapper":"🎬","tv":"📺","camera":"📷","camera_flash":"📸","video_camera":"📹","vhs":"📼","mag":"🔍","mag_right":"🔎","candle":"🕯️","bulb":"💡","flashlight":"🔦","izakaya_lantern":"🏮","diya_lamp":"🪔","notebook_with_decorative_cover":"📔","closed_book":"📕","book":"📖","green_book":"📗","blue_book":"📘","orange_book":"📙","books":"📚","notebook":"📓","ledger":"📒","page_with_curl":"📃","scroll":"📜","page_facing_up":"📄","newspaper":"📰","newspaper_roll":"🗞️","bookmark_tabs":"📑","bookmark":"🔖","label":"🏷️","moneybag":"💰","coin":"🪙","yen":"💴","dollar":"💵","euro":"💶","pound":"💷","money_with_wings":"💸","credit_card":"💳","receipt":"🧾","chart":"💹","envelope":"✉️","email":"📧","incoming_envelope":"📨","envelope_with_arrow":"📩","outbox_tray":"📤","inbox_tray":"📥","package":"📦","mailbox":"📫","mailbox_closed":"📪","mailbox_with_mail":"📬","mailbox_with_no_mail":"📭","postbox":"📮","ballot_box":"🗳️","pencil2":"✏️","black_nib":"✒️","fountain_pen":"🖋️","pen":"🖊️","paintbrush":"🖌️","crayon":"🖍️","memo":"📝","briefcase":"💼","file_folder":"📁","open_file_folder":"📂","card_index_dividers":"🗂️","date":"📅","calendar":"📆","spiral_notepad":"🗒️","spiral_calendar":"🗓️","card_index":"📇","chart_with_upwards_trend":"📈","chart_with_downwards_trend":"📉","bar_chart":"📊","clipboard":"📋","pushpin":"📌","round_pushpin":"📍","paperclip":"📎","paperclips":"🖇️","straight_ruler":"📏","triangular_ruler":"📐","scissors":"✂️","card_file_box":"🗃️","file_cabinet":"🗄️","wastebasket":"🗑️","lock":"🔒","unlock":"🔓","lock_with_ink_pen":"🔏","closed_lock_with_key":"🔐","key":"🔑","old_key":"🗝️","hammer":"🔨","axe":"🪓","pick":"⛏️","hammer_and_pick":"⚒️","hammer_and_wrench":"🛠️","dagger":"🗡️","crossed_swords":"⚔️","bomb":"💣","boomerang":"🪃","bow_and_arrow":"🏹","shield":"🛡️","carpentry_saw":"🪚","wrench":"🔧","screwdriver":"🪛","nut_and_bolt":"🔩","gear":"⚙️","clamp":"🗜️","balance_scale":"⚖️","probing_cane":"🦯","link":"🔗","broken_chain":"⛓️‍💥","chains":"⛓️","hook":"🪝","toolbox":"🧰","magnet":"🧲","ladder":"🪜","shovel":"🪏","alembic":"⚗️","test_tube":"🧪","petri_dish":"🧫","dna":"🧬","microscope":"🔬","telescope":"🔭","satellite":"📡","syringe":"💉","drop_of_blood":"🩸","pill":"💊","adhesive_bandage":"🩹","crutch":"🩼","stethoscope":"🩺","x_ray":"🩻","door":"🚪","elevator":"🛗","mirror":"🪞","window":"🪟","bed":"🛏️","couch_and_lamp":"🛋️","chair":"🪑","toilet":"🚽","plunger":"🪠","shower":"🚿","bathtub":"🛁","mouse_trap":"🪤","razor":"🪒","lotion_bottle":"🧴","safety_pin":"🧷","broom":"🧹","basket":"🧺","roll_of_paper":"🧻","bucket":"🪣","soap":"🧼","bubbles":"🫧","toothbrush":"🪥","sponge":"🧽","fire_extinguisher":"🧯","shopping_cart":"🛒","smoking":"🚬","coffin":"⚰️","headstone":"🪦","funeral_urn":"⚱️","nazar_amulet":"🧿","hamsa":"🪬","moyai":"🗿","placard":"🪧","identification_card":"🪪","atm":"🏧","put_litter_in_its_place":"🚮","potable_water":"🚰","wheelchair":"♿","mens":"🚹","womens":"🚺","restroom":"🚻","baby_symbol":"🚼","wc":"🚾","passport_control":"🛂","customs":"🛃","baggage_claim":"🛄","left_luggage":"🛅","warning":"⚠️","children_crossing":"🚸","no_entry":"⛔","no_entry_sign":"🚫","no_bicycles":"🚳","no_smoking":"🚭","do_not_litter":"🚯","non-potable_water":"🚱","no_pedestrians":"🚷","no_mobile_phones":"📵","underage":"🔞","radioactive":"☢️","biohazard":"☣️","arrow_up":"⬆️","arrow_upper_right":"↗️","arrow_right":"➡️","arrow_lower_right":"↘️","arrow_down":"⬇️","arrow_lower_left":"↙️","arrow_left":"⬅️","arrow_upper_left":"↖️","arrow_up_down":"↕️","left_right_arrow":"↔️","leftwards_arrow_with_hook":"↩️","arrow_right_hook":"↪️","arrow_heading_up":"⤴️","arrow_heading_down":"⤵️","arrows_clockwise":"🔃","arrows_counterclockwise":"🔄","back":"🔙","end":"🔚","on":"🔛","soon":"🔜","top":"🔝","place_of_worship":"🛐","atom_symbol":"⚛️","om":"🕉️","star_of_david":"✡️","wheel_of_dharma":"☸️","yin_yang":"☯️","latin_cross":"✝️","orthodox_cross":"☦️","star_and_crescent":"☪️","peace_symbol":"☮️","menorah":"🕎","six_pointed_star":"🔯","khanda":"🪯","aries":"♈","taurus":"♉","gemini":"♊","cancer":"♋","leo":"♌","virgo":"♍","libra":"♎","scorpius":"♏","sagittarius":"♐","capricorn":"♑","aquarius":"♒","pisces":"♓","ophiuchus":"⛎","twisted_rightwards_arrows":"🔀","repeat":"🔁","repeat_one":"🔂","arrow_forward":"▶️","fast_forward":"⏩","next_track_button":"⏭️","play_or_pause_button":"⏯️","arrow_backward":"◀️","rewind":"⏪","previous_track_button":"⏮️","arrow_up_small":"🔼","arrow_double_up":"⏫","arrow_down_small":"🔽","arrow_double_down":"⏬","pause_button":"⏸️","stop_button":"⏹️","record_button":"⏺️","eject_button":"⏏️","cinema":"🎦","low_brightness":"🔅","high_brightness":"🔆","signal_strength":"📶","wireless":"🛜","vibration_mode":"📳","mobile_phone_off":"📴","female_sign":"♀️","male_sign":"♂️","transgender_symbol":"⚧️","heavy_multiplication_x":"✖️","heavy_plus_sign":"➕","heavy_minus_sign":"➖","heavy_division_sign":"➗","heavy_equals_sign":"🟰","infinity":"♾️","bangbang":"‼️","interrobang":"⁉️","question":"❓","grey_question":"❔","grey_exclamation":"❕","exclamation":"❗","wavy_dash":"〰️","currency_exchange":"💱","heavy_dollar_sign":"💲","medical_symbol":"⚕️","recycle":"♻️","fleur_de_lis":"⚜️","trident":"🔱","name_badge":"📛","beginner":"🔰","o":"⭕","white_check_mark":"✅","ballot_box_with_check":"☑️","heavy_check_mark":"✔️","x":"❌","negative_squared_cross_mark":"❎","curly_loop":"➰","loop":"➿","part_alternation_mark":"〽️","eight_spoked_asterisk":"✳️","eight_pointed_black_star":"✴️","sparkle":"❇️","copyright":"©️","registered":"®️","tm":"™️","splatter":"🫟","capital_abcd":"🔠","abcd":"🔡","1234":"🔢","symbols":"🔣","abc":"🔤","a":"🅰️","ab":"🆎","b":"🅱️","cl":"🆑","cool":"🆒","free":"🆓","information_source":"ℹ️","id":"🆔","m":"Ⓜ️","new":"🆕","ng":"🆖","o2":"🅾️","ok":"🆗","parking":"🅿️","sos":"🆘","up":"🆙","vs":"🆚","koko":"🈁","sa":"🈂️","u6708":"🈷️","u6709":"🈶","u6307":"🈯","ideograph_advantage":"🉐","u5272":"🈹","u7121":"🈚","u7981":"🈲","accept":"🉑","u7533":"🈸","u5408":"🈴","u7a7a":"🈳","congratulations":"㊗️","secret":"㊙️","u55b6":"🈺","u6e80":"🈵","red_circle":"🔴","orange_circle":"🟠","yellow_circle":"🟡","green_circle":"🟢","large_blue_circle":"🔵","purple_circle":"🟣","brown_circle":"🟤","black_circle":"⚫","white_circle":"⚪","red_square":"🟥","orange_square":"🟧","yellow_square":"🟨","green_square":"🟩","blue_square":"🟦","purple_square":"🟪","brown_square":"🟫","black_large_square":"⬛","white_large_square":"⬜","black_medium_square":"◼️","white_medium_square":"◻️","black_medium_small_square":"◾","white_medium_small_square":"◽","black_small_square":"▪️","white_small_square":"▫️","large_orange_diamond":"🔶","large_blue_diamond":"🔷","small_orange_diamond":"🔸","small_blue_diamond":"🔹","small_red_triangle":"🔺","small_red_triangle_down":"🔻","diamond_shape_with_a_dot_inside":"💠","radio_button":"🔘","white_square_button":"🔳","black_square_button":"🔲","checkered_flag":"🏁","triangular_flag_on_post":"🚩","crossed_flags":"🎌","black_flag":"🏴","white_flag":"🏳️","rainbow_flag":"🏳️‍🌈","transgender_flag":"🏳️‍⚧️","pirate_flag":"🏴‍☠️","ascension_island":"🇦🇨","andorra":"🇦🇩","united_arab_emirates":"🇦🇪","afghanistan":"🇦🇫","antigua_barbuda":"🇦🇬","anguilla":"🇦🇮","albania":"🇦🇱","armenia":"🇦🇲","angola":"🇦🇴","antarctica":"🇦🇶","argentina":"🇦🇷","american_samoa":"🇦🇸","austria":"🇦🇹","australia":"🇦🇺","aruba":"🇦🇼","aland_islands":"🇦🇽","azerbaijan":"🇦🇿","bosnia_herzegovina":"🇧🇦","barbados":"🇧🇧","bangladesh":"🇧🇩","belgium":"🇧🇪","burkina_faso":"🇧🇫","bulgaria":"🇧🇬","bahrain":"🇧🇭","burundi":"🇧🇮","benin":"🇧🇯","st_barthelemy":"🇧🇱","bermuda":"🇧🇲","brunei":"🇧🇳","bolivia":"🇧🇴","caribbean_netherlands":"🇧🇶","brazil":"🇧🇷","bahamas":"🇧🇸","bhutan":"🇧🇹","bouvet_island":"🇧🇻","botswana":"🇧🇼","belarus":"🇧🇾","belize":"🇧🇿","canada":"🇨🇦","cocos_islands":"🇨🇨","congo_kinshasa":"🇨🇩","central_african_republic":"🇨🇫","congo_brazzaville":"🇨🇬","switzerland":"🇨🇭","cote_divoire":"🇨🇮","cook_islands":"🇨🇰","chile":"🇨🇱","cameroon":"🇨🇲","cn":"🇨🇳","colombia":"🇨🇴","clipperton_island":"🇨🇵","flag_sark":"🇨🇶","costa_rica":"🇨🇷","cuba":"🇨🇺","cape_verde":"🇨🇻","curacao":"🇨🇼","christmas_island":"🇨🇽","cyprus":"🇨🇾","czech_republic":"🇨🇿","de":"🇩🇪","diego_garcia":"🇩🇬","djibouti":"🇩🇯","denmark":"🇩🇰","dominica":"🇩🇲","dominican_republic":"🇩🇴","algeria":"🇩🇿","ceuta_melilla":"🇪🇦","ecuador":"🇪🇨","estonia":"🇪🇪","egypt":"🇪🇬","western_sahara":"🇪🇭","eritrea":"🇪🇷","es":"🇪🇸","ethiopia":"🇪🇹","eu":"🇪🇺","finland":"🇫🇮","fiji":"🇫🇯","falkland_islands":"🇫🇰","micronesia":"🇫🇲","faroe_islands":"🇫🇴","fr":"🇫🇷","gabon":"🇬🇦","gb":"🇬🇧","grenada":"🇬🇩","georgia":"🇬🇪","french_guiana":"🇬🇫","guernsey":"🇬🇬","ghana":"🇬🇭","gibraltar":"🇬🇮","greenland":"🇬🇱","gambia":"🇬🇲","guinea":"🇬🇳","guadeloupe":"🇬🇵","equatorial_guinea":"🇬🇶","greece":"🇬🇷","south_georgia_south_sandwich_islands":"🇬🇸","guatemala":"🇬🇹","guam":"🇬🇺","guinea_bissau":"🇬🇼","guyana":"🇬🇾","hong_kong":"🇭🇰","heard_mcdonald_islands":"🇭🇲","honduras":"🇭🇳","croatia":"🇭🇷","haiti":"🇭🇹","hungary":"🇭🇺","canary_islands":"🇮🇨","indonesia":"🇮🇩","ireland":"🇮🇪","israel":"🇮🇱","isle_of_man":"🇮🇲","india":"🇮🇳","british_indian_ocean_territory":"🇮🇴","iraq":"🇮🇶","iran":"🇮🇷","iceland":"🇮🇸","it":"🇮🇹","jersey":"🇯🇪","jamaica":"🇯🇲","jordan":"🇯🇴","jp":"🇯🇵","kenya":"🇰🇪","kyrgyzstan":"🇰🇬","cambodia":"🇰🇭","kiribati":"🇰🇮","comoros":"🇰🇲","st_kitts_nevis":"🇰🇳","north_korea":"🇰🇵","kr":"🇰🇷","kuwait":"🇰🇼","cayman_islands":"🇰🇾","kazakhstan":"🇰🇿","laos":"🇱🇦","lebanon":"🇱🇧","st_lucia":"🇱🇨","liechtenstein":"🇱🇮","sri_lanka":"🇱🇰","liberia":"🇱🇷","lesotho":"🇱🇸","lithuania":"🇱🇹","luxembourg":"🇱🇺","latvia":"🇱🇻","libya":"🇱🇾","morocco":"🇲🇦","monaco":"🇲🇨","moldova":"🇲🇩","montenegro":"🇲🇪","st_martin":"🇲🇫","madagascar":"🇲🇬","marshall_islands":"🇲🇭","macedonia":"🇲🇰","mali":"🇲🇱","myanmar":"🇲🇲","mongolia":"🇲🇳","macau":"🇲🇴","northern_mariana_islands":"🇲🇵","martinique":"🇲🇶","mauritania":"🇲🇷","montserrat":"🇲🇸","malta":"🇲🇹","mauritius":"🇲🇺","maldives":"🇲🇻","malawi":"🇲🇼","mexico":"🇲🇽","malaysia":"🇲🇾","mozambique":"🇲🇿","namibia":"🇳🇦","new_caledonia":"🇳🇨","niger":"🇳🇪","norfolk_island":"🇳🇫","nigeria":"🇳🇬","nicaragua":"🇳🇮","netherlands":"🇳🇱","norway":"🇳🇴","nepal":"🇳🇵","nauru":"🇳🇷","niue":"🇳🇺","new_zealand":"🇳🇿","oman":"🇴🇲","panama":"🇵🇦","peru":"🇵🇪","french_polynesia":"🇵🇫","papua_new_guinea":"🇵🇬","philippines":"🇵🇭","pakistan":"🇵🇰","poland":"🇵🇱","st_pierre_miquelon":"🇵🇲","pitcairn_islands":"🇵🇳","puerto_rico":"🇵🇷","palestinian_territories":"🇵🇸","portugal":"🇵🇹","palau":"🇵🇼","paraguay":"🇵🇾","qatar":"🇶🇦","reunion":"🇷🇪","romania":"🇷🇴","serbia":"🇷🇸","ru":"🇷🇺","rwanda":"🇷🇼","saudi_arabia":"🇸🇦","solomon_islands":"🇸🇧","seychelles":"🇸🇨","sudan":"🇸🇩","sweden":"🇸🇪","singapore":"🇸🇬","st_helena":"🇸🇭","slovenia":"🇸🇮","svalbard_jan_mayen":"🇸🇯","slovakia":"🇸🇰","sierra_leone":"🇸🇱","san_marino":"🇸🇲","senegal":"🇸🇳","somalia":"🇸🇴","suriname":"🇸🇷","south_sudan":"🇸🇸","sao_tome_principe":"🇸🇹","el_salvador":"🇸🇻","sint_maarten":"🇸🇽","syria":"🇸🇾","swaziland":"🇸🇿","tristan_da_cunha":"🇹🇦","turks_caicos_islands":"🇹🇨","chad":"🇹🇩","french_southern_territories":"🇹🇫","togo":"🇹🇬","thailand":"🇹🇭","tajikistan":"🇹🇯","tokelau":"🇹🇰","timor_leste":"🇹🇱","turkmenistan":"🇹🇲","tunisia":"🇹🇳","tonga":"🇹🇴","tr":"🇹🇷","trinidad_tobago":"🇹🇹","tuvalu":"🇹🇻","taiwan":"🇹🇼","tanzania":"🇹🇿","ukraine":"🇺🇦","uganda":"🇺🇬","us_outlying_islands":"🇺🇲","united_nations":"🇺🇳","us":"🇺🇸","uruguay":"🇺🇾","uzbekistan":"🇺🇿","vatican_city":"🇻🇦","st_vincent_grenadines":"🇻🇨","venezuela":"🇻🇪","british_virgin_islands":"🇻🇬","us_virgin_islands":"🇻🇮","vietnam":"🇻🇳","vanuatu":"🇻🇺","wallis_futuna":"🇼🇫","samoa":"🇼🇸","kosovo":"🇽🇰","yemen":"🇾🇪","mayotte":"🇾🇹","south_africa":"🇿🇦","zambia":"🇿🇲","zimbabwe":"🇿🇼","england":"🏴󠁧󠁢󠁥󠁮󠁧󠁿","scotland":"🏴󠁧󠁢󠁳󠁣󠁴󠁿","wales":"🏴󠁧󠁢󠁷󠁬󠁳󠁿"};

    /**
     * These are all the transformations that form block-level
     * tags like paragraphs, headers, and list items.
     */
    showdown.subParser("makehtml.blockGamut", function (text, options, globals) {
        "use strict";

        text = globals.converter._dispatch("makehtml.blockGamut.before", text, options, globals).getText();

        // we parse blockquotes first so that we can have headings and hrs
        // inside blockquotes
        text = showdown.subParser("makehtml.blockQuotes")(text, options, globals);
        text = showdown.subParser("makehtml.headers")(text, options, globals);

        // Do Horizontal Rules:
        text = showdown.subParser("makehtml.horizontalRule")(text, options, globals);

        text = showdown.subParser("makehtml.lists")(text, options, globals);
        text = showdown.subParser("makehtml.codeBlocks")(text, options, globals);
        text = showdown.subParser("makehtml.tables")(text, options, globals);

        // We already ran _HashHTMLBlocks() before, in Markdown(), but that
        // was to escape raw HTML in the original Markdown source. This time,
        // we're escaping the markup we've just created, so that we don't wrap
        // <p> tags around block-level tags.
        text = showdown.subParser("makehtml.hashHTMLBlocks")(text, options, globals);
        text = showdown.subParser("makehtml.paragraphs")(text, options, globals);

        text = globals.converter._dispatch("makehtml.blockGamut.after", text, options, globals).getText();

        return text;
    });

    showdown.subParser("makehtml.blockQuotes", function (text, options, globals) {
        "use strict";

        text = globals.converter._dispatch("makehtml.blockQuotes.before", text, options, globals).getText();
        text = text + "\n\n";

        let rgx = /(^ {0,3}>[ \t]?.+\n(.+\n)*\n*)+/gm;
        if (options.splitAdjacentBlockquotes) {
            rgx = /^ {0,3}>[\s\S]*?(?:\n\n)/gm;
        }

        const badgeMap = {
            "[!NOTE]":       { class: "quote-blue", label: "Note", icon: "article" },
            "[!TIP]":        { class: "quote-green", label: "Tip", icon: "lightbulb" },
            "[!IMPORTANT]":  { class: "quote-purple", label: "Important", icon: "priority_high" },
            "[!WARNING]":    { class: "quote-yellow", label: "Warning", icon: "warning" },
            "[!CAUTION]":    { class: "quote-red", label: "Caution", icon: "dangerous" }
        };

        // Custom block types for blockquotes, e.g. [!DETAILS], [!EMBED], [!CSV], [!FLOWCHART]
        const customBlockMap = {
            "DETAILS": {
            allowHtml: false,
            render: function (title, contentHtml) {
                return `<details><summary title="Click to expand"><span>${title}</span></summary>\n` +
                `<div class="content">\n${contentHtml}\n</div>\n</details>`;
            }
            },
            "EMBED": {
            allowHtml: true,
            render: function (title, contentText) {
                // Each non-empty line is treated as an embed URL
                const urls = contentText
                .split(/\r?\n/)
                .map(line => line.trim())
                .filter(line => line.length > 0);

                const iframes = urls.map(url => {
                const safeUrl = url.replace(/"/g, "&quot;");
                return `<iframe 
                    src="${safeUrl}" 
                    sandbox="allow-same-origin allow-forms allow-popups allow-scripts" 
                    allowfullscreen>    
                    </iframe>`;
                }).join("\n");

                return `<div class="embed-container">\n${iframes}\n</div>`;
            }
            },
            "CSV": {
            allowHtml: true,
            render: function (sep, contentText) {
                // CSV block: sep is the separator, contentText is the CSV data
                let separator = ",";
                let data = contentText;

                if (sep.length === 1 || sep.length === 0) {
                separator = sep || ",";
                }

                const lines = data.split(/\r?\n/).filter(line => line.trim() !== "");
                if (lines.length === 0) return "";

                const rows = lines.map(line => line.split(separator).map(cell => cell.trim()));

                let tbody = "";
                for (let i = 0; i < rows.length; i++) {
                tbody += "<tr>" + rows[i].map(cell => `<td>${cell}</td>`).join("") + "</tr>\n";
                }

                return `<div class="csv-table-container">\n<table class="csv-table">\n<tbody>\n${tbody}</tbody>\n</table>\n</div>`;
            }
            },
            "FLOWCHART": {
                allowHtml: true,
                render: function (title, contentText) {
                    // FLOWCHART block: parses a simple flowchart DSL and renders SVG
                    let direction = "LR";
                    let actualTitle = title;
                    // Extract direction from title if present
                    if (title) {
                        // [!FLOWCHART:lr] or [!FLOWCHART:tb]
                        const dirMatch = title.match(/^\s*([a-z]{2})\s*$/i);
                        if (dirMatch) {
                            direction = dirMatch[1].toUpperCase();
                            actualTitle = "";
                        } else {
                            // [!FLOWCHART:lr]
                            const colonDir = title.match(/^(.*?):\s*([a-z]{2})\s*$/i);
                            if (colonDir) {
                                actualTitle = colonDir[1].trim();
                                direction = colonDir[2].toUpperCase();
                            }
                        }
                    }
                    // Map to valid values
                    const dirMap = {
                        TB: "TB", TD: "TB", // Top to bottom
                        LR: "LR",           // Left to right
                    };
                    direction = dirMap[direction] || "LR";

                    // Normalize lines
                    const lines = contentText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

                    const outlineColor = 'var(--text-color   , #000)';
                    const outlineRed = 'var(--quote-red      , #000)';
                    const bgRed = 'var(--quote-red-bg        , #e74c3c)';
                    const outlineGreen = 'var(--quote-green  , #000)';
                    const bgGreen = 'var(--quote-green-bg    , #2ecc71)';
                    const outlineYellow = 'var(--quote-yellow, #000)';
                    const bgYellow = 'var(--quote-yellow-bg  , #f1c40f)';
                    const textColor = 'var(--title-color     , #000)';

                    const nodes = {}; // id -> { id, label, shape }
                    const edges = []; // { from, to, label }

                    // Regex for nodes and edges
                    const nodeDefPar = /^([\w-]+)\((.+)\)$/;  // ellipse (start/end)
                    const nodeDefDia = /^([\w-]+)\{(.+)\}$/;  // diamond (decision)
                    const nodeDefRec = /^([\w-]+)\[(.+)\]$/;  // rectangle (process)
                    const edgeRegex = /^([\w-]+)(?:\(([^)]+)\))?\s*->\s*([\w-]+)(?:\(([^)]+)\))?$/;

                    // First pass: capture nodes and edges
                    lines.forEach(line => {
                        let m;
                        if (m = line.match(nodeDefPar)) {
                            nodes[m[1]] = { id: m[1], label: m[2], shape: "ellipse" };
                            return;
                        }
                        if (m = line.match(nodeDefDia)) {
                            nodes[m[1]] = { id: m[1], label: m[2], shape: "diamond" };
                            return;
                        }
                        if (m = line.match(nodeDefRec)) {
                            nodes[m[1]] = { id: m[1], label: m[2], shape: "rect" };
                            return;
                        }
                        if (m = line.match(edgeRegex)) {
                            const from = m[1], label = (m[2] || "").trim(), to = m[3];
                            const tailLabel = (m[4] || "").trim();
                            edges.push({ from, to, label: label || tailLabel || "" });
                            if (!nodes[from]) nodes[from] = { id: from, label: from, shape: "rect" };
                            if (!nodes[to]) nodes[to] = { id: to, label: to, shape: "rect" };
                            return;
                        }
                        // If not matched, create automatic node
                        const autoId = "n" + Math.random().toString(36).slice(2, 8);
                        nodes[autoId] = { id: autoId, label: line, shape: "rect" };
                    });

                    // Layout: define layers
                    const adj = {};
                    const indeg = {};
                    Object.keys(nodes).forEach(id => { adj[id] = []; indeg[id] = 0; });
                    edges.forEach(e => {
                        if (adj[e.from]) adj[e.from].push(e.to);
                        if (indeg[e.to] !== undefined) indeg[e.to] += 1;
                        else indeg[e.to] = 1;
                    });

                    // Kahn-like for layers
                    const layers = {};
                    const queue = [];
                    Object.keys(indeg).forEach(id => { if ((indeg[id] || 0) === 0) queue.push(id); });
                    queue.forEach(id => layers[id] = 0);
                    const visited = new Set();
                    while (queue.length) {
                        const u = queue.shift();
                        visited.add(u);
                        const baseLayer = layers[u] || 0;
                        adj[u].forEach(v => {
                            const newLayer = baseLayer + 1;
                            if (layers[v] === undefined || newLayer > layers[v]) layers[v] = newLayer;
                            indeg[v] -= 1;
                            if (indeg[v] === 0) queue.push(v);
                        });
                    }
                    Object.keys(nodes).forEach(id => {
                        if (layers[id] === undefined) {
                            let best = 0;
                            Object.keys(nodes).forEach(p => {
                                if (adj[p].includes(id) && layers[p] !== undefined) best = Math.max(best, layers[p] + 1);
                            });
                            layers[id] = best;
                        }
                    });

                    // Group by layer
                    const byLayer = {};
                    Object.entries(layers).forEach(([id, layer]) => {
                        byLayer[layer] = byLayer[layer] || [];
                        byLayer[layer].push(id);
                    });

                    // Size and spacing parameters
                    const nodeW = 140, nodeH = 54, spacingX = 220, spacingY = 120, margin = 40;
                    const layerIndices = Object.keys(byLayer).map(n => parseInt(n, 10)).sort((a, b) => a - b);
                    const positions = {};

                    // Compute SVG dimensions
                    const maxLayer = Math.max(...layerIndices);
                    const maxInLayer = Math.max(...layerIndices.map(i => byLayer[i].length));
                    let width, height;

                    // Orientation
                    let isVertical = direction === "TB" || direction === "TD" || direction === "BT";
                    let isReverse = direction === "RL" || direction === "BT";

                    // Position nodes according to direction
                    layerIndices.forEach((layerIdx, li) => {
                        const col = byLayer[layerIdx];
                        const colCount = col.length;
                        if (isVertical) {
                            const colWidth = (colCount - 1) * spacingX + nodeW;
                            const startX = margin + (Math.max(maxInLayer * spacingX + nodeW, colWidth) - colWidth) / 2;
                            col.forEach((id, idx) => {
                                let x = startX + idx * spacingX;
                                let y = margin + li * spacingY;
                                positions[id] = { x, y, w: nodeW, h: nodeH };
                            });
                        } else {
                            const colHeight = (colCount - 1) * spacingY + nodeH;
                            const startY = margin + (Math.max(maxInLayer * spacingY + nodeH, colHeight) - colHeight) / 2;
                            col.forEach((id, idx) => {
                                let x = margin + li * spacingX;
                                let y = startY + idx * spacingY;
                                positions[id] = { x, y, w: nodeW, h: nodeH };
                            });
                        }
                    });

                    // Reverse if RL or BT
                    if (isReverse) {
                        const maxX = Math.max(...Object.values(positions).map(p => p.x));
                        const maxY = Math.max(...Object.values(positions).map(p => p.y));
                        Object.values(positions).forEach(pos => {
                            if (direction === "RL") pos.x = maxX - pos.x;
                            if (direction === "BT") pos.y = maxY - pos.y;
                        });
                    }

                    // Escape HTML and break long lines
                    function esc(s) {
                        s = (s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
                        if (s.length > 15) {
                            s = s.replace(/(.{15,}?)(\s|$)/g, "$1\n");
                        }
                        return s;
                    }

                    // Arrow marker definition
                    const defs = `
                <defs>
                <marker id="arrow-flow" viewBox="0 0 10 10" refX="10" refY="5"
                markerWidth="10" markerHeight="10" orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="${outlineColor}"></path>
                </marker>
                </defs>`;

                    // Draw edges
                    const edgeSvgs = edges.map(e => {
                        const p0 = positions[e.from];
                        const p1 = positions[e.to];
                        if (!p0 || !p1) return "";
                        const x1 = p0.x + p0.w;
                        const y1 = p0.y + p0.h / 2;
                        const x2 = p1.x;
                        const y2 = p1.y + p1.h / 2;
                        const dx = Math.max(40, Math.abs(x2 - x1) / 2);
                        // Adjust for vertical orientation
                        let path, labelSvg;
                        if (isVertical) {
                            // vertical: y changes more than x
                            const yStart = p0.y + p0.h;
                            const yEnd = p1.y;
                            const cx = p0.x + p0.w / 2;
                            const cy = p1.x + p1.w / 2;
                            const dy = Math.max(40, Math.abs(yEnd - yStart) / 2);
                            path = `M ${cx} ${yStart} C ${cx} ${yStart + dy} ${cy} ${yEnd - dy} ${cy} ${yEnd}`;
                            labelSvg = e.label ? `<text class="edge-label" x="${(cx + cy) / 2}" y="${(yStart + yEnd) / 2 - 8}" font-size="12" text-anchor="middle">${esc(e.label)}</text>` : "";
                        } else {
                            // horizontal default
                            path = `M ${x1} ${y1} C ${x1 + dx} ${y1} ${x2 - dx} ${y2} ${x2} ${y2}`;
                            labelSvg = e.label ? `<text class="edge-label" x="${(x1 + x2) / 2}" y="${(y1 + y2) / 2 - 8}" font-size="12" text-anchor="middle">${esc(e.label)}</text>` : "";
                        }
                        return `<g class="edge">
                <path d="${path}" fill="none" stroke="${outlineColor}" stroke-width="1" marker-end="url(#arrow-flow)"></path>
                ${labelSvg}
                </g>`;
                    }).join("\n");

                    // Draw nodes
                    const nodeSvgs = Object.values(nodes).map(n => {
                        const pos = positions[n.id];
                        const x = pos.x;
                        const y = pos.y;
                        const cx = x + pos.w / 2;
                        const cy = y + pos.h / 2;
                        const label = esc(n.label);
                        const labelLines = label.split("\n");
                        const labelSvg = labelLines.map((line, i) =>
                            `<tspan x="${cx}" y="${cy + 5 + i * 16}">${line}</tspan>`
                        ).join("");
                        if (n.shape === "ellipse") {
                            return `<g class="node" data-id="${n.id}">
                <ellipse cx="${cx}" cy="${cy}" rx="${pos.w / 2}" ry="${pos.h / 2}" fill="${bgRed}" stroke="${outlineRed}"/>
                <text x="${cx}" y="${cy + 5}" font-size="13" text-anchor="middle">${labelSvg}</text>
                </g>`;
                        } else if (n.shape === "diamond") {
                            const rx = pos.w / 2;
                            const ry = pos.h / 2;
                            const points = [
                                `${cx},${cy - ry}`,
                                `${cx + rx},${cy}`,
                                `${cx},${cy + ry}`,
                                `${cx - rx},${cy}`
                            ].join(" ");
                            return `<g class="node" data-id="${n.id}">
                <polygon points="${points}" fill="${bgGreen}" stroke="${outlineGreen}"/>
                <text x="${cx}" y="${cy + 5}" font-size="13" text-anchor="middle">${labelSvg}</text>
                </g>`;
                        } else {
                            return `<g class="node" data-id="${n.id}">
                <rect x="${x}" y="${y}" width="${pos.w}" height="${pos.h}" rx="15" fill="${bgYellow}" stroke="${outlineYellow}"/>
                <text x="${cx}" y="${cy + 5}" font-size="13" text-anchor="middle">${labelSvg}</text>
                </g>`;
                        }
                    }).join("\n");

                    // Compute minimal SVG dimensions
                    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
                    Object.values(positions).forEach(pos => {
                        minX = Math.min(minX, pos.x);
                        minY = Math.min(minY, pos.y);
                        maxX = Math.max(maxX, pos.x + pos.w);
                        maxY = Math.max(maxY, pos.y + pos.h);
                    });
                    // Also consider edges (curves may go outside node bounds)
                    // For simplicity, add extra margin
                    const extraMargin = 30;
                    minX -= extraMargin;
                    minY -= extraMargin;
                    maxX += extraMargin;
                    maxY += extraMargin;

                    // Adjust to avoid negative values
                    if (minX < 0) { maxX += -minX; minX = 0; }
                    if (minY < 0) { maxY += -minY; minY = 0; }

                    const svgWidth = Math.ceil(maxX - minX);
                    const svgHeight = Math.ceil(maxY - minY);

                    // Final SVG
                    const svg = `
                <div class="flowchart" style="overflow:auto;">
                ${actualTitle ? `<div class="flowchart-title">${actualTitle}</div>` : ""}
                <svg width="${svgWidth}" height="${svgHeight}" viewBox="${minX} ${minY} ${svgWidth} ${svgHeight}" xmlns="http://www.w3.org/2000/svg">
                ${defs}
                <g class="edges">${edgeSvgs}</g>
                <g class="nodes">${nodeSvgs}</g>
                </svg>
                </div>
                <style>
                .flowchart svg { background: transparent; }
                .edge-label { fill: ${textColor}; font-family: sans-serif; }
                .node text { font-family: sans-serif; fill: ${textColor}; }
                .flowchart-title { font-weight: bold; font-size: 1.1em; margin-bottom: 0.5em; }
                </style>
                `;
                    return svg;
                }
            },
            "GRAPH": {
    allowHtml: true,
    render: function (title, contentText) {
        // [!GRAPH:bars] (bars, default)
        // [!GRAPH:pie]  (pie chart)
        // [!GRAPH:line] (multi-line chart)

        let type = "pie";
        let actualTitle = title;
        if (title) {
            const typeMatch = title.match(/^\s*(bars|pie|pizza|line)\s*$/i);
            if (typeMatch) {
                type = typeMatch[1].toLowerCase() === "pizza" ? "pie" : typeMatch[1].toLowerCase();
                actualTitle = "";
            } else {
                const colonType = title.match(/^(.*?):\s*(bars|pie|pizza|line)\s*$/i);
                if (colonType) {
                    actualTitle = colonType[1].trim();
                    type = colonType[2].toLowerCase() === "pizza" ? "pie" : colonType[2].toLowerCase();
                }
            }
        }

        const lines = contentText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

        const textColor = "var(--title-color, #000)";
        const borderColor = "var(--border-light-color, #ccc"

        const colors = [
            "var(--quote-blue  , #3498db)",
            "var(--quote-purple, #9b59b6)",
            "var(--quote-red   , #e74c3c)",
            "var(--quote-yellow, #f1c40f)",
            "var(--quote-green , #2ecc71)"
        ];

        const colorsBg = [
            "var(--quote-blue-bg  , transparent)",
            "var(--quote-purple-bg, transparent)",
            "var(--quote-red-bg   , transparent)",
            "var(--quote-yellow-bg, transparent)",
            "var(--quote-green-bg , transparent)"
        ];

        // SVG parameters
        const width = 640, height = 320, margin = 40;
        let svg = "";

        if (type === "bars") {
            // === BAR CHART ===
            // Parse lines: label,value
            let hasPercent = false;
            const data = lines.map(line => {
                const m = line.match(/^(.+?)[,;:\t ]+([0-9.]+)\s*(%)?$/);
                if (m) {
                    if (m[3] === "%") hasPercent = true;
                    return { label: m[1], value: parseFloat(m[2]) };
                }
                return null;
            }).filter(Boolean);
            if (data.length === 0) return "";

            const barCount = data.length;
            const maxValue = Math.max(...data.map(d => d.value));
            const barThickness = Math.floor((width - 2 * margin) / barCount * 0.6);

            svg += `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`;

            data.forEach((d, i) => {
                const color = colors[i % colors.length];
                const colorBg = colorsBg[i % colorsBg.length];
                const x = margin + i * ((width - 2 * margin) / barCount);
                const barH = Math.max(2, (d.value / maxValue) * (height - 2 * margin));
                const y = height - margin - barH;
                svg += `<rect x="${x}" y="${y}" width="${barThickness}" height="${barH}" fill="${colorBg}" stroke="${color}" stroke-width="1" />`;
                svg += `<text x="${x + barThickness / 2}" y="${height - margin + 16}" font-size="13" text-anchor="middle" fill="${textColor}">${d.label}</text>`;
                svg += `<text x="${x + barThickness / 2}" y="${y - 6}" font-size="12" text-anchor="middle" fill="${textColor}">${d.value}${hasPercent ? "%" : ""}</text>`;
            });

            svg += `</svg>`;

        } else if (type === "pie") {
            // === PIE CHART ===
            let hasPercent = false;
            const data = lines.map(line => {
                const m = line.match(/^(.+?)[,;:\t ]+([0-9.]+)\s*(%)?$/);
                if (m) {
                    if (m[3] === "%") hasPercent = true;
                    return { label: m[1], value: parseFloat(m[2]) };
                }
                return null;
            }).filter(Boolean);
            if (data.length === 0) return "";

            const cx = width / 2, cy = height / 2, r = Math.min(width, height) / 2 - margin;
            const total = data.reduce((sum, d) => sum + d.value, 0);
            let angle = 0;
            svg += `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`;

            data.forEach((d, i) => {
                const color = colors[i % colors.length];
                const colorBg = colorsBg[i % colorsBg.length];
                const sliceAngle = (d.value / total) * 2 * Math.PI;
                const x1 = cx + r * Math.cos(angle);
                const y1 = cy + r * Math.sin(angle);
                angle += sliceAngle;
                const x2 = cx + r * Math.cos(angle);
                const y2 = cy + r * Math.sin(angle);
                const largeArc = sliceAngle > Math.PI ? 1 : 0;
                const path = [
                    `M ${cx} ${cy}`,
                    `L ${x1} ${y1}`,
                    `A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`,
                    "Z"
                ].join(" ");
                svg += `<path d="${path}" fill="${colorBg}" stroke="${color}" stroke-width="1"/>`;
            });

            // Labels
            angle = 0;
            data.forEach((d, i) => {
                const sliceAngle = (d.value / total) * 2 * Math.PI;
                const midAngle = angle + sliceAngle / 2;
                const lx = cx + (r * 0.6) * Math.cos(midAngle);
                const ly = cy + (r * 0.6) * Math.sin(midAngle);
                svg += `<text x="${lx}" y="${ly}" font-size="13" text-anchor="middle" fill="${textColor}">${d.label} (${d.value}${hasPercent ? "%" : ""})</text>`;
                angle += sliceAngle;
            });

            svg += `</svg>`;

        } else if (type === "line") {
            // === LINE CHART ===
            if (lines.length < 2) return "";
            const seriesNames = lines[0].split(/[,;|\t]+/).map(s => s.trim()).filter(Boolean);
            const seriesCount = seriesNames.length;

            const rows = lines.slice(1).map(l =>
                l.split(/[,;|\t]+/).map(v => v.trim()).filter(Boolean).map(Number)
            ).filter(r => r.length === seriesCount);

            if (rows.length === 0) return "";

            const points = rows.map((values, i) => ({
                x: i + 1,
                values
            }));

            const xMin = 1;
            const xMax = points.length;
            const yMin = 0;
            const yMax = Math.max(...points.flatMap(p => p.values));

            function scaleX(x) {
                return margin + ((x - xMin) / (xMax - xMin)) * (width - 2 * margin);
            }
            function scaleY(y) {
                return height - margin - ((y - yMin) / (yMax - yMin)) * (height - 2 * margin);
            }

            svg += `<svg width="100%" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`;

            // Horizontal rules
            for (let i = 0; i <= 5; i++) {
                const yVal = yMin + (i / 5) * (yMax - yMin);
                const y = scaleY(yVal);
                if (yVal != 0) svg += `<line x1="${margin}" y1="${y}" x2="${width - margin}" y2="${y}" stroke="${borderColor}"/>`;
                svg += `<text x="${margin - 5}" y="${y + 4}" font-size="12" text-anchor="end" fill="${textColor}">${yVal}</text>`;
            }

            // Axys
            svg += `<line x1="${margin}" y1="${height - margin}" x2="${width - margin}" y2="${height - margin}" stroke="${textColor}" />`;
            svg += `<line x1="${margin}" y1="${margin}" x2="${margin}" y2="${height - margin}" stroke="${textColor}" />`;

            // Lines
            seriesNames.forEach((s, si) => {
                const color = colors[si % colors.length];
                let path = "";
                points.forEach((p, pi) => {
                    const x = scaleX(p.x);
                    const y = scaleY(p.values[si]);
                    path += (pi === 0 ? "M" : "L") + x + " " + y + " ";
                });
                svg += `<path d="${path}" fill="none" stroke="${color}" stroke-width="2"/>`;

                points.forEach((p) => {
                    const x = scaleX(p.x);
                    const y = scaleY(p.values[si]);
                    svg += `<circle cx="${x}" cy="${y}" r="3" fill="${color}"/>`;
                });

                svg += `<text x="${width - margin + 10}" y="${margin + si * 16}" font-size="12" fill="${color}">● ${s}</text>`;
            });

            svg += `</svg>`;
        }

        return `<div class="graph-block" style="overflow:auto;">
            ${actualTitle ? `<div class="graph-title" style="color:${textColor}">${actualTitle}</div>` : ""}
            ${svg}
            </div>
            <style>
            .graph-title { font-weight:bold; font-size:1.1em; margin-bottom:0.5em; }
            </style>
            `;
    }
}

        };

        text = text.replace(rgx, function (bq) {
            let lines = bq.split("\n").map((line) => line.replace(/^ {0,3}>[ \t]?/, ""));
            let firstLine = lines[0].trim();

            const customBlockRegex = /^\[\!(\w+)(?::(.*?))?\]$/i;
            const matchCustom = firstLine.match(customBlockRegex);
            if (matchCustom) {
                const blockType = matchCustom[1].toUpperCase();
                const blockTitle = (matchCustom[2] || "").trim();

                if (customBlockMap[blockType]) {
                    lines.shift();
                    let content = lines.join("\n").replace(/¨0/g, "").replace(/^[ \t]+$/gm, "");

                    const block = customBlockMap[blockType];

                    if (!block.allowHtml) {
                        content = showdown.subParser("makehtml.githubCodeBlocks")(content, options, globals);
                        content = showdown.subParser("makehtml.blockGamut")(content, options, globals);
                    }

                    const html = block.render(blockTitle, content);
                    return showdown.subParser("makehtml.hashBlock")(html, options, globals);
                }
            }

            const labelIdRegex = /^\[\!(.+?)\](?:\((.+?)\))?$/;
            let match = firstLine.match(labelIdRegex);

            let badgeClass = null;
            let badgeLabel = null;
            let blockId = null;

            if (match) {
                let label = match[1];
                blockId = match[2] || null;
                const badgeKey = `[!${label.toUpperCase()}]`;

                if (badgeMap[badgeKey]) {
                    let badge = badgeMap[badgeKey];
                    badgeClass = badge.class;
                    badgeLabel = `<label class='${badgeClass}-label quote-label'><span class='icon' translate='no'>${badge.icon}</span>${badge.label}</label>\n`;
                } else {
                    badgeClass = "quote-generic";
                    badgeLabel = `<label class='${badgeClass}-label quote-label'>${label}</label>\n`;
                }

                lines.shift();
            }

            bq = lines.join("\n").replace(/¨0/g, "").replace(/^[ \t]+$/gm, "");
            bq = showdown.subParser("makehtml.githubCodeBlocks")(bq, options, globals);
            bq = showdown.subParser("makehtml.blockGamut")(bq, options, globals);

            bq = bq.replace(/(^|\n)/g, "$1  ");
            bq = bq.replace(/(\s*<pre>[^\r]+?<\/pre>)/gm, function (wholeMatch, m1) {
                return m1.replace(/^  /gm, "¨0").replace(/¨0/g, "");
            });

            let blockquoteTag = "<blockquote";
            if (badgeClass) blockquoteTag += ` class="${badgeClass}"`;
            if (blockId) blockquoteTag += ` id="${blockId}"`;
            blockquoteTag += ">\n";

            if (badgeLabel) blockquoteTag += badgeLabel;
            blockquoteTag += bq + "\n</blockquote>";

            return showdown.subParser("makehtml.hashBlock")(blockquoteTag, options, globals);
        });

        text = globals.converter._dispatch("makehtml.blockQuotes.after", text, options, globals).getText();
        return text;
    });


    /**
     * Process Markdown `<pre><code>` blocks.
     */
    showdown.subParser("makehtml.codeBlocks", function (text, options, globals) {
        "use strict";

        text = globals.converter._dispatch("makehtml.codeBlocks.before", text, options, globals).getText();

        // sentinel workarounds for lack of \A and \Z, safari\khtml bug
        text += "¨0";

        var pattern = /(?:\n\n|^)((?:(?:[ ]{4}|\t).*\n+)+)(\n*[ ]{0,3}[^ \t\n]|(?=¨0))/g;
        text = text.replace(pattern, function (wholeMatch, m1, m2) {
            var codeblock = m1,
                nextChar = m2,
                end = "\n";

            codeblock = showdown.subParser("makehtml.outdent")(codeblock, options, globals);
            codeblock = showdown.subParser("makehtml.encodeCode")(codeblock, options, globals);
            codeblock = showdown.subParser("makehtml.detab")(codeblock, options, globals);
            codeblock = codeblock.replace(/^\n+/g, ""); // trim leading newlines
            codeblock = codeblock.replace(/\n+$/g, ""); // trim trailing newlines

            if (options.omitExtraWLInCodeBlocks) {
                end = "";
            }

            let codeHead = `
                <div class="code-container">
                    <div class="code-head">
                        <div>
                            <button class="icon-button" title="Copy" onclick="navigator.clipboard.writeText(this.closest('.code-container').querySelector('code').innerText); showToast('Copied to the clipboard', 'content_copy')">content_copy</button>
                        </div>
                    </div>
                    <pre><code>${codeblock + end}</code></pre>
                </div>
            `;

            return showdown.subParser("makehtml.hashBlock")(codeHead, options, globals) + nextChar;
        });

        // strip sentinel
        text = text.replace(/¨0/, "");

        text = globals.converter._dispatch("makehtml.codeBlocks.after", text, options, globals).getText();
        return text;
    });

    /**
     *
     *   *  Backtick quotes are used for <code></code> spans.
     *
     *   *  You can use multiple backticks as the delimiters if you want to
     *     include literal backticks in the code span. So, this input:
     *
     *         Just type ``foo `bar` baz`` at the prompt.
     *
     *       Will translate to:
     *
     *         <p>Just type <code>foo `bar` baz</code> at the prompt.</p>
     *
     *    There's no arbitrary limit to the number of backticks you
     *    can use as delimters. If you need three consecutive backticks
     *    in your code, use four for delimiters, etc.
     *
     *  *  You can use spaces to get literal backticks at the edges:
     *
     *         ... type `` `bar` `` ...
     *
     *       Turns to:
     *
     *         ... type <code>`bar`</code> ...
     */
    showdown.subParser("makehtml.codeSpans", function (text, options, globals) {
        "use strict";

        text = globals.converter._dispatch("makehtml.codeSpans.before", text, options, globals).getText();

        if (typeof text === "undefined") {
            text = "";
        }
        text = text.replace(/(^|[^\\])(`+)([^\r]*?[^`])\2(?!`)/gm, function (wholeMatch, m1, m2, m3) {
            var c = m3;
            c = c.replace(/^([ \t]*)/g, ""); // leading whitespace
            c = c.replace(/[ \t]*$/g, ""); // trailing whitespace
            c = showdown.subParser("makehtml.encodeCode")(c, options, globals);

            // detects color: #hex, rgb(), hsv()
            var colorMatch = c.match(/^#([0-9a-f]{3,8})$/i) ||
                            c.match(/^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/i) ||
                            c.match(/^hsv\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/i);

            if (colorMatch) {
                c = m1 + '<span class="colorSwatch" data-color="' + c + '" style="background-color:' + c + ';"></span><code>' + c + '</code>';
            } else {
                c = m1 + "<code>" + c + "</code>";
            }
            c = showdown.subParser("makehtml.hashHTMLSpans")(c, options, globals);
            return c;
        });

        text = globals.converter._dispatch("makehtml.codeSpans.after", text, options, globals).getText();
        return text;
    });

    /**
     * Create a full HTML document from the processed markdown
     */
    showdown.subParser("makehtml.completeHTMLDocument", function (text, options, globals) {
        "use strict";

        if (!options.completeHTMLDocument) {
            return text;
        }

        text = globals.converter._dispatch("makehtml.completeHTMLDocument.before", text, options, globals).getText();

        var doctype = "html",
            doctypeParsed = "<!DOCTYPE HTML>\n",
            title = "",
            charset = '<meta charset="utf-8">\n',
            lang = "",
            metadata = "";

        if (typeof globals.metadata.parsed.doctype !== "undefined") {
            doctypeParsed = "<!DOCTYPE " + globals.metadata.parsed.doctype + ">\n";
            doctype = globals.metadata.parsed.doctype.toString().toLowerCase();
            if (doctype === "html" || doctype === "html5") {
                charset = '<meta charset="utf-8">';
            }
        }

        for (var meta in globals.metadata.parsed) {
            if (globals.metadata.parsed.hasOwnProperty(meta)) {
                switch (meta.toLowerCase()) {
                    case "doctype":
                        break;

                    case "title":
                        title = "<title>" + globals.metadata.parsed.title + "</title>\n";
                        break;

                    case "charset":
                        if (doctype === "html" || doctype === "html5") {
                            charset = '<meta charset="' + globals.metadata.parsed.charset + '">\n';
                        } else {
                            charset = '<meta name="charset" content="' + globals.metadata.parsed.charset + '">\n';
                        }
                        break;

                    case "language":
                    case "lang":
                        lang = ' lang="' + globals.metadata.parsed[meta] + '"';
                        metadata += '<meta name="' + meta + '" content="' + globals.metadata.parsed[meta] + '">\n';
                        break;

                    default:
                        metadata += '<meta name="' + meta + '" content="' + globals.metadata.parsed[meta] + '">\n';
                }
            }
        }

        text = doctypeParsed + "<html" + lang + ">\n<head>\n" + title + charset + metadata + "</head>\n<body>\n" + text.trim() + "\n</body>\n</html>";

        text = globals.converter._dispatch("makehtml.completeHTMLDocument.after", text, options, globals).getText();
        return text;
    });

    /**
     * Convert all tabs to spaces
     */
    showdown.subParser("makehtml.detab", function (text, options, globals) {
        "use strict";
        text = globals.converter._dispatch("makehtml.detab.before", text, options, globals).getText();

        // expand first n-1 tabs
        text = text.replace(/\t(?=\t)/g, "    "); // g_tab_width

        // replace the nth with two sentinels
        text = text.replace(/\t/g, "¨A¨B");

        // use the sentinel to anchor our regex so it doesn't explode
        text = text.replace(/¨B(.+?)¨A/g, function (wholeMatch, m1) {
            var leadingText = m1,
                numSpaces = 4 - (leadingText.length % 4); // g_tab_width

            // there *must* be a better way to do this:
            for (var i = 0; i < numSpaces; i++) {
                leadingText += " ";
            }

            return leadingText;
        });

        // clean up sentinels
        text = text.replace(/¨A/g, "    "); // g_tab_width
        text = text.replace(/¨B/g, "");

        text = globals.converter._dispatch("makehtml.detab.after", text, options, globals).getText();
        return text;
    });

    showdown.subParser("makehtml.ellipsis", function (text, options, globals) {
        "use strict";

        if (!options.ellipsis) {
            return text;
        }

        text = globals.converter._dispatch("makehtml.ellipsis.before", text, options, globals).getText();

        text = text.replace(/\.\.\./g, "…");

        text = globals.converter._dispatch("makehtml.ellipsis.after", text, options, globals).getText();

        return text;
    });

    showdown.subParser("makehtml.dash", function (text, options, globals) {
        "use strict";

        if (!options.dash) {
            return text;
        }

        text = globals.converter._dispatch("makehtml.dash.before", text, options, globals).getText();

        text = text.replace(/--/g, "—");

        text = globals.converter._dispatch("makehtml.dash.after", text, options, globals).getText();

        return text;
    });

    /**
     * Turn emoji codes into emojis
     *
     * List of supported emojis: https://github.com/showdownjs/showdown/wiki/Emojis
     */
    showdown.subParser("makehtml.emoji", function (text, options, globals) {
        "use strict";

        if (!options.emoji) {
            return text;
        }

        text = globals.converter._dispatch("makehtml.emoji.before", text, options, globals).getText();

        var emojiRgx = /:([\S]+?):/g;

        text = text.replace(emojiRgx, function (wm, emojiCode) {
            if (showdown.helper.emojis.hasOwnProperty(emojiCode)) {
                return showdown.helper.emojis[emojiCode];
            }
            return wm;
        });

        text = globals.converter._dispatch("makehtml.emoji.after", text, options, globals).getText();

        return text;
    });

    /**
     * Smart processing for ampersands and angle brackets that need to be encoded.
     */
    showdown.subParser("makehtml.encodeAmpsAndAngles", function (text, options, globals) {
        "use strict";
        text = globals.converter._dispatch("makehtml.encodeAmpsAndAngles.before", text, options, globals).getText();

        // Ampersand-encoding based entirely on Nat Irons's Amputator MT plugin:
        // http://bumppo.net/projects/amputator/
        text = text.replace(/&(?!#?[xX]?(?:[0-9a-fA-F]+|\w+);)/g, "&amp;");

        // Encode naked <'s
        text = text.replace(/<(?![a-z\/?$!])/gi, "&lt;");

        // Encode <
        text = text.replace(/</g, "&lt;");

        // Encode >
        text = text.replace(/>/g, "&gt;");

        text = globals.converter._dispatch("makehtml.encodeAmpsAndAngles.after", text, options, globals).getText();
        return text;
    });

    /**
     * Returns the string, with after processing the following backslash escape sequences.
     *
     * attacklab: The polite way to do this is with the new escapeCharacters() function:
     *
     *    text = escapeCharacters(text,"\\",true);
     *    text = escapeCharacters(text,"`*_{}[]()>#+-.!",true);
     *
     * ...but we're sidestepping its use of the (slow) RegExp constructor
     * as an optimization for Firefox.  This function gets called a LOT.
     */
    showdown.subParser("makehtml.encodeBackslashEscapes", function (text, options, globals) {
        "use strict";
        text = globals.converter._dispatch("makehtml.encodeBackslashEscapes.before", text, options, globals).getText();

        text = text.replace(/\\(\\)/g, showdown.helper.escapeCharactersCallback);
        text = text.replace(/\\([`*_{}\[\]()>#+.!~=|:-])/g, showdown.helper.escapeCharactersCallback);

        text = globals.converter._dispatch("makehtml.encodeBackslashEscapes.after", text, options, globals).getText();
        return text;
    });

    /**
     * Encode/escape certain characters inside Markdown code runs.
     * The point is that in code, these characters are literals,
     * and lose their special Markdown meanings.
     */
    showdown.subParser("makehtml.encodeCode", function (text, options, globals) {
        "use strict";

        text = globals.converter._dispatch("makehtml.encodeCode.before", text, options, globals).getText();

        // Encode all ampersands; HTML entities are not
        // entities within a Markdown code span.
        text = text
            .replace(/&/g, "&amp;")
            // Do the angle bracket song and dance:
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            // Now, escape characters that are magic in Markdown:
            .replace(/([*_{}\[\]\\=~-])/g, showdown.helper.escapeCharactersCallback);

        text = globals.converter._dispatch("makehtml.encodeCode.after", text, options, globals).getText();
        return text;
    });

    /**
     * Within tags -- meaning between < and > -- encode [\ ` * _ ~ =] so they
     * don't conflict with their use in Markdown for code, italics and strong.
     */
    showdown.subParser("makehtml.escapeSpecialCharsWithinTagAttributes", function (text, options, globals) {
        "use strict";
        text = globals.converter._dispatch("makehtml.escapeSpecialCharsWithinTagAttributes.before", text, options, globals).getText();

        // Build a regex to find HTML tags.
        var tags = /<\/?[a-z\d_:-]+(?:[\s]+[\s\S]+?)?>/gi,
            comments = /<!(--(?:(?:[^>-]|-[^>])(?:[^-]|-[^-])*)--)>/gi;

        text = text.replace(tags, function (wholeMatch) {
            return wholeMatch.replace(/(.)<\/?code>(?=.)/g, "$1`").replace(/([\\`*_~=|])/g, showdown.helper.escapeCharactersCallback);
        });

        text = text.replace(comments, function (wholeMatch) {
            return wholeMatch.replace(/([\\`*_~=|])/g, showdown.helper.escapeCharactersCallback);
        });

        text = globals.converter._dispatch("makehtml.escapeSpecialCharsWithinTagAttributes.after", text, options, globals).getText();
        return text;
    });

    /**
     * Handle github codeblocks prior to running HashHTML so that
     * HTML contained within the codeblock gets escaped properly
     * Example:
     * ```ruby
     *     def hello_world(x)
     *       puts "Hello, #{x}"
     *     end
     * ```
     */
    showdown.subParser("makehtml.githubCodeBlocks", function (text, options, globals) {
        "use strict";

        if (!options.ghCodeBlocks) return text;

        text = globals.converter._dispatch("makehtml.githubCodeBlocks.before", text, options, globals).getText();
        text += "¨0";

        const languageHandlers = {
            js: `<button class="icon-button" title="Run JS" onclick="try{eval(this.closest('.code-container').querySelector('code').innerText)}catch(e){showToast(e,'error')}">step_over</button>`,
            javascript: `<button class="icon-button" title="Run JS" onclick="try{eval(this.closest('.code-container').querySelector('code').innerText)}catch(e){showToast(e,'error')}">step_over</button>`,

            html: `<button class="icon-button" title="Show HTML" onclick="(function(el){
                const iframe=document.createElement('iframe');
                iframe.setAttribute('sandbox','allow-scripts');
                iframe.setAttribute('style','width:100%;height:100%;border:none;background:white;border-radius:5px;');
                iframe.srcdoc=el.innerText;
                const wrapper=document.createElement('div');
                wrapper.setAttribute('style','width:100%;height:100%;');
                wrapper.appendChild(iframe);
                promptMessage(wrapper.outerHTML,true,true);
            })(this.closest('.code-container').querySelector('code'))">step_over</button>`,

            csv: `<button class="icon-button" title="Show table" onclick="(function(el){
                const raw = el.innerText.trim();
                let sep = ',';
                const lines = raw.split(/\\r?\\n/);
                if (/^sep=./i.test(lines[0])) {
                    sep = lines[0].charAt(4);
                    lines.shift();
                }
                const rows = lines.map(line => line.split(sep));
                let html = '<table style=\\'width:100%;border-collapse:collapse;text-align:left;\\'><thead><tr>';
                html += rows[0].map(c=>'<th style=\\'border:1px solid var(--border-light-color);padding:6px;\\'>'+c+'</th>').join('');
                html += '</tr></thead><tbody>';
                for(let i=1;i<rows.length;i++){
                    html += '<tr>' + rows[i].map(c=>'<td style=\\'border:1px solid var(--border-light-color);padding:6px;\\'>'+c+'</td>').join('') + '</tr>';
                }
                html += '</tbody></table>';
                promptMessage(html, true, false);
            })(this.closest('.code-container').querySelector('code'))">step_over</button>`
        };

        text = text.replace(/(?:^|\n) {0,3}(```+|~~~+) *([^\n\t`~]*)\n([\s\S]*?)\n {0,3}\1/g,
            function (wholeMatch, delim, language, codeblock) {
                var end = options.omitExtraWLInCodeBlocks ? "" : "\n";

                language = language.trim().split(" ")[0].toLowerCase();

                codeblock = showdown.subParser("makehtml.encodeCode")(codeblock, options, globals);
                codeblock = showdown.subParser("makehtml.detab")(codeblock, options, globals);
                codeblock = codeblock.replace(/^\n+/g, ""); // trim leading newlines
                codeblock = codeblock.replace(/\n+$/g, ""); // trim trailing whitespace

                const runButton = languageHandlers[language] ?? "";

                codeblock = `
                    <div class="code-container">
                        <div class="code-head">
                            <div style="display:flex;gap:5px">
                                ${runButton}
                                <button class="icon-button" title="Copy" onclick="navigator.clipboard.writeText(this.closest('.code-container').querySelector('code').innerText); showToast('Copied to the clipboard', 'content_copy')">content_copy</button>
                            </div>
                        </div>
                        <pre class='ghcodeblock'><code${language ? ' class="' + language + " language-" + language + '"' : ""}>${codeblock + end}</code></pre>
                    </div>
                `;

                codeblock = showdown.subParser("makehtml.hashBlock")(codeblock, options, globals);
                return "\n\n¨G" + (globals.ghCodeBlocks.push({ text: wholeMatch, codeblock: codeblock }) - 1) + "G\n\n";
            });

        text = text.replace(/¨0/, "");
        return globals.converter._dispatch("makehtml.githubCodeBlocks.after", text, options, globals).getText();
    });

    showdown.subParser("makehtml.hashBlock", function (text, options, globals) {
        "use strict";
        text = globals.converter._dispatch("makehtml.hashBlock.before", text, options, globals).getText();
        text = text.replace(/(^\n+|\n+$)/g, "");
        text = "\n\n¨K" + (globals.gHtmlBlocks.push(text) - 1) + "K\n\n";
        text = globals.converter._dispatch("makehtml.hashBlock.after", text, options, globals).getText();
        return text;
    });

    /**
     * Hash and escape <code> elements that should not be parsed as markdown
     */
    showdown.subParser("makehtml.hashCodeTags", function (text, options, globals) {
        "use strict";
        text = globals.converter._dispatch("makehtml.hashCodeTags.before", text, options, globals).getText();

        var repFunc = function (wholeMatch, match, left, right) {
            var codeblock = left + showdown.subParser("makehtml.encodeCode")(match, options, globals) + right;
            return "¨C" + (globals.gHtmlSpans.push(codeblock) - 1) + "C";
        };

        // Hash naked <code>
        text = showdown.helper.replaceRecursiveRegExp(text, repFunc, "<code\\b[^>]*>", "</code>", "gim");

        text = globals.converter._dispatch("makehtml.hashCodeTags.after", text, options, globals).getText();
        return text;
    });

    showdown.subParser("makehtml.hashElement", function (text, options, globals) {
        "use strict";

        return function (wholeMatch, m1) {
            var blockText = m1;

            // Undo double lines
            blockText = blockText.replace(/\n\n/g, "\n");
            blockText = blockText.replace(/^\n/, "");

            // strip trailing blank lines
            blockText = blockText.replace(/\n+$/g, "");

            // Replace the element text with a marker ("¨KxK" where x is its key)
            blockText = "\n\n¨K" + (globals.gHtmlBlocks.push(blockText) - 1) + "K\n\n";

            return blockText;
        };
    });

    showdown.subParser("makehtml.hashHTMLBlocks", function (text, options, globals) {
        "use strict";
        text = globals.converter._dispatch("makehtml.hashHTMLBlocks.before", text, options, globals).getText();

        var blockTags = ["pre", "div", "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "table", "dl", "ol", "ul", "script", "noscript", "form", "fieldset", "iframe", "math", "style", "section", "header", "footer", "nav", "article", "aside", "address", "audio", "canvas", "figure", "hgroup", "output", "video", "details", "p"],
            repFunc = function (wholeMatch, match, left, right) {
                var txt = wholeMatch;
                // check if this html element is marked as markdown
                // if so, it's contents should be parsed as markdown
                if (left.search(/\bmarkdown\b/) !== -1) {
                    txt = left + globals.converter.makeHtml(match) + right;
                }
                return "\n\n¨K" + (globals.gHtmlBlocks.push(txt) - 1) + "K\n\n";
            };

        if (options.backslashEscapesHTMLTags) {
            // encode backslash escaped HTML tags
            text = text.replace(/\\<(\/?[^>]+?)>/g, function (wm, inside) {
                return "&lt;" + inside + "&gt;";
            });
        }

        // hash HTML Blocks
        for (var i = 0; i < blockTags.length; ++i) {
            var opTagPos,
                rgx1 = new RegExp("^ {0,3}(<" + blockTags[i] + "\\b[^>]*>)", "im"),
                patLeft = "<" + blockTags[i] + "\\b[^>]*>",
                patRight = "</" + blockTags[i] + ">";
            // 1. Look for the first position of the first opening HTML tag in the text
            while ((opTagPos = showdown.helper.regexIndexOf(text, rgx1)) !== -1) {
                // if the HTML tag is \ escaped, we need to escape it and break

                //2. Split the text in that position
                var subTexts = showdown.helper.splitAtIndex(text, opTagPos),
                    //3. Match recursively
                    newSubText1 = showdown.helper.replaceRecursiveRegExp(subTexts[1], repFunc, patLeft, patRight, "im");

                // prevent an infinite loop
                if (newSubText1 === subTexts[1]) {
                    break;
                }
                text = subTexts[0].concat(newSubText1);
            }
        }
        // HR SPECIAL CASE
        text = text.replace(/(\n {0,3}(<(hr)\b([^<>])*?\/?>)[ \t]*(?=\n{2,}))/g, showdown.subParser("makehtml.hashElement")(text, options, globals));

        // Special case for standalone HTML comments
        text = showdown.helper.replaceRecursiveRegExp(
            text,
            function (txt) {
                return "\n\n¨K" + (globals.gHtmlBlocks.push(txt) - 1) + "K\n\n";
            },
            "^ {0,3}<!--",
            "-->",
            "gm"
        );

        // PHP and ASP-style processor instructions (<?...?> and <%...%>)
        text = text.replace(/\n\n( {0,3}<([?%])[^\r]*?\2>[ \t]*(?=\n{2,}))/g, showdown.subParser("makehtml.hashElement")(text, options, globals));

        text = globals.converter._dispatch("makehtml.hashHTMLBlocks.after", text, options, globals).getText();
        return text;
    });

    /**
     * Hash span elements that should not be parsed as markdown
     */
    showdown.subParser("makehtml.hashHTMLSpans", function (text, options, globals) {
        "use strict";
        text = globals.converter._dispatch("makehtml.hashHTMLSpans.before", text, options, globals).getText();

        // Hash Self Closing tags
        text = text.replace(/<[^>]+?\/>/gi, function (wm) {
            return showdown.helper._hashHTMLSpan(wm, globals);
        });

        // Hash tags without properties
        text = text.replace(/<([^>]+?)>[\s\S]*?<\/\1>/g, function (wm) {
            return showdown.helper._hashHTMLSpan(wm, globals);
        });

        // Hash tags with properties
        text = text.replace(/<([^>]+?)\s[^>]+?>[\s\S]*?<\/\1>/g, function (wm) {
            return showdown.helper._hashHTMLSpan(wm, globals);
        });

        // Hash self closing tags without />
        text = text.replace(/<[^>]+?>/gi, function (wm) {
            return showdown.helper._hashHTMLSpan(wm, globals);
        });

        text = globals.converter._dispatch("makehtml.hashHTMLSpans.after", text, options, globals).getText();
        return text;
    });

    /**
     * Unhash HTML spans
     */
    showdown.subParser("makehtml.unhashHTMLSpans", function (text, options, globals) {
        "use strict";
        text = globals.converter._dispatch("makehtml.unhashHTMLSpans.before", text, options, globals).getText();

        for (var i = 0; i < globals.gHtmlSpans.length; ++i) {
            var repText = globals.gHtmlSpans[i],
                // limiter to prevent infinite loop (assume 10 as limit for recurse)
                limit = 0;

            while (/¨C(\d+)C/.test(repText)) {
                var num = RegExp.$1;
                repText = repText.replace("¨C" + num + "C", globals.gHtmlSpans[num]);
                if (limit === 10) {
                    console.error("maximum nesting of 10 spans reached!!!");
                    break;
                }
                ++limit;
            }
            text = text.replace("¨C" + i + "C", repText);
        }

        text = globals.converter._dispatch("makehtml.unhashHTMLSpans.after", text, options, globals).getText();
        return text;
    });

    /**
     * Hash and escape <pre><code> elements that should not be parsed as markdown
     */
    showdown.subParser("makehtml.hashPreCodeTags", function (text, options, globals) {
        "use strict";
        text = globals.converter._dispatch("makehtml.hashPreCodeTags.before", text, options, globals).getText();

        var repFunc = function (wholeMatch, match, left, right) {
            // encode html entities
            var codeblock = left + showdown.subParser("makehtml.encodeCode")(match, options, globals) + right;
            return "\n\n¨G" + (globals.ghCodeBlocks.push({ text: wholeMatch, codeblock: codeblock }) - 1) + "G\n\n";
        };

        // Hash <pre><code>
        text = showdown.helper.replaceRecursiveRegExp(text, repFunc, "^ {0,3}<pre\\b[^>]*>\\s*<code\\b[^>]*>", "^ {0,3}</code>\\s*</pre>", "gim");

        text = globals.converter._dispatch("makehtml.hashPreCodeTags.after", text, options, globals).getText();
        return text;
    });

    showdown.subParser("makehtml.headers", function (text, options, globals) {
        "use strict";

        text = globals.converter._dispatch("makehtml.headers.before", text, options, globals).getText();

        var headerLevelStart = isNaN(parseInt(options.headerLevelStart)) ? 1 : parseInt(options.headerLevelStart),
            // Set text-style headers:
            //	Header 1
            //	========
            //
            //	Header 2
            //	--------
            //
            setextRegexH1 = options.smoothLivePreview ? /^(.+)[ \t]*\n={2,}[ \t]*\n+/gm : /^(.+)[ \t]*\n=+[ \t]*\n+/gm,
            setextRegexH2 = options.smoothLivePreview ? /^(.+)[ \t]*\n-{2,}[ \t]*\n+/gm : /^(.+)[ \t]*\n-+[ \t]*\n+/gm;

        text = text.replace(setextRegexH1, function (wholeMatch, m1) {
            var spanGamut = showdown.subParser("makehtml.spanGamut")(m1, options, globals),
                hID = options.noHeaderId ? "" : ' id="' + headerId(m1) + '"',
                hLevel = headerLevelStart,
                hashBlock = "<h" + hLevel + hID + ">" + spanGamut + "</h" + hLevel + ">";
            return showdown.subParser("makehtml.hashBlock")(hashBlock, options, globals);
        });

        text = text.replace(setextRegexH2, function (matchFound, m1) {
            var spanGamut = showdown.subParser("makehtml.spanGamut")(m1, options, globals),
                hID = options.noHeaderId ? "" : ' id="' + headerId(m1) + '"',
                hLevel = headerLevelStart + 1,
                hashBlock = "<h" + hLevel + hID + ">" + spanGamut + "</h" + hLevel + ">";
            return showdown.subParser("makehtml.hashBlock")(hashBlock, options, globals);
        });

        // -# small line support
        text = text.replace(/^-# (.*)$/gm, function (wholeMatch, content) {
            var span = showdown.subParser("makehtml.spanGamut")(content, options, globals);
            return '<span class="small">' + span + '</span>';
        });

        // atx-style headers:
        //  # Header 1
        //  ## Header 2
        //  ## Header 2 with closing hashes ##
        //  ...
        //  ###### Header 6
        //
        var atxStyle = options.requireSpaceBeforeHeadingText ? /^(#{1,6})[ \t]+(.+?)[ \t]*#*\n+/gm : /^(#{1,6})[ \t]*(.+?)[ \t]*#*\n+/gm;

        text = text.replace(atxStyle, function (wholeMatch, m1, m2) {
            var hText = m2;
            if (options.customizedHeaderId) {
                hText = m2.replace(/\s?{([^{]+?)}\s*$/, "");
            }

            var span = showdown.subParser("makehtml.spanGamut")(hText, options, globals),
                hID = options.noHeaderId ? "" : ' id="' + headerId(m2) + '"',
                hLevel = headerLevelStart - 1 + m1.length,
                header = "<h" + hLevel + hID + ">" + span + "</h" + hLevel + ">";

            return showdown.subParser("makehtml.hashBlock")(header, options, globals);
        });

        function headerId(m) {
            var title, prefix;

            // It is separate from other options to allow combining prefix and customized
            if (options.customizedHeaderId) {
                var match = m.match(/{([^{]+?)}\s*$/);
                if (match && match[1]) {
                    m = match[1];
                }
            }

            title = m;

            // Prefix id to prevent causing inadvertent pre-existing style matches.
            if (showdown.helper.isString(options.prefixHeaderId)) {
                prefix = options.prefixHeaderId;
            } else if (options.prefixHeaderId === true) {
                prefix = "section-";
            } else {
                prefix = "";
            }

            if (!options.rawPrefixHeaderId) {
                title = prefix + title;
            }

            if (options.ghCompatibleHeaderId) {
                title = title
                    .replace(/ /g, "-")
                    // replace previously escaped chars (&, ¨ and $)
                    .replace(/&amp;/g, "")
                    .replace(/¨T/g, "")
                    .replace(/¨D/g, "")
                    // replace rest of the chars (&~$ are repeated as they might have been escaped)
                    // borrowed from github's redcarpet (some they should produce similar results)
                    .replace(/[&+$,\/:;=?@"#{}|^¨~\[\]`\\*)(%.!'<>]/g, "")
                    .toLowerCase();
            } else if (options.rawHeaderId) {
                title = title
                    .replace(/ /g, "-")
                    // replace previously escaped chars (&, ¨ and $)
                    .replace(/&amp;/g, "&")
                    .replace(/¨T/g, "¨")
                    .replace(/¨D/g, "$")
                    // replace " and '
                    .replace(/["']/g, "-")
                    .toLowerCase();
            } else {
                title = title.replace(/[^\w]/g, "").toLowerCase();
            }

            if (options.rawPrefixHeaderId) {
                title = prefix + title;
            }

            if (globals.hashLinkCounts[title]) {
                title = title + "-" + globals.hashLinkCounts[title]++;
            } else {
                globals.hashLinkCounts[title] = 1;
            }
            return title;
        }

        text = globals.converter._dispatch("makehtml.headers.after", text, options, globals).getText();
        return text;
    });

    /**
     * Turn Markdown horizontal rule shortcuts into <hr /> tags.
     *
     * Any 3 or more unindented consecutive hyphens, asterisks or underscores with or without a space beetween them
     * in a single line is considered a horizontal rule
     */
    showdown.subParser("makehtml.horizontalRule", function (text, options, globals) {
        "use strict";
        text = globals.converter._dispatch("makehtml.horizontalRule.before", text, options, globals).getText();

        var key = showdown.subParser("makehtml.hashBlock")("<hr />", options, globals);
        text = text.replace(/^ {0,2}( ?-){3,}[ \t]*$/gm, key);
        text = text.replace(/^ {0,2}( ?\*){3,}[ \t]*$/gm, key);
        text = text.replace(/^ {0,2}( ?_){3,}[ \t]*$/gm, key);

        text = globals.converter._dispatch("makehtml.horizontalRule.after", text, options, globals).getText();
        return text;
    });

    /**
     * Turn Markdown image shortcuts into <img> tags.
     */
    showdown.subParser("makehtml.images", function (text, options, globals) {
        "use strict";

        text = globals.converter._dispatch("makehtml.images.before", text, options, globals).getText();

        var inlineRegExp = /!\[([^\]]*?)][ \t]*()\([ \t]?<?([\S]+?(?:\([\S]*?\)[\S]*?)?)>?(?: =([*\d]+[A-Za-z%]{0,4})x([*\d]+[A-Za-z%]{0,4}))?[ \t]*(?:(["'])([^"]*?)\6)?[ \t]?\)/g,
            crazyRegExp = /!\[([^\]]*?)][ \t]*()\([ \t]?<([^>]*)>(?: =([*\d]+[A-Za-z%]{0,4})x([*\d]+[A-Za-z%]{0,4}))?[ \t]*(?:(?:(["'])([^"]*?)\6))?[ \t]?\)/g,
            base64RegExp = /!\[([^\]]*?)][ \t]*()\([ \t]?<?(data:.+?\/.+?;base64,[A-Za-z0-9+/=\n]+?)>?(?: =([*\d]+[A-Za-z%]{0,4})x([*\d]+[A-Za-z%]{0,4}))?[ \t]*(?:(["'])([^"]*?)\6)?[ \t]?\)/g,
            referenceRegExp = /!\[([^\]]*?)] ?(?:\n *)?\[([\s\S]*?)]()()()()()/g,
            refShortcutRegExp = /!\[([^\[\]]+)]()()()()()/g;

        function writeMediaTag(wholeMatch, altText, linkId, url, width, height, m5, title) {
            var gUrls = globals.gUrls,
                gTitles = globals.gTitles,
                gDims = globals.gDimensions;

            linkId = linkId.toLowerCase();
            if (!title) title = "";

            if (wholeMatch.search(/\(<?\s*>? ?(['"].*['"])?\)$/m) > -1) {
                url = "";
            } else if (!url) {
                if (!linkId) linkId = altText.toLowerCase().replace(/ ?\n/g, " ");
                url = "#" + linkId;
                if (!showdown.helper.isUndefined(gUrls[linkId])) {
                    url = gUrls[linkId];
                    if (!showdown.helper.isUndefined(gTitles[linkId])) {
                        title = gTitles[linkId];
                    }
                    if (!showdown.helper.isUndefined(gDims[linkId])) {
                        width = gDims[linkId].width;
                        height = gDims[linkId].height;
                    }
                } else {
                    return wholeMatch;
                }
            }

            altText = altText.replace(/"/g, "&quot;").replace(showdown.helper.regexes.asteriskDashTildeAndColon, showdown.helper.escapeCharactersCallback);
            url = url.replace(showdown.helper.regexes.asteriskDashTildeAndColon, showdown.helper.escapeCharactersCallback);

            var extension = url.split(".").pop().toLowerCase();

            var supportedAudio = ["mp3", "wav", "ogg"];
            var supportedVideo = ["mp4", "webm"];

            var mediaTag = "";
            if (supportedAudio.includes(extension)) {
                mediaTag = '<audio controls src="' + url + '"></audio>';
            } else if (supportedVideo.includes(extension)) {
                mediaTag = '<video controls src="' + url + '"';
                if (width && height) {
                    width = width === "*" ? "auto" : width;
                    height = height === "*" ? "auto" : height;
                    mediaTag += ' width="' + width + '" height="' + height + '"';
                }
                mediaTag += "></video>";
            } else {
                // default: image
                let imgTag = '<img src="' + url + '" alt="' + altText + '"';
                if (title && showdown.helper.isString(title)) {
                    title = title.replace(/"/g, "&quot;").replace(showdown.helper.regexes.asteriskDashTildeAndColon, showdown.helper.escapeCharactersCallback);
                    imgTag += ' title="' + title + '"';
                }
                if (width && height) {
                    width = width === "*" ? "auto" : width;
                    height = height === "*" ? "auto" : height;
                    imgTag += ' width="' + width + '" height="' + height + '"';
                }
                imgTag += " />";
                mediaTag = imgTag;
            }

            return '<div class="media-container">' + mediaTag + "<div><span class='alt'>" + altText + " </span><span class='url'>&lt;" + url + "&gt;</span></div></div>";
        }

        function writeMediaTagBase64(wholeMatch, altText, linkId, url, width, height, m5, title) {
            url = url.replace(/\s/g, "");
            return writeMediaTag(wholeMatch, altText, linkId, url, width, height, m5, title);
        }

        function writeMediaTagBaseUrl(wholeMatch, altText, linkId, url, width, height, m5, title) {
            url = showdown.helper.applyBaseUrl(options.relativePathBaseUrl, url);
            return writeMediaTag(wholeMatch, altText, linkId, url, width, height, m5, title);
        }

        // First, handle reference-style labeled media: ![alt text][id]
        text = text.replace(referenceRegExp, writeMediaTag);

        // base64 encoded
        text = text.replace(base64RegExp, writeMediaTagBase64);

        // crazy URLs
        text = text.replace(crazyRegExp, writeMediaTagBaseUrl);

        // normal
        text = text.replace(inlineRegExp, writeMediaTagBaseUrl);

        // shortcut refs
        text = text.replace(refShortcutRegExp, writeMediaTag);

        text = globals.converter._dispatch("makehtml.images.after", text, options, globals).getText();
        return text;
    });

    showdown.subParser("makehtml.italicsAndBold", function (text, options, globals) {
        "use strict";

        text = globals.converter._dispatch("makehtml.italicsAndBold.before", text, options, globals).getText();

        function parseInside(txt, left, right) {
            return left + txt + right;
        }

        // Parse underscores
        if (options.literalMidWordUnderscores) {
            text = text.replace(/\b___(\S[\s\S]*?)___\b/g, function (wm, txt) {
                return parseInside(txt, "<strong><em>", "</em></strong>");
            });
            text = text.replace(/\b__(\S[\s\S]*?)__\b/g, function (wm, txt) {
                return parseInside(txt, "<strong>", "</strong>");
            });
            text = text.replace(/\b_(\S[\s\S]*?)_\b/g, function (wm, txt) {
                return parseInside(txt, "<em>", "</em>");
            });
        } else {
            text = text.replace(/___(\S[\s\S]*?)___/g, function (wm, m) {
                return /\S$/.test(m) ? parseInside(m, "<strong><em>", "</em></strong>") : wm;
            });
            text = text.replace(/__(\S[\s\S]*?)__/g, function (wm, m) {
                return /\S$/.test(m) ? parseInside(m, "<strong>", "</strong>") : wm;
            });
            text = text.replace(/_([^\s_][\s\S]*?)_/g, function (wm, m) {
                return /\S$/.test(m) ? parseInside(m, "<em>", "</em>") : wm;
            });
        }

        // Parse asterisks
        text = text.replace(/\*\*\*(\S[\s\S]*?)\*\*\*/g, function (wm, m) {
            return /\S$/.test(m) ? parseInside(m, "<strong><em>", "</em></strong>") : wm;
        });
        text = text.replace(/\*\*(\S[\s\S]*?)\*\*/g, function (wm, m) {
            return /\S$/.test(m) ? parseInside(m, "<strong>", "</strong>") : wm;
        });
        text = text.replace(/\*([^\s*][\s\S]*?)\*/g, function (wm, m) {
            return /\S$/.test(m) ? parseInside(m, "<em>", "</em>") : wm;
        });

        // Parse equals
        text = text.replace(/==([\s\S]+?)==/g, function (wm, m) {
            return /\S/.test(m) ? parseInside(m, "<mark>", "</mark>") : wm;
        });

        // Parse superscript: ^text^
        text = text.replace(/(?<!\\)\^([^\s^][\s\S]*?)\^/g, function (wm, m) {
            return parseInside(m, "<sup>", "</sup>");
        });

        // Parse subscript: ~text~
        text = text.replace(/(^|[^\~])~(?!~)([\s\S]*?)~(?!~)/g, function (wm, pre, m) {
            if (!/\S/.test(m)) return wm;
            return pre + parseInside(m, "<sub>", "</sub>");
        });
        
        text = text.replace(/\\\^/g, "^");
        text = globals.converter._dispatch("makehtml.italicsAndBold.after", text, options, globals).getText();

        return text;
    });

    ////
    // makehtml/links.js
    // Copyright (c) 2018 ShowdownJS
    //
    // Transforms MD links into `<a>` html anchors
    //
    // A link contains link text (the visible text), a link destination (the URI that is the link destination), and
    // optionally a link title. There are two basic kinds of links in Markdown.
    // In inline links the destination and title are given immediately after the link text.
    // In reference links the destination and title are defined elsewhere in the document.
    //
    // ***Author:***
    // - Estevão Soares dos Santos (Tivie) <https://github.com/tivie>
    ////

    (function () {
        /**
         * Helper function: Wrapper function to pass as second replace parameter
         *
         * @param {RegExp} rgx
         * @param {string} evtRootName
         * @param {{}} options
         * @param {{}} globals
         * @returns {Function}
         */
        function replaceAnchorTagReference(rgx, evtRootName, options, globals, emptyCase) {
            emptyCase = !!emptyCase;
            return function (wholeMatch, text, id, url, m5, m6, title) {
                // bail we we find 2 newlines somewhere
                if (/\n\n/.test(wholeMatch)) {
                    return wholeMatch;
                }

                var evt = createEvent(rgx, evtRootName + ".captureStart", wholeMatch, text, id, url, title, options, globals);
                return writeAnchorTag(evt, options, globals, emptyCase);
            };
        }

        function replaceAnchorTagBaseUrl(rgx, evtRootName, options, globals, emptyCase) {
            return function (wholeMatch, text, id, url, m5, m6, title) {
                url = showdown.helper.applyBaseUrl(options.relativePathBaseUrl, url);

                var evt = createEvent(rgx, evtRootName + ".captureStart", wholeMatch, text, id, url, title, options, globals);
                return writeAnchorTag(evt, options, globals, emptyCase);
            };
        }

        /**
         * TODO Normalize this
         * Helper function: Create a capture event
         * @param {RegExp} rgx
         * @param {String} evtName Event name
         * @param {String} wholeMatch
         * @param {String} text
         * @param {String} id
         * @param {String} url
         * @param {String} title
         * @param {{}} options
         * @param {{}} globals
         * @returns {showdown.helper.Event|*}
         */
        function createEvent(rgx, evtName, wholeMatch, text, id, url, title, options, globals) {
            return globals.converter._dispatch(evtName, wholeMatch, options, globals, {
                regexp: rgx,
                matches: {
                    wholeMatch: wholeMatch,
                    text: text,
                    id: id,
                    url: url,
                    title: title,
                },
            });
        }

        /**
         * Helper Function: Normalize and write an anchor tag based on passed parameters
         * @param evt
         * @param options
         * @param globals
         * @param {boolean} emptyCase
         * @returns {string}
         */
        function writeAnchorTag(evt, options, globals, emptyCase) {
            var wholeMatch = evt.getMatches().wholeMatch;
            var text = evt.getMatches().text;
            var id = evt.getMatches().id;
            var url = evt.getMatches().url;
            var title = evt.getMatches().title;
            var target = "";

            if (!title) {
                title = "";
            }
            id = id ? id.toLowerCase() : "";

            if (emptyCase) {
                url = "";
            } else if (!url) {
                if (!id) {
                    // lower-case and turn embedded newlines into spaces
                    id = text.toLowerCase().replace(/ ?\n/g, " ");
                }
                url = "#" + id;

                if (!showdown.helper.isUndefined(globals.gUrls[id])) {
                    url = globals.gUrls[id];
                    if (!showdown.helper.isUndefined(globals.gTitles[id])) {
                        title = globals.gTitles[id];
                    }
                } else {
                    return wholeMatch;
                }
            }
            //url = showdown.helper.escapeCharacters(url, '*_:~', false); // replaced line to improve performance
            url = url.replace(showdown.helper.regexes.asteriskDashTildeAndColon, showdown.helper.escapeCharactersCallback);

            if (title !== "" && title !== null) {
                title = title.replace(/"/g, "&quot;");
                //title = showdown.helper.escapeCharacters(title, '*_', false); // replaced line to improve performance
                title = title.replace(showdown.helper.regexes.asteriskDashTildeAndColon, showdown.helper.escapeCharactersCallback);
                title = ' title="' + title + '"';
            }

            // optionLinksInNewWindow only applies
            // to external links. Hash links (#) open in same page
            if (options.openLinksInNewWindow && !/^#/.test(url)) {
                // escaped _
                target = ' rel="noopener noreferrer" target="¨E95Eblank"';
            }

            // Text can be a markdown element, so we run through the appropriate parsers
            text = showdown.subParser("makehtml.codeSpans")(text, options, globals);
            text = showdown.subParser("makehtml.emoji")(text, options, globals);
            text = showdown.subParser("makehtml.underline")(text, options, globals);
            text = showdown.subParser("makehtml.italicsAndBold")(text, options, globals);
            text = showdown.subParser("makehtml.strikethrough")(text, options, globals);
            text = showdown.subParser("makehtml.ellipsis")(text, options, globals);
            text = showdown.subParser("makehtml.dash")(text, options, globals);
            text = showdown.subParser("makehtml.hashHTMLSpans")(text, options, globals);

            //evt = createEvent(rgx, evtRootName + '.captureEnd', wholeMatch, text, id, url, title, options, globals);

            var result = '<a href="' + url + '"' + title + target + ">" + text + "</a>";

            //evt = createEvent(rgx, evtRootName + '.beforeHash', wholeMatch, text, id, url, title, options, globals);

            result = showdown.subParser("makehtml.hashHTMLSpans")(result, options, globals);

            return result;
        }

        var evtRootName = "makehtml.links";

        /**
         * Turn Markdown link shortcuts into XHTML <a> tags.
         */
        showdown.subParser("makehtml.links", function (text, options, globals) {
            text = globals.converter._dispatch(evtRootName + ".start", text, options, globals).getText();

            // 1. Handle reference-style links: [link text] [id]
            text = showdown.subParser("makehtml.links.reference")(text, options, globals);

            // 2. Handle inline-style links: [link text](url "optional title")
            text = showdown.subParser("makehtml.links.inline")(text, options, globals);

            // 3. Handle reference-style shortcuts: [link text]
            // These must come last in case there's a [link text][1] or [link text](/foo)
            text = showdown.subParser("makehtml.links.referenceShortcut")(text, options, globals);

            // 4. Handle angle brackets links -> `<http://example.com/>`
            // Must come after links, because you can use < and > delimiters in inline links like [this](<url>).
            text = showdown.subParser("makehtml.links.angleBrackets")(text, options, globals);

            // 5. Handle GithubMentions (if option is enabled)
            text = showdown.subParser("makehtml.links.ghMentions")(text, options, globals);

            // 6. Handle <a> tags and img tags
            text = text.replace(/<a\s[^>]*>[\s\S]*<\/a>/g, function (wholeMatch) {
                return showdown.helper._hashHTMLSpan(wholeMatch, globals);
            });

            text = text.replace(/<img\s[^>]*\/?>/g, function (wholeMatch) {
                return showdown.helper._hashHTMLSpan(wholeMatch, globals);
            });

            // 7. Handle naked links (if option is enabled)
            text = showdown.subParser("makehtml.links.naked")(text, options, globals);

            text = globals.converter._dispatch(evtRootName + ".end", text, options, globals).getText();
            return text;
        });

        /**
         * TODO WRITE THIS DOCUMENTATION
         */
        showdown.subParser("makehtml.links.inline", function (text, options, globals) {
            var evtRootName = evtRootName + ".inline";

            text = globals.converter._dispatch(evtRootName + ".start", text, options, globals).getText();

            // 1. Look for empty cases: []() and [empty]() and []("title")
            var rgxEmpty = /\[(.*?)]()()()()\(<? ?>? ?(?:["'](.*)["'])?\)/g;
            text = text.replace(rgxEmpty, replaceAnchorTagBaseUrl(rgxEmpty, evtRootName, options, globals, true));

            // 2. Look for cases with crazy urls like ./image/cat1).png
            var rgxCrazy = /\[((?:\[[^\]]*]|[^\[\]])*)]()\s?\([ \t]?<([^>]*)>(?:[ \t]*((["'])([^"]*?)\5))?[ \t]?\)/g;
            text = text.replace(rgxCrazy, replaceAnchorTagBaseUrl(rgxCrazy, evtRootName, options, globals));

            // 3. inline links with no title or titles wrapped in ' or ":
            // [text](url.com) || [text](<url.com>) || [text](url.com "title") || [text](<url.com> "title")
            //var rgx2 = /\[[ ]*[\s]?[ ]*([^\n\[\]]*?)[ ]*[\s]?[ ]*] ?()\(<?[ ]*[\s]?[ ]*([^\s'"]*)>?(?:[ ]*[\n]?[ ]*()(['"])(.*?)\5)?[ ]*[\s]?[ ]*\)/; // this regex is too slow!!!
            var rgx2 = /\[([\S ]*?)]\s?()\( *<?([^\s'"]*?(?:\([\S]*?\)[\S]*?)?)>?\s*(?:()(['"])(.*?)\5)? *\)/g;
            text = text.replace(rgx2, replaceAnchorTagBaseUrl(rgx2, evtRootName, options, globals));

            // 4. inline links with titles wrapped in (): [foo](bar.com (title))
            var rgx3 = /\[([\S ]*?)]\s?()\( *<?([^\s'"]*?(?:\([\S]*?\)[\S]*?)?)>?\s+()()\((.*?)\) *\)/g;
            text = text.replace(rgx3, replaceAnchorTagBaseUrl(rgx3, evtRootName, options, globals));

            text = globals.converter._dispatch(evtRootName + ".end", text, options, globals).getText();

            return text;
        });

        /**
         * TODO WRITE THIS DOCUMENTATION
         */
        showdown.subParser("makehtml.links.reference", function (text, options, globals) {
            var evtRootName = evtRootName + ".reference";

            text = globals.converter._dispatch(evtRootName + ".start", text, options, globals).getText();

            var rgx = /\[((?:\[[^\]]*]|[^\[\]])*)] ?(?:\n *)?\[(.*?)]()()()()/g;
            text = text.replace(rgx, replaceAnchorTagReference(rgx, evtRootName, options, globals));

            text = globals.converter._dispatch(evtRootName + ".end", text, options, globals).getText();

            return text;
        });

        /**
         * TODO WRITE THIS DOCUMENTATION
         */
        showdown.subParser("makehtml.links.referenceShortcut", function (text, options, globals) {
            var evtRootName = evtRootName + ".referenceShortcut";

            text = globals.converter._dispatch(evtRootName + ".start", text, options, globals).getText();

            var rgx = /\[([^\[\]]+)]()()()()()/g;
            text = text.replace(rgx, replaceAnchorTagReference(rgx, evtRootName, options, globals));

            text = globals.converter._dispatch(evtRootName + ".end", text, options, globals).getText();

            return text;
        });

        /**
         * TODO WRITE THIS DOCUMENTATION
         */
        showdown.subParser("makehtml.links.ghMentions", function (text, options, globals) {
            var evtRootName = evtRootName + "ghMentions";

            if (!options.ghMentions) {
                return text;
            }

            text = globals.converter._dispatch(evtRootName + ".start", text, options, globals).getText();

            var rgx = /(^|\s)(\\)?(@([a-z\d]+(?:[a-z\d._-]+?[a-z\d]+)*))/gi;

            text = text.replace(rgx, function (wholeMatch, st, escape, mentions, username) {
                // bail if the mentions was escaped
                if (escape === "\\") {
                    return st + mentions;
                }

                // check if options.ghMentionsLink is a string
                // TODO Validation should be done at initialization not at runtime
                if (!showdown.helper.isString(options.ghMentionsLink)) {
                    throw new Error("ghMentionsLink option must be a string");
                }
                var url = options.ghMentionsLink.replace(/{u}/g, username);
                var evt = createEvent(rgx, evtRootName + ".captureStart", wholeMatch, mentions, null, url, null, options, globals);
                // captureEnd Event is triggered inside writeAnchorTag function
                return st + writeAnchorTag(evt, options, globals);
            });

            text = globals.converter._dispatch(evtRootName + ".end", text, options, globals).getText();

            return text;
        });

        /**
         * TODO WRITE THIS DOCUMENTATION
         */
        showdown.subParser("makehtml.links.angleBrackets", function (text, options, globals) {
            var evtRootName = "makehtml.links.angleBrackets";

            text = globals.converter._dispatch(evtRootName + ".start", text, options, globals).getText();

            // 1. Parse links first
            var urlRgx = /<(((?:https?|ftp):\/\/|www\.)[^'">\s]+)>/gi;
            text = text.replace(urlRgx, function (wholeMatch, url, urlStart) {
                var text = url;
                url = urlStart === "www." ? "http://" + url : url;
                var evt = createEvent(urlRgx, evtRootName + ".captureStart", wholeMatch, text, null, url, null, options, globals);
                return writeAnchorTag(evt, options, globals);
            });

            // 2. Then Mail Addresses
            var mailRgx = /<(?:mailto:)?([-.\w]+@[-a-z0-9]+(\.[-a-z0-9]+)*\.[a-z]+)>/gi;
            text = text.replace(mailRgx, function (wholeMatch, mail) {
                var url = "mailto:";
                mail = showdown.subParser("makehtml.unescapeSpecialChars")(mail, options, globals);
                if (options.encodeEmails) {
                    url = showdown.helper.encodeEmailAddress(url + mail);
                    mail = showdown.helper.encodeEmailAddress(mail);
                } else {
                    url = url + mail;
                }
                var evt = createEvent(mailRgx, evtRootName + ".captureStart", wholeMatch, mail, null, url, null, options, globals);
                return writeAnchorTag(evt, options, globals);
            });

            text = globals.converter._dispatch(evtRootName + ".end", text, options, globals).getText();
            return text;
        });

        /**
         * TODO MAKE THIS WORK (IT'S NOT ACTIVATED)
         * TODO WRITE THIS DOCUMENTATION
         */
        showdown.subParser("makehtml.links.naked", function (text, options, globals) {
            if (!options.simplifiedAutoLink) {
                return text;
            }

            var evtRootName = "makehtml.links.naked";

            text = globals.converter._dispatch(evtRootName + ".start", text, options, globals).getText();

            // 2. Now we check for
            // we also include leading markdown magic chars [_*~] for cases like __https://www.google.com/foobar__
            var urlRgx = /([_*~]*?)(((?:https?|ftp):\/\/|www\.)[^\s<>"'`´.-][^\s<>"'`´]*?\.[a-z\d.]+[^\s<>"']*)\1/gi;
            text = text.replace(urlRgx, function (wholeMatch, leadingMDChars, url, urlPrefix) {
                // we now will start traversing the url from the front to back, looking for punctuation chars [_*~,;:.!?\)\]]
                var len = url.length;
                var suffix = "";
                for (var i = len - 1; i >= 0; --i) {
                    var char = url.charAt(i);

                    if (/[_*~,;:.!?]/.test(char)) {
                        // it's a punctuation char
                        // we remove it from the url
                        url = url.slice(0, -1);
                        // and prepend it to the suffix
                        suffix = char + suffix;
                    } else if (/\)/.test(char)) {
                        var opPar = url.match(/\(/g) || [];
                        var clPar = url.match(/\)/g);

                        // it's a curved parenthesis so we need to check for "balance" (kinda)
                        if (opPar.length < clPar.length) {
                            // there are more closing Parenthesis than opening so chop it!!!!!
                            url = url.slice(0, -1);
                            // and prepend it to the suffix
                            suffix = char + suffix;
                        } else {
                            // it's (kinda) balanced so our work is done
                            break;
                        }
                    } else if (/]/.test(char)) {
                        var opPar2 = url.match(/\[/g) || [];
                        var clPar2 = url.match(/\]/g);
                        // it's a squared parenthesis so we need to check for "balance" (kinda)
                        if (opPar2.length < clPar2.length) {
                            // there are more closing Parenthesis than opening so chop it!!!!!
                            url = url.slice(0, -1);
                            // and prepend it to the suffix
                            suffix = char + suffix;
                        } else {
                            // it's (kinda) balanced so our work is done
                            break;
                        }
                    } else {
                        // it's not a punctuation or a parenthesis so our work is done
                        break;
                    }
                }

                // we copy the treated url to the text variable
                var text = url;
                // finally, if it's a www shortcut, we prepend http
                url = urlPrefix === "www." ? "http://" + url : url;

                // url part is done so let's take care of text now
                // we need to escape the text (because of links such as www.example.com/foo__bar__baz)
                text = text.replace(showdown.helper.regexes.asteriskDashTildeAndColon, showdown.helper.escapeCharactersCallback);

                // finally we dispatch the event
                var evt = createEvent(urlRgx, evtRootName + ".captureStart", wholeMatch, text, null, url, null, options, globals);

                // and return the link tag, with the leadingMDChars and  suffix. The leadingMDChars are added at the end too because
                // we consumed those characters in the regexp
                return leadingMDChars + writeAnchorTag(evt, options, globals) + suffix + leadingMDChars;
            });

            // 2. Then mails
            var mailRgx = /(^|\s)(?:mailto:)?([A-Za-z0-9!#$%&'*+-/=?^_`{|}~.]+@[-a-z0-9]+(\.[-a-z0-9]+)*\.[a-z]+)(?=$|\s)/gim;
            text = text.replace(mailRgx, function (wholeMatch, leadingChar, mail) {
                var url = "mailto:";
                mail = showdown.subParser("makehtml.unescapeSpecialChars")(mail, options, globals);
                if (options.encodeEmails) {
                    url = showdown.helper.encodeEmailAddress(url + mail);
                    mail = showdown.helper.encodeEmailAddress(mail);
                } else {
                    url = url + mail;
                }
                var evt = createEvent(mailRgx, evtRootName + ".captureStart", wholeMatch, mail, null, url, null, options, globals);
                return leadingChar + writeAnchorTag(evt, options, globals);
            });

            text = globals.converter._dispatch(evtRootName + ".end", text, options, globals).getText();
            return text;
        });
    })();

    /**
     * Form HTML ordered (numbered) and unordered (bulleted) lists.
     */
    showdown.subParser("makehtml.lists", function (text, options, globals) {
        "use strict";

        function processListItems(listStr, trimTrailing) {
            // The $g_list_level global keeps track of when we're inside a list.
            // Each time we enter a list, we increment it; when we leave a list,
            // we decrement. If it's zero, we're not in a list anymore.
            //
            // We do this because when we're not inside a list, we want to treat
            // something like this:
            //
            //    I recommend upgrading to version
            //    8. Oops, now this line is treated
            //    as a sub-list.
            //
            // As a single paragraph, despite the fact that the second line starts
            // with a digit-period-space sequence.
            //
            // Whereas when we're inside a list (or sub-list), that line will be
            // treated as the start of a sub-list. What a kludge, huh? This is
            // an aspect of Markdown's syntax that's hard to parse perfectly
            // without resorting to mind-reading. Perhaps the solution is to
            // change the syntax rules such that sub-lists must start with a
            // starting cardinal number; e.g. "1." or "a.".
            globals.gListLevel++;

            // trim trailing blank lines:
            listStr = listStr.replace(/\n{2,}$/, '\n');

            // attacklab: add sentinel to emulate \z
            listStr += '¨0';

            var rgx = /(\n)?(^ {0,3})([*+-]|\d+[.])[ \t]+((\[([xX ])])?[ \t]*[^\r]+?(\n{1,2}))(?=\n*(¨0| {0,3}([*+-]|\d+[.])[ \t]+))/gm,
                isParagraphed = (/\n[ \t]*\n(?!¨0)/.test(listStr));

            // Since version 1.5, nesting sublists requires 4 spaces (or 1 tab) indentation,
            // which is a syntax breaking change
            // activating this option reverts to old behavior
            // This will be removed in version 2.0
            if (options.disableForced4SpacesIndentedSublists) {
                rgx = /(\n)?(^ {0,3})([*+-]|\d+[.])[ \t]+((\[([xX ])])?[ \t]*[^\r]+?(\n{1,2}))(?=\n*(¨0|\2([*+-]|\d+[.])[ \t]+))/gm;
            }

            listStr = listStr.replace(rgx, function (wholeMatch, m1, m2, m3, m4, taskbtn, checked) {
                checked = (checked && checked.trim() !== '');

                var item = showdown.subParser('makehtml.outdent')(m4, options, globals),
                    bulletStyle = '';

                // Support for github tasklists
                if (taskbtn && options.tasklists) {

                    // Style used for tasklist bullets
                    bulletStyle = ' class="task-list-item';
                    if (options.moreStyling) { bulletStyle += checked ? ' task-list-item-complete' : ''; }
                    bulletStyle += '" style="list-style-type: none;"';

                    item = item.replace(/^[ \t]*\[([xX ])?]/m, function () {
                        var otp = '<input type="checkbox" disabled style="margin: 0px 0.35em 0.25em -1.6em; vertical-align: middle;"';
                        if (checked) {
                            otp += ' checked';
                        }
                        otp += '>';
                        return otp;
                    });
                }

                // ISSUE #312
                // This input: - - - a
                // causes trouble to the parser, since it interprets it as:
                // <ul><li><li><li>a</li></li></li></ul>
                // instead of:
                // <ul><li>- - a</li></ul>
                // So, to prevent it, we will put a marker (¨A)in the beginning of the line
                // Kind of hackish/monkey patching, but seems more effective than overcomplicating the list parser
                item = item.replace(/^([-*+]|\d\.)[ \t]+[\S\n ]*/g, function (wm2) {
                    return '¨A' + wm2;
                });

                // SPECIAL CASE: a heading followed by a paragraph of text that is not separated by a double newline
                // or/nor indented. ex:
                //
                // - # foo
                // bar is great
                //
                // While this does now follow the spec per se, not allowing for this might cause confusion since
                // header blocks don't need double-newlines after
                if (/^#+.+\n.+/.test(item)) {
                    item = item.replace(/^(#+.+)$/m, '$1\n');
                }

                // m1 - Leading line or
                // Has a double return (multi paragraph)
                if (m1 || (item.search(/\n{2,}/) > -1)) {
                    item = showdown.subParser('makehtml.githubCodeBlocks')(item, options, globals);
                    item = showdown.subParser('makehtml.blockQuotes')(item, options, globals);
                    item = showdown.subParser('makehtml.headers')(item, options, globals);
                    item = showdown.subParser('makehtml.lists')(item, options, globals);
                    item = showdown.subParser('makehtml.codeBlocks')(item, options, globals);
                    item = showdown.subParser('makehtml.tables')(item, options, globals);
                    item = showdown.subParser('makehtml.hashHTMLBlocks')(item, options, globals);
                    //item = showdown.subParser('makehtml.paragraphs')(item, options, globals);

                    // TODO: This is a copy of the paragraph parser
                    // This is a provisory fix for issue #494
                    // For a permanente fix we need to rewrite the paragraph parser, passing the unhashify logic outside
                    // so that we can call the paragraph parser without accidently unashifying previously parsed blocks

                    // Strip leading and trailing lines:
                    item = item.replace(/^\n+/g, '');
                    item = item.replace(/\n+$/g, '');

                    var grafs = item.split(/\n{2,}/g),
                        grafsOut = [],
                        end = grafs.length; // Wrap <p> tags

                    for (var i = 0; i < end; i++) {
                        var str = grafs[i];
                        // if this is an HTML marker, copy it
                        if (str.search(/¨([KG])(\d+)\1/g) >= 0) {
                            grafsOut.push(str);

                            // test for presence of characters to prevent empty lines being parsed
                            // as paragraphs (resulting in undesired extra empty paragraphs)
                        } else if (str.search(/\S/) >= 0) {
                            str = showdown.subParser('makehtml.spanGamut')(str, options, globals);
                            str = str.replace(/^([ \t]*)/g, '<p>');
                            str += '</p>';
                            grafsOut.push(str);
                        }
                    }
                    item = grafsOut.join('\n');
                    // Strip leading and trailing lines:
                    item = item.replace(/^\n+/g, '');
                    item = item.replace(/\n+$/g, '');

                } else {

                    // Recursion for sub-lists:
                    item = showdown.subParser('makehtml.lists')(item, options, globals);
                    item = item.replace(/\n$/, ''); // chomp(item)
                    item = showdown.subParser('makehtml.hashHTMLBlocks')(item, options, globals);

                    // Colapse double linebreaks
                    item = item.replace(/\n\n+/g, '\n\n');

                    if (isParagraphed) {
                        item = showdown.subParser('makehtml.paragraphs')(item, options, globals);
                    } else {
                        item = showdown.subParser('makehtml.spanGamut')(item, options, globals);
                    }
                }

                // now we need to remove the marker (¨A)
                item = item.replace('¨A', '');
                // we can finally wrap the line in list item tags
                item = '<li' + bulletStyle + '>' + item + '</li>\n';

                return item;
            });

            // attacklab: strip sentinel
            listStr = listStr.replace(/¨0/g, '');

            globals.gListLevel--;

            if (trimTrailing) {
                listStr = listStr.replace(/\s+$/, '');
            }

            return listStr;
        }

        function styleStartNumber(list, listType) {
            // check if ol and starts by a number different than 1
            if (listType === "ol") {
                var res = list.match(/^ *(\d+)\./);
                if (res && res[1] !== "1") {
                    return ' start="' + res[1] + '"';
                }
            }
            return "";
        }

        /**
         * Check and parse consecutive lists (better fix for issue #142)
         * @param {string} list
         * @param {string} listType
         * @param {boolean} trimTrailing
         * @returns {string}
         */
        function parseConsecutiveLists(list, listType, trimTrailing) {
            // check if we caught 2 or more consecutive lists by mistake
            // we use the counterRgx, meaning if listType is UL we look for OL and vice versa
            var olRgx = options.disableForced4SpacesIndentedSublists ? /^ ?\d+\.[ \t]/gm : /^ {0,3}\d+\.[ \t]/gm,
                ulRgx = options.disableForced4SpacesIndentedSublists ? /^ ?[*+-][ \t]/gm : /^ {0,3}[*+-][ \t]/gm,
                counterRxg = listType === "ul" ? olRgx : ulRgx,
                result = "";

            if (list.search(counterRxg) !== -1) {
                (function parseCL(txt) {
                    var pos = txt.search(counterRxg),
                        style = styleStartNumber(list, listType);
                    if (pos !== -1) {
                        // slice
                        result += "\n\n<" + listType + style + ">\n" + processListItems(txt.slice(0, pos), !!trimTrailing) + "</" + listType + ">\n";

                        // invert counterType and listType
                        listType = listType === "ul" ? "ol" : "ul";
                        counterRxg = listType === "ul" ? olRgx : ulRgx;

                        //recurse
                        parseCL(txt.slice(pos));
                    } else {
                        result += "\n\n<" + listType + style + ">\n" + processListItems(txt, !!trimTrailing) + "</" + listType + ">\n";
                    }
                })(list);
            } else {
                var style = styleStartNumber(list, listType);
                result = "\n\n<" + listType + style + ">\n" + processListItems(list, !!trimTrailing) + "</" + listType + ">\n";
            }

            return result;
        }

        // Start of list parsing
        var subListRgx = /^(( {0,3}([*+-]|\d+[.])[ \t]+)[^\r]+?(¨0|\n{2,}(?=\S)(?![ \t]*(?:[*+-]|\d+[.])[ \t]+)))/gm;
        var mainListRgx = /(\n\n|^\n?)(( {0,3}([*+-]|\d+[.])[ \t]+)[^\r]+?(¨0|\n{2,}(?=\S)(?![ \t]*(?:[*+-]|\d+[.])[ \t]+)))/gm;

        text = globals.converter._dispatch("lists.before", text, options, globals).getText();
        // add sentinel to hack around khtml/safari bug:
        // http://bugs.webkit.org/show_bug.cgi?id=11231
        text += "¨0";

        if (globals.gListLevel) {
            text = text.replace(subListRgx, function (wholeMatch, list, m2) {
                var listType = m2.search(/[*+-]/g) > -1 ? "ul" : "ol";
                return parseConsecutiveLists(list, listType, true);
            });
        } else {
            text = text.replace(mainListRgx, function (wholeMatch, m1, list, m3) {
                var listType = m3.search(/[*+-]/g) > -1 ? "ul" : "ol";
                return parseConsecutiveLists(list, listType, false);
            });
        }

        // strip sentinel
        text = text.replace(/¨0/, "");
        text = globals.converter._dispatch("makehtml.lists.after", text, options, globals).getText();
        return text;
    });

    /**
     * Parse metadata at the top of the document
     */
    showdown.subParser("makehtml.metadata", function (text, options, globals) {
        "use strict";

        if (!options.metadata) {
            return text;
        }

        text = globals.converter._dispatch("makehtml.metadata.before", text, options, globals).getText();

        function parseMetadataContents(content) {
            // raw is raw so it's not changed in any way
            globals.metadata.raw = content;

            // escape chars forbidden in html attributes
            // double quotes
            content = content
                // ampersand first
                .replace(/&/g, "&amp;")
                // double quotes
                .replace(/"/g, "&quot;");

            // Restore dollar signs and tremas
            content = content.replace(/¨D/g, "$$").replace(/¨T/g, "¨");

            content = content.replace(/\n {4}/g, " ");
            content.replace(/^([\S ]+): +([\s\S]+?)$/gm, function (wm, key, value) {
                globals.metadata.parsed[key] = value;
                return "";
            });
        }

        text = text.replace(/^\s*«««+(\S*?)\n([\s\S]+?)\n»»»+\n/, function (wholematch, format, content) {
            parseMetadataContents(content);
            return "¨M";
        });

        text = text.replace(/^\s*---+(\S*?)\n([\s\S]+?)\n---+\n/, function (wholematch, format, content) {
            if (format) {
                globals.metadata.format = format;
            }
            parseMetadataContents(content);
            return "¨M";
        });

        text = text.replace(/¨M/g, "");

        text = globals.converter._dispatch("makehtml.metadata.after", text, options, globals).getText();
        return text;
    });

    /**
     * Remove one level of line-leading tabs or spaces
     */
    showdown.subParser("makehtml.outdent", function (text, options, globals) {
        "use strict";
        text = globals.converter._dispatch("makehtml.outdent.before", text, options, globals).getText();

        // attacklab: hack around Konqueror 3.5.4 bug:
        // "----------bug".replace(/^-/g,"") == "bug"
        text = text.replace(/^(\t|[ ]{1,4})/gm, "¨0"); // attacklab: g_tab_width

        // attacklab: clean up hack
        text = text.replace(/¨0/g, "");

        text = globals.converter._dispatch("makehtml.outdent.after", text, options, globals).getText();
        return text;
    });

    /**
     *
     */
    showdown.subParser("makehtml.paragraphs", function (text, options, globals) {
        "use strict";

        text = globals.converter._dispatch("makehtml.paragraphs.before", text, options, globals).getText();
        // Strip leading and trailing lines:
        text = text.replace(/^\n+/g, "");
        text = text.replace(/\n+$/g, "");

        var grafs = text.split(/\n{2,}/g),
            grafsOut = [],
            end = grafs.length; // Wrap <p> tags

        for (var i = 0; i < end; i++) {
            var str = grafs[i];
            // if this is an HTML marker, copy it
            if (str.search(/¨(K|G)(\d+)\1/g) >= 0) {
                grafsOut.push(str);

                // test for presence of characters to prevent empty lines being parsed
                // as paragraphs (resulting in undesired extra empty paragraphs)
            } else if (str.search(/\S/) >= 0) {
                str = showdown.subParser("makehtml.spanGamut")(str, options, globals);
                str = str.replace(/^([ \t]*)/g, "<p>");
                str += "</p>";
                grafsOut.push(str);
            }
        }

        /** Unhashify HTML blocks */
        end = grafsOut.length;
        for (i = 0; i < end; i++) {
            var blockText = "",
                grafsOutIt = grafsOut[i],
                codeFlag = false;
            // if this is a marker for an html block...
            // use RegExp.test instead of string.search because of QML bug
            while (/¨(K|G)(\d+)\1/.test(grafsOutIt)) {
                var delim = RegExp.$1,
                    num = RegExp.$2;

                if (delim === "K") {
                    blockText = globals.gHtmlBlocks[num];
                } else {
                    // we need to check if ghBlock is a false positive
                    if (codeFlag) {
                        // use encoded version of all text
                        blockText = showdown.subParser("makehtml.encodeCode")(globals.ghCodeBlocks[num].text, options, globals);
                    } else {
                        blockText = globals.ghCodeBlocks[num].codeblock;
                    }
                }
                blockText = blockText.replace(/\$/g, "$$$$"); // Escape any dollar signs

                grafsOutIt = grafsOutIt.replace(/(\n\n)?¨(K|G)\d+\2(\n\n)?/, blockText);
                // Check if grafsOutIt is a pre->code
                if (/^<pre\b[^>]*>\s*<code\b[^>]*>/.test(grafsOutIt)) {
                    codeFlag = true;
                }
            }
            grafsOut[i] = grafsOutIt;
        }
        text = grafsOut.join("\n");
        // Strip leading and trailing lines:
        text = text.replace(/^\n+/g, "");
        text = text.replace(/\n+$/g, "");
        return globals.converter._dispatch("makehtml.paragraphs.after", text, options, globals).getText();
    });

    /**
     * Run extension
     */
    showdown.subParser("makehtml.runExtension", function (ext, text, options, globals) {
        "use strict";

        if (ext.filter) {
            text = ext.filter(text, globals.converter, options);
        } else if (ext.regex) {
            // TODO remove this when old extension loading mechanism is deprecated
            var re = ext.regex;
            if (!(re instanceof RegExp)) {
                re = new RegExp(re, "g");
            }
            text = text.replace(re, ext.replace);
        }

        return text;
    });

    /**
     * These are all the transformations that occur *within* block-level
     * tags like paragraphs, headers, and list items.
     */
    showdown.subParser("makehtml.spanGamut", function (text, options, globals) {
        "use strict";

        text = globals.converter._dispatch("makehtml.span.before", text, options, globals).getText();

        text = showdown.subParser("makehtml.codeSpans")(text, options, globals);
        text = showdown.subParser("makehtml.escapeSpecialCharsWithinTagAttributes")(text, options, globals);
        text = showdown.subParser("makehtml.encodeBackslashEscapes")(text, options, globals);

        // Process link and image tags. Images must come first,
        // because ![foo][f] looks like a link.
        text = showdown.subParser("makehtml.images")(text, options, globals);

        text = globals.converter._dispatch("smakehtml.links.before", text, options, globals).getText();
        text = showdown.subParser("makehtml.links")(text, options, globals);
        text = globals.converter._dispatch("smakehtml.links.after", text, options, globals).getText();

        //text = showdown.subParser('makehtml.autoLinks')(text, options, globals);
        //text = showdown.subParser('makehtml.simplifiedAutoLinks')(text, options, globals);
        text = showdown.subParser("makehtml.emoji")(text, options, globals);
        text = showdown.subParser("makehtml.underline")(text, options, globals);
        text = showdown.subParser("makehtml.italicsAndBold")(text, options, globals);
        text = showdown.subParser("makehtml.strikethrough")(text, options, globals);
        text = showdown.subParser("makehtml.ellipsis")(text, options, globals);
        text = showdown.subParser("makehtml.dash")(text, options, globals);

        // we need to hash HTML tags inside spans
        text = showdown.subParser("makehtml.hashHTMLSpans")(text, options, globals);

        // now we encode amps and angles
        text = showdown.subParser("makehtml.encodeAmpsAndAngles")(text, options, globals);

        // Do hard breaks
        if (options.simpleLineBreaks) {
            // GFM style hard breaks
            // only add line breaks if the text does not contain a block (special case for lists)
            if (!/\n\n¨K/.test(text)) {
                text = text.replace(/\n+/g, "<br />\n");
            }
        } else {
            // Vanilla hard breaks
            text = text.replace(/  +\n/g, "<br />\n");
        }

        text = globals.converter._dispatch("makehtml.spanGamut.after", text, options, globals).getText();
        return text;
    });

    showdown.subParser("makehtml.strikethrough", function (text, options, globals) {
        "use strict";

        if (options.strikethrough) {
            text = globals.converter._dispatch("makehtml.strikethrough.before", text, options, globals).getText();
            text = text.replace(/(?:~){2}([\s\S]+?)(?:~){2}/g, function (wm, txt) {
                return "<del>" + txt + "</del>";
            });
            text = globals.converter._dispatch("makehtml.strikethrough.after", text, options, globals).getText();
        }

        return text;
    });

    /**
     * Strips link definitions from text, stores the URLs and titles in
     * hash references.
     * Link defs are in the form: ^[id]: url "optional title"
     */
    showdown.subParser("makehtml.stripLinkDefinitions", function (text, options, globals) {
        "use strict";

        var regex = /^ {0,3}\[([^\]]+)]:[ \t]*\n?[ \t]*<?([^>\s]+)>?(?: =([*\d]+[A-Za-z%]{0,4})x([*\d]+[A-Za-z%]{0,4}))?[ \t]*\n?[ \t]*(?:(\n*)["|'(](.+?)["|')][ \t]*)?(?:\n+|(?=¨0))/gm,
            base64Regex = /^ {0,3}\[([^\]]+)]:[ \t]*\n?[ \t]*<?(data:.+?\/.+?;base64,[A-Za-z0-9+/=\n]+?)>?(?: =([*\d]+[A-Za-z%]{0,4})x([*\d]+[A-Za-z%]{0,4}))?[ \t]*\n?[ \t]*(?:(\n*)["|'(](.+?)["|')][ \t]*)?(?:\n\n|(?=¨0)|(?=\n\[))/gm;

        // attacklab: sentinel workarounds for lack of \A and \Z, safari\khtml bug
        text += "¨0";

        var replaceFunc = function (wholeMatch, linkId, url, width, height, blankLines, title) {
            // if there aren't two instances of linkId it must not be a reference link so back out
            linkId = linkId.toLowerCase();
            if (text.toLowerCase().split(linkId).length - 1 < 2) {
                return wholeMatch;
            }
            if (url.match(/^data:.+?\/.+?;base64,/)) {
                // remove newlines
                globals.gUrls[linkId] = url.replace(/\s/g, "");
            } else {
                url = showdown.helper.applyBaseUrl(options.relativePathBaseUrl, url);

                globals.gUrls[linkId] = showdown.subParser("makehtml.encodeAmpsAndAngles")(url, options, globals); // Link IDs are case-insensitive
            }

            if (blankLines) {
                // Oops, found blank lines, so it's not a title.
                // Put back the parenthetical statement we stole.
                return blankLines + title;
            } else {
                if (title) {
                    globals.gTitles[linkId] = title.replace(/"|'/g, "&quot;");
                }
                if (options.parseImgDimensions && width && height) {
                    globals.gDimensions[linkId] = {
                        width: width,
                        height: height,
                    };
                }
            }
            // Completely remove the definition from the text
            return "";
        };

        // first we try to find base64 link references
        text = text.replace(base64Regex, replaceFunc);

        text = text.replace(regex, replaceFunc);

        // attacklab: strip sentinel
        text = text.replace(/¨0/, "");

        return text;
    });

    showdown.subParser("makehtml.tables", function (text, options, globals) {
        "use strict";

        if (!options.tables) {
            return text;
        }

        var tableRgx = /^ {0,3}\|?.+\|.+\n {0,3}\|?[ \t]*:?[ \t]*[-=]{2,}[ \t]*:?[ \t]*\|[ \t]*:?[ \t]*[-=]{2,}[\s\S]+?(?:\n\n|¨0)/gm,
            //singeColTblRgx = /^ {0,3}\|.+\|\n {0,3}\|[ \t]*:?[ \t]*(?:[-=]){2,}[ \t]*:?[ \t]*\|[ \t]*\n(?: {0,3}\|.+\|\n)+(?:\n\n|¨0)/gm;
            singeColTblRgx = /^ {0,3}\|.+\|[ \t]*\n {0,3}\|[ \t]*:?[ \t]*[-=]{2,}[ \t]*:?[ \t]*\|[ \t]*\n( {0,3}\|.+\|[ \t]*\n)*(?:\n|¨0)/gm;

        function parseStyles(sLine) {
            if (/^:[ \t]*--*$/.test(sLine)) {
                return ' style="text-align:left;"';
            } else if (/^--*[ \t]*:[ \t]*$/.test(sLine)) {
                return ' style="text-align:right;"';
            } else if (/^:[ \t]*--*[ \t]*:$/.test(sLine)) {
                return ' style="text-align:center;"';
            } else {
                return "";
            }
        }

        function parseHeaders(header, style) {
            var id = "";
            header = header.trim();
            // support both tablesHeaderId and tableHeaderId due to error in documentation so we don't break backwards compatibility
            if (options.tablesHeaderId || options.tableHeaderId) {
                id = ' id="' + header.replace(/ /g, "_").toLowerCase() + '"';
            }
            header = showdown.subParser("makehtml.spanGamut")(header, options, globals);

            return "<th" + id + style + ">" + header + "</th>\n";
        }

        function parseCells(cell, style) {
            var subText = showdown.subParser("makehtml.spanGamut")(cell, options, globals);

            // Se tasklists estiver ativado, permitir checkboxes também em tabelas
            if (options.tasklists) {
                subText = subText.replace(/^\[([xX ])]\s*/m, function (match, checked) {
                    var otp = '<input type="checkbox" disabled style="margin:0 .4em; vertical-align: middle;"';
                    if (checked.trim() !== "") {
                        otp += ' checked';
                    }
                    otp += '>';
                    return otp;
                });
            }

            return "<td" + style + ">" + subText + "</td>\n";
        }

        function buildTable(headers, cells) {
            var tb = '<div class="table-container">\n<table>\n<thead>\n<tr>\n',
                tblLgn = headers.length;

            for (var i = 0; i < tblLgn; ++i) {
                tb += headers[i];
            }
            tb += "</tr>\n</thead>\n<tbody>\n";

            for (i = 0; i < cells.length; ++i) {
                tb += "<tr>\n";
                for (var ii = 0; ii < tblLgn; ++ii) {
                    tb += cells[i][ii];
                }
                tb += "</tr>\n";
            }
            tb += "</tbody>\n</table>\n</div>\n";
            return tb;
        }

        function parseTable(rawTable) {
            var i,
                tableLines = rawTable.split("\n");

            for (i = 0; i < tableLines.length; ++i) {
                // strip wrong first and last column if wrapped tables are used
                if (/^ {0,3}\|/.test(tableLines[i])) {
                    tableLines[i] = tableLines[i].replace(/^ {0,3}\|/, "");
                }
                if (/\|[ \t]*$/.test(tableLines[i])) {
                    tableLines[i] = tableLines[i].replace(/\|[ \t]*$/, "");
                }
                // parse code spans first, but we only support one line code spans

                tableLines[i] = showdown.subParser("makehtml.codeSpans")(tableLines[i], options, globals);
            }

            var rawHeaders = tableLines[0].split("|").map(function (s) {
                    return s.trim();
                }),
                rawStyles = tableLines[1].split("|").map(function (s) {
                    return s.trim();
                }),
                rawCells = [],
                headers = [],
                styles = [],
                cells = [];

            tableLines.shift();
            tableLines.shift();

            for (i = 0; i < tableLines.length; ++i) {
                if (tableLines[i].trim() === "") {
                    continue;
                }
                rawCells.push(
                    tableLines[i].split("|").map(function (s) {
                        return s.trim();
                    })
                );
            }

            if (rawHeaders.length < rawStyles.length) {
                return rawTable;
            }

            for (i = 0; i < rawStyles.length; ++i) {
                styles.push(parseStyles(rawStyles[i]));
            }

            for (i = 0; i < rawHeaders.length; ++i) {
                if (showdown.helper.isUndefined(styles[i])) {
                    styles[i] = "";
                }
                headers.push(parseHeaders(rawHeaders[i], styles[i]));
            }

            for (i = 0; i < rawCells.length; ++i) {
                var row = [];
                for (var ii = 0; ii < headers.length; ++ii) {
                    if (showdown.helper.isUndefined(rawCells[i][ii])) {
                    }
                    row.push(parseCells(rawCells[i][ii], styles[ii]));
                }
                cells.push(row);
            }

            return buildTable(headers, cells);
        }

        text = globals.converter._dispatch("makehtml.tables.before", text, options, globals).getText();

        // find escaped pipe characters
        text = text.replace(/\\(\|)/g, showdown.helper.escapeCharactersCallback);

        // parse multi column tables
        text = text.replace(tableRgx, parseTable);

        // parse one column tables
        text = text.replace(singeColTblRgx, parseTable);

        text = globals.converter._dispatch("makehtml.tables.after", text, options, globals).getText();

        return text;
    });

    showdown.subParser("makehtml.underline", function (text, options, globals) {
        "use strict";

        if (!options.underline) {
            return text;
        }

        text = globals.converter._dispatch("makehtml.underline.before", text, options, globals).getText();

        if (options.literalMidWordUnderscores) {
            text = text.replace(/\b___(\S[\s\S]*?)___\b/g, function (wm, txt) {
                return "<u>" + txt + "</u>";
            });
            text = text.replace(/\b__(\S[\s\S]*?)__\b/g, function (wm, txt) {
                return "<u>" + txt + "</u>";
            });
        } else {
            text = text.replace(/___(\S[\s\S]*?)___/g, function (wm, m) {
                return /\S$/.test(m) ? "<u>" + m + "</u>" : wm;
            });
            text = text.replace(/__(\S[\s\S]*?)__/g, function (wm, m) {
                return /\S$/.test(m) ? "<u>" + m + "</u>" : wm;
            });
        }

        // escape remaining underscores to prevent them being parsed by italic and bold
        text = text.replace(/(_)/g, showdown.helper.escapeCharactersCallback);

        text = globals.converter._dispatch("makehtml.underline.after", text, options, globals).getText();

        return text;
    });

    /**
     * Swap back in all the special characters we've hidden.
     */
    showdown.subParser("makehtml.unescapeSpecialChars", function (text, options, globals) {
        "use strict";
        text = globals.converter._dispatch("makehtml.unescapeSpecialChars.before", text, options, globals).getText();

        text = text.replace(/¨E(\d+)E/g, function (wholeMatch, m1) {
            var charCodeToReplace = parseInt(m1);
            return String.fromCharCode(charCodeToReplace);
        });

        text = globals.converter._dispatch("makehtml.unescapeSpecialChars.after", text, options, globals).getText();
        return text;
    });

    showdown.subParser("makeMarkdown.blockquote", function (node, globals) {
        "use strict";

        var txt = "";
        if (node.hasChildNodes()) {
            var children = node.childNodes,
                childrenLength = children.length;

            for (var i = 0; i < childrenLength; ++i) {
                var innerTxt = showdown.subParser("makeMarkdown.node")(children[i], globals);

                if (innerTxt === "") {
                    continue;
                }
                txt += innerTxt;
            }
        }
        // cleanup
        txt = txt.trim();
        txt = "> " + txt.split("\n").join("\n> ");
        return txt;
    });

    showdown.subParser("makeMarkdown.break", function () {
        "use strict";

        return "  \n";
    });

    showdown.subParser("makeMarkdown.codeBlock", function (node, globals) {
        "use strict";

        var lang = node.getAttribute("language"),
            num = node.getAttribute("precodenum");
        return "```" + lang + "\n" + globals.preList[num] + "\n```";
    });

    showdown.subParser("makeMarkdown.codeSpan", function (node) {
        "use strict";

        return "`" + node.innerHTML + "`";
    });

    showdown.subParser("makeMarkdown.emphasis", function (node, globals) {
        "use strict";

        var txt = "";
        if (node.hasChildNodes()) {
            txt += "*";
            var children = node.childNodes,
                childrenLength = children.length;
            for (var i = 0; i < childrenLength; ++i) {
                txt += showdown.subParser("makeMarkdown.node")(children[i], globals);
            }
            txt += "*";
        }
        return txt;
    });

    showdown.subParser("makeMarkdown.header", function (node, globals, headerLevel) {
        "use strict";

        var headerMark = new Array(headerLevel + 1).join("#"),
            txt = "";

        if (node.hasChildNodes()) {
            txt = headerMark + " ";
            var children = node.childNodes,
                childrenLength = children.length;

            for (var i = 0; i < childrenLength; ++i) {
                txt += showdown.subParser("makeMarkdown.node")(children[i], globals);
            }
        }
        return txt;
    });

    showdown.subParser("makeMarkdown.hr", function () {
        "use strict";

        return "---";
    });

    showdown.subParser("makeMarkdown.image", function (node) {
        "use strict";

        var txt = "";
        if (node.hasAttribute("src")) {
            txt += "![" + node.getAttribute("alt") + "](";
            txt += "<" + node.getAttribute("src") + ">";
            if (node.hasAttribute("width") && node.hasAttribute("height")) {
                txt += " =" + node.getAttribute("width") + "x" + node.getAttribute("height");
            }

            if (node.hasAttribute("title")) {
                txt += ' "' + node.getAttribute("title") + '"';
            }
            txt += ")";
        }
        return txt;
    });

    showdown.subParser("makeMarkdown.input", function (node, globals) {
        "use strict";

        var txt = "";
        if (node.getAttribute("checked") !== null) {
            txt += "[x]";
        } else {
            txt += "[ ]";
        }
        var children = node.childNodes,
            childrenLength = children.length;
        for (var i = 0; i < childrenLength; ++i) {
            txt += showdown.subParser("makeMarkdown.node")(children[i], globals);
        }
        return txt;
    });

    showdown.subParser("makeMarkdown.links", function (node, globals) {
        "use strict";

        var txt = "";
        if (node.hasChildNodes() && node.hasAttribute("href")) {
            var children = node.childNodes,
                childrenLength = children.length;
            txt = "[";
            for (var i = 0; i < childrenLength; ++i) {
                txt += showdown.subParser("makeMarkdown.node")(children[i], globals);
            }
            txt += "](";
            txt += "<" + node.getAttribute("href") + ">";
            if (node.hasAttribute("title")) {
                txt += ' "' + node.getAttribute("title") + '"';
            }
            txt += ")";
        }
        return txt;
    });

    showdown.subParser("makeMarkdown.list", function (node, globals, type) {
        "use strict";

        var txt = "";
        if (!node.hasChildNodes()) {
            return "";
        }
        var listItems = node.childNodes,
            listItemsLenght = listItems.length,
            listNum = node.getAttribute("start") || 1;

        for (var i = 0; i < listItemsLenght; ++i) {
            if (typeof listItems[i].tagName === "undefined" || listItems[i].tagName.toLowerCase() !== "li") {
                continue;
            }

            // define the bullet to use in list
            var bullet = "";
            if (type === "ol") {
                bullet = listNum.toString() + ". ";
            } else {
                bullet = "- ";
            }

            // parse list item
            txt += bullet + showdown.subParser("makeMarkdown.listItem")(listItems[i], globals);
            ++listNum;
        }

        return txt.trim();
    });

    showdown.subParser("makeMarkdown.listItem", function (node, globals) {
        "use strict";

        var listItemTxt = "";

        var children = node.childNodes,
            childrenLenght = children.length;

        for (var i = 0; i < childrenLenght; ++i) {
            listItemTxt += showdown.subParser("makeMarkdown.node")(children[i], globals);
        }
        // if it's only one liner, we need to add a newline at the end
        if (!/\n$/.test(listItemTxt)) {
            listItemTxt += "\n";
        } else {
            // it's multiparagraph, so we need to indent
            listItemTxt = listItemTxt
                .split("\n")
                .join("\n    ")
                .replace(/^ {4}$/gm, "")
                .replace(/\n\n+/g, "\n\n");
        }

        return listItemTxt;
    });

    showdown.subParser("makeMarkdown.node", function (node, globals, spansOnly) {
        "use strict";

        spansOnly = spansOnly || false;

        var txt = "";

        // edge case of text without wrapper paragraph
        if (node.nodeType === 3) {
            return showdown.subParser("makeMarkdown.txt")(node, globals);
        }

        // HTML comment
        if (node.nodeType === 8) {
            return "<!--" + node.data + "-->\n\n";
        }

        // process only node elements
        if (node.nodeType !== 1) {
            return "";
        }

        var tagName = node.tagName.toLowerCase();

        switch (tagName) {
            //
            // BLOCKS
            //
            case "h1":
                if (!spansOnly) {
                    txt = showdown.subParser("makeMarkdown.header")(node, globals, 1) + "\n\n";
                }
                break;
            case "h2":
                if (!spansOnly) {
                    txt = showdown.subParser("makeMarkdown.header")(node, globals, 2) + "\n\n";
                }
                break;
            case "h3":
                if (!spansOnly) {
                    txt = showdown.subParser("makeMarkdown.header")(node, globals, 3) + "\n\n";
                }
                break;
            case "h4":
                if (!spansOnly) {
                    txt = showdown.subParser("makeMarkdown.header")(node, globals, 4) + "\n\n";
                }
                break;
            case "h5":
                if (!spansOnly) {
                    txt = showdown.subParser("makeMarkdown.header")(node, globals, 5) + "\n\n";
                }
                break;
            case "h6":
                if (!spansOnly) {
                    txt = showdown.subParser("makeMarkdown.header")(node, globals, 6) + "\n\n";
                }
                break;

            case "p":
                if (!spansOnly) {
                    txt = showdown.subParser("makeMarkdown.paragraph")(node, globals) + "\n\n";
                }
                break;

            case "blockquote":
                if (!spansOnly) {
                    txt = showdown.subParser("makeMarkdown.blockquote")(node, globals) + "\n\n";
                }
                break;

            case "hr":
                if (!spansOnly) {
                    txt = showdown.subParser("makeMarkdown.hr")(node, globals) + "\n\n";
                }
                break;

            case "ol":
                if (!spansOnly) {
                    txt = showdown.subParser("makeMarkdown.list")(node, globals, "ol") + "\n\n";
                }
                break;

            case "ul":
                if (!spansOnly) {
                    txt = showdown.subParser("makeMarkdown.list")(node, globals, "ul") + "\n\n";
                }
                break;

            case "precode":
                if (!spansOnly) {
                    txt = showdown.subParser("makeMarkdown.codeBlock")(node, globals) + "\n\n";
                }
                break;

            case "pre":
                if (!spansOnly) {
                    txt = showdown.subParser("makeMarkdown.pre")(node, globals) + "\n\n";
                }
                break;

            case "table":
                if (!spansOnly) {
                    txt = showdown.subParser("makeMarkdown.table")(node, globals) + "\n\n";
                }
                break;

            //
            // SPANS
            //
            case "code":
                txt = showdown.subParser("makeMarkdown.codeSpan")(node, globals);
                break;

            case "em":
            case "i":
                txt = showdown.subParser("makeMarkdown.emphasis")(node, globals);
                break;

            case "strong":
            case "b":
                txt = showdown.subParser("makeMarkdown.strong")(node, globals);
                break;

            case "del":
                txt = showdown.subParser("makeMarkdown.strikethrough")(node, globals);
                break;

            case "a":
                txt = showdown.subParser("makeMarkdown.links")(node, globals);
                break;

            case "img":
                txt = showdown.subParser("makeMarkdown.image")(node, globals);
                break;

            case "br":
                txt = showdown.subParser("makeMarkdown.break")(node, globals);
                break;

            case "input":
                txt = showdown.subParser("makeMarkdown.input")(node, globals);
                break;

            default:
                txt = node.outerHTML + "\n\n";
        }

        // common normalization
        // TODO eventually

        return txt;
    });

    showdown.subParser("makeMarkdown.paragraph", function (node, globals) {
        "use strict";

        var txt = "";
        if (node.hasChildNodes()) {
            var children = node.childNodes,
                childrenLength = children.length;
            for (var i = 0; i < childrenLength; ++i) {
                txt += showdown.subParser("makeMarkdown.node")(children[i], globals);
            }
        }

        // some text normalization
        txt = txt.trim();

        return txt;
    });

    showdown.subParser("makeMarkdown.pre", function (node, globals) {
        "use strict";

        var num = node.getAttribute("prenum");
        return "<pre>" + globals.preList[num] + "</pre>";
    });

    showdown.subParser("makeMarkdown.strikethrough", function (node, globals) {
        "use strict";

        var txt = "";
        if (node.hasChildNodes()) {
            txt += "~~";
            var children = node.childNodes,
                childrenLength = children.length;
            for (var i = 0; i < childrenLength; ++i) {
                txt += showdown.subParser("makeMarkdown.node")(children[i], globals);
            }
            txt += "~~";
        }
        return txt;
    });

    showdown.subParser("makeMarkdown.strong", function (node, globals) {
        "use strict";

        var txt = "";
        if (node.hasChildNodes()) {
            txt += "**";
            var children = node.childNodes,
                childrenLength = children.length;
            for (var i = 0; i < childrenLength; ++i) {
                txt += showdown.subParser("makeMarkdown.node")(children[i], globals);
            }
            txt += "**";
        }
        return txt;
    });

    showdown.subParser("makeMarkdown.table", function (node, globals) {
        "use strict";

        var txt = "",
            tableArray = [[], []],
            headings = node.querySelectorAll("thead>tr>th"),
            rows = node.querySelectorAll("tbody>tr"),
            i,
            ii;
        for (i = 0; i < headings.length; ++i) {
            var headContent = showdown.subParser("makeMarkdown.tableCell")(headings[i], globals),
                allign = "---";

            if (headings[i].hasAttribute("style")) {
                var style = headings[i].getAttribute("style").toLowerCase().replace(/\s/g, "");
                switch (style) {
                    case "text-align:left;":
                        allign = ":---";
                        break;
                    case "text-align:right;":
                        allign = "---:";
                        break;
                    case "text-align:center;":
                        allign = ":---:";
                        break;
                }
            }
            tableArray[0][i] = headContent.trim();
            tableArray[1][i] = allign;
        }

        for (i = 0; i < rows.length; ++i) {
            var r = tableArray.push([]) - 1,
                cols = rows[i].getElementsByTagName("td");

            for (ii = 0; ii < headings.length; ++ii) {
                var cellContent = " ";
                if (typeof cols[ii] !== "undefined") {
                    cellContent = showdown.subParser("makeMarkdown.tableCell")(cols[ii], globals);
                }
                tableArray[r].push(cellContent);
            }
        }

        var cellSpacesCount = 3;
        for (i = 0; i < tableArray.length; ++i) {
            for (ii = 0; ii < tableArray[i].length; ++ii) {
                var strLen = tableArray[i][ii].length;
                if (strLen > cellSpacesCount) {
                    cellSpacesCount = strLen;
                }
            }
        }

        for (i = 0; i < tableArray.length; ++i) {
            for (ii = 0; ii < tableArray[i].length; ++ii) {
                if (i === 1) {
                    if (tableArray[i][ii].slice(-1) === ":") {
                        tableArray[i][ii] = showdown.helper.padEnd(tableArray[i][ii].slice(0, -1), cellSpacesCount - 1, "-") + ":";
                    } else {
                        tableArray[i][ii] = showdown.helper.padEnd(tableArray[i][ii], cellSpacesCount, "-");
                    }
                } else {
                    tableArray[i][ii] = showdown.helper.padEnd(tableArray[i][ii], cellSpacesCount);
                }
            }
            txt += "| " + tableArray[i].join(" | ") + " |\n";
        }

        return txt.trim();
    });

    showdown.subParser("makeMarkdown.tableCell", function (node, globals) {
        "use strict";

        var txt = "";
        if (!node.hasChildNodes()) {
            return "";
        }
        var children = node.childNodes,
            childrenLength = children.length;

        for (var i = 0; i < childrenLength; ++i) {
            txt += showdown.subParser("makeMarkdown.node")(children[i], globals, true);
        }
        return txt.trim();
    });

    showdown.subParser("makeMarkdown.txt", function (node) {
        "use strict";

        var txt = node.nodeValue;

        // multiple spaces are collapsed
        txt = txt.replace(/ +/g, " ");

        // replace the custom ¨NBSP; with a space
        txt = txt.replace(/¨NBSP;/g, " ");

        // ", <, > and & should replace escaped html entities
        txt = showdown.helper.unescapeHTMLEntities(txt);

        // escape markdown magic characters
        // emphasis, strong and strikethrough - can appear everywhere
        // we also escape pipe (|) because of tables
        // and escape ` because of code blocks and spans
        txt = txt.replace(/([*_~|`])/g, "\\$1");

        // escape > because of blockquotes
        txt = txt.replace(/^(\s*)>/g, "\\$1>");

        // hash character, only troublesome at the beginning of a line because of headers
        txt = txt.replace(/^#/gm, "\\#");

        // horizontal rules
        txt = txt.replace(/^(\s*)([-=]{3,})(\s*)$/, "$1\\$2$3");

        // dot, because of ordered lists, only troublesome at the beginning of a line when preceded by an integer
        txt = txt.replace(/^( {0,3}\d+)\./gm, "$1\\.");

        // +, * and -, at the beginning of a line becomes a list, so we need to escape them also (asterisk was already escaped)
        txt = txt.replace(/^( {0,3})([+-])/gm, "$1\\$2");

        // images and links, ] followed by ( is problematic, so we escape it
        txt = txt.replace(/]([\s]*)\(/g, "\\]$1\\(");

        // reference URIs must also be escaped
        txt = txt.replace(/^ {0,3}\[([\S \t]*?)]:/gm, "\\[$1]:");

        return txt;
    });

    /**
     * Created by Estevao on 31-05-2015.
     */

    /**
     * Showdown Converter class
     * @class
     * @param {object} [converterOptions]
     * @returns {Converter}
     */
    showdown.Converter = function (converterOptions) {
        "use strict";

        var /**
             * Options used by this converter
             * @private
             * @type {{}}
             */
            options = {},
            /**
             * Language extensions used by this converter
             * @private
             * @type {Array}
             */
            langExtensions = [],
            /**
             * Output modifiers extensions used by this converter
             * @private
             * @type {Array}
             */
            outputModifiers = [],
            /**
             * Event listeners
             * @private
             * @type {{}}
             */
            listeners = {},
            /**
             * The flavor set in this converter
             */
            setConvFlavor = setFlavor,
            /**
             * Metadata of the document
             * @type {{parsed: {}, raw: string, format: string}}
             */
            metadata = {
                parsed: {},
                raw: "",
                format: "",
            };

        _constructor();

        /**
         * Converter constructor
         * @private
         */
        function _constructor() {
            converterOptions = converterOptions || {};

            for (var gOpt in globalOptions) {
                if (globalOptions.hasOwnProperty(gOpt)) {
                    options[gOpt] = globalOptions[gOpt];
                }
            }

            // Merge options
            if (typeof converterOptions === "object") {
                for (var opt in converterOptions) {
                    if (converterOptions.hasOwnProperty(opt)) {
                        options[opt] = converterOptions[opt];
                    }
                }
            } else {
                throw Error("Converter expects the passed parameter to be an object, but " + typeof converterOptions + " was passed instead.");
            }

            if (options.extensions) {
                showdown.helper.forEach(options.extensions, _parseExtension);
            }
        }

        /**
         * Parse extension
         * @param {*} ext
         * @param {string} [name='']
         * @private
         */
        function _parseExtension(ext, name) {
            name = name || null;
            // If it's a string, the extension was previously loaded
            if (showdown.helper.isString(ext)) {
                ext = showdown.helper.stdExtName(ext);
                name = ext;

                // LEGACY_SUPPORT CODE
                if (showdown.extensions[ext]) {
                    console.warn("DEPRECATION WARNING: " + ext + " is an old extension that uses a deprecated loading method." + "Please inform the developer that the extension should be updated!");
                    legacyExtensionLoading(showdown.extensions[ext], ext);
                    return;
                    // END LEGACY SUPPORT CODE
                } else if (!showdown.helper.isUndefined(extensions[ext])) {
                    ext = extensions[ext];
                } else {
                    throw Error('Extension "' + ext + '" could not be loaded. It was either not found or is not a valid extension.');
                }
            }

            if (typeof ext === "function") {
                ext = ext();
            }

            if (!showdown.helper.isArray(ext)) {
                ext = [ext];
            }

            var validExt = validate(ext, name);
            if (!validExt.valid) {
                throw Error(validExt.error);
            }

            for (var i = 0; i < ext.length; ++i) {
                switch (ext[i].type) {
                    case "lang":
                        langExtensions.push(ext[i]);
                        break;

                    case "output":
                        outputModifiers.push(ext[i]);
                        break;
                }
                if (ext[i].hasOwnProperty("listeners")) {
                    for (var ln in ext[i].listeners) {
                        if (ext[i].listeners.hasOwnProperty(ln)) {
                            listen(ln, ext[i].listeners[ln]);
                        }
                    }
                }
            }
        }

        /**
         * LEGACY_SUPPORT
         * @param {*} ext
         * @param {string} name
         */
        function legacyExtensionLoading(ext, name) {
            if (typeof ext === "function") {
                ext = ext(new showdown.Converter());
            }
            if (!showdown.helper.isArray(ext)) {
                ext = [ext];
            }
            var valid = validate(ext, name);

            if (!valid.valid) {
                throw Error(valid.error);
            }

            for (var i = 0; i < ext.length; ++i) {
                switch (ext[i].type) {
                    case "lang":
                        langExtensions.push(ext[i]);
                        break;
                    case "output":
                        outputModifiers.push(ext[i]);
                        break;
                    default: // should never reach here
                        throw Error("Extension loader error: Type unrecognized!!!");
                }
            }
        }

        /**
         * Listen to an event
         * @param {string} name
         * @param {function} callback
         */
        function listen(name, callback) {
            if (!showdown.helper.isString(name)) {
                throw Error("Invalid argument in converter.listen() method: name must be a string, but " + typeof name + " given");
            }

            if (typeof callback !== "function") {
                throw Error("Invalid argument in converter.listen() method: callback must be a function, but " + typeof callback + " given");
            }
            name = name.toLowerCase();
            if (!listeners.hasOwnProperty(name)) {
                listeners[name] = [];
            }
            listeners[name].push(callback);
        }

        function rTrimInputText(text) {
            var rsp = text.match(/^\s*/)[0].length,
                rgx = new RegExp("^\\s{0," + rsp + "}", "gm");
            return text.replace(rgx, "");
        }

        /**
         *
         * @param {string} evtName Event name
         * @param {string} text Text
         * @param {{}} options Converter Options
         * @param {{}} globals Converter globals
         * @param {{}} [pParams] extra params for event
         * @returns showdown.helper.Event
         * @private
         */
        this._dispatch = function dispatch(evtName, text, options, globals, pParams) {
            evtName = evtName.toLowerCase();
            var params = pParams || {};
            params.converter = this;
            params.text = text;
            params.options = options;
            params.globals = globals;
            var event = new showdown.helper.Event(evtName, text, params);

            if (listeners.hasOwnProperty(evtName)) {
                for (var ei = 0; ei < listeners[evtName].length; ++ei) {
                    var nText = listeners[evtName][ei](event);
                    if (nText && typeof nText !== "undefined") {
                        event.setText(nText);
                    }
                }
            }
            return event;
        };

        /**
         * Listen to an event
         * @param {string} name
         * @param {function} callback
         * @returns {showdown.Converter}
         */
        this.listen = function (name, callback) {
            listen(name, callback);
            return this;
        };

        /**
         * Converts a markdown string into HTML string
         * @param {string} text
         * @returns {*}
         */
        this.makeHtml = function (text) {
            //check if text is not falsy
            if (!text) {
                return text;
            }

            var globals = {
                gHtmlBlocks: [],
                gHtmlMdBlocks: [],
                gHtmlSpans: [],
                gUrls: {},
                gTitles: {},
                gDimensions: {},
                gListLevel: 0,
                hashLinkCounts: {},
                langExtensions: langExtensions,
                outputModifiers: outputModifiers,
                converter: this,
                ghCodeBlocks: [],
                metadata: {
                    parsed: {},
                    raw: "",
                    format: "",
                },
            };

            // This lets us use ¨ trema as an escape char to avoid md5 hashes
            // The choice of character is arbitrary; anything that isn't
            // magic in Markdown will work.
            text = text.replace(/¨/g, "¨T");

            // Replace $ with ¨D
            // RegExp interprets $ as a special character
            // when it's in a replacement string
            text = text.replace(/\$/g, "¨D");

            // Standardize line endings
            text = text.replace(/\r\n/g, "\n"); // DOS to Unix
            text = text.replace(/\r/g, "\n"); // Mac to Unix

            // Stardardize line spaces
            text = text.replace(/\u00A0/g, "&nbsp;");

            if (options.smartIndentationFix) {
                text = rTrimInputText(text);
            }

            // Make sure text begins and ends with a couple of newlines:
            text = "\n\n" + text + "\n\n";

            // detab
            text = showdown.subParser("makehtml.detab")(text, options, globals);

            /**
             * Strip any lines consisting only of spaces and tabs.
             * This makes subsequent regexs easier to write, because we can
             * match consecutive blank lines with /\n+/ instead of something
             * contorted like /[ \t]*\n+/
             */
            text = text.replace(/^[ \t]+$/gm, "");

            //run languageExtensions
            showdown.helper.forEach(langExtensions, function (ext) {
                text = showdown.subParser("makehtml.runExtension")(ext, text, options, globals);
            });

            // run the sub parsers
            text = showdown.subParser("makehtml.metadata")(text, options, globals);
            text = showdown.subParser("makehtml.hashPreCodeTags")(text, options, globals);
            text = showdown.subParser("makehtml.githubCodeBlocks")(text, options, globals);
            text = showdown.subParser("makehtml.hashHTMLBlocks")(text, options, globals);
            text = showdown.subParser("makehtml.hashCodeTags")(text, options, globals);
            text = showdown.subParser("makehtml.stripLinkDefinitions")(text, options, globals);
            text = showdown.subParser("makehtml.blockGamut")(text, options, globals);
            text = showdown.subParser("makehtml.unhashHTMLSpans")(text, options, globals);
            text = showdown.subParser("makehtml.unescapeSpecialChars")(text, options, globals);

            // attacklab: Restore dollar signs
            text = text.replace(/¨D/g, "$$");

            // attacklab: Restore tremas
            text = text.replace(/¨T/g, "¨");

            // render a complete html document instead of a partial if the option is enabled
            text = showdown.subParser("makehtml.completeHTMLDocument")(text, options, globals);

            // Run output modifiers
            showdown.helper.forEach(outputModifiers, function (ext) {
                text = showdown.subParser("makehtml.runExtension")(ext, text, options, globals);
            });

            // update metadata
            metadata = globals.metadata;
            return text;
        };

        /**
         * Converts an HTML string into a markdown string
         * @param src
         * @returns {string}
         */
        this.makeMarkdown = function (src) {
            // replace \r\n with \n
            src = src.replace(/\r\n/g, "\n");
            src = src.replace(/\r/g, "\n"); // old macs

            // due to an edge case, we need to find this: > <
            // to prevent removing of non silent white spaces
            // ex: <em>this is</em> <strong>sparta</strong>
            src = src.replace(/>[ \t]+</, ">¨NBSP;<");

            var doc = showdown.helper.document.createElement("div");
            doc.innerHTML = src;

            var globals = {
                preList: substitutePreCodeTags(doc),
            };

            // remove all newlines and collapse spaces
            clean(doc);

            // some stuff, like accidental reference links must now be escaped
            // TODO
            // doc.innerHTML = doc.innerHTML.replace(/\[[\S\t ]]/);

            var nodes = doc.childNodes,
                mdDoc = "";

            for (var i = 0; i < nodes.length; i++) {
                mdDoc += showdown.subParser("makeMarkdown.node")(nodes[i], globals);
            }

            function clean(node) {
                for (var n = 0; n < node.childNodes.length; ++n) {
                    var child = node.childNodes[n];
                    if (child.nodeType === 3) {
                        if (!/\S/.test(child.nodeValue) && !/^[ ]+$/.test(child.nodeValue)) {
                            node.removeChild(child);
                            --n;
                        } else {
                            child.nodeValue = child.nodeValue.split("\n").join(" ");
                            child.nodeValue = child.nodeValue.replace(/(\s)+/g, "$1");
                        }
                    } else if (child.nodeType === 1) {
                        clean(child);
                    }
                }
            }

            // find all pre tags and replace contents with placeholder
            // we need this so that we can remove all indentation from html
            // to ease up parsing
            function substitutePreCodeTags(doc) {
                var pres = doc.querySelectorAll("pre"),
                    presPH = [];

                for (var i = 0; i < pres.length; ++i) {
                    if (pres[i].childElementCount === 1 && pres[i].firstChild.tagName.toLowerCase() === "code") {
                        var content = pres[i].firstChild.innerHTML.trim(),
                            language = pres[i].firstChild.getAttribute("data-language") || "";

                        // if data-language attribute is not defined, then we look for class language-*
                        if (language === "") {
                            var classes = pres[i].firstChild.className.split(" ");
                            for (var c = 0; c < classes.length; ++c) {
                                var matches = classes[c].match(/^language-(.+)$/);
                                if (matches !== null) {
                                    language = matches[1];
                                    break;
                                }
                            }
                        }

                        // unescape html entities in content
                        content = showdown.helper.unescapeHTMLEntities(content);

                        presPH.push(content);
                        pres[i].outerHTML = '<precode language="' + language + '" precodenum="' + i.toString() + '"></precode>';
                    } else {
                        presPH.push(pres[i].innerHTML);
                        pres[i].innerHTML = "";
                        pres[i].setAttribute("prenum", i.toString());
                    }
                }
                return presPH;
            }

            return mdDoc;
        };

        /**
         * Set an option of this Converter instance
         * @param {string} key
         * @param {*} value
         */
        this.setOption = function (key, value) {
            options[key] = value;
        };

        /**
         * Get the option of this Converter instance
         * @param {string} key
         * @returns {*}
         */
        this.getOption = function (key) {
            return options[key];
        };

        /**
         * Get the options of this Converter instance
         * @returns {{}}
         */
        this.getOptions = function () {
            return options;
        };

        /**
         * Add extension to THIS converter
         * @param {{}} extension
         * @param {string} [name=null]
         */
        this.addExtension = function (extension, name) {
            name = name || null;
            _parseExtension(extension, name);
        };

        /**
         * Use a global registered extension with THIS converter
         * @param {string} extensionName Name of the previously registered extension
         */
        this.useExtension = function (extensionName) {
            _parseExtension(extensionName);
        };

        /**
         * Set the flavor THIS converter should use
         * @param {string} name
         */
        this.setFlavor = function (name) {
            if (!flavor.hasOwnProperty(name)) {
                throw Error(name + " flavor was not found");
            }
            var preset = flavor[name];
            setConvFlavor = name;
            for (var option in preset) {
                if (preset.hasOwnProperty(option)) {
                    options[option] = preset[option];
                }
            }
        };

        /**
         * Get the currently set flavor of this converter
         * @returns {string}
         */
        this.getFlavor = function () {
            return setConvFlavor;
        };

        /**
         * Remove an extension from THIS converter.
         * Note: This is a costly operation. It's better to initialize a new converter
         * and specify the extensions you wish to use
         * @param {Array} extension
         */
        this.removeExtension = function (extension) {
            if (!showdown.helper.isArray(extension)) {
                extension = [extension];
            }
            for (var a = 0; a < extension.length; ++a) {
                var ext = extension[a];
                for (var i = 0; i < langExtensions.length; ++i) {
                    if (langExtensions[i] === ext) {
                        langExtensions.splice(i, 1);
                    }
                }
                for (var ii = 0; ii < outputModifiers.length; ++ii) {
                    if (outputModifiers[ii] === ext) {
                        outputModifiers.splice(ii, 1);
                    }
                }
            }
        };

        /**
         * Get all extension of THIS converter
         * @returns {{language: Array, output: Array}}
         */
        this.getAllExtensions = function () {
            return {
                language: langExtensions,
                output: outputModifiers,
            };
        };

        /**
         * Get the metadata of the previously parsed document
         * @param raw
         * @returns {string|{}}
         */
        this.getMetadata = function (raw) {
            if (raw) {
                return metadata.raw;
            } else {
                return metadata.parsed;
            }
        };

        /**
         * Get the metadata format of the previously parsed document
         * @returns {string}
         */
        this.getMetadataFormat = function () {
            return metadata.format;
        };

        /**
         * Private: set a single key, value metadata pair
         * @param {string} key
         * @param {string} value
         */
        this._setMetadataPair = function (key, value) {
            metadata.parsed[key] = value;
        };

        /**
         * Private: set metadata format
         * @param {string} format
         */
        this._setMetadataFormat = function (format) {
            metadata.format = format;
        };

        /**
         * Private: set metadata raw text
         * @param {string} raw
         */
        this._setMetadataRaw = function (raw) {
            metadata.raw = raw;
        };
    };

    var root = this;

    // AMD Loader
    if (typeof define === "function" && define.amd) {
        define(function () {
            "use strict";
            return showdown;
        });

        // CommonJS/nodeJS Loader
    } else if (typeof module !== "undefined" && module.exports) {
        module.exports = showdown;

        // Regular Browser loader
    } else {
        root.showdown = showdown;
    }
}).call(this);

//# sourceMappingURL=showdown.js.map
