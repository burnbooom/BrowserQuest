define([], function() {
    var renderConfig = {
        host: "browserquest-server.onrender.com",
        port: 443,
        secure: true,
        dispatcher: false
    };
    
    return {
        dev: renderConfig,
        build: renderConfig,
        local: renderConfig
    };
});
