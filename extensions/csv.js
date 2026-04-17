/**
 * @extension
 * @title CSV
 * @author Cohesion
 * @version 1.0.0
 * @description Renders CSV files as tables
 * @icon table
 * @color var(--accent)
 */

MediaRendererRegistry.register("csv", async (attributes) => {
    const content = await MediaRendererRegistry.getContent(attributes);
    
    let tableHtml = `<p>No data</p>`;
    
    if (content) {
        const lines = content.trim().split('\n');
        const rows = lines.map(line => {
            return line.split(',').map(cell => cell.trim());
        });
        
        tableHtml = `
            <table>
                ${rows.map((row) => `
                    <tr>
                        ${row.map(cell => `
                            <td>
                                ${cell}
                            </td>
                        `).join('')}
                    </tr>
                `).join('')}
            </table>
        `;
    }
    
    return tableHtml;
});
