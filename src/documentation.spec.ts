import { Documentation } from './documentation';

describe('Documentation', () => {
  it('should be a resource for module documentation', async () => {
    const docs = new Documentation(process.cwd());
    const request: any = {};

    const response: any = {
      setHeader: jasmine.createSpy('setHeader'),
      writeHead: jasmine.createSpy('writeHead'),
      end: jasmine.createSpy('end'),
    };

    await docs.get(request, response);

    expect(response.setHeader).toHaveBeenCalledWith('Content-Type', 'text/html');
    expect(response.writeHead).toHaveBeenCalledWith(200);
    expect(response.end).toHaveBeenCalledTimes(1);

    const html = response.end.calls.argsFor(0)[0];
    expect(html.indexOf('<h1>Gateway</h1>') === -1).toBe(false);
  });
});
