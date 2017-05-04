'use strict';

const _ = require('lodash');
const chai = require('chai');
const expect = require('chai').expect;
const nock = require('nock');
const sinon = require('sinon');

const BitScoop = require('../main');


chai.use(require('chai-as-promised'));
chai.use(require('sinon-chai'));


describe('Basic request proxy behavior', function() {
	before(function() {
		nock.disableNetConnect();
	});

	after(function() {
		nock.enableNetConnect();
	});

	afterEach(function() {
		nock.cleanAll();
	});

	it('call the specified endpoint on the API', function() {
		let bitscoop = new BitScoop('abcd');
		let api = bitscoop.api('1234');

		let body = [
			{ id: 1 },
			{ id: 2 }
		];

		nock('https://api.bitscoop.com', {
			reqHeaders: {
				host: 'data.api.bitscoop.com'
			}
		})
			.get('/1234/Posts')
			.reply(200, body);

		let promise = api.endpoint('Posts').method('GET')();

		return Promise.all([
			expect(promise).to.be.fulfilled,
			promise.then(function(result) {
				let [data] = result;

				data = JSON.parse(JSON.stringify(data));

				return expect(data).to.deep.equal(body);
			})
		]);
	});

	it('should use the method set by the .method function call', function() {
		let bitscoop = new BitScoop('abcd');
		let api = bitscoop.api('1234');

		let body = [
			{ id: 1 },
			{ id: 2 }
		];

		nock('https://api.bitscoop.com', {
			reqHeaders: {
				host: 'data.api.bitscoop.com'
			}
		})
			.post('/1234/Posts')
			.reply(200, body);

		let promise = api.endpoint('Posts').method('POST')();

		return Promise.all([
			expect(promise).to.be.fulfilled,
			promise.then(function(result) {
				let [data] = result;

				data = JSON.parse(JSON.stringify(data));

				return expect(data).to.deep.equal(body);
			})
		]);
	});

	it('should make the same call even if method is called before endpoint', function() {
		let bitscoop = new BitScoop('abcd');
		let api = bitscoop.api('1234');

		let body = [
			{ id: 1 },
			{ id: 2 }
		];

		nock('https://api.bitscoop.com', {
			reqHeaders: {
				host: 'data.api.bitscoop.com'
			}
		})
			.get('/1234/Posts')
			.reply(200, body);

		let promise = api.method('GET').endpoint('Posts')();

		return Promise.all([
			expect(promise).to.be.fulfilled,
			promise.then(function(result) {
				let [data] = result;

				data = JSON.parse(JSON.stringify(data));

				return expect(data).to.deep.equal(body);
			})
		]);
	});

	it('should default to a GET if .method was not called', function() {
		let bitscoop = new BitScoop('abcd');
		let api = bitscoop.api('1234');

		let body = [
			{ id: 1 },
			{ id: 2 }
		];

		nock('https://api.bitscoop.com', {
			reqHeaders: {
				host: 'data.api.bitscoop.com'
			}
		})
			.get('/1234/Posts')
			.reply(200, body);

		let promise = api.endpoint('Posts')();

		return Promise.all([
			expect(promise).to.be.fulfilled,
			promise.then(function(result) {
				let [data] = result;

				data = JSON.parse(JSON.stringify(data));

				return expect(data).to.deep.equal(body);
			})
		]);
	});

	it('should return an error if .endpoint is never called', function() {
		let bitscoop = new BitScoop('abcd');
		let api = bitscoop.api('1234');

		let body = [
			{ id: 1 },
			{ id: 2 }
		];

		nock('https://api.bitscoop.com', {
			reqHeaders: {
				host: 'data.api.bitscoop.com'
			}
		})
			.post('/1234/Posts')
			.reply(200, body);

		let promise = api.method('POST')();

		return Promise.all([
			expect(promise).to.be.rejected
		]);
	});

	it('should only use the last values passed via the .method and .endpoint functions', function() {
		let bitscoop = new BitScoop('abcd');
		let api = bitscoop.api('1234');

		let body = [
			{ id: 1 },
			{ id: 2 }
		];

		nock('https://api.bitscoop.com', {
			reqHeaders: {
				host: 'data.api.bitscoop.com'
			}
		})
			.get('/1234/Posts')
			.reply(200, body);

		let promise = api.endpoint('Users').method('POST').endpoint('Posts').method('GET')();

		return Promise.all([
			expect(promise).to.be.fulfilled,
			promise.then(function(result) {
				let [data] = result;

				data = JSON.parse(JSON.stringify(data));

				return expect(data).to.deep.equal(body);
			})
		]);
	});

	it('should pass the headers used to call the function', function() {
		let bitscoop = new BitScoop('abcd');
		let api = bitscoop.api('1234');
		let headerSpy = sinon.spy();

		nock('https://api.bitscoop.com', {
			reqHeaders: {
				host: 'data.api.bitscoop.com'
			}
		})
			.get('/1234/Posts')
			.reply(200, function() {
				let filtered = _.pick(this.req.headers, ['x-connection-id', 'authorization', 'foo']);

				headerSpy(filtered);
			});

		let promise = api.endpoint('Posts').method('GET')({
			headers: {
				'X-Connection-Id': 'abc123',
				foo: 'bar'
			}
		});

		return Promise.all([
			expect(promise).to.be.fulfilled,

			promise.then(function() {
				return expect(headerSpy).to.have.been.calledWith({
					'x-connection-id': 'abc123',
					foo: 'bar',
					authorization: 'Bearer abcd'
				});
			})
		]);
	});

	it('should pass the query parameters used to call the function', function() {
		let bitscoop = new BitScoop('abcd');
		let api = bitscoop.api('1234');

		nock('https://api.bitscoop.com', {
			reqHeaders: {
				host: 'data.api.bitscoop.com'
			}
		})
			.get('/1234/Posts')
			.query({
				head: 'toe',
				foo: 'bar'
			})
			.reply(200);

		let promise = api.endpoint('Posts').method('GET')({
			query: {
				head: 'toe',
				foo: 'bar'
			}
		});

		return Promise.all([
			expect(promise).to.be.fulfilled
		]);
	});

	it('should pass the identifier correctly', function() {
		let bitscoop = new BitScoop('abcd');
		let api = bitscoop.api('1234');

		nock('https://api.bitscoop.com', {
			reqHeaders: {
				host: 'data.api.bitscoop.com'
			}
		})
			.get('/1234/Posts/1')
			.reply(200);

		let promise = api.endpoint('Posts').method('GET')(1);

		return Promise.all([
			expect(promise).to.be.fulfilled
		]);
	});

	it('should should handle an identifier and options correctly', function() {
		let bitscoop = new BitScoop('abcd');
		let api = bitscoop.api('1234');

		nock('https://api.bitscoop.com', {
			reqHeaders: {
				host: 'data.api.bitscoop.com'
			}
		})
			.get('/1234/Posts/4')
			.query({
				head: 'toe',
				foo: 'bar'
			})
			.reply(200);

		let promise = api.endpoint('Posts').method('GET')(4, {
			query: {
				head: 'toe',
				foo: 'bar'
			}
		});

		return Promise.all([
			expect(promise).to.be.fulfilled
		]);
	});

	it('should override the API key if the api is instantiated with a different token', function() {
		let bitscoop = new BitScoop('abcd');
		let api = bitscoop.api('1234', 'zyxv');
		let headerSpy = sinon.spy();

		nock('https://api.bitscoop.com', {
			reqHeaders: {
				host: 'data.api.bitscoop.com'
			}
		})
			.get('/1234/Posts')
			.reply(200, function() {
				let filtered = _.pick(this.req.headers, ['x-connection-id', 'authorization', 'foo']);

				headerSpy(filtered);
			});

		let promise = api.endpoint('Posts').method('GET')();

		return Promise.all([
			expect(promise).to.be.fulfilled,

			promise.then(function() {
				return expect(headerSpy).to.have.been.calledWith({
					authorization: 'Bearer zyxv'
				});
			})
		]);
	});

	it('should create a new instance of api when .map is called', function() {
		let bitscoop = new BitScoop('abcd');
		let api = bitscoop.map('1234');

		nock('https://api.bitscoop.com', {
			reqHeaders: {
				host: 'data.api.bitscoop.com'
			}
		})
			.get('/1234/Posts')
			.reply(200);

		let promise = api.endpoint('Posts').method('GET')();

		return Promise.all([
			expect(promise).to.be.fulfilled
		]);
	});

	it('should use an existing api instance if .map is called and an instance of that map already exists', function() {
		let bitscoop = new BitScoop('abcd');
		let apiOrig = bitscoop.api('1234');
		let apiCopy = bitscoop.map('1234');

		return Promise.all([
			expect(apiOrig).to.equal(apiCopy)
		]);
	});

	it('should override the API key if the api is instantiated with a different token using .map', function() {
		let bitscoop = new BitScoop('abcd');
		let api = bitscoop.map('1234', 'zyxv');
		let headerSpy = sinon.spy();

		nock('https://api.bitscoop.com', {
			reqHeaders: {
				host: 'data.api.bitscoop.com'
			}
		})
			.get('/1234/Posts')
			.reply(200, function() {
				let filtered = _.pick(this.req.headers, ['x-connection-id', 'authorization', 'foo']);

				headerSpy(filtered);
			});

		let promise = api.endpoint('Posts').method('GET')();

		return Promise.all([
			expect(promise).to.be.fulfilled,

			promise.then(function() {
				return expect(headerSpy).to.have.been.calledWith({
					authorization: 'Bearer zyxv'
				});
			})
		]);
	});

	it('should use a callback function if called with one', function() {
		let bitscoop = new BitScoop('abcd');
		let api = bitscoop.map('1234', 'zyxv');

		let body = [
			{ id: 1 },
			{ id: 2 }
		];

		nock('https://api.bitscoop.com', {
			reqHeaders: {
				host: 'data.api.bitscoop.com'
			}
		})
			.get('/1234/Posts')
			.reply(200, body);

		let promise = new Promise(function(resolve, reject) {
			api.endpoint('Posts').method('GET')(function(err, response, body) {
				if (err) {
					reject();
				}
				else {
					resolve(body);
				}
			});
		});

		return Promise.all([
			expect(promise).to.be.fulfilled,
			promise.then(function(data) {
				data = JSON.parse(JSON.stringify(data));

				return expect(data).to.deep.equal(body);
			})
		]);
	});
});
