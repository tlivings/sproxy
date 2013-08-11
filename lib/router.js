"use strict";

var http = require("http"),
	url = require("url");

function Router(proxyServer) {
	this._proxyServer = proxyServer;
	this._handler = undefined;
}

Router.prototype = {

	get handler() {
		return this._handler;
	},

	pipe : function(options) {
		//Might be a URL.
		if(typeof options === "string") {
			options = url.parse(options);
		}
		this._handler = function(req, res) {
			//TODO: Provide some rewrite capability
			options.path = req.path;

			var request = http.request(options, function(response) {
				response.pipe(res, {end : true});
			});

			req.pipe(request, {end : true});
		};
		return this._proxyServer;
	}
};

exports = module.exports = Router;