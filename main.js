'use strict';

const assert = require('assert');

const _ = require('lodash');
const noop = require('node-noop').noop;

const callApi = require('./lib/util/call-api');
const cursor = require('./lib/cursor');


let sdkMapRef = {};
let sdkConnectionRef = {};


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
		assert.ok(id != null, 'An API Map ID is required.');
		assert.ok(typeof id === 'string', 'API Map ID must be a string.');

		return new BitScoopAPI(id, token || this.token, this.hostname, this.protocol, this.port, this.allowUnauthorized);
	}

	/**
	 * Creates a Connection from the given mapId, with optional data.
	 * Can call a callback function if specified, otherwise returns a Promise.
	 *
	 * @param mapId {String} The map ID
	 * @param [data] {Object} The data to pass to the API call.
	 * @param [cb] {Function} A callback function
	 * @returns {Promise}
	 */
	createConnection(mapId, data, cb = noop) {
		if (typeof data === 'function') {
			cb = data;
			data = null;
		}

		let self = this;

		return new Promise(function(resolve, reject) {
			callApi({
				protocol: self.protocol,
				method: 'POST',
				path: '/maps/' + mapId + '/connections',
				port: self.port,
				hostname: self.hostname,
				headers: {
					Authorization: 'Bearer ' + self.token
				},
				body: data,
				allowUnauthorized: self.allowUnauthorized
			}, function(err, response, body) {
				if (err) {
					reject(err);
				}
				else {
					resolve([body, response]);
				}
			});
		})
			.then(function(result) {
				let [body, response] = result;

				if (!(/^2/.test(response.statusCode))) {
					return Promise.reject(new Error(body.message));
				}

				return Promise.resolve(body);
			})
			.then(function(body) {
				let connection = new BitScoopConnection(body);

				sdkMapRef[connection.id] = self;

				cb(null, connection);

				return Promise.resolve(connection);
			})
			.catch(function(err) {
				cb(err, null);

				return Promise.reject(err);
			});
	}

	/**
	 * Deletes a Connection from the given mapId.
	 * Can call a callback function if specified, otherwise returns a Promise.
	 *
	 * @param connectionId {String} The map ID
	 * @param [cb] {Function} A callback function
	 * @returns {Promise}
	 */
	deleteConnection(connectionId, cb = noop) {
		let self = this;

		return new Promise(function(resolve, reject) {
			callApi({
				protocol: self.protocol,
				method: 'DELETE',
				path: '/connections/' + connectionId,
				port: self.port,
				hostname: self.hostname,
				headers: {
					Authorization: 'Bearer ' + self.token
				},
				allowUnauthorized: self.allowUnauthorized
			}, function(err, response, body) {
				if (err) {
					reject(err);
				}
				else {
					resolve([body, response]);
				}
			});
		})
			.then(function(result) {
				let [body, response] = result;

				if (!(/^2/.test(response.statusCode))) {
					return Promise.reject(new Error(body.message));
				}

				cb(null, null);

				return Promise.resolve();
			})
			.catch(function(err) {
				cb(err, null);

				return Promise.reject(err);
			});
	}

	/**
	 * Gets a Connection specified by the ID.
	 * Can call a callback function if specified, otherwise returns a Promise.
	 *
	 * @param connectionId {String} The map ID
	 * @param [cb] {Function} A callback function
	 * @returns {Promise}
	 */
	getConnection(connectionId, cb = noop) {
		let self = this;

		return new Promise(function(resolve, reject) {
			callApi({
				protocol: self.protocol,
				method: 'GET',
				path: '/connections/' + connectionId,
				port: self.port,
				hostname: self.hostname,
				headers: {
					Authorization: 'Bearer ' + self.token
				},
				allowUnauthorized: self.allowUnauthorized
			}, function(err, response, body) {
				if (err) {
					reject(err);
				}
				else {
					resolve([body, response]);
				}
			});
		})
			.then(function(result) {
				let [body, response] = result;

				if (!(/^2/.test(response.statusCode))) {
					return Promise.reject(new Error(body.message));
				}

				return Promise.resolve(body);
			})
			.then(function(body) {
				let connection = new BitScoopConnection(body);

				sdkConnectionRef[connection.id] = self;

				cb(null, connection);

				return Promise.resolve(connection);
			})
			.catch(function(err) {
				cb(err, null);

				return Promise.reject(err);
			});
	}

	/**
	 * Creates a new API map from the data passed in.
	 * Can call a callback function if specified, otherwise returns a Promise.
	 *
	 * @param data {Object} The data used to create the new Map.
	 * @param [cb] {Function} A callback function
	 * @returns {Promise}
	 */
	createMap(data, cb = noop) {
		let self = this;

		return new Promise(function(resolve, reject) {
			callApi({
				protocol: self.protocol,
				method: 'POST',
				path: '/maps',
				port: self.port,
				hostname: self.hostname,
				headers: {
					Authorization: 'Bearer ' + self.token
				},
				body: data,
				allowUnauthorized: self.allowUnauthorized
			}, function(err, response, body) {
				if (err) {
					reject(err);
				}
				else {
					resolve([body, response]);
				}
			});
		})
			.then(function(result) {
				let [body, response] = result;

				if (!(/^2/.test(response.statusCode))) {
					return Promise.reject(new Error(body.message));
				}

				return Promise.resolve(body);
			})
			.then(function(body) {
				let map = new BitScoopMap(body);

				sdkMapRef[map.id] = self;

				cb(null, map);

				return Promise.resolve(map);
			})
			.catch(function(err) {
				cb(err, null);

				return Promise.reject(err);
			});
	}


	/**
	 * Deletes a Map specified by the ID.
	 * Can call a callback function if specified, otherwise returns a Promise.
	 *
	 * @param mapId {String} The map ID
	 * @param [cb] {Function} A callback function
	 * @returns {Promise}
	 */
	deleteMap(mapId, cb = noop) {
		let self = this;

		return new Promise(function(resolve, reject) {
			callApi({
				protocol: self.protocol,
				method: 'DELETE',
				path: '/maps/' + mapId,
				port: self.port,
				hostname: self.hostname,
				headers: {
					Authorization: 'Bearer ' + self.token
				},
				allowUnauthorized: self.allowUnauthorized
			}, function(err, response, body) {
				if (err) {
					reject(err);
				}
				else {
					resolve([body, response]);
				}
			});
		})
			.then(function(result) {
				let [body, response] = result;

				if (!(/^2/.test(response.statusCode))) {
					return Promise.reject(new Error(body.message));
				}

				delete sdkMapRef[mapId];

				cb(null, null);

				return Promise.resolve();
			})
			.catch(function(err) {
				cb(err, null);

				return Promise.reject(err);
			});
	}


	/**
	 * Gets a Map specified by the ID.
	 * Can call a callback function if specified, otherwise returns a Promise.
	 *
	 * @param mapId {String} The map ID
	 * @param [cb] {Function} A callback function
	 * @returns {Promise}
	 */
	getMap(mapId, cb = noop) {
		let self = this;

		return new Promise(function(resolve, reject) {
			callApi({
				protocol: self.protocol,
				method: 'GET',
				path: '/maps/' + mapId,
				port: self.port,
				hostname: self.hostname,
				headers: {
					Authorization: 'Bearer ' + self.token
				},
				allowUnauthorized: self.allowUnauthorized
			}, function(err, response, body) {
				if (err) {
					reject(err);
				}
				else {
					resolve([body, response]);
				}
			});
		})
			.then(function(result) {
				let [body, response] = result;

				if (!(/^2/.test(response.statusCode))) {
					return Promise.reject(new Error(body.message));
				}

				return Promise.resolve(body);
			})
			.then(function(body) {
				let map = new BitScoopMap(body);

				sdkMapRef[mapId] = self;

				cb(null, map);

				return Promise.resolve(map);
			})
			.catch(function(err) {
				cb(err, null);

				return Promise.reject(err);
			});
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
	 * @param id {String} The Map ID.
	 * @param token {String} The BitScoop API Key.
	 * @param hostname {String} The hostname to use when making API calls.
	 * @param protocol {String} The protocol to use when making API calls.
	 * @param port {Number} The port to use when making API calls.
	 * @param allowUnauthorized {Boolean} Whether or not to allow unauthorized https calls. Only intended to be used for local development.
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


/**
 * A Connection built from a Map.
 *
 * @class
 */
class BitScoopConnection {
	/**
	 * Parses a Connection into its editable fields.
	 *
	 * @constructor
	 * @param data {Object} The raw response from fetching a Connection.
	 */
	constructor(data) {
		let self = this;

		_.each(data, function(val, key) {
			if (key !== 'created' && key !== 'updated' && key !== 'endpoint_data') {
				self[key] = val;
			}
		});
	}

	/**
	 * Deletes the Connection.
	 * Can call a callback function if specified, otherwise returns a Promise.
	 *
	 * @param [cb] {Function} A callback function
	 * @returns {Promise}
	 */
	delete(cb) {
		let sdk = sdkConnectionRef[this.id];

		return sdk.deleteConnection(this.id, cb);
	}

	/**
	 * Saves the Connection by making a PATCH request.
	 * Can call a callback function if specified, otherwise returns a Promise.
	 *
	 * @param [cb] {Function} A callback function
	 * @returns {Promise}
	 */
	save(cb = noop) {
		let self = this;
		let json = {};
		let sdk = sdkConnectionRef[this.id];

		_.each(this, function(value, key) {
			if (key !== 'id') {
				json[key] = value;
			}
		});

		return new Promise(function(resolve, reject) {
			callApi({
				protocol: sdk.protocol,
				method: 'PATCH',
				path: '/connections/' + self.id,
				port: sdk.port,
				hostname: sdk.hostname,
				headers: {
					Authorization: 'Bearer ' + sdk.token
				},
				body: json,
				allowUnauthorized: sdk.allowUnauthorized
			}, function(err, response, body) {
				if (err) {
					reject(err);
				}
				else {
					resolve([body, response]);
				}
			});
		})
			.then(function(result) {
				let [body, response] = result;

				if (!(/^2/.test(response.statusCode))) {
					return Promise.reject(new Error(body.message));
				}

				return Promise.resolve(body);
			})
			.then(function(body) {
				let connection = new BitScoopConnection(body);

				cb(null, connection);

				return Promise.resolve(connection);
			})
			.catch(function(err) {
				cb(err, null);

				return Promise.reject(err);
			});
	}
}


/**
 * A BitScoop API Map.
 *
 * @class
 */
class BitScoopMap {
	/**
	 * Parses a Map into its editable fields.
	 *
	 * @constructor
	 * @param data {Object} The raw response from fetching a Connection.
	 */
	constructor(data) {
		_.assign(this, data.source);

		this.id = data.id;
	}

	/**
	 * Creates a Connection from this Map, with optional data.
	 * Can call a callback function if specified, otherwise returns a Promise.
	 *
	 * @param [data] {Object} The data to pass to the API call.
	 * @param [cb] {Function} A callback function
	 * @returns {Promise}
	 */
	createConnection(data, cb) {
		if (typeof data === 'function') {
			cb = data;
			data = null;
		}

		let sdk = sdkMapRef[this.id];

		return sdk.createConnection(this.id, data, cb);
	}

	/**
	 * Deletes a Map specified by the ID.
	 * Can call a callback function if specified, otherwise returns a Promise.
	 *
	 * @param mapId {String} The map ID
	 * @param [cb] {Function} A callback function
	 * @returns {Promise}
	 */
	delete(cb) {
		let sdk = sdkMapRef[this.id];

		sdk.deleteMap(this.id, cb);
	}

	/**
	 * Saves the Map by making a PUT request.
	 * Can call a callback function if specified, otherwise returns a Promise.
	 *
	 * @param [cb] {Function} A callback function
	 * @returns {Promise}
	 */
	save(cb = noop) {
		let self = this;
		let json = {};
		let sdk = sdkMapRef[this.id];

		_.each(this, function(value, key) {
			if (key !== 'id') {
				json[key] = value;
			}
		});

		return new Promise(function(resolve, reject) {
			callApi({
				protocol: sdk.protocol,
				method: 'PUT',
				path: '/maps/' + self.id,
				port: sdk.port,
				hostname: sdk.hostname,
				headers: {
					Authorization: 'Bearer ' + sdk.token
				},
				body: json,
				allowUnauthorized: sdk.allowUnauthorized
			}, function(err, response, body) {
				if (err) {
					reject(err);
				}
				else {
					resolve([body, response]);
				}
			});
		})
			.then(function(result) {
				let [body, response] = result;

				if (!(/^2/.test(response.statusCode))) {
					return Promise.reject(new Error(body.message));
				}

				return Promise.resolve(body);
			})
			.then(function(body) {
				let map = new BitScoopMap(body);

				cb(null, map);

				return Promise.resolve(map);
			})
			.catch(function(err) {
				cb(err, null);

				return Promise.reject(err);
			});
	}
}


module.exports = BitScoopSDK;
