import bodyParser from 'body-parser';
import cors from 'cors';
import { IncomingMessage, ServerResponse } from 'http';
import { defaultLogger, Logger } from './logger.js';
import { Resource } from './resource.js';

const validMethodRe = /^(head|get|post|put|patch|delete)$/i;
const timeoutError = new Error('Authorization timeout');
const unauthorizedError = new Error('Unauthorized');
const internalError = new Error('Internal error');

type NextFunction = (error?: Error) => void;

class Chain {
  index = 0;
  steps: any[] = [];

  constructor(private request: IncomingMessage, private response: ServerResponse) {}
  
  next(error?: Error) {
    let statusCode = 0;

    if (error === timeoutError) {
      statusCode = 408;
    }
    
    if (error === unauthorizedError) {
      statusCode = 401;
    }

    if (this.index >= this.steps.length) {
      statusCode = 404;
    }
    
    if (statusCode) {
      this.response.writeHead(statusCode);
      this.response.end();
      return; 
    }

    this[this.index](this.request, this.response, () => this.next());
  }

  use(...steps: any[]) {
    this.steps.push(...steps);
    return this;
  }
}

export class Gateway {
  private resources = new Map<string, Resource>([]);
  
  constructor(protected logger: Logger = defaultLogger) { }

  async dispatch(request: IncomingMessage, response: ServerResponse) {
    const chain = new Chain(request, response);
    
    chain.use(
      (i, s, n) => this.listAllEndpoints(i, s, n),
      (i, s, n) => this.checkResourceAndMethod(i, s, n),
      (i, s, n) => this.checkAuthorization(i, s, n),
      (i, s, n) => this.callMethod(i, s, n),
    );

    try {
      chain.next();
    } catch (error) {
      chain.next(error);
    }
  }

  add(name: string, resource: Resource) {
    this.resources.set(name, resource);
    return this;
  }

  private listAllEndpoints(request: IncomingMessage, response: ServerResponse, next: NextFunction) {
    if (request.url === '/' && request.method === 'GET') {
      response.writeHead(200);
      response.end(JSON.stringify(Array.from(this.resources.keys())));
      return;    
    }

    next();
  }

  private readMethodAndResource(request: IncomingMessage) {
    const methodName = request.method.toLowerCase();
    const resourceName = request.url.slice(1).toLowerCase().split('/')[0];

    return { resourceName, methodName };
  }

  private async callMethod(request: IncomingMessage, response: ServerResponse, next: NextFunction) {
    const { resourceName, methodName } = this.readMethodAndResource(request);
    const resource = this.resources.get(resourceName);

    try {
      await this.processCors(request, response, resource);
      await this.processBody(request, response, resource);

      request.url = request.url.slice(1).replace(resourceName, '');

      this.logger.log(JSON.stringify({ type: 'request', time: Date.now(), method: methodName, resource: resourceName }));

      await resource[methodName](request, response);
    } catch (error) {
      this.logger.error(JSON.stringify({ type: 'error', time: Date.now(), error: error.message, stack: error.stack }));
      next(internalError);
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

  private async checkAuthorization(request: IncomingMessage, response: ServerResponse, next: NextFunction) {
    const { resourceName } = this.readMethodAndResource(request);
    const resource = this.resources.get(resourceName);
    const timeout = setTimeout(() => next(timeoutError), 30_000);

    try {
      const authorized = await resource.auth(request, response);
      clearTimeout(timeout);

      if (authorized === true) {
        next();
        return; 
      }

      throw unauthorizedError;
    } catch (error) {
      next(error);
    }
  }

  private checkResourceAndMethod(request: IncomingMessage, response: ServerResponse, next: NextFunction): boolean {
    const { resourceName, methodName } = this.readMethodAndResource(request);

    if (!this.resources.has(resourceName)) {
      response.writeHead(404);
      response.end('');
      return;
    }

    if (
      validMethodRe.test(methodName) === false ||
      typeof this.resources.get(resourceName)[methodName] !== 'function'
    ) {
      response.writeHead(405);
      response.end('');
    }

    next();
  }
}

export const gateway = new Gateway();
