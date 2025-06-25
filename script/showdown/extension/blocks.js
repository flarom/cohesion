(function () {
    function parseBlocks(text, blockHandlers) {
        text = text.replace(/\\:::/g, '§§§ESCAPED_BLOCK_START§§§');

        const htmlBlocks = [];
        const codeBlocks = [];

        text = text.replace(
            /<([a-zA-Z0-9]+)(?![^>]*markdown\s*=\s*["']?1["']?)[^>]*>[\s\S]*?<\/\1>/g,
            function (match) {
                htmlBlocks.push(match);
                return `§§§HTMLBLOCK${htmlBlocks.length - 1}§§§`;
            }
        );

        text = text.replace(/((```|~~~)[\s\S]*?\2|`[^`\n]+`)/g, function (match) {
            codeBlocks.push(match);
            return `§§§CODEBLOCK${codeBlocks.length - 1}§§§`;
        });

        text = text.replace(
            /:::(\w+)(?:\[(.*?)\])?\s*\n([\s\S]+?)\n:::/g,
            function (_, type, param, content) {
                if (blockHandlers[type]) {
                    return blockHandlers[type].placeholder(type, param, content);
                }
                return _;
            }
        );

        text = text.replace(/§§§CODEBLOCK(\d+)§§§/g, (_, i) => codeBlocks[i]);
        text = text.replace(/§§§HTMLBLOCK(\d+)§§§/g, (_, i) => htmlBlocks[i]);

        text = text.replace(/§§§ESCAPED_BLOCK_START§§§/g, ':::');

        return text;
    }

    function registerBlock(type, toHtml) {
        return {
            placeholder: (type, param, content) =>
                `§§§BLOCK_${type.toUpperCase()}_START§§§${param || ''}§§§BLOCK_MIDDLE§§§${content.trim()}§§§BLOCK_END§§§`,
            output: {
                type: 'output',
                regex: new RegExp(
                    `§§§BLOCK_${type.toUpperCase()}_START§§§([\\s\\S]*?)§§§BLOCK_MIDDLE§§§([\\s\\S]*?)§§§BLOCK_END§§§`,
                    'g'
                ),
                replace: function (_, param, content) {
                    return toHtml(param, content);
                }
            }
        };
    }

    const detailsBlock = registerBlock('details', function (param, content) {
        const summary = (param || '').trim();
        const innerHtml = new showdown.Converter().makeHtml(content);
        return `<details><summary title='Click to expand'><span>${summary}</span></summary>\n<div class='content'>${innerHtml}</div>\n</details>`;
    });

    const csvBlock = registerBlock('csv', function (param, content) {
        const sep = (param && param.length > 0) ? param : ',';
        const lines = content.trim().split('\n').filter(Boolean);
        if (lines.length === 0) return '';
        const escape = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const rows = lines.map(line => line.split(sep).map(cell => escape(cell.trim())));
        const header = rows[0];
        const body = rows.slice(1);
        return `<table class="csv-block"><thead><tr>${header.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${body.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
    });

    const blockHandlers = {
        details: detailsBlock,
        csv: csvBlock
    };

    showdown.extension('blocks', function () {
        return [
            {
                type: 'lang',
                filter: function (text) {
                    return parseBlocks(text, blockHandlers);
                }
            },
            detailsBlock.output,
            csvBlock.output
        ];
    });
})();
