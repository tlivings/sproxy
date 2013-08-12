"use strict";

var assert = require("assert"),
	http = require("http"),
	express = require("express"),
	sproxy = require("../lib/index"),
	request = require("supertest");

describe("test", function() {

	var app, proxyServer;

	before(function(done) {

		app = express();

		app.get("/test", function(req, res) {
			res.json(200, { message : "Hello World"});
		});

		app.listen(3001, function() {

			proxyServer = sproxy.
				createServer(app).
				on("/*").
				pipe({
					scheme : "http",
					host : "localhost",
					port : "3001"
				}).
				listen(3000, done);
		});

	});

	after(function() {
		proxyServer.close();
	});

	it("should do something", function(next) {

		var req = http.request({
			scheme : "http",
			host : "localhost",
			port : "3000",
			path : "/test"
		}, function(response) {
			assert(response.statusCode === 200);
			next();
		});

		req.end();

	});

});