var blockOverlay = {
    token: function(stream) {
        if (stream.sol() && stream.match(/^:::/, true)) {
            stream.skipToEnd();
            return 'block';
        } else {
            stream.skipToEnd();
            return null;
        }
    }
};