import { IncomingMessage, ServerResponse } from 'http';
import { Options, OptionsJson, OptionsText, OptionsUrlencoded } from 'body-parser';
import { FormOptions } from 'multiparty';
import { CorsOptions } from 'cors';

export abstract class Resource {
  abstract get?(request: IncomingMessage, response: ServerResponse): Promise<any> | void;
  abstract post?(request: IncomingMessage, response: ServerResponse): Promise<any> | void;
  abstract put?(request: IncomingMessage, response: ServerResponse): Promise<any> | void;
  abstract patch?(request: IncomingMessage, response: ServerResponse): Promise<any> | void;
  abstract delete?(request: IncomingMessage, response: ServerResponse): Promise<any> | void;
  abstract options?(request: IncomingMessage, response: ServerResponse): Promise<any> | void;

  body?: BodyParserOptions;
  form?: FormOptions;
  cors?: CorsOptions;
}

export interface BodyParserOptions {
  raw?: Options;
  json?: OptionsJson;
  text?: OptionsText;
  urlencoded?: OptionsUrlencoded;
}

// type fn = (...args: any[]) => any;
// export const pipe = (...fns: Array<fn>) => fns.reduce((f, g) => (...args) => g(f(...args)));
