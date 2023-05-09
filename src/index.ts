export { Resource, Request, Response } from './resource.js';
export { Gateway } from './gateway.js';
export type { Logger } from './logger.js';

import { createServer } from 'https';
import { Gateway } from './gateway.js';

export default function () {
  const gateway = new Gateway();
  const server = createServer((request, response) => gateway.dispatch(request, response)).listen(
    Number(process.env.PORT),
    process.env.HOST || '127.0.0.1',
  );

  return { server, gateway };
}
