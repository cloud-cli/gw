import bodyParser from 'body-parser';
import cors from 'cors';
import { IncomingMessage, ServerResponse } from 'http';
import { defaultLogger, Logger } from './logger.js';
import { Resource } from './resource.js';

const validMethodRe = /^(head|get|post|put|patch|delete)$/i;
const notFoundError = new Error('404: Not found');
const notAllowedError = new Error('405: Method not allowed');
const unauthorizedError = new Error('401: Unauthorized');
const internalError = new Error('500: Internal error');
const END = {};

export class Gateway {
  private resources = new Map<string, Resource>([]);
  
  /* istanbul ignore next k*/
  constructor(protected logger: Logger = defaultLogger) { }

  async dispatch(request: IncomingMessage, response: ServerResponse) {
    try {
      (
        await this.listAllEndpoints(request, response) ||
        await this.checkResourceAndMethod(request, response) ||
        await this.checkAuthorization(request, response) ||
        await this.callMethod(request, response)
      );
    } catch (error) {
      this.onError(response, error);
    }
  }

  add(name: string, resource: Resource) {
    this.resources.set(name, resource);
    return this;
  }

  private onError(response: ServerResponse, error: Error) {
    const statusCode = String(error).match(/(Error: )?(\d{3})/);

    response.writeHead(statusCode && Number(statusCode[2]));
    response.end();
  }

  private async listAllEndpoints(request: IncomingMessage, response: ServerResponse) {
    if (request.url === '/' && request.method === 'GET') {
      response.writeHead(200);
      response.end(JSON.stringify(Array.from(this.resources.keys())));
      return END;
    }
  }

  private async checkAuthorization(request: IncomingMessage, response: ServerResponse) {
    try {
      const { resourceName } = this.readMethodAndResource(request);
      const resource = this.resources.get(resourceName);
      const authorized = await resource.auth(request, response);

      if (authorized === true) {
        return;
      }

      return Promise.reject(unauthorizedError);
    } catch (error) {
      this.logger.error(JSON.stringify({ type: 'error', time: Date.now(), error: error.message, stack: error.stack }));
      throw internalError;
    }
  }

  private async checkResourceAndMethod(request: IncomingMessage, response: ServerResponse) {
    const { resourceName, methodName } = this.readMethodAndResource(request);

    if (!this.resources.has(resourceName)) {
      throw notFoundError;
    }

    if (
      validMethodRe.test(methodName) === false ||
      typeof this.resources.get(resourceName)[methodName] !== 'function'
    ) {
      throw notAllowedError;
    }
  }

  private async callMethod(request: IncomingMessage, response: ServerResponse) {
    try {
      const { resourceName, methodName } = this.readMethodAndResource(request);
      const resource = this.resources.get(resourceName);

      await this.processCors(request, response, resource);
      await this.processBody(request, response, resource);

      request.url = request.url.slice(1).replace(resourceName, '');

      this.logger.log(JSON.stringify({ type: 'request', time: Date.now(), method: methodName, resource: resourceName }));

      await resource[methodName](request, response);
      return END;
    } catch (error) {
      this.logger.error(JSON.stringify({ type: 'error', time: Date.now(), error: error.message, stack: error.stack }));
      throw internalError;
    }
  }

  private readMethodAndResource(request: IncomingMessage) {
    const methodName = request.method.toLowerCase();
    const resourceName = request.url.slice(1).toLowerCase().split('/')[0];

    return { resourceName, methodName };
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
}
