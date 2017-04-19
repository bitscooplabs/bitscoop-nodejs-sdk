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
	 * Ensures the token passed in is present and is a string, sets the token on the instance, and creates an entry in maps for the new instance.
	 *
	 * @constructor
	 * @param token
	 */
	constructor(token) {
		assert.ok(token != null, 'An API key is required.');
		assert.ok(typeof token === 'string', 'API key must be a string.');

		maps[this] = {};

		this.token = token;
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
		let api = new BitScoopAPI(id, token || this.token);

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
	 * Ensures the ID and token are present and are strings, and sets those fields on the instance.
	 *
	 * @constructor
	 * @param id
	 * @param token
	 */
	constructor(id, token) {
		assert.ok(id != null, 'An API Map ID is required.');
		assert.ok(typeof id === 'string', 'API Map ID must be a string.');
		assert.ok(token != null, 'An API key is required.');
		assert.ok(typeof token === 'string', 'API key must be a string.');

		this.id = id;
		this.token = token;
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
