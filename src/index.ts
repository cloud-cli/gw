export { Resource } from './resource.js';
export { Gateway } from './gateway.js';

import { createServer } from 'https';
import { gateway } from './gateway.js';

export default function () {
  return createServer((request, response) => gateway.dispatch(request, response)).listen(
    Number(process.env.PORT),
    '127.0.0.1',
  );
}
