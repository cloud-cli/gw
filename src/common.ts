import { Options, OptionsJson, OptionsText, OptionsUrlencoded } from 'body-parser';
import { CorsOptions } from 'cors';
import { IncomingMessage, ServerResponse } from 'http';

export abstract class Resource {
  abstract get?(request: IncomingMessage, response: ServerResponse): Promise<any> | void;
  abstract post?(request: IncomingMessage, response: ServerResponse): Promise<any> | void;
  abstract put?(request: IncomingMessage, response: ServerResponse): Promise<any> | void;
  abstract patch?(request: IncomingMessage, response: ServerResponse): Promise<any> | void;
  abstract delete?(request: IncomingMessage, response: ServerResponse): Promise<any> | void;
  abstract options?(request: IncomingMessage, response: ServerResponse): Promise<any> | void;

  body?: BodyParserOptions;
  cors?: CorsOptions;
}

interface BodyParserOptions {
  raw?: Options;
  json?: OptionsJson;
  text?: OptionsText;
  urlencoded?: OptionsUrlencoded;
}
