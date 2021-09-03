import { jest } from '@jest/globals';
import { Documentation } from './documentation.js';
import { Response } from './resource.js';

describe('Documentation', () => {
  it('should be a resource for module documentation', async () => {
    const docs = new Documentation(process.cwd());
    const request: any = {};

    const response = {
      setHeader: jest.fn(),
      writeHead: jest.fn(),
      end: jest.fn(),
    };

    await docs.get(request, response as unknown as Response);

    expect(response.setHeader).toHaveBeenCalledWith('Content-Type', 'text/html');
    expect(response.writeHead).toHaveBeenCalledWith(200);
    expect(response.end).toHaveBeenCalledTimes(1);

    const html = response.end.mock.calls[0][0];
    expect(String(html).indexOf('<h1>Gateway</h1>') === -1).toBe(false);
  });
});
