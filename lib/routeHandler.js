'use strict';

var url = require('url'),
    http = require('http');

/**
 * Creates a new request handler for the given options.
 * @param options
 * @returns {Function}
 * @private
 */
exports = module.exports = function createHandler (config) {
    var options = {};

    if (typeof config === 'string') {
        options = url.parse(config);
    }
    else {
        Object.getOwnPropertyNames(config).forEach(function (name) {
            var d = Object.getOwnPropertyDescriptor(config, name);
            Object.defineProperty(options, name, d);
        });
    }

    /**
     * Fills misc options and headers.
     * TODO: content-length, transfer-encoding, etc.
     * @param options
     * @param req
     * @returns {*}
     * @private
     */
    function _fillOptions (req) {
        var host = req.headers.host.split(':');

        options.scheme = options.scheme || req.connection.encrypted ? 'https' : 'http';
        options.host = options.host || host[0];
        options.port = options.port || host[1];
        options.path = options.path || req.url;
        options.method = options.method || req.method;

        if (!options.headers) {
            options.headers = {};
        }

        Object.keys(options.headers).forEach(function (header) {
            var name = header.toLowerCase();
            var value = options.headers[header];
            options.headers[name] = value;
            delete options.headers[header];
        });

        options.headers.connection = options.headers.connection || req.headers.connection;

        options.headers['X-Real-IP'] = req.connection.remoteAddress;
        options.headers['X-Forwarded-For'] = req.headers['X-Forwarded-For'] ? req.headers['X-Forwarded-For'] + ',' + req.connection.remoteAddress : req.connection.remoteAddress;
        options.headers['X-Forwarded-Proto'] = req.headers['X-Forwarded-Proto'] || options.scheme;

        return options;
    }

    /**
     * Pipes the incoming request to the server defined in options.
     * @param req
     * @param res
     * @returns {Function}
     */
    return function (proxyRequest, proxyResponse) {
        _fillOptions(proxyRequest);

        var request = http.request(options, function (response) {
            response.pause();
            if (proxyResponse instanceof http.ServerResponse) {
                proxyResponse.writeHead(response.statusCode, response.headers);
            }
            response.pipe(proxyResponse);
            response.resume();
        });

        proxyRequest.pipe(request);
    };
}