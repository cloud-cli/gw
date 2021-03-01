# GW

A REST HTTP server implementation mapping resources to JS classes

## REST API

#### List available resources

```
GET /
```

#### Invoke a method in a resource

Just like any REST service, invoke a resource with an HTTP method:

```
[GET/POST/PUT/DELETE/PATCH/OPTIONS] /[resource name]/...
```

## JS API

Set up a `Gateway` instance and add resources to it

```typescript
import { Gateway, Resource } from '@cloud-cli/gw';
import { createServer } from 'http';

class Ponies extends Resource {
  get(request, response) {
    response.writeHead(200);
    response.end(JSON.stringify(['list', 'of', 'ponies']));
  }
}

const gw = new Gateway();
gw.add('ponies', new Ponies());

createServer((request, response) => gw.dispatch(request, response)).listen(80);
```

Then invoke the resource with an HTTP call

```
GET /ponies
```

A resource can implement any of the valid HTTP methods: get, post, put, delete, patch and options.
The methods are called with the request/response objects from a vanilla Node.JS HTTP server.

## CORS

Add a property to a resource implmementation with the options to enable CORS.
The available options are the same as [the cors module](https://www.npmjs.com/package/cors)

```typescript
import { Resource } from '@cloud-cli/gw';

export class ResourceWithCors extends Resource {
  cors = { ... }
}
```

## Body parser

Add a property to a resource implmementation with the options to enable CORS.
The available options are the same as [the body-parser module options](https://www.npmjs.com/package/body-parser)

```typescript
import { Resource } from '@cloud-cli/gw';

export class ResourceWithBody extends Resource {
  // provide one of the 4 available options
  body = {
    json: {};
    raw: {};
    text: {};
    urlencoded: {};
  };
}
```
