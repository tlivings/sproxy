"use strict";

var http = require("http"),
    assert = require("assert"),
    url = require("url");

function Proxy(server) {

    this._server = server;

    this._routeHandlers = {};
}

Proxy.prototype = {

    get routes() {
        return this._routeHandlers;
    },

    on: function(route) {
        var self = this;

        var handler = {
            pipe: function(options) {
                //Might be a URL.
                if(typeof options === "string") {
                    options = url.parse(options);
                }
                this.handler = function(req, res) {
                    var request, pipe;

                    //TODO: Provide some rewrite capability
                    options.path = req.path;

                    request = http.request(options, function(response) {
                        response.pipe(res, {end: true});
                    });

                    pipe = req.pipe(request);

                    pipe.end();
                };
                return self;
            }
        }

        this._routeHandlers[route] = handler;

        return handler;
    },

    listen: function() {
        this._server.listen.apply(this._server, arguments);
        return this;
    },

    close: function() {
        this._server.close.apply(this._server, arguments);
        return this;
    }
};

var ProxyAPI = {

    createServer: function() {

        var server = http.createServer(function(req, res) {
            Object.keys(proxy.routes).forEach(function(route) {
                var url = req.url;
                if(url.match(route)) {
                    return proxy.routes[route].handler.call(proxy.routes[route], req, res);
                }
            });
        });

        var proxy = new Proxy(server);

        return proxy;
    }

};

exports = module.exports = ProxyAPI;