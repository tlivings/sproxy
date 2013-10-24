'use strict';

var url = require('url'),
    http = require('http');

/**
 * Creates a new request handler for the given options.
 * @param options
 * @returns {Function}
 * @private
 */
exports = module.exports = function createHandler (options) {
    var _options;

    if (typeof options === 'string') {
        _options = url.parse(options);
    }
    else {
        _options = options;
    }

    /**
     * Pipes the incoming request to the server defined in options.
     * @param req
     * @param res
     * @returns {Function}
     */
    return function (req, res) {
        if (!_options.path) {
            _options.path = req.url;
        }
        if (!_options.method) {
            _options.method = req.method;
        }

        var proxiedReq = http.request(_options, function (proxiedRes) {
            res.writeHead(proxiedRes.statusCode, proxiedRes.headers);
            proxiedRes.pipe(res);
        });

        req.pipe(proxiedReq);
    };
}