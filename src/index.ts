export { Resource } from './common';
export { Gateway } from './gateway';

import { createServer } from 'https';
import { gateway } from './gateway';

export default function () {
  return createServer((request, response) => gateway.dispatch(request, response)).listen(
    Number(process.env.PORT),
    '127.0.0.1',
  );
}
