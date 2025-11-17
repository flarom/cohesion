showdown.extension('definition-list', function () {
    // Add /deflist slash command
    CommandRegistry.register("deflist", {
        description: "Insert a definition list",
        exec: function() { insertSnippet('${1:Term}\n: ${2:Definition}') }
    });

    return [{
        type: 'lang',
        filter: function (text) {
            const codeBlocks = [];

            text = text.replace(/((```|~~~)[\s\S]*?\2|`[^`\n]+`)/g, function (match) {
                codeBlocks.push(match);
                return `§§§CODEBLOCK${codeBlocks.length - 1}§§§`;
            });

            text = text.replace(/((?:^[^\n:][^\n]*\n(?::\s[^\n]*\n?)+)+)/gm, function (wholeMatch, group) {
                const lines = group.trim().split('\n');
                let html = '<dl>\n';
                let currentTerm = null;

                for (let line of lines) {
                    if (/^[^:\s]/.test(line)) {
                        currentTerm = line.trim();
                        html += `  <dt>${currentTerm}</dt>\n`;
                    } else if (/^:\s+/.test(line)) {
                        const definition = line.replace(/^:\s+/, '').trim();
                        html += `  <dd>${definition}</dd>\n`;
                    } else {
                        html += line + '\n';
                    }
                }

                html += '</dl>\n';
                return html;
            });

            text = text.replace(/§§§CODEBLOCK(\d+)§§§/g, (_, i) => codeBlocks[i]);

            return text;
        }
    }];
});
