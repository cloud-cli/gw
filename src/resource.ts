import { Options, OptionsJson, OptionsText, OptionsUrlencoded } from 'body-parser';
import { CorsOptions } from 'cors';
import { IncomingMessage, ServerResponse } from 'http';

function notImplemented(_: IncomingMessage, response: ServerResponse) {
  response.writeHead(405);
  response.end('');
}
export class Resource {
  get(request: IncomingMessage, response: ServerResponse): Promise<any> | void {
    notImplemented(request, response);
  }

  post(request: IncomingMessage, response: ServerResponse): Promise<any> | void {
    notImplemented(request, response);
  }

  put(request: IncomingMessage, response: ServerResponse): Promise<any> | void {
    notImplemented(request, response);
  }

  patch(request: IncomingMessage, response: ServerResponse): Promise<any> | void {
    notImplemented(request, response);
  }

  delete(request: IncomingMessage, response: ServerResponse): Promise<any> | void {
    notImplemented(request, response);
  }

  options(request: IncomingMessage, response: ServerResponse): Promise<any> | void {
    notImplemented(request, response);
  }

  body?: BodyParserOptions;
  cors?: CorsOptions;
}

interface BodyParserOptions {
  raw?: Options;
  json?: OptionsJson;
  text?: OptionsText;
  urlencoded?: OptionsUrlencoded;
}
