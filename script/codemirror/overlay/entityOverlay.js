const htmlEntityOverlay = {
    token: function (stream) {
        const match = stream.match(/^&[^\s;]{1,32};/, true);
        if (match) {
            return `entitychar entitychar-beforechar-${match}`;
        }
        stream.next();
        return null;
    },
};
