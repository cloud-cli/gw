# Gateway

Minimalist REST HTTP server implementation.

## API

Short example:

```js
// index.js
import api from '@cloud-cli/gw';
import Foo from './foo.js';

const { gateway } = api();
gateway.add('foo', new Foo());
```

With a custom logger:

```js
import { Gateway } from '@cloud-cli/gw';
import Foo from './foo.js';
import logger from './logger.js';

const gateway = new Gateway(logger);
gateway.add('foo', new Foo());
```

## Restful API

> Assume your API runs at `https://example.com/`

**List available resources:**

List all registered resources

```bash
curl https://example.com/
```

**Invoke a method in a resource (get, post, etc):**

Just like any REST endpoint, invoke a resource with an HTTP method. Valid methods: HEAD, GET, POST, PUT, DELETE, PATCH and OPTIONS.

```bash
curl -d 'test' https://example.com/foo
curl https://example.com/foo/123
curl --head https://example.com/foo/123
curl -X DELETE https://example.com/foo/123
```

## Resource class and custom HTTP server

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

Add a property to a resource class with the options to enable CORS.
The available options are the same as [the body-parser module options](https://www.npmjs.com/package/body-parser)

The resulting request body will be available as `request.body`.

```typescript
import { Resource } from '@cloud-cli/gw';

export class ResourceWithBody extends Resource {
  // provide ONLY ONE of the 4 possible options:
  body = {
    json: {};
    raw: {};
    text: {};
    urlencoded: {};
  };
}
```

## Authorization

Implement the resource method called `auth` to protect resources. The method is async.

```typescript
import { Resource } from '@cloud-cli/gw';

export class ProtectedResource extends Resource {
  async auth(request: IncomingMessage, response: ServerResponse) {
    return this.isAllowed() || Promise.reject(new Error('Nope'));
  }

  isAllowed() {
    // return "true" to authorize
  }
}
```
