import { IncomingMessage, ServerResponse } from 'http';
import { Readable } from 'stream';
import { Gateway, gateway } from './gateway';

describe('Gateway', () => {
  beforeAll(() => spyOn(console, 'log'));

  function expectHeadBody(response, status, body) {
    expect(response.writeHead).toHaveBeenCalledTimes(1);
    expect(response.end).toHaveBeenCalledTimes(1);

    expect(response.writeHead).toHaveBeenCalledWith(status);
    expect(response.end).toHaveBeenCalledWith(body);
  }

  function createStream(data: string) {
    const buffer = Buffer.from(data);
    const readable = Readable.from(buffer);

    return readable;
  }

  function setup(method: string, url: string) {
    const request: any = {};
    const response: any = {};

    request.url = url;
    request.method = method;

    response.writeHead = jasmine.createSpy('writeHead');
    response.end = jasmine.createSpy('end');
    response.setHeader = jasmine.createSpy('setHeader');

    const gateway = new Gateway();
    return { request, response, gateway };
  }

  it('has a gateway object', () => {
    expect(gateway).not.toBeUndefined();
  });

  it('should send 404', () => {
    const { request, response, gateway } = setup('GET', '');
    gateway.dispatch(request, response);

    expectHeadBody(response, 404, '');
  });

  it('should list all resources', () => {
    const { request, response, gateway } = setup('GET', '/');
    gateway.add('test', {});
    gateway.dispatch(request, response);

    expectHeadBody(response, 200, '["test"]');
  });

  it('should reject invalid method', () => {
    const { request, response, gateway } = setup('FOO', '/test');
    gateway.add('test', {});
    gateway.dispatch(request, response);

    expectHeadBody(response, 405, '');
  });

  it('should catch resource errors', async () => {
    const { request, response, gateway } = setup('GET', '/test');
    gateway.add('test', {
      get() {
        throw new Error('oops!');
      },
    });

    await gateway.dispatch(request, response);

    expectHeadBody(response, 500, '');
  });

  it('should process a GET request', async () => {
    const { request, response, gateway } = setup('GET', '/foo');

    gateway.add('foo', {
      async get(request, response: ServerResponse) {
        const ok = await Promise.resolve(request.url);
        response.writeHead(200);
        response.end(ok);
      },
    });

    await gateway.dispatch(request, response);

    expectHeadBody(response, 200, '/foo');
  });

  it('should process a request with a subpath', async () => {
    const { request, response, gateway } = setup('PUT', '/foo/123');

    gateway.add('foo', {
      async put(request, response: ServerResponse) {
        const ok = await Promise.resolve(request.url.slice(5));
        response.writeHead(200);
        response.end(ok);
      },
    });

    await gateway.dispatch(request, response);

    expectHeadBody(response, 200, '123');
  });

  it('should enable CORS', async () => {
    const { request, response, gateway } = setup('GET', '/foo');
    gateway.add('foo', {
      cors: {},
      get() {
        response.writeHead(200);
        response.end('ok');
      },
    });

    request.headers = {
      origin: 'www.test.com',
      host: 'www.example.com',
    };

    await gateway.dispatch(request, response);

    expect(response.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Origin', '*');
    expectHeadBody(response, 200, 'ok');
  });

  it('should parse a JSON request', async () => {
    const { request, response, gateway } = setup('POST', '/foo');
    const stream = createStream('{"ok": true}') as IncomingMessage & { body: any };

    gateway.add('foo', {
      body: { json: {} },
      post() {
        response.writeHead(200);
        response.end('ok');
      },
    });

    Object.assign(stream, request, {
      headers: {
        'content-type': 'application/json',
        'content-length': '12',
      },
    });

    await gateway.dispatch(stream, response);

    expect(stream.body).toEqual({ ok: true });
    expectHeadBody(response, 200, 'ok');
  });

  it('should parse a text request', async () => {
    const { request, response, gateway } = setup('POST', '/foo');
    const text = 'hello world!';
    const stream = createStream(text) as IncomingMessage & { body: any };

    gateway.add('foo', {
      body: { text: {} },
      post() {
        response.writeHead(200);
        response.end('ok');
      },
    });

    Object.assign(stream, request, {
      headers: {
        'content-type': 'text/plain',
        'content-length': text.length,
      },
    });

    await gateway.dispatch(stream, response);

    expect(stream.body).toEqual(text);
    expectHeadBody(response, 200, 'ok');
  });

  it('should parse a form url-encoded request', async () => {
    const { request, response, gateway } = setup('POST', '/foo');
    const urlEncodedText = 'foo=1&bar=2';
    const stream = createStream(urlEncodedText) as IncomingMessage & { body: any };

    gateway.add('foo', {
      body: { urlencoded: { extended: false } },
      post() {
        response.writeHead(200);
        response.end('ok');
      },
    });

    Object.assign(stream, request, {
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'content-length': urlEncodedText.length,
      },
    });

    await gateway.dispatch(stream, response);

    expect(stream.body).toEqual({ foo: '1', bar: '2' });
    expectHeadBody(response, 200, 'ok');
  });

  it('should parse a raw request', async () => {
    const { request, response, gateway } = setup('POST', '/foo');
    const bufferedContent = 'foo bar';
    const stream = createStream(bufferedContent) as IncomingMessage & { body: any };

    gateway.add('foo', {
      body: { raw: {} },
      post() {
        response.writeHead(200);
        response.end('ok');
      },
    });

    Object.assign(stream, request, {
      headers: {
        'content-type': 'application/octet-stream',
        'content-length': bufferedContent.length,
      },
    });

    await gateway.dispatch(stream, response);

    expect(stream.body).toEqual(Buffer.from(bufferedContent));
    expectHeadBody(response, 200, 'ok');
  });
});
