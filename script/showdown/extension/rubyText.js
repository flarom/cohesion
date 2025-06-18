showdown.extension('rubyText', function () {
    return [{
        type: 'lang',
        filter: function (text) {
            const codeBlocks = [];
            const regexCode = /(```[\s\S]*?```|~~~[\s\S]*?~~~|`[^`\n]*`)/g;

            let match;
            let lastIndex = 0;
            let output = '';

            while ((match = regexCode.exec(text)) !== null) {
                const chunk = text.slice(lastIndex, match.index);
                output += chunk.replace(/\[([^\]]+?)\]\^\((.+?)\)/g, function (_, kanji, reading) {
                    let ruby = '<ruby>';
                    const kanjiChars = [...kanji];
                    const readings = reading.trim().split(/\s+/);

                    for (let i = 0; i < kanjiChars.length; i++) {
                        const char = kanjiChars[i];
                        const rt = readings[i] || '';
                        ruby += `${char}<rp>（</rp><rt>${rt}</rt><rp>）</rp>`;
                    }

                    ruby += '</ruby>';
                    return ruby;
                });

                output += match[0];
                lastIndex = regexCode.lastIndex;
            }

            output += text.slice(lastIndex).replace(/\[([^\]]+?)\]\^\((.+?)\)/g, function (_, kanji, reading) {
                let ruby = '<ruby>';
                const kanjiChars = [...kanji];
                const readings = reading.trim().split(/\s+/);

                for (let i = 0; i < kanjiChars.length; i++) {
                    const char = kanjiChars[i];
                    const rt = readings[i] || '';
                    ruby += `${char}<rp>（</rp><rt>${rt}</rt><rp>）</rp>`;
                }

                ruby += '</ruby>';
                return ruby;
            });

            return output;
        }
    }];
});
