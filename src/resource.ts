import { Options, OptionsJson, OptionsText, OptionsUrlencoded } from 'body-parser';
import { CorsOptions } from 'cors';
import { IncomingMessage, ServerResponse } from 'http';

function notImplemented(_: IncomingMessage, response: ServerResponse) {
  response.writeHead(405);
  response.end('');
}

export class Request extends IncomingMessage {
  body?: object | null;
}

export class Response extends ServerResponse { }

export class Resource {
  head(request: Request, response: Response): Promise<any> | void {
    notImplemented(request, response);
  }

  get(request: Request, response: Response): Promise<any> | void {
    notImplemented(request, response);
  }

  post(request: Request, response: Response): Promise<any> | void {
    notImplemented(request, response);
  }

  put(request: Request, response: Response): Promise<any> | void {
    notImplemented(request, response);
  }

  patch(request: Request, response: Response): Promise<any> | void {
    notImplemented(request, response);
  }

  delete(request: Request, response: Response): Promise<any> | void {
    notImplemented(request, response);
  }

  options(request: Request, response: Response): Promise<any> | void {
    notImplemented(request, response);
  }

  body?: BodyParserOptions;
  cors?: CorsOptions;

  async auth() {
    return true;
  }
}

interface BodyParserOptions {
  raw?: Options;
  json?: OptionsJson;
  text?: OptionsText;
  urlencoded?: OptionsUrlencoded;
}
