# Bitscoop Node Client Library

This is the [node.js](http://nodejs.org/) library for calling the BitScoop API.
Sign up for a BitScoop account [here](https://bitscoop.com/signup).


## Installation

Install the latest version of the library with the following command:

```
npm install bitscoop-sdk
```


## Usage

To use the SDK, you must instantiate a new instance of it with your API key:

```
var Bitscoop = require('bitscoop-sdk');

var bitscoop = new Bitscoop(token);
```

From there, you can create multiple APIs corresponding to API maps in the BitScoop platform:

```
var api = bitscoop.api(mapId, [token]);
```

Note that you can override the token used when creating the SDK by providing a token when you create the API instance.
This new token will only be applied to that API instance.

To fetch data from BitScoop, you chain together a few methods.

```
var cursor = api.endpoint(name).method(verb);
var promise = cursor([identifier], [options={}], [callback]);

promise.then(function(result) {
    var data = result[0];
    var response = result[1];

    // ...
});
```

identifier is the ID of a single object that you wish to act on, e.g. if you were calling the endpoint `/Posts` and wanted to act on Post 5, identifier would be 5.
This gets translated to a call to `/Posts/5`.
options can contain JSON objects `query`, `headers`, and `body`, that correspond to the query parameters, headers, and body that will be passed as part of the call.

```
cursor({
    query: {
        foo: 'bar'
    },
    headers: {
        'X-Connection-Id': 'acb123'
    },
    body: {
        mega: {
            fun: 9
        }
    }
});
```

Note that it does not matter which order you call `.endpoint()` or `.method()`.
Calling `.endpoint()` at some point in the chain is required, but the default HTTP verb is 'GET', so calling `.get()` is not required.
Calling either one of these methods returns a cursor function which should be invoked to fetch the data.

You can also use callbacks if you prefer.

```
api.endpoint(name).method(verb)(function(err, response, body) {
    // ...
});
```
