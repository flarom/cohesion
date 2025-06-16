var underlineOverlay = {
    token: function(stream, state) {
        if (stream.match(/__[^_][^]*?__/)) { 
            return 'underline';
        } else {
            stream.next();
            return null;
        }
    }
};