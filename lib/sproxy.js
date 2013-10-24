'use strict';

var http = require('http'),
    url = require('url'),
    routeHandler = require('./routeHandler');

/**
 * Returns the proxy middleware request handler.
 * @param config define the path mappings.
 * @type {Function}
 */
exports = module.exports = function sproxy (config) {

    var _handlers = {};

    if (config) {
        Object.keys(config).forEach(function (path) {
            _handlers[path] = routeHandler(config[path]);
        });
    }

    /**
     * Proxy middleware request handler;
     * @param req
     * @param res
     */
    var proxyHandler = function (req, res) {
        Object.keys(_handlers).forEach(function (path) {
            var url = req.url;
            if (url.match(path)) {
                return _handlers[path].call(null, req, res);
            }
        });
    };

    /**
     * Adds a new hook to pipe a request for a path to a different server.
     * @param path
     * @returns {{pipe: Function}}
     */
    proxyHandler.on = function (path) {
        return {
            /**
             * Creates a new request handler for the given path which pipes to a different server as defined in options.
             * @param options
             * @returns {Function}
             */
            pipe : function (options) {
                _handlers[path] = routeHandler(options);
                return proxyHandler;
            }
        }
    };

    return proxyHandler;
};