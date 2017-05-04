'use strict';

const assert = require('assert');

const cursor = require('./lib/cursor');


let maps = new WeakMap();


/**
 * Creates an SDK instance with the provided token.
 * @class
 */
class BitScoopSDK {
	/**
	 * Ensures the token passed in is present and is a string, sets the token on the instance, sets the host if specified, and creates an entry in maps for the new instance.
	 *
	 * @constructor
	 * @param token {Object, String} The API key or an object containing the API key and other options.
	 * @param options {Object} An object containing instantiation options.
	 */
	constructor(token, options) {
		if (typeof token === 'object') {
			options = token;
			token = null;
		}

		if (options == null) {
			options = {};
		}

		if (!options.hasOwnProperty('token')) {
			options.token = token;
		}

		assert.ok(options.token != null, 'An API key is required.');
		assert.ok(typeof options.token === 'string', 'API key must be a string.');

		if (options.allowUnauthorized) {
			assert.ok(typeof options.allowUnauthorized === 'boolean', 'allowUnauthorized must be a boolean.');
		}

		maps[this] = {};

		this.token = options.token;
		this.hostname = options.hostname || 'api.bitscoop.com';
		this.allowUnauthorized = options.allowUnauthorized === true;
		this.protocol = options.protocol || 'https';

		assert.ok(this.protocol === 'https' || this.protocol === 'http', 'protocol must be http or https');

		if (this.protocol === 'https') {
			this.port = options.port || 443;
		}
		else if (this.protocol === 'http') {
			this.port = options.port || 80;
		}
	}

	/**
	 * Creates and returns an instance of BitScoopAPI for a specific API map.
	 * If also provided with a token, it will use that token when making calls, otherwise it uses the token used to instantiate the SDK instance.
	 *
	 * @param id {String} The ID of the API map.
	 * @param [token] {String} A BitScoop API Key, overrides the one used to create the SDK instance.
	 * @returns {BitScoopAPI} An instance of a BitScoop API with callable methods mapping to the API map.
	 */
	api(id, token) {
		let api = new BitScoopAPI(id, token || this.token, this.hostname, this.protocol, this.port, this.allowUnauthorized);

		return maps[this][id] = api;
	}

	/**
	 * Returns the BitScoopAPI instance for the provided ID if it exists, otherwise creates a new instance and returns that.
	 * Accepts an override token that is only used if creating a new instance.
	 *
	 * @param id {String} The ID of the API map.
	 * @param [token] {String} A BitScoop API Key, overrides the one used to create the SDK instance if a new instance is being created.
	 * @returns {BitScoopAPI} An instance of a BitScoop API with callable methods mapping to the API map.
	 */
	map(id, token) {
		assert.ok(id != null, 'An API Map ID is required.');
		assert.ok(typeof id === 'string', 'API Map ID must be a string.');

		if (maps[this][id]) {
			return maps[this][id];
		}
		else {
			return this.api(id, token);
		}
	}
}


/**
 * Returns a callable cursor that makes calls to the BitScoop API.
 * Has chainable, reversable methods `endpoint` and `method` that set the endpoint and method that will be used in the call.
 * The endpoint must be set for the call to be valid.
 *
 * @class
 */
class BitScoopAPI {
	/**
	 * Ensures the options are present and the proper type, and sets those fields on the instance.
	 *
	 * @constructor
	 * @param id
	 * @param token
	 * @param hostname
	 * @param protocol
	 * @param port
	 * @param allowUnauthorized
	 */
	constructor(id, token, hostname, protocol, port, allowUnauthorized) {
		assert.ok(id != null, 'An API Map ID is required.');
		assert.ok(typeof id === 'string', 'API Map ID must be a string.');

		assert.ok(token != null, 'An API key is required.');
		assert.ok(typeof token === 'string', 'API key must be a string.');

		assert.ok(hostname != null, 'A hostname is required.');
		assert.ok(typeof hostname === 'string', 'hostname must be a string.');

		assert.ok(protocol != null, 'A protocol is required.');
		assert.ok(typeof protocol === 'string', 'protocol must be a string.');
		assert.ok(protocol === 'https' || protocol === 'http', 'protocol must be http or https');

		assert.ok(port != null, 'A port is required.');
		assert.ok(typeof port === 'number', 'port must be a number.');

		assert.ok(allowUnauthorized != null, 'allowUnauthoried is required.');
		assert.ok(typeof allowUnauthorized === 'boolean', 'allowUnauthorized must be a boolean.');

		this.id = id;
		this.allowUnauthorized = allowUnauthorized;
		this.token = token;
		this.hostname = hostname;
		this.protocol = protocol;
		this.port = port;
	}

	/**
	 * Returns a callable cursor with the endpoint set to the input `name`.
	 *
	 * @param {String} name
	 * @returns {cursor}
	 */
	endpoint(name) {
		return cursor(this).endpoint(name);
	}

	/**
	 * Returns a callable cursor with the method set to the input `verb`.
	 *
	 * @param {String} verb
	 * @returns {cursor}
	 */
	method(verb) {
		return cursor(this).method(verb);
	}
}


module.exports = BitScoopSDK;
