"use strict";

var http = require("http"),
    url = require("url");

/**
 * Returns the proxy middleware request handler.
 * @param config define the path mappings.
 * @type {Function}
 */
exports = module.exports = function(config) {

    var _handlers = {};

    if(config) {
        Object.keys(config).forEach(function(path) {
            _handlers[path] = _makeHandler(config[path]);
        });
    }

    /**
     * Proxy middleware request handler;
     * @param req
     * @param res
     */
    var requestHandler = function(req, res) {
        Object.keys(_handlers).forEach(function(path) {
            var url = req.url;
            if(url.match(path)) {
                return _handlers[path].call(null, req, res);
            }
        });
    };

    /**
     * Adds a new hook to pipe a request for a path to a different server.
     * @param path
     * @returns {{pipe: Function}}
     */
    requestHandler.on = function(path) {
        return {
            /**
             * Creates a new request handler for the given path which pipes to a different server as defined in options.
             * @param options
             * @returns {Function}
             */
            pipe: function(options) {
                var handler = _makeHandler(options);
                _handlers[path] = handler;
                return requestHandler;
            }
        }
    };

    return requestHandler;
};

/**
 * Creates a new request handler for the given options.
 * @param options
 * @returns {Function}
 * @private
 */
function _makeHandler(options) {
    var _options;

    if(typeof options === "string") {
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
        if(!_options.path) {
            _options.path = req.url;
        }

        _options.method = req.method;

        var proxiedReq = http.request(_options, function (proxiedRes) {
            res.writeHead(proxiedRes.statusCode, proxiedRes.headers);
            proxiedRes.pipe(res, {end : true});
        });

        req.pipe(proxiedReq, {end : true});
    };
}