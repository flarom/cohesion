/**
 * @extension
 * @title Flowcharts
 * @author Cohesion
 * @version 1.1.0
 * @updateLink https://github.com/flarom/cohesion-extensions/blob/main/flowchart.js
 * @documentationLink https://github.com/flarom/cohesion-extensions/wiki/Flowchart
 * @description Implementation of flowcharts for Cohesion.
 * @icon flowchart
 * @color var(--accent)
 */

BlockRegistry.register("FLOWCHART", {
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
            TB: "TB",
            TD: "TB", // Top to bottom
            LR: "LR", // Left to right
        };
        direction = dirMap[direction] || "LR";

        // Normalize lines
        const lines = contentText
            .split(/\r?\n/)
            .map((l) => l.trim())
            .filter(Boolean);

        const outlineColor = "var(--text-color   , #000)";
        const outlineRed = "var(--color-red      , #000)";
        const bgRed = "var(--color-red-bg        , #e74c3c)";
        const outlineGreen = "var(--color-green  , #000)";
        const bgGreen = "var(--color-green-bg    , #2ecc71)";
        const outlineYellow = "var(--color-yellow, #000)";
        const bgYellow = "var(--color-yellow-bg  , #f1c40f)";
        const textColor = "var(--title-color     , #000)";

        const nodes = {}; // id -> { id, label, shape }
        const edges = []; // { from, to, label }

        // Regex for nodes and edges
        const nodeDefPar = /^([\w-]+)\((.+)\)$/; // ellipse (start/end)
        const nodeDefDia = /^([\w-]+)\{(.+)\}$/; // diamond (decision)
        const nodeDefRec = /^([\w-]+)\[(.+)\]$/; // rectangle (process)
        const edgeRegex = /^([\w-]+)(?:\(([^)]+)\))?\s*->\s*([\w-]+)(?:\(([^)]+)\))?$/;

        // First pass: capture nodes and edges
        lines.forEach((line) => {
            let m;
            if ((m = line.match(nodeDefPar))) {
                nodes[m[1]] = { id: m[1], label: m[2], shape: "ellipse" };
                return;
            }
            if ((m = line.match(nodeDefDia))) {
                nodes[m[1]] = { id: m[1], label: m[2], shape: "diamond" };
                return;
            }
            if ((m = line.match(nodeDefRec))) {
                nodes[m[1]] = { id: m[1], label: m[2], shape: "rect" };
                return;
            }
            if ((m = line.match(edgeRegex))) {
                const from = m[1],
                    label = (m[2] || "").trim(),
                    to = m[3];
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

        // Escape HTML and break long lines intelligently
        function esc(s) {
            s = (s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
            const maxChars = 20;
            const words = s.split(" ");
            const lines = [];
            let currentLine = "";

            words.forEach((word) => {
                if ((currentLine + " " + word).length <= maxChars) {
                    currentLine += (currentLine ? " " : "") + word;
                } else {
                    if (currentLine) lines.push(currentLine);
                    if (word.length > maxChars) {
                        // Break very long words
                        for (let i = 0; i < word.length; i += maxChars) {
                            lines.push(word.substring(i, i + maxChars));
                        }
                        currentLine = "";
                    } else {
                        currentLine = word;
                    }
                }
            });
            if (currentLine) lines.push(currentLine);
            return lines.join("\n");
        }

        // Layout: define layers
        const adj = {};
        const indeg = {};
        Object.keys(nodes).forEach((id) => {
            adj[id] = [];
            indeg[id] = 0;
        });
        edges.forEach((e) => {
            if (adj[e.from]) adj[e.from].push(e.to);
            if (indeg[e.to] !== undefined) indeg[e.to] += 1;
            else indeg[e.to] = 1;
        });

        // Kahn-like for layers
        const layers = {};
        const queue = [];
        Object.keys(indeg).forEach((id) => {
            if ((indeg[id] || 0) === 0) queue.push(id);
        });
        queue.forEach((id) => (layers[id] = 0));
        const visited = new Set();
        while (queue.length) {
            const u = queue.shift();
            visited.add(u);
            const baseLayer = layers[u] || 0;
            adj[u].forEach((v) => {
                const newLayer = baseLayer + 1;
                if (layers[v] === undefined || newLayer > layers[v]) layers[v] = newLayer;
                indeg[v] -= 1;
                if (indeg[v] === 0) queue.push(v);
            });
        }
        Object.keys(nodes).forEach((id) => {
            if (layers[id] === undefined) {
                let best = 0;
                Object.keys(nodes).forEach((p) => {
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
        const minNodeW = 120,
            minNodeH = 50,
            maxLineWidth = 18,
            lineHeight = 16,
            padding = 16,
            spacingX = 220,
            spacingY = 120,
            margin = 40;
        const layerIndices = Object.keys(byLayer)
            .map((n) => parseInt(n, 10))
            .sort((a, b) => a - b);
        const positions = {};

        // Function to calculate node size based on label
        function calculateNodeSize(label) {
            const lines = label.split("\n");
            let maxCharsPerLine = 0;
            lines.forEach((line) => {
                maxCharsPerLine = Math.max(maxCharsPerLine, line.length);
            });
            // Approximate character width: ~8 pixels per character
            const charWidth = 8;
            const width = Math.max(minNodeW, maxCharsPerLine * charWidth + padding);
            const height = Math.max(minNodeH, lines.length * lineHeight + padding);
            return { w: width, h: height };
        }

        // Store node sizes
        const nodeSizes = {};
        Object.keys(nodes).forEach((id) => {
            const size = calculateNodeSize(esc(nodes[id].label));
            nodeSizes[id] = size;
        });

        // Compute SVG dimensions
        const maxLayer = Math.max(...layerIndices);
        const maxInLayer = Math.max(...layerIndices.map((i) => byLayer[i].length));
        let width, height;

        // Orientation
        let isVertical = direction === "TB" || direction === "TD" || direction === "BT";
        let isReverse = direction === "RL" || direction === "BT";

        // Position nodes according to direction
        layerIndices.forEach((layerIdx, li) => {
            const col = byLayer[layerIdx];
            const colCount = col.length;
            if (isVertical) {
                const colWidth = (colCount - 1) * spacingX + minNodeW;
                const startX = margin + (Math.max(maxInLayer * spacingX + minNodeW, colWidth) - colWidth) / 2;
                col.forEach((id, idx) => {
                    const size = nodeSizes[id];
                    let x = startX + idx * spacingX;
                    let y = margin + li * spacingY;
                    positions[id] = { x, y, w: size.w, h: size.h };
                });
            } else {
                const colHeight = (colCount - 1) * spacingY + minNodeH;
                const startY = margin + (Math.max(maxInLayer * spacingY + minNodeH, colHeight) - colHeight) / 2;
                col.forEach((id, idx) => {
                    const size = nodeSizes[id];
                    let x = margin + li * spacingX;
                    let y = startY + idx * spacingY;
                    positions[id] = { x, y, w: size.w, h: size.h };
                });
            }
        });

        // Reverse if RL or BT
        if (isReverse) {
            const maxX = Math.max(...Object.values(positions).map((p) => p.x));
            const maxY = Math.max(...Object.values(positions).map((p) => p.y));
            Object.values(positions).forEach((pos) => {
                if (direction === "RL") pos.x = maxX - pos.x;
                if (direction === "BT") pos.y = maxY - pos.y;
            });
        }

        // Arrow marker definition
        const defs = `<defs>
                <marker id="arrow-flow" viewBox="0 0 10 10" refX="10" refY="5"
                markerWidth="10" markerHeight="10" orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="${outlineColor}"></path>
                </marker>
                </defs>`;

        // Draw edges
        const edgeSvgs = edges
            .map((e) => {
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
            })
            .join("\n");

        // Draw nodes
        const nodeSvgs = Object.values(nodes)
            .map((n) => {
                const pos = positions[n.id];
                const x = pos.x;
                const y = pos.y;
                const cx = x + pos.w / 2;
                const cy = y + pos.h / 2;
                const label = esc(n.label);
                const labelLines = label.split("\n");
                const lineOffset = (labelLines.length - 1) * lineHeight / 2;
                const labelSvg = labelLines.map((line, i) => `<tspan x="${cx}" y="${cy + 5 - lineOffset + i * lineHeight}">${line}</tspan>`).join("");
                if (n.shape === "ellipse") {
                    return `<g class="node" data-id="${n.id}">
                <ellipse cx="${cx}" cy="${cy}" rx="${pos.w / 2}" ry="${pos.h / 2}" fill="${bgRed}" stroke="${outlineRed}"/>
                <text x="${cx}" y="${cy + 5 - lineOffset}" font-size="13" text-anchor="middle">${labelSvg}</text>
                </g>`;
                } else if (n.shape === "diamond") {
                    const rx = pos.w / 2;
                    const ry = pos.h / 2;
                    const points = [`${cx},${cy - ry}`, `${cx + rx},${cy}`, `${cx},${cy + ry}`, `${cx - rx},${cy}`].join(" ");
                    return `<g class="node" data-id="${n.id}">
                <polygon points="${points}" fill="${bgGreen}" stroke="${outlineGreen}"/>
                <text x="${cx}" y="${cy + 5 - lineOffset}" font-size="13" text-anchor="middle">${labelSvg}</text>
                </g>`;
                } else {
                    return `<g class="node" data-id="${n.id}">
                <rect x="${x}" y="${y}" width="${pos.w}" height="${pos.h}" rx="15" fill="${bgYellow}" stroke="${outlineYellow}"/>
                <text x="${cx}" y="${cy + 5 - lineOffset}" font-size="13" text-anchor="middle">${labelSvg}</text>
                </g>`;
                }
            })
            .join("\n");

        // Compute minimal SVG dimensions
        let minX = Infinity,
            minY = Infinity,
            maxX = -Infinity,
            maxY = -Infinity;
        Object.values(positions).forEach((pos) => {
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
        if (minX < 0) {
            maxX += -minX;
            minX = 0;
        }
        if (minY < 0) {
            maxY += -minY;
            minY = 0;
        }

        const svgWidth = Math.ceil(maxX - minX);
        const svgHeight = Math.ceil(maxY - minY);

        // Final SVG
        const svg = `<div class="flowchart" style="overflow:auto;">
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
</style>`;
        return svg;
    },
});