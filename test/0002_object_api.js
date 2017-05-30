'use strict';

const chai = require('chai');
const expect = require('chai').expect;
const nock = require('nock');

const BitScoop = require('../main');


chai.use(require('chai-as-promised'));
chai.use(require('sinon-chai'));


describe('Object API behavior', function() {
	before(function() {
		nock.disableNetConnect();
	});

	after(function() {
		nock.enableNetConnect();
	});

	afterEach(function() {
		nock.cleanAll();
	});

	it('should create a new Map when calling createMap', function() {
		let bitscoop = new BitScoop('abcd');

		let postBody = {
			version: '1.0',
			name: 'test',
			url: 'https://test.com'
		};

		let parsedBody  = {
			id: '1234',
			version: '1.0',
			name: 'test',
			url: 'https://test.com'
		};

		let responseBody = {
			id: '1234',
			version: '1.0',
			name: 'test',
			url: 'https://test.com',
			source: postBody,
			created: '2017-04-10T23:04:44.401Z',
			updated: '2017-04-10T23:04:44.401Z'
		};

		nock('https://api.bitscoop.com')
			.post('/maps', postBody)
			.reply(200, responseBody);

		let promise = bitscoop.createMap(postBody);

		return Promise.all([
			expect(promise).to.be.fulfilled,
			promise.then(function(result) {
				result = JSON.parse(JSON.stringify(result));

				return expect(result).to.deep.equal(parsedBody);
			})
		]);
	});

	it('should use a callback function if one is passed to createMap', function() {
		let bitscoop = new BitScoop('abcd');

		let postBody = {
			version: '1.0',
			name: 'test',
			url: 'https://test.com'
		};

		let parsedBody  = {
			id: '1234',
			version: '1.0',
			name: 'test',
			url: 'https://test.com'
		};

		let responseBody = {
			id: '1234',
			version: '1.0',
			name: 'test',
			url: 'https://test.com',
			source: postBody,
			created: '2017-04-10T23:04:44.401Z',
			updated: '2017-04-10T23:04:44.401Z'
		};

		nock('https://api.bitscoop.com')
			.post('/maps', postBody)
			.reply(200, responseBody);

		let promise = new Promise(function(resolve, reject) {
			bitscoop.createMap(postBody, function(err, result) {
				if (err) {
					reject(err);
				}
				else {
					resolve(result);
				}
			});
		});

		return Promise.all([
			expect(promise).to.be.fulfilled,
			promise.then(function(result) {
				result = JSON.parse(JSON.stringify(result));

				return expect(result).to.deep.equal(parsedBody);
			})
		]);
	});

	it('should delete an existing Map when calling deleteMap', function() {
		let bitscoop = new BitScoop('abcd');

		nock('https://api.bitscoop.com')
			.delete('/maps/1234')
			.reply(204);

		let promise = bitscoop.deleteMap('1234');

		return Promise.all([
			expect(promise).to.be.fulfilled
		]);
	});

	it('should use a callback function if one is passed to deleteMap', function() {
		let bitscoop = new BitScoop('abcd');

		nock('https://api.bitscoop.com')
			.delete('/maps/1234')
			.reply(204);

		let promise = new Promise(function(resolve, reject) {
			bitscoop.deleteMap('1234', function(err, result) {
				if (err) {
					reject(err);
				}
				else {
					resolve(result);
				}
			});
		});

		return Promise.all([
			expect(promise).to.be.fulfilled
		]);
	});

	it('should get an existing Map when calling getMap', function() {
		let bitscoop = new BitScoop('abcd');

		let parsedBody  = {
			id: '1234',
			version: '1.0',
			name: 'test',
			url: 'https://test.com'
		};

		let responseBody = {
			id: '1234',
			version: '1.0',
			name: 'test',
			url: 'https://test.com',
			source: {
				version: '1.0',
				name: 'test',
				url: 'https://test.com'
			},
			created: '2017-04-10T23:04:44.401Z',
			updated: '2017-04-10T23:04:44.401Z'
		};

		nock('https://api.bitscoop.com')
			.get('/maps/1234')
			.reply(200, responseBody);

		let promise = bitscoop.getMap('1234');

		return Promise.all([
			expect(promise).to.be.fulfilled,
			promise.then(function(result) {
				result = JSON.parse(JSON.stringify(result));

				return expect(result).to.deep.equal(parsedBody);
			})
		]);
	});

	it('should use the callback function if one is passed to getMap', function() {
		let bitscoop = new BitScoop('abcd');

		let parsedBody  = {
			id: '1234',
			version: '1.0',
			name: 'test',
			url: 'https://test.com'
		};

		let responseBody = {
			id: '1234',
			version: '1.0',
			name: 'test',
			url: 'https://test.com',
			source: {
				version: '1.0',
				name: 'test',
				url: 'https://test.com'
			},
			created: '2017-04-10T23:04:44.401Z',
			updated: '2017-04-10T23:04:44.401Z'
		};

		nock('https://api.bitscoop.com')
			.get('/maps/1234')
			.reply(200, responseBody);

		let promise = new Promise(function(resolve, reject) {
			bitscoop.getMap('1234', function(err, result) {
				if (err) {
					reject(err);
				}
				else {
					resolve(result);
				}
			});
		});

		return Promise.all([
			expect(promise).to.be.fulfilled,
			promise.then(function(result) {
				result = JSON.parse(JSON.stringify(result));

				return expect(result).to.deep.equal(parsedBody);
			})
		]);
	});

	it('should create a Connection when calling Map.createConnection', function() {
		let bitscoop = new BitScoop('abcd');

		let mapResponseBody = {
			id: '1234',
			version: '1.0',
			name: 'test',
			url: 'https://test.com',
			source: {
				version: '1.0',
				name: 'test',
				url: 'https://test.com'
			},
			created: '2017-04-10T23:04:44.401Z',
			updated: '2017-04-10T23:04:44.401Z'
		};

		let connectionResponseBody = {
			id: '5678',
			redirectUrl: 'https://go.to.here.com/auth'
		};

		nock('https://api.bitscoop.com')
			.get('/maps/1234')
			.reply(200, mapResponseBody);

		nock('https://api.bitscoop.com')
			.post('/maps/1234/connections')
			.reply(200, connectionResponseBody);

		let promise = bitscoop.getMap('1234')
			.then(function(map) {
				return map.createConnection();
			});

		return Promise.all([
			expect(promise).to.be.fulfilled,
			promise.then(function(result) {
				result = JSON.parse(JSON.stringify(result));

				return expect(result).to.deep.equal(connectionResponseBody);
			})
		]);
	});

	it('should use a callback function if one is passed to Map.createConnection', function() {
		let bitscoop = new BitScoop('abcd');

		let mapResponseBody = {
			id: '1234',
			version: '1.0',
			name: 'test',
			url: 'https://test.com',
			source: {
				version: '1.0',
				name: 'test',
				url: 'https://test.com'
			},
			created: '2017-04-10T23:04:44.401Z',
			updated: '2017-04-10T23:04:44.401Z'
		};

		let connectionResponseBody = {
			id: '5678',
			redirectUrl: 'https://go.to.here.com/auth'
		};

		nock('https://api.bitscoop.com')
			.get('/maps/1234')
			.reply(200, mapResponseBody);

		nock('https://api.bitscoop.com')
			.post('/maps/1234/connections')
			.reply(200, connectionResponseBody);

		let promise = new Promise(function(resolve, reject) {
			bitscoop.getMap('1234')
				.then(function(map) {
					map.createConnection(function(err, result) {
						if (err) {
							reject(err);
						}
						else {
							resolve(result);
						}
					})
				});
		});

		return Promise.all([
			expect(promise).to.be.fulfilled,
			promise.then(function(result) {
				result = JSON.parse(JSON.stringify(result));

				return expect(result).to.deep.equal(connectionResponseBody);
			})
		]);
	});

	it('should delete a Map when calling Map.delete', function() {
		let bitscoop = new BitScoop('abcd');

		let responseBody = {
			id: '1234',
			version: '1.0',
			name: 'test',
			url: 'https://test.com',
			source: {
				version: '1.0',
				name: 'test',
				url: 'https://test.com'
			},
			created: '2017-04-10T23:04:44.401Z',
			updated: '2017-04-10T23:04:44.401Z'
		};

		nock('https://api.bitscoop.com')
			.get('/maps/1234')
			.reply(200, responseBody);

		nock('https://api.bitscoop.com')
			.delete('/maps/1234')
			.reply(204);

		let promise = bitscoop.getMap('1234')
			.then(function(map) {
				return map.delete();
			});

		return Promise.all([
			expect(promise).to.be.fulfilled
		]);
	});

	it('should use a callback function if one is passed to Map.delete', function() {
		let bitscoop = new BitScoop('abcd');

		let responseBody = {
			id: '1234',
			version: '1.0',
			name: 'test',
			url: 'https://test.com',
			source: {
				version: '1.0',
				name: 'test',
				url: 'https://test.com'
			},
			created: '2017-04-10T23:04:44.401Z',
			updated: '2017-04-10T23:04:44.401Z'
		};

		nock('https://api.bitscoop.com')
			.get('/maps/1234')
			.reply(200, responseBody);

		nock('https://api.bitscoop.com')
			.delete('/maps/1234')
			.reply(204);

		let promise = new Promise(function(resolve, reject) {
			bitscoop.getMap('1234')
				.then(function(map) {
					map.delete(function(err, result) {
						if (err) {
							reject(err);
						}
						else {
							resolve(result);
						}
					})
				});
		});

		return Promise.all([
			expect(promise).to.be.fulfilled
		]);
	});

	it('should update a Map when calling Map.save', function() {
		let bitscoop = new BitScoop('abcd');

		let getResponseBody = {
			id: '1234',
			version: '1.0',
			name: 'test',
			url: 'https://test.com',
			source: {
				version: '1.0',
				name: 'test',
				url: 'https://test.com'
			},
			created: '2017-04-10T23:04:44.401Z',
			updated: '2017-04-10T23:04:44.401Z'
		};

		let putResponseBody = {
			id: '1234',
			version: '1.0',
			name: 'foo',
			url: 'https://foobar.com',
			source: {
				version: '1.0',
				name: 'foo',
				url: 'https://foobar.com'
			},
			created: '2017-04-10T23:04:44.401Z',
			updated: '2017-04-10T23:04:44.401Z'
		};

		let parsedPutResponse = {
			id: '1234',
			version: '1.0',
			name: 'foo',
			url: 'https://foobar.com'
		};

		nock('https://api.bitscoop.com')
			.get('/maps/1234')
			.reply(200, getResponseBody);

		nock('https://api.bitscoop.com')
			.put('/maps/1234')
			.reply(200, putResponseBody);

		let promise = bitscoop.getMap('1234')
			.then(function(map) {
				map.name = 'foo';
				map.url = 'https://foobar.com';

				return map.save();
			});

		return Promise.all([
			expect(promise).to.be.fulfilled,
			promise.then(function(result) {
				result = JSON.parse(JSON.stringify(result));

				return expect(result).to.deep.equal(parsedPutResponse);
			})
		]);
	});

	it('should use a callback function if one is passed to Map.save', function() {
		let bitscoop = new BitScoop('abcd');

		let getResponseBody = {
			id: '1234',
			version: '1.0',
			name: 'test',
			url: 'https://test.com',
			source: {
				version: '1.0',
				name: 'test',
				url: 'https://test.com'
			},
			created: '2017-04-10T23:04:44.401Z',
			updated: '2017-04-10T23:04:44.401Z'
		};

		let putResponseBody = {
			id: '1234',
			version: '1.0',
			name: 'foo',
			url: 'https://foobar.com',
			source: {
				version: '1.0',
				name: 'foo',
				url: 'https://foobar.com'
			},
			created: '2017-04-10T23:04:44.401Z',
			updated: '2017-04-10T23:04:44.401Z'
		};

		let parsedPutResponse = {
			id: '1234',
			version: '1.0',
			name: 'foo',
			url: 'https://foobar.com'
		};

		nock('https://api.bitscoop.com')
			.get('/maps/1234')
			.reply(200, getResponseBody);

		nock('https://api.bitscoop.com')
			.put('/maps/1234')
			.reply(200, putResponseBody);

		let promise = new Promise(function(resolve, reject) {
			bitscoop.getMap('1234')
				.then(function(map) {
					map.name = 'foo';
					map.url = 'https://foobar.com';

					map.save(function(err, result) {
						if (err) {
							reject(err);
						}
						else {
							resolve(result);
						}
					})
				});
		});

		return Promise.all([
			expect(promise).to.be.fulfilled,
			promise.then(function(result) {
				result = JSON.parse(JSON.stringify(result));

				return expect(result).to.deep.equal(parsedPutResponse);
			})
		]);
	});

	it('should create a new Connection when calling createConnection', function() {
		let bitscoop = new BitScoop('abcd');

		let responseBody = {
			id: '5678',
			redirectUrl: 'https://go.to.here.com/auth'
		};

		nock('https://api.bitscoop.com')
			.post('/maps/1234/connections')
			.reply(200, responseBody);

		let promise = bitscoop.createConnection('1234');

		return Promise.all([
			expect(promise).to.be.fulfilled,
			promise.then(function(result) {
				result = JSON.parse(JSON.stringify(result));

				return expect(result).to.deep.equal(responseBody);
			})
		]);
	});

	it('should use a callback function if one is passed to createConnection', function() {
		let bitscoop = new BitScoop('abcd');

		let responseBody = {
			id: '5678',
			redirectUrl: 'https://go.to.here.com/auth'
		};

		nock('https://api.bitscoop.com')
			.post('/maps/1234/connections')
			.reply(200, responseBody);

		let promise = new Promise(function(resolve, reject) {
			bitscoop.createConnection('1234', function(err, result) {
				if (err) {
					reject(err);
				}
				else {
					resolve(result);
				}
			});
		});

		return Promise.all([
			expect(promise).to.be.fulfilled,
			promise.then(function(result) {
				result = JSON.parse(JSON.stringify(result));

				return expect(result).to.deep.equal(responseBody);
			})
		]);
	});

	it('should delete an existing Connection when calling deleteConnection', function() {
		let bitscoop = new BitScoop('abcd');

		nock('https://api.bitscoop.com')
			.delete('/connections/1234')
			.reply(204);

		let promise = bitscoop.deleteConnection('1234');

		return Promise.all([
			expect(promise).to.be.fulfilled
		]);
	});

	it('should use a callback function if one is passed to deleteConnection', function() {
		let bitscoop = new BitScoop('abcd');

		nock('https://api.bitscoop.com')
			.delete('/connections/1234')
			.reply(204);

		let promise = new Promise(function(resolve, reject) {
			bitscoop.deleteConnection('1234', function(err, result) {
				if (err) {
					reject(err);
				}
				else {
					resolve(result);
				}
			});
		});

		return Promise.all([
			expect(promise).to.be.fulfilled
		]);
	});

	it('should get an existing Connection when calling getConnection', function() {
		let bitscoop = new BitScoop('abcd');

		let parsedBody = {
			id: '1234',
			auth: {
				status: {
					complete: true,
					authorized: true
				}
			},
			metadata: {
				id: 'abcd'
			},
			provider_id: '5678'
		};

		let responseBody = {
			id: '1234',
			auth: {
				status: {
					complete: true,
					authorized: true
				}
			},
			endpoint_data: {},
			metadata: {
				id: 'abcd'
			},
			created: '2017-04-17T17:55:48.336Z',
			updated: '2017-04-17T17:55:48.336Z',
			provider_id: '5678'
		};

		nock('https://api.bitscoop.com')
			.get('/connections/1234')
			.reply(200, responseBody);

		let promise = bitscoop.getConnection('1234');

		return Promise.all([
			expect(promise).to.be.fulfilled,
			promise.then(function(result) {
				result = JSON.parse(JSON.stringify(result));

				return expect(result).to.deep.equal(parsedBody);
			})
		]);
	});

	it('should use a callback function if one is passed to getConnection', function() {
		let bitscoop = new BitScoop('abcd');

		let parsedBody = {
			id: '1234',
			auth: {
				status: {
					complete: true,
					authorized: true
				}
			},
			metadata: {
				id: 'abcd'
			},
			provider_id: '5678'
		};

		let responseBody = {
			id: '1234',
			auth: {
				status: {
					complete: true,
					authorized: true
				}
			},
			endpoint_data: {},
			metadata: {
				id: 'abcd'
			},
			created: '2017-04-17T17:55:48.336Z',
			updated: '2017-04-17T17:55:48.336Z',
			provider_id: '5678'
		};

		nock('https://api.bitscoop.com')
			.get('/connections/1234')
			.reply(200, responseBody);

		let promise = new Promise(function(resolve, reject) {
			bitscoop.getConnection('1234', function(err, result) {
				if (err) {
					reject(err);
				}
				else {
					resolve(result);
				}
			});
		});

		return Promise.all([
			expect(promise).to.be.fulfilled,
			promise.then(function(result) {
				result = JSON.parse(JSON.stringify(result));

				return expect(result).to.deep.equal(parsedBody);
			})
		]);
	});

	it('should delete a Connection when calling Connection.delete', function() {
		let bitscoop = new BitScoop('abcd');

		let responseBody = {
			id: '1234',
			auth: {
				status: {
					complete: true,
					authorized: true
				}
			},
			endpoint_data: {},
			metadata: {
				id: 'abcd'
			},
			created: '2017-04-17T17:55:48.336Z',
			updated: '2017-04-17T17:55:48.336Z',
			provider_id: '5678'
		};

		nock('https://api.bitscoop.com')
			.get('/connections/1234')
			.reply(200, responseBody);

		nock('https://api.bitscoop.com')
			.delete('/connections/1234')
			.reply(204);

		let promise = bitscoop.getConnection('1234')
			.then(function(connection) {
				return connection.delete();
			});

		return Promise.all([
			expect(promise).to.be.fulfilled
		]);
	});

	it('should use a callback function if one is passed to Connection.delete', function() {
		let bitscoop = new BitScoop('abcd');

		let responseBody = {
			id: '1234',
			auth: {
				status: {
					complete: true,
					authorized: true
				}
			},
			endpoint_data: {},
			metadata: {
				id: 'abcd'
			},
			created: '2017-04-17T17:55:48.336Z',
			updated: '2017-04-17T17:55:48.336Z',
			provider_id: '5678'
		};

		nock('https://api.bitscoop.com')
			.get('/connections/1234')
			.reply(200, responseBody);

		nock('https://api.bitscoop.com')
			.delete('/connections/1234')
			.reply(204);

		let promise = new Promise(function(resolve, reject) {
			bitscoop.getConnection('1234')
				.then(function(connection) {
					connection.delete(function(err, result) {
						if (err) {
							reject(err);
						}
						else {
							resolve(result);
						}
					});
				});
		});

		return Promise.all([
			expect(promise).to.be.fulfilled
		]);
	});

	it('should update a Connection when calling Connection.save', function() {
		let bitscoop = new BitScoop('abcd');

		let getResponseBody = {
			id: '1234',
			auth: {
				status: {
					complete: true,
					authorized: true
				}
			},
			endpoint_data: {},
			metadata: {
				id: 'abcd'
			},
			created: '2017-04-17T17:55:48.336Z',
			updated: '2017-04-17T17:55:48.336Z',
			provider_id: '5678'
		};

		let patchResponseBody = {
			id: '1234',
			auth: {
				status: {
					complete: false,
					authorized: true
				}
			},
			endpoint_data: {},
			metadata: {
				id: 'efgh'
			},
			created: '2017-04-17T17:55:48.336Z',
			updated: '2017-04-17T17:55:48.336Z',
			provider_id: '5678'
		};

		let parsedPatchBody = {
			id: '1234',
			auth: {
				status: {
					complete: false,
					authorized: true
				}
			},
			metadata: {
				id: 'efgh'
			},
			provider_id: '5678'
		};

		nock('https://api.bitscoop.com')
			.get('/connections/1234')
			.reply(200, getResponseBody);

		nock('https://api.bitscoop.com')
			.patch('/connections/1234')
			.reply(200, patchResponseBody);

		let promise = bitscoop.getConnection('1234')
			.then(function(connection) {
				connection.auth.status.complete = false;
				connection.metadata.id = 'efgh';

				return connection.save();
			});

		return Promise.all([
			expect(promise).to.be.fulfilled,
			promise.then(function(result) {
				result = JSON.parse(JSON.stringify(result));

				return expect(result).to.deep.equal(parsedPatchBody);
			})
		]);
	});

	it('should use a callback function if one is passed to Connection.save', function() {
		let bitscoop = new BitScoop('abcd');

		let getResponseBody = {
			id: '1234',
			auth: {
				status: {
					complete: true,
					authorized: true
				}
			},
			endpoint_data: {},
			metadata: {
				id: 'abcd'
			},
			created: '2017-04-17T17:55:48.336Z',
			updated: '2017-04-17T17:55:48.336Z',
			provider_id: '5678'
		};

		let patchResponseBody = {
			id: '1234',
			auth: {
				status: {
					complete: false,
					authorized: true
				}
			},
			endpoint_data: {},
			metadata: {
				id: 'efgh'
			},
			created: '2017-04-17T17:55:48.336Z',
			updated: '2017-04-17T17:55:48.336Z',
			provider_id: '5678'
		};

		let parsedPatchBody = {
			id: '1234',
			auth: {
				status: {
					complete: false,
					authorized: true
				}
			},
			metadata: {
				id: 'efgh'
			},
			provider_id: '5678'
		};

		nock('https://api.bitscoop.com')
			.get('/connections/1234')
			.reply(200, getResponseBody);

		nock('https://api.bitscoop.com')
			.patch('/connections/1234')
			.reply(200, patchResponseBody);

		let promise = new Promise(function(resolve, reject) {
			bitscoop.getConnection('1234')
				.then(function(connection) {
					connection.auth.status.complete = false;
					connection.metadata.id = 'efgh';

					connection.save(function(err, result) {
						if (err) {
							reject(err);
						}
						else {
							resolve(result);
						}
					});
				});
		});

		return Promise.all([
			expect(promise).to.be.fulfilled,
			promise.then(function(result) {
				result = JSON.parse(JSON.stringify(result));

				return expect(result).to.deep.equal(parsedPatchBody);
			})
		]);
	});
});
