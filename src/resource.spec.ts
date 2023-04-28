import { jest } from '@jest/globals';
import { Resource } from './resource';

describe('Resource', () => {
  ['head', 'get', 'post', 'patch', 'put', 'delete', 'options'].forEach((methodName) => {
    it(`should have a default implementation for ${methodName} method`, () => {
      class ImplementedResource extends Resource { }
      const resource = new ImplementedResource();
      const request: any = {};

      const response: any = {
        writeHead: jest.fn(),
        end: jest.fn(),
      };

      resource[methodName](request, response);

      expect(response.writeHead).toHaveBeenCalledWith(405);
      expect(response.end).toHaveBeenCalledWith('');
    });

    it(`should have a default implementation for auth`, async () => {
      class ImplementedResource extends Resource { }
      const resource = new ImplementedResource();

      expect(await resource.auth()).toBe(true);
    });
  });
});
