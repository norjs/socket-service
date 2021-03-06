// Interfaces for TypeUtils
require('@norjs/types/interfaces/HttpRequestObject.js');
require('@norjs/types/interfaces/HttpResponseObject.js');

/**
 *
 * @type {typeof AbstractSocketHttpServer}
 */
const AbstractSocketHttpServer = require('./AbstractSocketHttpServer.js');

const _ = require('lodash');

/**
 *
 * @type {typeof TypeUtils}
 */
const TypeUtils = require("@norjs/utils/Type");

/**
 *
 * @type {typeof LogicUtils}
 */
const LogicUtils = require('@norjs/utils/Logic');

const URL = require('url');

/**
 * This class implements an abstract base class for HttpRequestControllers.
 *
 * @implements {HttpRequestController}
 * @abstract
 */
class AbstractHttpRequestController {

    /**
     *
     * @param request {HttpRequestObject}
     * @param response {HttpResponseObject}
     */
    constructor ({
        request,
        response
    }) {

        // You probably should test at the concrete class, not here.
        TypeUtils.assert(request, "HttpRequestObject");
        TypeUtils.assert(response, "HttpResponseObject");

        /**
         *
         * @member {HttpRequestObject}
         * @protected
         */
        this._request = request;

        /**
         *
         * @member {HttpResponseObject}
         * @protected
         */
        this._response = response;

    }

    /**
     *
     * @param data {*} The response body data to write as JSON
     * @param statusCode {number}
     * @return {*} The response body data which was written (as non-JSON-string)
     * @protected
     */
    _writeJsonResponse (data, statusCode = 200) {

        //TypeUtils.assert(request, "*");
        TypeUtils.assert(statusCode, "number");

        if (!_.isObject(data)) {
            data = {payload: data};
        }

        const dataString = JSON.stringify(data);
        // console.log('WOOT: dataString: ', dataString);

        this._response.statusCode = statusCode;
        this._response.setHeader('Content-Type', 'application/json');
        this._response.write(`${dataString}\n`);
        this._response.end();
        console.log(`[${AbstractSocketHttpServer.getTimeForLog()}] Request "${this._request.method} ${this._request.url}" finished with ${statusCode}`);
        return data;
    }

    /**
     *
     * @param error {string|Error}
     * @param payload {{}}
     * @param statusCode {number}
     * @return {*} The response body data
     * @protected
     */
    _writeErrorResponse ({error, payload = {}, statusCode = 500}) {

        if (error instanceof Error) {
            console.error('Internal Error: ', error);
            error = 'InternalError';
        }

        TypeUtils.assert(error, "string");
        TypeUtils.assert(payload, "object");
        TypeUtils.assert(statusCode, "number");
        return this._writeJsonResponse({payload, error}, statusCode);
    }

    /**
     * Get request query parameters.
     *
     * @returns {{}}
     * @protected
     */
    getParams () {
        return URL.parse(this._request.url, true).query;
    }

    /**
     * Get request body data.
     *
     * @return {Promise.<*>} The request input data
     * @protected
     */
    getRequestData () {
        return new Promise( (resolve, reject) => {
            LogicUtils.tryCatch(
                () => {
                    let chunks = [];
                    this._request.on('data', chunk => {
                        LogicUtils.tryCatch(() => {
                            chunks.push(chunk);
                        }, reject);
                    });
                    this._request.on('end', () => {
                        LogicUtils.tryCatch(() => {
                            const buffer = Buffer.concat(chunks);
                            const dataString = buffer.toString('utf8');
                            if (dataString === "") {
                                resolve(undefined);
                            } else {
                                resolve(JSON.parse(dataString));
                            }
                        }, reject);
                    });
                },
                reject
            );
        });
    }

    /**
     * Call function `f` and return the result as a JSON response.
     *
     * Handles promises, exceptions, and errors.
     *
     * @param f {function(params: {}, payload: {})}
     * @return {Promise<*>} Promise of the JSON data which was sent.
     * @protected
     */
    _jsonResponse (f) {
        TypeUtils.assert(f, "function");
        return this.getRequestData().then(
            payload => f(this.getParams(), payload)
        ).then(
            data => this._writeJsonResponse(data)
        ).catch(
            err => this._writeErrorResponse({error: err})
        );
    }

    /**
     * Write 404 Not Found Error response.
     * @return {*}
     * @protected
     */
    _writeNotFoundError () {
        return this._writeErrorResponse({
            payload:{
                url: this._request.url
            },
            error: 'Not Found',
            statusCode: 404
        });
    }

    /**
     *
     * @param err {Error}
     * @return {*}
     */
    handleRequestErrors (err) {
        TypeUtils.assert(err, "Error");
        console.error(`Error: `, err);
        return this._writeErrorResponse ({error: 'Internal Service Error'});
    }

    /**
     * HTTP service will call this method to handle the request.
     * @return {*} The JSON data which was sent.
     */
    onRequest () {
        return this._writeNotFoundError();
    }

}

TypeUtils.defineType("AbstractHttpRequestController", TypeUtils.classToTestType(AbstractHttpRequestController));

/**
 *
 * @type {typeof AbstractHttpRequestController}
 */
module.exports = AbstractHttpRequestController;
