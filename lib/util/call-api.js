'use strict';

const url = require('url');

const _ = require('lodash');
const request = require('request');


/**
 * Calls the BitScoop API.
 *
 * @param {Object} options Options to use in making the call.
 * @param {Function} cb The callback function to call when finished.
 * @returns {Promise}
 */
module.exports = function(options, cb) {
	options = options || {};

	let urlParts = {
		protocol: 'https',
		hostname: 'api.bitscoop.com'
	};

	if (options.hostname) {
		urlParts.hostname = options.hostname;
	}

	if (options.path) {
		urlParts.pathname = options.path;
	}

	if (options.query) {
		urlParts.query = options.query;
	}

	let requestOptions = {
		uri: url.format(urlParts),
		method: options.method || 'GET',
		headers: options.headers
	};

	if (options.body) {
		requestOptions.body = JSON.stringify(options.body);
		if (!requestOptions.headers.hasOwnProperty('Content-Type')) {
			requestOptions.headers['Content-Type'] = 'application/json';
		}
	}

	return request(requestOptions, function(err, response, body) {
		let contentType = _.get(response, 'headers[\'content-type\']', null);

		if (contentType && /application\/json/.test(contentType)) {
			body = JSON.parse(body);
		}

		cb(err, response, body);
	});
};
