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

var bitscoop = new Bitscoop(token, [options]);
```

You can alternatively pass the token as one of the options:
```
var bitscoop = new Bitscoop({
    token: 'abcd1234',
    ...
});
```

The options that can be passed are as follows:

* token - Will override a token passed as a parameter.
* protocol - http or https, defaults to https.
* port - Defaults to 443 if protocol is https and 80 if protocol is http.
* hostname - The hostname used to make calls to the API, defaults to 'api.bitscoop.com'. Do not change unless you are using a local deployment.
* allowUnauthorized - If calling over https, uses an https agent with `rejectUnauthorized` set to false. It's not advised to set this to true unless you are testing a local deployment.


## Data and Object APIs

BitScoop has two main APIs, the Data API and the Object API.
The Data API is located at data.api.bitscoop.com and is used to call other APIs using API maps.
The Object API is located at api.bitscoop.com and is used to perform CRUD operations on API maps and Connections.
The two APIs are called differently in this SDK.

### Data API
To use the Data API, you create an `api` instance for a specified Map:

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
options can contain JSON objects `query/parameters`, `headers`, and `body`, that correspond to the query parameters, headers, and body that will be passed as part of the call.

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

You can pass query parameters as either `query` or `parameters`:

```
cursor({
    parameters: {
        foo: 'bar'
    }
});
```

OR

```
cursor({
    query: {
        foo: 'bar
    }
});
```

If you pass both in, only what is defined in `query` will be used.

Note that it does not matter which order you call `.endpoint()` or `.method()`.
Calling `.endpoint()` at some point in the chain is required, but the default HTTP verb is 'GET', so calling `.method('GET')` is not required.
Calling either one of these methods returns a cursor function which should be invoked to fetch the data.

You can also use callbacks if you prefer.

```
api.endpoint(name).method(verb)(function(err, response, body) {
    // ...
});
```

### Object API

There are several functions that call the object API.
All of these functions return a Promise by default, but you can pass in an optional callback function if you prefer to use callbacks.

```
bitscoop.createMap(data, function(err, result) {
    ...
});
```

#### sdk.createMap

createMap creates a new API Map from the `data` parameter.
It returns a Promise resolved with an instance of BitscoopMap, which contains all of the editable Map fields as well as the functions `createConnection`, `delete`, and `save`.
These functions are detailed further down.

```
bitscoop.createMap(data)
    .then(function(map) {
        ...
    });
```

#### sdk.deleteMap

deleteMap deletes the Map with the ID passed via the `mapId` parameter.
It returns a Promise resolved with null.

```
bitscoop.deleteMap(mapId)
    .then(function() {
        ...
    });
```

#### sdk.getMap

getMap retrieves the Map with ID `mapId` from the BitScoop platform.
It returns a Promise resolved with an instance of BitscoopMap, which contains all of the editable Map fields as well as the functions `createConnection`, `delete`, and `save`.
The functions are detailed further down.

```
bitscoop.getMap(mapId)
    .then(function(map) {
        ...
    });
```

#### sdk.createConnection

createConnection creates a new Connection for the `mapId` API Map using any information from the optional `data` parameter.
It returns a Promise resolved with the ID of the new Connection and the redirect URL that must be followed to complete authorization of the Connection.

```
bitscoop.createConnection(mapId, [data]) {
    .then(function(result) {
        let id = result.id;
        let redirectUrl = result.redirectUrl;

        ...
    });
```

#### sdk.deleteConnection

deleteConnection deletes the Connection with ID `connectionId` from the BitScoop platform.
It returns a Promise resolved with null.

```
bitscoop.deleteConnection(connectionId)
    .then(function() {
        ...
    });
```

#### sdk.getConnnection

getConnection retrieves the Connection with the ID passed via the `connectionId` parameter.
It returns a Promise resolved with an instance of BitscoopConnection, which contains all of the editable Map fields as well as the functions `delete` and `save`.
The functions are detailed further down.

```
bitscoop.getConnection(connectionId)
    .then(function(connection) {
        ...
    });
```

#### Map.createConnection

Calling createConnection on a BitscoopMap instance creates a Connection using the ID of that Map and any optional `data` passed in.
It returns a Promise resolved with the ID of the new Connection and the redirect URL that must be followed to complete authorization of the Connection.

```
bitscoop.getMap(mapId)
    .then(function(map) {
        map.createConnection([data])
            .then(function(result) {
                let id = result.id;
                let redirectUrl = result.redirectUrl;

                ...
            });
    });
```

#### Map.delete

Calling delete on a BitscoopMap instance deletes that Map from the BitScoop platform.
It will not delete the instance, so any further calls to `Map.createConnection`, `Map.delete`, and `Map.save` will return 404 errors.
It returns a Promise resolved with null.

```
bitscoop.getMap(mapId)
    .then(function(map) {
        map.deleteConnection([data])
            .then(function() {
                ...
            });
    });
```

#### Map.save

Calling save on a BitscoopMap instance makes a PUT request to update the Map using the data currently on that instance.
It returns a Promise resolved with an instance of BitscoopMap that contains the newly-updated information.

Say Map `1234` had the following data:

```
{
    version: '1.0',
    name: 'foobar',
    url: 'https://foo.bar.com
}
```

Performing the following steps would update the Map to have `name` be 'barfoo' and `url` be 'http://test.com':

```
bitscoop.getMap(mapId)
    .then(function(map) {
        map.name = 'barfoo',
        map.url = 'http://test.com';

        map.save()
            .then(function(map) {
                ...
            });
    });
```

#### Connection.delete

Calling delete on a BitscoopConnection instance deletes that Connection from the BitScoop platform.
It will not delete the instance, so any further calls to `Connection.delete` or `Connection.save` will return 404 errors.
It returns a Promise resolved with null.

```
bitscoop.getConnection(connectionId)
    .then(function(connection) {
        connection.delete()
            .then(function() {
                ...
            });
    });
```

#### Connection.save

Calling save on a BitscoopConnection instance makes a PATCH request to update the Map using the data currently on that instance.
It returns a Promise resolved with an instance of BitscoopConnection that contains the newly-updated information.

Say Connection `1234` had the following data:

```
{
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
}
```

Performing the following steps would update the Connection to have `auth.status.complete` be false and `metadata.id` be 'efgh':

```
bitscoop.getConnection(connectionId)
    .then(function(connection) {
        connection.auth.status.complete = false,
        connection.metadata.id = 'efgh';

        connection.save()
            .then(function(connection) {
                ...
            });
    });
```
