(function(mod) {
  if (typeof exports == "object" && typeof module == "object") {
    mod(require("../../lib/codemirror"));
  } else if (typeof define == "function" && define.amd) {
    define(["../../lib/codemirror"], mod);
  } else {
    mod(CodeMirror);
  }
})(function(CodeMirror) {
  "use strict";

  function modifier(e) {
    return e.ctrlKey || e.metaKey;
  }

  function extractLink(line, ch) {
    let match;

    // https://extrenal.link
    const urlRegex = /(https?:\/\/[^\s"'()\[\]{}<>]+)/g;
    while ((match = urlRegex.exec(line))) {
      const from = match.index;
      const to = from + match[0].length;
      if (ch >= from && ch <= to) {
        return {
          type: "external",
          value: match[0],
          from,
          to
        };
      }
    }

    // [[internal link]]
    const internalRegex = /\[\[([^\]]+)\]\]/g;
    while ((match = internalRegex.exec(line))) {
      const from = match.index;
      const to = from + match[0].length;
      if (ch >= from && ch <= to) {
        return {
          type: "internal",
          value: match[1],
          from,
          to
        };
      }
    }

    return null;
  }

  CodeMirror.defineOption("followLinks", true, function(cm, val, old) {
    if (old && old !== CodeMirror.Init) {
      cm.getWrapperElement().removeEventListener("mousemove", cm.state.flHover);
      cm.getWrapperElement().removeEventListener("mousedown", cm.state.flClick);
      if (cm.state.flHoverMark) cm.state.flHoverMark.clear();
    }

    if (!val) return;

    cm.state.flHoverMark = null;

    function clearHover() {
      if (cm.state.flHoverMark) {
        cm.state.flHoverMark.clear();
        cm.state.flHoverMark = null;
      }
    }

    cm.state.flHover = function(e) {
      if (!modifier(e)) {
        clearHover();
        return;
      }

      const pos = cm.coordsChar({ left: e.clientX, top: e.clientY });
      const line = cm.getLine(pos.line);
      if (!line) return;

      const link = extractLink(line, pos.ch);

      clearHover();
      if (!link) return;

      cm.state.flHoverMark = cm.markText(
        { line: pos.line, ch: link.from },
        { line: pos.line, ch: link.to },
        { className: "cm-link-hover" }
      );
    };

    cm.state.flClick = function(e) {
      if (!modifier(e)) return;

      const pos = cm.coordsChar({ left: e.clientX, top: e.clientY });
      const line = cm.getLine(pos.line);
      if (!line) return;

      const link = extractLink(line, pos.ch);
      if (!link) return;

      e.preventDefault();

      if (link.type === "external") {
        window.open(link.value, "_blank", "noopener");
      } else if (link.type === "internal" && cm.options.openInternalLink) {
        cm.options.openInternalLink(link.value);
      }
    };

    cm.getWrapperElement().addEventListener("mousemove", cm.state.flHover);
    cm.getWrapperElement().addEventListener("mousedown", cm.state.flClick);
  });
});
