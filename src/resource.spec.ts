import { Resource } from './resource';

describe('Resource', () => {
  ['get', 'post', 'patch', 'put', 'delete', 'options'].forEach((methodName) => {
    it(`should have a default implementation for ${methodName} method`, () => {
      class ImplementedResource extends Resource {}
      const resource = new ImplementedResource();
      const request: any = {};

      const response: any = {
        writeHead: jasmine.createSpy('writeHead'),
        end: jasmine.createSpy('end'),
      };

      resource[methodName](request, response);

      expect(response.writeHead).toHaveBeenCalledWith(405);
      expect(response.end).toHaveBeenCalledWith('');
    });
  });
});
