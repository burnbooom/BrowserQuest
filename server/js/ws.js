var cls = require("./lib/class"),
    WebSocket = require('ws'),
    http = require('http'),
    _ = require('underscore'),
    Utils = require('./utils'),
    WS = {};

module.exports = WS;

var Server = cls.Class.extend({
    init: function(port) { this.port = port; this._connections = {}; },
    onConnect: function(callback) { this.connection_callback = callback; },
    onError: function(callback) { this.error_callback = callback; },
    forEachConnection: function(callback) { _.each(this._connections, callback); },
    addConnection: function(connection) { this._connections[connection.id] = connection; },
    removeConnection: function(id) { delete this._connections[id]; }
});

var Connection = cls.Class.extend({
    init: function(id, connection, server) {
        this._connection = connection;
        this._server = server;
        this.id = id;
    },
    onClose: function(callback) { this.close_callback = callback; },
    listen: function(callback) { this.listen_callback = callback; },
    send: function(message) { this._connection.send(JSON.stringify(message)); },
    close: function(logError) { this._connection.close(); }
});

WS.MultiVersionWebsocketServer = Server.extend({
    _counter: 0,
    init: function(port) {
        var self = this;
        this._super(port);
        
        // Skapa en HTTP-server för att Render ska kunna hälsa på den
        this._httpServer = http.createServer(function(req, res) {
            res.writeHead(200);
            res.end("Server is running");
        });

        // Starta WebSocket-servern på samma port
        this._wsServer = new WebSocket.Server({ server: this._httpServer });
        
        this._wsServer.on('connection', function(socket, req) {
            socket.remoteAddress = req.socket.remoteAddress;
            var c = new WS.SocketConnection('5' + Utils.random(99) + (self._counter++), socket, self);
            
            if(self.connection_callback) self.connection_callback(c);
            self.addConnection(c);
        });

        this._httpServer.listen(port, function() {
            console.log("BrowserQuest server lyssnar på port: " + port);
        });
    },
    broadcast: function(message) {
        this.forEachConnection(function(c) { c.send(message); });
    },
    onRequestStatus: function(callback) { this.status_callback = callback; }
});

WS.SocketConnection = Connection.extend({
    init: function(id, connection, server) {
        var self = this;
        this._super(id, connection, server);
        
        this._connection.on('message', function(data) {
            if(self.listen_callback) {
                try {
                    self.listen_callback(JSON.parse(data));
                } catch(e) { console.log("JSON Error"); }
            }
        });
        
        this._connection.on('close', function() {
            if(self.close_callback) self.close_callback();
            self._server.removeConnection(self.id);
        });
    }
});
