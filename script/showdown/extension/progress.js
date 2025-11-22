(function() {
    const progressRegex = /\[!progress\s+([^\]]+)\]/g;

    // Add /progress slash command
    try {
        CommandRegistry.register("progress", {
            description: "Insert a progress bar",
            icon: "action_key",
            exec: function() { insertSnippet('[!progress ${1:value} ${2:min} ${3:max}]') }
        });
    } catch (e) {}

    showdown.extension("progress", function() {
        return [
            {
                type: "lang",
                regex: progressRegex,
                replace: function(match, content) {

                    const args = [];
                    content.trim().replace(/"([^"]*)"|(\S+)/g, (m, quoted, plain) => {
                        args.push(quoted || plain);
                    });

                    let value = parseFloat(args[0]);
                    let min = 0;
                    let max = 100;
                    let labelTemplate = null;

                    if (args.length === 2 && isNaN(parseFloat(args[1]))) {
                        labelTemplate = args[1];
                    }

                    else if (!isNaN(parseFloat(args[1]))) {
                        if (args.length >= 3) {
                            min = parseFloat(args[1]);
                            max = parseFloat(args[2]);
                        }
                        if (args.length >= 4) {
                            labelTemplate = args[3];
                        }
                    }

                    if (isNaN(value)) value = 0;
                    if (isNaN(min)) min = 0;
                    if (isNaN(max)) max = 100;

                    let realPercent = ((value - min) / (max - min)) * 100;
                    if (!isFinite(realPercent)) realPercent = 0;
                    realPercent = Math.max(0, Math.min(100, realPercent));

                    const progressValue = realPercent;

                    let labelHTML = "";
                    if (labelTemplate) {
                        let formattedLabel = labelTemplate;

                        formattedLabel = formattedLabel.replace(/\{(\d+)(?::\.(\d+))?\}/g,
                            (_, index, decimals) => {
                                let num = [value, min, max][index - 1];
                                if (decimals) num = num.toFixed(parseInt(decimals));
                                return num;
                            });

                        formattedLabel = formattedLabel.replace(/\{%\}/g, Math.round(realPercent));

                        labelHTML = `\n<label class="progress-label">${formattedLabel}</label>`;
                    }

                    return (
                        `<progress value="${progressValue}" max="100"></progress>` +
                        labelHTML
                    );
                }
            }
        ];
    });
})();
