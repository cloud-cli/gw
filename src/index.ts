import { createServer } from 'https';
import { gateway, Gateway } from './gateway';

export { Gateway };

export default function () {
  return createServer((request, response) => gateway.dispatch(request, response)).listen(
    Number(process.env.PORT),
    '127.0.0.1',
  );
}
