# GW

## REST API

#### List available resources

```
GET /
```

#### Invoke a method in a resource

```
[METHOD] /[resource name]
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
