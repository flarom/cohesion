/**
 * @extension
 * @title Blocks and Admonitions
 * @author Cohesion
 * @version 1.0.0
 * @description Allows creation of custom block elements like admonitions, details, etc. using a simple markdown syntax.
 * @updateLink
 * @documentationLink
 * @icon article
 * @color var(--accent)
 */
BlockRegistry.register("DETAILS", {
    allowHtml: false,
    render: function (title, contentHtml) {
        return `<details markdown="1"><summary>${title?title:'More details'}</summary>${contentHtml}</details>`;
    },
});

BlockRegistry.register("NOTE", {
    allowHtml: false,
    render(param, content, ctx) {
        return `<blockquote class="admonition-quote quote-blue" ${ctx.id ? `id="${ctx.id}"` : ""}>
                    <label class="quote-blue-label quote-label">
                        <span class="icon">article</span>Note
                    </label>

                    <div class="quote-content">${content}</div>
                </blockquote>`;
    },
});

BlockRegistry.register("TIP", {
    allowHtml: false,
    render(param, content, ctx) {
        return `<blockquote class="admonition-quote quote-green" ${ctx.id ? `id="${ctx.id}"` : ""}>
                    <label class="quote-green-label quote-label">
                        <span class="icon">lightbulb</span>Tip  
                    </label>

                    <div class="quote-content">${content}</div>
                </blockquote>`;
    },
});

BlockRegistry.register("IMPORTANT", {
    allowHtml: false,
    render(param, content, ctx) {
        return `<blockquote class="admonition-quote quote-purple" ${ctx.id ? `id="${ctx.id}"` : ""}>
                    <label class="quote-purple-label quote-label">
                        <span class="icon">priority_high</span>Important  
                    </label>

                    <div class="quote-content">${content}</div>
                </blockquote>`;
    },
});

BlockRegistry.register("WARNING", {
    allowHtml: false,
    render(param, content, ctx) {
        return `<blockquote class="admonition-quote quote-yellow" ${ctx.id ? `id="${ctx.id}"` : ""}>
                    <label class="quote-yellow-label quote-label">
                        <span class="icon">warning</span>Warning  
                    </label>

                    <div class="quote-content">${content}</div>
                </blockquote>`;
    },
});

BlockRegistry.register("CAUTION", {
    allowHtml: false,
    render(param, content, ctx) {
        return `<blockquote class="admonition-quote quote-red" ${ctx.id ? `id="${ctx.id}"` : ""}>
                    <label class="quote-red-label quote-label">
                        <span class="icon">dangerous</span>Caution  
                    </label>

                    <div class="quote-content">${content}</div>
                </blockquote>`;
    },
});

customStyle.add("admonition-blocks", `
    
    .admonition-quote .quote-label {
        display: inline-flex;
        align-items: center;
        gap: 0.25em;
    }
    .admonition-quote .icon {
        font-size: 1.2em;
        user-select: none;
    }
    .admonition-quote.quote-blue   { border-left: 2px solid var(--color-blue);   .quote-label{ color: var(--color-blue);   } }
    .admonition-quote.quote-green  { border-left: 2px solid var(--color-green);  .quote-label{ color: var(--color-green);  } }
    .admonition-quote.quote-purple { border-left: 2px solid var(--color-purple); .quote-label{ color: var(--color-purple); } }
    .admonition-quote.quote-yellow { border-left: 2px solid var(--color-yellow); .quote-label{ color: var(--color-yellow); } }
    .admonition-quote.quote-red    { border-left: 2px solid var(--color-red);    .quote-label{ color: var(--color-red);    } }
`);