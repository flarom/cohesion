/**
 * @extension
 * @title Markdown Table Formatter
 * @author Cohesion
 * @version 1.0.0
 * @description Shows a "Format table" widget at the end of markdown tables and formats the whole table on click.
 * @icon table
 * @color var(--accent)
 */

(() => {
    const PATTERN_ID = "cohesion.markdown-table-formatter-widget";

    function splitTableRow(line) {
        return String(line || "")
            .trim()
            .replace(/^\|/, "")
            .replace(/\|$/, "")
            .split("|")
            .map((part) => part.trim());
    }

    function isSeparatorCell(text) {
        return /^:?-{3,}:?$/.test(String(text || "").trim());
    }

    function parseAlignment(cellText) {
        const text = String(cellText || "").trim();

        if (text.startsWith(":") && text.endsWith(":")) return "center";
        if (text.startsWith(":")) return "left";
        if (text.endsWith(":")) return "right";
        return "none";
    }

    function isPotentialTableHeader(line) {
        const text = String(line || "").trim();

        if (text.length === 0) {
            return false;
        }

        if (!text.includes("|")) {
            return false;
        }

        return splitTableRow(text).length >= 2;
    }

    function isSeparatorRow(line) {
        const cells = splitTableRow(line);

        if (cells.length < 2) {
            return false;
        }

        return cells.every((cell) => isSeparatorCell(cell));
    }

    function isTableBodyRow(line) {
        const text = String(line || "").trim();

        if (text.length === 0 || !text.includes("|")) {
            return false;
        }

        const cells = splitTableRow(text);
        return cells.length >= 2;
    }

    function makeSeparatorCell(width, alignment) {
        const safeWidth = Math.max(3, width);

        if (alignment === "left") {
            return `:${"-".repeat(Math.max(2, safeWidth - 1))}`;
        }

        if (alignment === "right") {
            return `${"-".repeat(Math.max(2, safeWidth - 1))}:`;
        }

        if (alignment === "center") {
            return `:${"-".repeat(Math.max(1, safeWidth - 2))}:`;
        }

        return "-".repeat(safeWidth);
    }

    function formatTableRange(cm, startLine, endLine) {
        const rawLines = [];

        for (let line = startLine; line <= endLine; line += 1) {
            rawLines.push(cm.getLine(line));
        }

        if (rawLines.length < 2) {
            return;
        }

        const header = splitTableRow(rawLines[0]);
        const separator = splitTableRow(rawLines[1]);
        const body = rawLines.slice(2).map(splitTableRow);

        const columnCount = Math.max(
            header.length,
            separator.length,
            ...body.map((row) => row.length)
        );

        const normalizeRow = (row) => {
            const normalized = row.slice(0, columnCount);

            while (normalized.length < columnCount) {
                normalized.push("");
            }

            return normalized;
        };

        const normalizedHeader = normalizeRow(header);
        const normalizedBody = body.map(normalizeRow);
        const alignments = normalizeRow(separator).map(parseAlignment);

        const widths = Array(columnCount).fill(3);

        const updateWidths = (row) => {
            for (let index = 0; index < columnCount; index += 1) {
                widths[index] = Math.max(widths[index], String(row[index] || "").length);
            }
        };

        updateWidths(normalizedHeader);
        normalizedBody.forEach(updateWidths);

        const formatRow = (row) => {
            const paddedCells = row.map((cell, index) => String(cell || "").padEnd(widths[index], " "));
            return `| ${paddedCells.join(" | ")} |`;
        };

        const separatorCells = widths.map((width, index) => makeSeparatorCell(width, alignments[index]));
        const formattedLines = [
            formatRow(normalizedHeader),
            `| ${separatorCells.join(" | ")} |`,
            ...normalizedBody.map(formatRow)
        ];

        cm.operation(() => {
            cm.replaceRange(
                formattedLines.join("\n"),
                { line: startLine, ch: 0 },
                { line: endLine, ch: cm.getLine(endLine).length }
            );
        });
    }

    WidgetPatternRegistry.unregister(PATTERN_ID);

    WidgetPatternRegistry.register(PATTERN_ID, {
        scan({ lines }) {
            const matches = [];

            for (let line = 0; line < lines.length - 1; line += 1) {
                if (!isPotentialTableHeader(lines[line])) {
                    continue;
                }

                if (!isSeparatorRow(lines[line + 1])) {
                    continue;
                }

                let endLine = line + 1;
                let cursor = line + 2;

                while (cursor < lines.length && isTableBodyRow(lines[cursor])) {
                    endLine = cursor;
                    cursor += 1;
                }

                matches.push({
                    line: endLine,
                    data: {
                        startLine: line,
                        endLine
                    }
                });

                line = endLine;
            }

            return matches;
        },

        render({ editor, item, helpers }) {
            const startLine = item?.data?.startLine;
            const endLine = item?.data?.endLine;

            if (typeof startLine !== "number" || typeof endLine !== "number") {
                return null;
            }

            const container = helpers.createContainer();

            const button = helpers.createButton("Format table", () => {
                formatTableRange(editor, startLine, endLine);
            });

            container.appendChild(button);
            return container;
        }
    });
})();
