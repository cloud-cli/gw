export { Resource, Request, Response } from './resource.js';
export { Gateway } from './gateway.js';
export { Logger } from './logger.js';
export { Documentation } from './documentation.js';

import { createServer } from 'https';
import { gateway } from './gateway.js';

export default function () {
  return createServer((request, response) => gateway.dispatch(request, response)).listen(
    Number(process.env.PORT),
    '127.0.0.1',
  );
}
