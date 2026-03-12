define([], function() {
    var c = {
        host: "browserquest-server.onrender.com",
        port: 443,
        secure: true,
        dispatcher: false
    };
    return {
        dev: c,
        build: c,
        local: c
    };
});
