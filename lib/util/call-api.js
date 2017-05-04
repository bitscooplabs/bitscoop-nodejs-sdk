'use strict';

const https = require('https');
const url = require('url');

const _ = require('lodash');
const request = require('request');


let agent = new https.Agent({
	rejectUnauthorized: false
});


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
		protocol: options.protocol,
		hostname: options.hostname
	};

	if (options.path) {
		urlParts.pathname = options.path;
	}

	if (options.port) {
		urlParts.port = options.port;
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

	if (options.allowUnauthorized && options.protocol === 'https') {
		requestOptions.agent = agent;
	}

	return request(requestOptions, function(err, response, body) {
		let contentType = _.get(response, 'headers[\'content-type\']', null);

		if (contentType && /application\/json/.test(contentType)) {
			body = JSON.parse(body);
		}

		cb(err, response, body);
	});
};
