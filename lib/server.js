"use strict";

var http = require("http"),
	assert = require("assert"),
	Router = require("./router");

function Proxy(server) {

	this._server = server;

	this._routes = {};
}

Proxy.prototype = {

	get routes() {
		return this._routes;
	},

	on : function(route) {
		var router = new Router(this, route);
		this._routes[route] = router;
		return router;
	},

	listen : function() {
		this._server.listen.apply(this._server, arguments);
		return this;
	},

	close : function() {
		this._server.close.apply(this._server, arguments);
		return this;
	}
};

var ProxyAPI = {

	createServer : function() {

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