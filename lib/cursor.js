'use strict';

const assert = require('assert');
const http = require('http');

const setPrototypeOf = require('setprototypeof');

const callApi = require('./util/call-api');


const METHODS = new Set(http.METHODS);


/**
 * A function that calls proto.handle if called directly.
 * Has prototype functions `endpoint` and `method` that set the endpoint name and method, respectively.
 *
 * @param {BitScoopAPI} api An instance of BitScoopAPI.
 * @type {Function}
 */
let proto = module.exports = function cursor(api) {
	function cursor(identifier, options, cb) {
		return cursor.handle(identifier, options, cb);
	}

	cursor.api = api;
	cursor.verb = 'GET';

	setPrototypeOf(cursor, proto);

	return cursor;
};


/**
 *
 * @param {String} [identifier] An API Map ID.
 * @param {Object} options Options to use when making the call such as query, headers, and identifier.
 * @param {Function} cb A callback function.
 * @returns {Promise}
 */
proto.handle = function handle(identifier, options, cb) {
	let self = this;

	if (typeof identifier === 'object') {
		if (arguments.length === 1) {
			options = identifier;
			identifier = null;
		}
		else if (arguments.length > 1) {
			cb = options;
			options = identifier;
			identifier = null;
		}
	}
	else if (typeof identifier === 'function') {
		cb = identifier;
		options = null;
		identifier = null;
	}

	if (options == null) {
		options = {};
	}

	if (options.headers == null) {
		options.headers = {};
	}

	options.headers.Authorization = 'Bearer ' + self.api.token;

	if (self.endpointName == null) {
		return Promise.reject(new Error('The endpoint to call was not specified.'));
	}

	let path = self.api.id + '/' + self.endpointName;

	if (identifier) {
		path = path + '/' + identifier;
	}

	return new Promise(function(resolve, reject) {
		callApi({
			method: self.verb,
			path: path,
			hostname: 'data.api.bitscoop.com',
			headers: options.headers,
			query: options.query,
			body: options.body
		}, function(err, response, body) {
			if (typeof cb === 'function') {
				cb(err, response, body);
			}

			if (err) {
				reject(err);
			}
			else {
				resolve([body, response]);
			}
		});
	});
};


/**
 * Sets the endpoint name and returns the callable cursor.
 *
 * @param {String} name The name of the endpoint to be called.
 * @returns {proto}
 */
proto.endpoint = function endpoint(name) {
	assert.ok(name != null, 'An endpoint name is required.');
	assert.ok(typeof name === 'string', 'Endpoint name must be a string.');

	this.endpointName = name;

	return this;
};


/**
 * Sets the verb and returns the callable cursor.
 *
 * @param {String} verb The verb to use when making the call.
 * @returns {proto}
 */
proto.method = function method(verb) {
	assert.ok(verb != null, 'An HTTP verb is required.');
	assert.ok(typeof verb === 'string', 'HTTP verb must be a string.');

	verb = verb.toUpperCase();

	assert.ok(METHODS.has(verb), 'Unsupported HTTP verb.');

	this.verb = verb;

	return this;
};
