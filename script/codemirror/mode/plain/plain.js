CodeMirror.defineMode("plain", function() {
  return {
    token: function(stream) {
      stream.skipToEnd();
      return "default";
    }
  };
});

CodeMirror.defineMIME("text/plain", "plain");