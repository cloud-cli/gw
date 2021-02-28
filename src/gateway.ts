import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import { IncomingMessage, ServerResponse } from 'http';
import { Resource } from './common';

const validMethodRe = /^(get|post|put|patch|delete)$/i;

export class Gateway {
  private resources = new Map<string, Resource>([]);

  dispatch(request: IncomingMessage, response: ServerResponse) {
    return (
      this.listAllEndpoints(request, response) ||
      this.checkResourceAndMethod(request, response) ||
      this.callMethod(request, response)
    );
  }

  add(name: string, resource: Resource) {
    this.resources.set(name, resource);
    return this;
  }

  private listAllEndpoints(request: IncomingMessage, response: ServerResponse) {
    if (request.url === '/' && request.method === 'GET') {
      response.writeHead(200);
      response.end(JSON.stringify(Array.from(this.resources.keys())));
      return true;
    }
  }

  private readMethodAndResource(request: IncomingMessage) {
    const methodName = request.method.toLowerCase();
    const resourceName = request.url.slice(1).toLowerCase().split('/')[0];

    return { resourceName, methodName };
  }

  private async callMethod(request: IncomingMessage, response: ServerResponse) {
    const { resourceName, methodName } = this.readMethodAndResource(request);
    const resource = this.resources.get(resourceName);

    try {
      await this.processCors(request, response, resource);
      await this.processBody(request, response, resource);

      response.setHeader('X-Powered-by', '@cloud-cli/gw');
      console.log(JSON.stringify({ method: methodName, resource: resourceName }));

      return await resource[methodName](request, response);
    } catch (error) {
      response.writeHead(500);
      response.end('');
      console.log(JSON.stringify({ error: error.message, stack: error.stack }));
    }
  }

  private async processCors(request: IncomingMessage, response: ServerResponse, resource: Resource) {
    if (!resource.cors) {
      return;
    }

    const { next, promise } = this.createNext();
    cors(resource.cors)(request, response, next);

    return promise;
  }

  private async processBody(request: IncomingMessage, response: ServerResponse, resource: Resource) {
    if (!resource.body) {
      return;
    }

    const options = resource.body;
    const { next, promise } = this.createNext();

    if (options.json) {
      bodyParser.json(options.json)(request, response, next);
    }

    if (options.text) {
      bodyParser.text(options.text)(request, response, next);
    }

    if (options.urlencoded) {
      bodyParser.urlencoded(options.urlencoded)(request, response, next);
    }

    if (options.raw) {
      bodyParser.raw(options.raw)(request, response, next);
    }

    return await promise;
  }

  private createNext() {
    const out: any = {};
    out.promise = new Promise((resolve) => (out.resolve = resolve));

    const next = () => out.resolve();
    return { next, promise: out.promise };
  }

  private checkResourceAndMethod(request: IncomingMessage, response: ServerResponse): boolean {
    const { resourceName, methodName } = this.readMethodAndResource(request);

    if (!this.resources.has(resourceName)) {
      response.writeHead(404);
      response.end('');
      return true;
    }

    if (
      validMethodRe.test(methodName) === false ||
      typeof this.resources.get(resourceName)[methodName] !== 'function'
    ) {
      response.writeHead(405);
      response.end('');
      return true;
    }
  }
}

export const gateway = new Gateway();
