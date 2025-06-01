var markOverlay = {
    token: function(stream, state) {
        if (stream.match(/==[^=][^]*?==/)) { 
            return 'mark-highlight';
        } else {
            stream.next();
            return null;
        }
    }
};
