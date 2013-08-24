"use strict";

var assert = require("assert"),
    http = require("http"),
    express = require("express"),
    sproxy = require("../lib/index");

describe("test", function() {

    var app, proxyServer;

    before(function(done) {

        app = express();

        app.get("/foo", function(req, res) {
            res.json(200, { message: "Hello World?"});
        });


        var proxyConfig = {
            "/*": {
                scheme: "http",
                host: "localhost",
                port: "3003",
                path : "/foo"
            }
        };

        var proxy = sproxy(proxyConfig);

        proxyServer = http.createServer(proxy);

        app.listen(3003, function() {

            proxyServer.listen(3002, done);

        });

    });

    after(function() {
        proxyServer.close();
    });

    it("should proxy request to /foo on 3003.", function(next) {

        var req = http.request({
                scheme : "http",
                host : "localhost",
                port : "3002",
                path : "/test"
            }, function(response) {
                assert(response.statusCode === 200);
                next();
            }
        );

        req.end();

    });

});