showdown.extension('definition-list', function () {
  return [{
    type: 'lang',
    regex: /((?:^[^\n:][^\n]*\n(?::[^\n]*\n)+)+)/gm,
    replace: function (wholeMatch, group) {
      const lines = group.trim().split('\n');
      let html = '<dl>\n';
      let currentTerm = null;

      for (let line of lines) {
        if (/^[^:\s]/.test(line)) {
          currentTerm = line.trim();
          html += `  <dt>${currentTerm}</dt>\n`;
        } else if (/^:\s*/.test(line)) {
          const definition = line.replace(/^:\s*/, '').trim();
          html += `  <dd>${definition}</dd>\n`;
        }
      }

      html += '</dl>\n';
      return html;
    }
  }];
});
