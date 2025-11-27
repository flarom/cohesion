showdown.extension("style", function() {
    // flatten one nested level
    function flattenNestedOneLevel(css) {
        // ignore css comments
        css = css.replace(/\/\*[\s\S]*?\*\//g, "");

        let out = "";
        // search for parent blocks (selector { inner })
        const parentRegex = /([^{]+)\{([^}]*)\}/g;
        let m;
        while ((m = parentRegex.exec(css))) {
            const parentSel = m[1].trim();
            let inner = m[2];

            // search for child blocks: child { decls }
            const nestedRegex = /([^\{\}]+)\{([^}]+)\}/g;
            let nm;
            const nestedRules = [];

            // remove nested blocks fom parent declarations
            while ((nm = nestedRegex.exec(inner))) {
                const childSel = nm[1].trim();
                const childDecls = nm[2].trim();
                // combine selectors
                const combined = childSel.split(",").map(s => (parentSel + " " + s.trim())).join(", ");
                nestedRules.push(combined + " {" + childDecls + "}");
                // remove child block from inner, to keep only parent declarations
                inner = inner.replace(nm[0], "");
            }

            if (inner.trim()) {
                out += parentSel + " {" + inner.trim() + "}\n";
            }
            for (const r of nestedRules) out += r + "\n";
        }

        return out.trim();
    }

    // rewrite url(resources/...) to data urls (async)
    async function rewriteResourceURLs(css) {
        const urlRegex = /url\((['"]?)(resources\/[^'")]+)\1\)/g;

        // collect promisses and filepaths in order
        const jobs = [];
        let match;
        while ((match = urlRegex.exec(css))) {
            jobs.push({fullMatch: match[0], quote: match[1], path: match[2], index: match.index});
        }

        // dedupe
        const byPath = {};
        for (const j of jobs) {
            if (!byPath[j.path]) byPath[j.path] = [];
            byPath[j.path].push(j);
        }

        const replacements = {};
        const paths = Object.keys(byPath);
        for (const path of paths) {
            const fileName = path.slice("resources/".length);
            // Resources.resolveFSItem is async and returns dataURL
            try {
                const dataUrl = await Resources.resolveFSItem(fileName);
                if (dataUrl) replacements[path] = dataUrl;
            } catch (e) {
                replacements[path] = null;
            }
        }

        // build final CSS
        const finalCss = css.replace(urlRegex, (m, q, p) => {
            const rep = replacements[p];
            if (rep) return `url(${q}${rep}${q})`;
            return m;
        });

        return finalCss;
    }

    // inject style onto preview
    async function injectStylesAsync(preview, styles) {
        for (let css of styles) {
            // flatten one nested level
            css = flattenNestedOneLevel(css);

            // rewite resources
            css = await rewriteResourceURLs(css);

            // create <style> tag
            const tag = document.createElement("style");
            tag.setAttribute("data-injected-by", "styleEnhancer");
            tag.textContent = css;
            preview.appendChild(tag);
        }
    }

    function extractStyles(html) {
        const regex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
        let styles = [];
        let match;
        while ((match = regex.exec(html))) {
            styles.push(match[1]);
        }
        return styles;
    }

    return [
        {
            type: "output",
            filter: function (text, converter, options) {
                const rawStyles = extractStyles(text);

                // remove <style> from base HTML
                text = text.replace(/<style[\s\S]*?<\/style>/gi, "");

                // inject CSS after initial HTML render
                setTimeout(async () => {
                    const preview = document.querySelector(".preview") || document.body;
                    if (!rawStyles.length) return;
                    try {
                        await injectStylesAsync(preview, rawStyles);
                    } catch (e) {
                        console.error("styleEnhancer error:", e);
                    }
                }, 0);

                return text;
            }
        }
    ];
});
