'use strict';

var assert = require('assert'),
    http = require('http'),
    express = require('express'),
    sproxy = require('../lib/index');

describe('test', function () {

    var app, proxyServer;

    before(function (done) {

        app = express();

        app.get('/foo', function (req, res) {
            res.json(200, { message : 'Hello World?'});
        });

        var proxy = sproxy().
            on('/*').
            pipe({
                port : '3001',
                path : '/foo'
            });

        proxyServer = http.createServer(proxy);

        app.listen(3001, function () {

            proxyServer.listen(3000, done);

        });

    });

    after(function () {
        proxyServer.close();
    });

    it('should proxy request to /foo on 3001.', function (next) {

        var req = http.request({
                scheme : 'http',
                host : 'localhost',
                port : '3000',
                path : '/test'
            }, function (response) {
                assert(response.statusCode === 200);
                next();
            }
        );

        req.end();

    });

});