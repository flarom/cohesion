// overlay that fixes fenced code blocks being marked as comments
var fixCodeOverlay = {
  token(stream) {
    if (stream.sol()) {
      const match = stream.match(/(```+|~~~+)/, false);
      if (match) {
        stream.match(/(```+|~~~+)/);
        return "code-delimiter";
      }
    }

    if (stream.match(/`[^`]*`/, true)) {
      return "inline-code";
    }

    stream.next();
    return null;
  }
};